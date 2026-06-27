"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ProductGallery from "./ProductGallery";
import OrderSummary from "./OrderSummary";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import { getAllApparel, getApparelById, createCustomOrder } from "@/lib/api";
import { useRouter } from "next/navigation";

interface ApparelProduct {
  _id: string;
  title: string;
  apparelType: string;
  availableGSM: number[];
  baseColors: string[];
  designTemplates: string[];
  printPlacements: string[];
  basePrice: number;
}

interface ApparelType {
  _id: string;
  title: string;
  apparelType: string;
}

interface SizeQuantity {
  size: string;
  quantity: number;
}

export default function CustomOrderPage() {
  const router = useRouter();
  const [apparelTypes, setApparelTypes] = useState<ApparelType[]>([]);
  const [selectedApparelType, setSelectedApparelType] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<ApparelProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedGSM, setSelectedGSM] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedPlacement, setSelectedPlacement] = useState<string>("");
  const [printPlacements, setPrintPlacements] = useState<string[]>([]);
  const [uploadedDesigns, setUploadedDesigns] = useState<Record<string, string>>({});
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  
  // Sizes and quantities - array to support multiple size-quantity pairs
  const [sizesAndQty, setSizesAndQty] = useState<SizeQuantity[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");

  // Delivery details states
  const [deliveryDetails, setDeliveryDetails] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    email: ""
  });

  // Fetch all apparel on mount
  useEffect(() => {
    const fetchApparelTypes = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined;
        const response = await getAllApparel(token);
        if (response.status === "success" && response.data?.products) {
          setApparelTypes(response.data.products);
        }
      } catch (error) {
        console.error("Error fetching apparel:", error);
      }
    };
    fetchApparelTypes();
  }, []);

  // Fetch single product when apparel type is selected
  const handleApparelTypeChange = async (value: string) => {
    setSelectedApparelType(value);
    setSelectedProduct(null);
    setSelectedGSM("");
    setSelectedColor("");
    setSelectedPlacement("");
    setPrintPlacements([]);
    setSizesAndQty([]);

    const product = apparelTypes.find(p => p._id === value);
    if (product) {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined;
        const response = await getApparelById(value, token);
        if (response.status === "success" && response.data?.product) {
          setSelectedProduct(response.data.product);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrintPlacementChange = (value: string) => {
    if (printPlacements.includes(value)) {
      setPrintPlacements(printPlacements.filter(p => p !== value));
    } else {
      setPrintPlacements([...printPlacements, value]);
    }
  };

  const removePrintPlacement = (value: string) => {
    setPrintPlacements(printPlacements.filter(p => p !== value));
    setUploadedDesigns(prev => {
      const updated = { ...prev };
      delete updated[value];
      return updated;
    });
  };

  const handleImageUpload = (placement: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setUploadedDesigns(prev => ({
          ...prev,
          [placement]: imageData
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = (placement: string) => {
    const fileInput = document.getElementById(`file-input-${placement}`) as HTMLInputElement;
    fileInput?.click();
  };

  // Add size and quantity to the array
  const addSizeQuantity = () => {
    if (selectedSize && quantity) {
      const existingIndex = sizesAndQty.findIndex(s => s.size === selectedSize.toLowerCase());
      if (existingIndex >= 0) {
        // Update existing size quantity
        const updated = [...sizesAndQty];
        updated[existingIndex].quantity += parseInt(quantity);
        setSizesAndQty(updated);
      } else {
        // Add new size-quantity pair
        setSizesAndQty([...sizesAndQty, { size: selectedSize.toLowerCase(), quantity: parseInt(quantity) }]);
      }
      setSelectedSize("");
      setQuantity("");
    }
  };

  // Remove size-quantity pair
  const removeSizeQuantity = (index: number) => {
    setSizesAndQty(sizesAndQty.filter((_, i) => i !== index));
  };

  // Handle delivery detail changes
  const handleDeliveryChange = (field: string, value: string) => {
    setDeliveryDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate total quantity
  const totalQuantity = sizesAndQty.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total price
  const total = selectedProduct ? (selectedProduct.basePrice * totalQuantity) : 0;

  // Submit order
  const handleSubmit = async () => {
    if (!selectedProduct || !selectedGSM || !selectedColor || printPlacements.length === 0 || sizesAndQty.length === 0) {
      alert("Please fill all required fields");
      return;
    }

    if (!deliveryDetails.fullName || !deliveryDetails.phone || !deliveryDetails.address || !deliveryDetails.city || !deliveryDetails.state || !deliveryDetails.pincode || !deliveryDetails.email) {
      alert("Please fill all delivery details");
      return;
    }

    setSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined;
      
      // Prepare design files array (using uploaded images as base64 for now - in production, upload to cloud storage)
      const designFiles = Object.values(uploadedDesigns);

      const orderData = {
        selectedGSM: parseInt(selectedGSM),
        selectedColor: selectedColor,
        designFiles: designFiles,
        printPlacements: printPlacements,
        additionalNotes: additionalNotes,
        sizesAndQty: sizesAndQty,
        deliveryDetails: deliveryDetails
      };

      const response = await createCustomOrder(selectedProduct._id, orderData, token);
      
      if (response.status === "success") {
        alert("Order placed successfully!");
        router.push("/dashboard/orders");
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      alert(error.response?.data?.message || "Error placing order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="">
      {/* Breadcrumb */}
      <div className="px-6 py-4 text-sm text-muted-foreground">
        Home <span className="mx-2">{">"}</span> Custom Apparel Order Page
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[420px_1fr]">
          {/* LEFT – Sticky */}
          <div className="lg:sticky lg:top-24 h-fit space-y-6">
            <ProductGallery images={selectedProduct?.designTemplates || []} />
            <OrderSummary
              product={selectedProduct}
              selectedGSM={selectedGSM}
              selectedColor={selectedColor}
              printPlacements={printPlacements}
              quantity={totalQuantity.toString()}
              total={total}
              onProceed={handleSubmit}
              submitting={submitting}
            />
          </div>

          {/* RIGHT – Scrollable */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide pr-2 space-y-10"
          >
            {/* 1. Select Product */}
            <section className="space-y-4">
              <h3 className="font-semibold">1. Select Your Product</h3>

              <div className="grid gap-2">
                <Label htmlFor="apparelType">Apparel Type</Label>
                <Select value={selectedApparelType} onValueChange={handleApparelTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Apparel Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {apparelTypes.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {loading && <p className="text-sm text-muted-foreground">Loading product details...</p>}

              <div className="grid gap-2">
                <Label htmlFor="select-gsm">Select GSM</Label>

                <Select value={selectedGSM} onValueChange={setSelectedGSM} disabled={!selectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select GSM" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProduct?.availableGSM.map((gsm) => (
                      <SelectItem key={gsm} value={gsm.toString()}>
                        {gsm} GSM
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="base-color">Choose Base Color</Label>

                <Select value={selectedColor} onValueChange={setSelectedColor} disabled={!selectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Base Color" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProduct?.baseColors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* 2. Customize Design */}
            <section className="space-y-4">
              <h3 className="font-semibold">2. Customize Your Design</h3>

              <div className="grid grid-cols-2 gap-4">
                {printPlacements.length > 0 ? (
                  printPlacements.map((placement) => (
                    <div key={placement} className="relative">
                      <button
                        onClick={() => triggerFileInput(placement)}
                        className="relative h-36 w-full rounded-md border-2 border-dashed border-gray-300 transition-all hover:border-[#B87D4C] hover:bg-gray-50"
                      >
                        {uploadedDesigns[placement] ? (
                          <div className="relative h-full w-full overflow-hidden rounded-md">
                            <img loading="lazy" decoding="async"
                              src={uploadedDesigns[placement]}
                              alt={placement}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 transition-opacity hover:opacity-100">
                              <span className="text-white text-sm font-medium">Click to Change</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                            <span className="text-2xl">📤</span>
                            <span className="text-xs capitalize">{placement}</span>
                            <span className="text-xs">Click to Upload</span>
                          </div>
                        )}
                      </button>
                      {uploadedDesigns[placement] && (
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedDesigns(prev => {
                              const updated = { ...prev };
                              delete updated[placement];
                              return updated;
                            });
                          }}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                          ✕
                        </button>
                      )}
                      <input
                        id={`file-input-${placement}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(placement, e)}
                        className="hidden"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 flex h-36 items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-center text-sm text-muted-foreground">
                    Select print placements above to upload designs
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="print-placement">
                  Select Print Placement(s)
                </Label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {selectedProduct?.printPlacements.map((placement) => (
                    <Button
                      key={placement}
                      type="button"
                      onClick={() => handlePrintPlacementChange(placement)}
                      className={`capitalize transition-all ${printPlacements.includes(placement)
                        ? "bg-[#171717] text-white hover:bg-[#B87D4C]"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      disabled={!selectedProduct}
                    >
                      {placement}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Selected Placements Display */}
              {printPlacements.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">Selected Placements:</div>
                  <div className="flex flex-wrap gap-2">
                    {printPlacements.map((placement) => (
                      <div
                        key={placement}
                        className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-4 py-2 text-sm text-white"
                      >
                        <span className="capitalize">{placement}</span>
                        <button
                          type="button"
                          onClick={() => removePrintPlacement(placement)}
                          className="ml-1 text-white hover:opacity-70"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="additional-notes">Additional Notes</Label>

                <Textarea 
                  placeholder="Additional Notes (e.g. logo size, position)" 
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                />
              </div>
            </section>

            {/* 3. Sizes */}
            <section className="space-y-4">
              <h3 className="font-semibold">3. Select Sizes & Quantity</h3>
              <div className=" grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="select-size">Select Size</Label>

                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xs">XS</SelectItem>
                      <SelectItem value="s">S</SelectItem>
                      <SelectItem value="m">M</SelectItem>
                      <SelectItem value="l">L</SelectItem>
                      <SelectItem value="xl">XL</SelectItem>
                      <SelectItem value="xxl">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="select-quantity">Select Quantity</Label>

                  <Select value={quantity} onValueChange={setQuantity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Quantity" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 5, 10, 25, 50, 100, 250, 500, 1000].map((qty) => (
                        <SelectItem key={qty} value={qty.toString()}>
                          {qty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                type="button"
                onClick={addSizeQuantity}
                className="mt-2 bg-[#171717] hover:bg-[#B87D4C]"
                disabled={!selectedSize || !quantity}
              >
                Add Size
              </Button>

              {/* Display added sizes and quantities */}
              {sizesAndQty.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium">Added Sizes:</div>
                  {sizesAndQty.map((item, index) => (
                    <div key={index} className="flex items-center justify-between rounded-md bg-gray-100 px-4 py-2">
                      <span className="capitalize">{item.size} - {item.quantity} pcs</span>
                      <button
                        type="button"
                        onClick={() => removeSizeQuantity(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 4. Delivery */}
            <section className="space-y-4">
              <h3 className="font-semibold">4. Delivery Details</h3>
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>

                <Input 
                  placeholder="Full Name" 
                  value={deliveryDetails.fullName}
                  onChange={(e) => handleDeliveryChange("fullName", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="Phone">Phone</Label>

                <Input 
                  placeholder="Phone" 
                  value={deliveryDetails.phone}
                  onChange={(e) => handleDeliveryChange("phone", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="Full Address">Full Address</Label>

                <Input 
                  placeholder="Full Address" 
                  value={deliveryDetails.address}
                  onChange={(e) => handleDeliveryChange("address", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">

                <div className="grid gap-2">
                  <Label htmlFor="City">City</Label>

                  <Input 
                    placeholder="City" 
                    value={deliveryDetails.city}
                    onChange={(e) => handleDeliveryChange("city", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="State">State</Label>

                  <Input 
                    placeholder="State" 
                    value={deliveryDetails.state}
                    onChange={(e) => handleDeliveryChange("state", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="Pincode">Pincode</Label>

                <Input 
                  placeholder="Pincode" 
                  value={deliveryDetails.pincode}
                  onChange={(e) => handleDeliveryChange("pincode", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="Email address">Email address</Label>
                <Input 
                  placeholder="Email address" 
                  value={deliveryDetails.email}
                  onChange={(e) => handleDeliveryChange("email", e.target.value)}
                />
              </div>
            </section>

            <Button 
              className="w-fit bg-[#171717] hover:bg-[#B87D4C]"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Save & Continue"}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
