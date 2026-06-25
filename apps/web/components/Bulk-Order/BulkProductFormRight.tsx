// ProductFormRight.tsx

"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Info,
  Lock,
  Minus,
  Plus,
  Star,
  X,
  Upload,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import TShirtDesigner from "./TShirtDesigner";
import WalletTopUpModal from "@/components/DashboardLayout/WalletTopUpModal";
import * as api from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function ProductFormRight({
  product,
  selectedVariant: selectedVariantProp,
  setSelectedVariant: setSelectedVariantProp,
}: {
  product?: any;
  selectedVariant?: any;
  setSelectedVariant?: (v: any) => void;
}) {
  // =========================
  // STATE
  // =========================

  const [selectedQty, setSelectedQty] =
    useState<string | null>(null);

  const router = useRouter();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [useSavedAddress, setUseSavedAddress] = useState(true);

  // Wallet top-up modal, opened when checkout fails with 402 (low balance)
  const [showTopUp, setShowTopUp] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  const [deliveryDetails, setDeliveryDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined;
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined;
      if (token) {
        try {
          const res = await api.getUserProfile(token);
          if (res?.status === "success" && res?.data?.user) {
            setProfileData(res.data.user);
          }
        } catch (error) {
          console.error("Failed to load profile", error);
        }
      }
    };
    if (isLoggedIn) {
      fetchProfile();
    } else {
      setProfileData(null);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (profileData) {
      setDeliveryDetails({
        fullName: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        address: profileData.address?.street || "",
        city: profileData.address?.city || "",
        state: profileData.address?.state || "",
        pincode: profileData.address?.pincode || "",
      });
    }
  }, [profileData]);

  const hasSavedAddress = !!(
    profileData?.address?.street &&
    profileData?.address?.city &&
    profileData?.address?.state &&
    profileData?.address?.pincode &&
    profileData?.phone
  );

  const handlePlaceBulkOrder = async () => {
    setCheckoutError(null);
    setLoadingCheckout(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined;

      // Purchases require login (orders are paid from the wallet).
      if (!token) {
        setCheckoutError("Please log in to place an order.");
        setLoadingCheckout(false);
        router.push("/login");
        return;
      }

      const street = isLoggedIn && useSavedAddress && hasSavedAddress ? profileData.address.street : deliveryDetails.address;
      const city = isLoggedIn && useSavedAddress && hasSavedAddress ? profileData.address.city : deliveryDetails.city;
      const state = isLoggedIn && useSavedAddress && hasSavedAddress ? profileData.address.state : deliveryDetails.state;
      const pincode = isLoggedIn && useSavedAddress && hasSavedAddress ? profileData.address.pincode : deliveryDetails.pincode;
      const phone = isLoggedIn && useSavedAddress && hasSavedAddress ? profileData.phone : deliveryDetails.phone;

      if (!street || !city || !state || !pincode || !phone) {
        throw new Error("Please complete the delivery details (address, city, state, pincode, phone number).");
      }

      const selectedSizesList = Object.entries(sizeQuantity)
        .filter(([_, qty]) => qty > 0)
        .map(([sizeName, qty]) => `${sizeName} (${qty})`);
      const sizeString = selectedSizesList.length > 0 ? selectedSizesList.join(", ") : "OS";

      const payload: any = {
        productId: product._id,
        productType: "bulk",
        variantId: activeVariant?._id,
        color: activeVariant?.color || undefined,
        size: sizeString,
        quantity: targetQty,
        shippingAddress: {
          street,
          city,
          state,
          pincode,
        },
        phoneNumber: phone,
        customDesign: uploadedDesigns.length > 0 ? `Uploaded (${uploadedDesigns.length} files)` : (designerState ? "Online Customized Design" : undefined),
        anyText: customizationText || undefined,
      };

      const res = await api.buyNowOrder(payload, token);
      
      const orderId = res?.data?.orderId || res?.data?._id;
      setIsCheckoutOpen(false);

      router.push(`/order-confirmed?orderId=${orderId}&amount=${calculatePrice}`);
    } catch (err: any) {
      console.error("Bulk checkout failed:", err);
      // 402 = insufficient wallet balance → prompt the user to recharge
      if (err?.response?.status === 402) {
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined;
          const balRes = await api.getWalletBalance(token);
          setWalletBalance(balRes?.data?.balance ?? 0);
        } catch {
          setWalletBalance(0);
        }
        setCheckoutError("Insufficient wallet balance. Please recharge to complete your order.");
        setShowTopUp(true);
      } else {
        setCheckoutError(err?.response?.data?.message || err?.message || "Checkout failed. Please try again.");
      }
    } finally {
      setLoadingCheckout(false);
    }
  };

  const [selectedGsm, setSelectedGsm] =
    useState<number | null>(null);

  const [selectedCustomization, setSelectedCustomization] =
    useState<string | null>(null);

  const [selectedVariantLocal, setSelectedVariantLocal] =
    useState<any>(null);

  const activeVariant =
    selectedVariantProp ?? selectedVariantLocal;

  const [customizationText, setCustomizationText] =
    useState("");

  const [uploadedDesigns, setUploadedDesigns] =
    useState<string[]>([]);

  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [designerState, setDesignerState] = useState<any>(null);

  const handleSaveCustomDesign = (
    previews: { front?: string; back?: string },
    editorState: any
  ) => {
    setDesignerState(editorState);
    const newDesigns: string[] = [];
    if (previews.front) newDesigns.push(previews.front);
    if (previews.back) newDesigns.push(previews.back);
    
    if (newDesigns.length > 0) {
      setUploadedDesigns((prev) => [...prev, ...newDesigns]);
    }
  };

  // =========================
  // PRODUCT DATA
  // =========================

  const basePrice = product?.basePrice || 0;

  const title = product?.title || "Product";

  const description =
    product?.description || "";

  // FIXED HERE
  const sizes = Array.isArray(product?.sizes)
    ? product.sizes
    : [];

  const colors = Array.isArray(product?.colors)
    ? product.colors
    : [];

  const customizationTypes = Array.isArray(
    product?.customizationTypes
  )
    ? product.customizationTypes
    : [];

  const gsmQuantities = Array.isArray(
    product?.gsmQuantity
  )
    ? product.gsmQuantity
    : [];

  const variants = Array.isArray(
    product?.variants
  )
    ? product.variants
    : [];

  const uploadYourDesignRequired =
    product?.uploadYourDesign ===
    "required";

  const anyTextRequired =
    product?.anyText === "required";

  // =========================
  // SIZE STATE DYNAMIC
  // =========================

  const initialSizeState = useMemo(() => {
    const obj: Record<string, number> = {};

    sizes.forEach((size: string) => {
      obj[size] = 0;
    });

    return obj;
  }, [sizes]);

  const [sizeQuantity, setSizeQuantity] =
    useState<Record<string, number>>({});

  useEffect(() => {
    setSizeQuantity(initialSizeState);
  }, [initialSizeState]);

  // =========================
  // QUANTITY OPTIONS
  // =========================

  const quantityOptions = useMemo(() => {
    const backendQty =
      product?.quantities || [];

    if (
      Array.isArray(backendQty) &&
      backendQty.length > 0
    ) {
      return backendQty.map((qty: number) =>
        qty === 2
          ? `${qty} Pcs Sample`
          : `${qty} Pcs`
      );
    }

    return [];
  }, [product]);

  // =========================
  // DEFAULT SELECT
  // =========================

  useEffect(() => {
    if (
      quantityOptions.length > 0 &&
      !selectedQty
    ) {
      setSelectedQty(quantityOptions[0]);
    }

    if (
      gsmQuantities.length > 0 &&
      selectedGsm === null
    ) {
      setSelectedGsm(gsmQuantities[0]);
    }

    if (
      variants.length > 0 &&
      !selectedVariantProp &&
      !selectedVariantLocal
    ) {
      setSelectedVariantLocal(variants[0]);
    }
  }, [
    quantityOptions,
    gsmQuantities,
    variants,
    selectedQty,
    selectedGsm,
    selectedVariantProp,
    selectedVariantLocal,
  ]);

  // =========================
  // TOTAL SELECTED
  // =========================

  const totalSelected = useMemo(() => {
    return Object.values(
      sizeQuantity
    ).reduce(
      (acc, val) => acc + val,
      0
    );
  }, [sizeQuantity]);

  // =========================
  // PRICE CALCULATION
  // =========================

  const calculatePrice = useMemo(() => {
    let price =
      activeVariant?.finalPrice ||
      basePrice;

    // GSM Pricing
    if (
      activeVariant?.gsmPricingTiers
        ?.length &&
      selectedGsm
    ) {
      const matchedTier =
        activeVariant.gsmPricingTiers.find(
          (tier: any) =>
            Number(
              tier.gsmQuantity
            ) === Number(selectedGsm)
        );

      if (matchedTier) {
        price =
          price *
          (1 +
            matchedTier.addPercentage /
            100);
      }
    }

    // Customization Pricing
    if (selectedCustomization) {
      const customType =
        customizationTypes.find(
          (c: any) =>
            c._id ===
            selectedCustomization
        );

      if (customType) {
        price =
          price *
          (1 +
            customType.addPercentage /
            100);
      }
    }

    // =========================
    // QUANTITY MULTIPLY
    // =========================

    const qty =
      parseInt(
        selectedQty?.match(/\d+/)?.[0] ||
        "1"
      ) || 1;

    price = price * qty;


    return Number(price.toFixed(2));
  }, [
    basePrice,
    activeVariant,
    selectedGsm,
    selectedCustomization,
    customizationTypes,
    selectedQty,
  ]);

  // =========================
  // UPDATE SIZE
  // =========================

  const updateQty = (
    size: string,
    type: "inc" | "dec"
  ) => {
    setSizeQuantity((prev) => ({
      ...prev,

      [size]:
        type === "inc"
          ? (prev[size] || 0) + 1
          : Math.max(
            0,
            (prev[size] || 0) - 1
          ),
    }));
  };

  // =========================
  // DESIGN UPLOAD
  // =========================

  const handleDesignUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    const newImages = files.map((file) =>
      URL.createObjectURL(file)
    );

    setUploadedDesigns((prev) => [
      ...prev,
      ...newImages,
    ]);
  };

  const removeDesign = (index: number) => {
    setUploadedDesigns((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const targetQty =
    parseInt(
      selectedQty?.match(/\d+/)?.[0] ||
      "0"
    ) || 0;

  const isCompleted =
    totalSelected === targetQty;

  const isExceeded =
    totalSelected > targetQty;


    // ================= COLOR HEX MAP =================
  function getColorHex(colorName: string): string {
    const map: Record<string, string> = {
      black: "#171717",
      blue: "#B87D4C",
      red: "#EF4444",
      white: "#ffffff",
      navy: "#B87D4C",
      gray: "#9CA3AF",
      orange: "#B87D4C",
      royalblue: "#B87D4C",
      darkgreen: "#166534",
      purple: "#B87D4C",
      pink: "#C79280",
      green: "#16A34A",
      yellow: "#CBAA75",
    };

    return map[colorName?.toLowerCase()] || "#E8E6E3";
  }


  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="w-full max-w-[460px]"
    >
      {/* TITLE */}
      <div>
        <h1 className="text-[32px] leading-[38px] font-[700] tracking-[-0.2px] text-[#1B1B1B]">
          {title}
        </h1>

        {/* REVIEW */}
        <div className="flex items-center gap-2 mt-[10px]">
          <div className="flex items-center gap-[1px]">
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <Star
                  key={item}
                  className="w-[11px] h-[11px] fill-[#B87D4C] text-[#B87D4C]"
                />
              )
            )}
          </div>

          <span className="text-[12px] text-[#707070] font-medium">
            4.3 (733 Reviews)
          </span>
        </div>

        <p className="text-[10px] text-[#A3A3A3] mt-[3px]">
          11240+ Orders Delivered
        </p>
      </div>

      {/* DESCRIPTION */}
      {description && (
        <p className="text-[13px] text-[#555] mt-4 leading-[20px]">
          {description}
        </p>
      )}

      {/* PRICE */}
      <div className="mt-5 bg-[#F5F1EA] border border-[#E8E6E3] rounded-[4px] px-5 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[32px] font-[700] tracking-[-0.5px] text-[#171717]">
            ₹ {calculatePrice}
          </h2>
        </div>

        <p className="text-[10px] text-[#8B8B8B] mt-[2px]">
          Inclusive of All Taxes
        </p>
      </div>

      {/* UPLOAD DESIGN */}
      {uploadYourDesignRequired && (
        <div className="mt-5">
          {/* HIDDEN INPUT */}
          <input
            type="file"
            id="design-upload"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleDesignUpload}
          />

          <div className="flex flex-col gap-3">
            {/* CUSTOMIZE ONLINE BUTTON */}
            <button
              type="button"
              onClick={() => setIsDesignerOpen(true)}
              className="w-full h-[52px] bg-[#B87D4C] hover:bg-[#B87D4C] rounded-[4px] text-white text-[14px] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border-0 outline-none"
            >
              <Palette className="w-4 h-4" />
              Customize Design Online
            </button>

            {/* UPLOAD BUTTON */}
            <label htmlFor="design-upload" className="w-full">
              <div className="w-full h-[46px] border border-[#E8E6E3] hover:bg-neutral-50 rounded-[4px] text-[#444] text-[13px] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload Existing File
              </div>
            </label>
          </div>

          {/* PREVIEW */}
          {uploadedDesigns.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {uploadedDesigns.map(
                (img, index) => (
                  <div
                    key={index}
                    className="relative w-[82px] h-[82px] rounded-[6px] border border-[#E8E6E3] overflow-hidden bg-white"
                  >
                    {/* IMAGE */}
                    <img
                      src={img}
                      alt="design"
                      className="w-full h-full object-cover"
                    />

                    {/* REMOVE */}
                    <button
                      type="button"
                      onClick={() =>
                        removeDesign(index)
                      }
                      className="absolute top-1 right-1 w-[20px] h-[20px] rounded-full bg-black/70 text-white flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* INFO BOX */}
      <div className="mt-4 border border-[#F5F1EA] bg-[#F5F1EA] rounded-[4px] px-4 py-3 flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <Info className="w-[14px] h-[14px] text-[#B87D4C] mt-[1px]" />

          <p className="text-[10px] leading-[15px] text-[#555] font-medium">
            Design Approval:
            We&apos;ll send a design
            for your approval after
            order is confirmed.
          </p>
        </div>

        <div className="flex items-start gap-2">
          <Info className="w-[14px] h-[14px] text-[#B87D4C] mt-[1px]" />

          <p className="text-[10px] leading-[15px] text-[#555] font-medium">
            No Logo? Place order with
            text only - our team will
            create a custom design for
            you.
          </p>
        </div>
      </div>

      {/* CUSTOMIZATION TEXT */}
      {anyTextRequired && (
        <div className="mt-5">
          <p className="text-[11px] font-semibold text-[#171717] mb-2">
            Any Text or
            Customization Needed *
          </p>

          <textarea
            placeholder="Write here..."
            value={customizationText}
            onChange={(e) =>
              setCustomizationText(
                e.target.value
              )
            }
            className="w-full h-[84px] border border-[#E7E7E7] rounded-[4px] px-4 py-3 resize-none text-[13px] outline-none focus:border-[#B87D4C]"
          />
        </div>
      )}

      {/* CUSTOMIZATION TYPES */}
      {customizationTypes.length >
        0 && (
          <div className="mt-6">
            <p className="text-[11px] font-bold uppercase text-[#171717]">
              Customization Types
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {customizationTypes.map(
                (type: any) => (
                  <button
                    key={type._id}
                    onClick={() =>
                      setSelectedCustomization(
                        type._id
                      )
                    }
                    className={cn(
                      "h-[40px] px-4 rounded-[4px] border text-[11px] font-semibold transition-all",

                      selectedCustomization ===
                        type._id
                        ? "bg-[#171717] border-[#171717] text-white"
                        : "bg-white border-[#E8E6E3] text-[#555]"
                    )}
                  >
                    {type.type} (+
                    {
                      type.addPercentage
                    }
                    %)
                  </button>
                )
              )}
            </div>
          </div>
        )}

      {/* QUANTITY */}
      {quantityOptions.length >
        0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase text-[#171717]">
                Quantity:{" "}
                {selectedQty}
              </p>

              <ChevronDown className="w-4 h-4 text-[#555]" />
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {quantityOptions.map(
                (item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setSelectedQty(
                        item
                      )
                    }
                    className={cn(
                      "h-[30px] px-3 rounded-[4px] border text-[10px] font-semibold transition-all",

                      selectedQty === item
                        ? "bg-[#171717] border-[#171717] text-white"
                        : "bg-white border-[#E8E6E3] text-[#555]"
                    )}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        )}

      {/* GSM QUALITY */}
      {gsmQuantities.length > 0 && (
        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase text-[#171717]">
            GSM Quality
          </p>

          <div className="flex flex-wrap gap-2 mt-3">
            {gsmQuantities.map(
              (gsm: number) => (
                <button
                  key={gsm}
                  onClick={() =>
                    setSelectedGsm(
                      gsm
                    )
                  }
                  className={cn(
                    "h-[30px] px-4 rounded-[4px] border text-[10px] font-semibold transition-all",

                    selectedGsm === gsm
                      ? "bg-[#171717] border-[#171717] text-white"
                      : "bg-white border-[#E8E6E3] text-[#555]"
                  )}
                >
                  {gsm} GSM
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* AVAILABLE COLORS */}
      {variants.length > 0 && (
        <div className="mt-7">
          <p className="font-bold">
            Color:{" "}
            <span className="text-[#B87D4C] uppercase">
              {activeVariant?.color || "Select"}
            </span>
          </p>

          <div className="grid grid-cols-5 gap-4 mt-4">
            {variants.map((variant: any) => {
              const colorName = variant.color?.toLowerCase() || "unknown";

              const colorHex = getColorHex(colorName); // use your helper

              return (
                <button
                  key={variant._id}
                  onClick={() => {
                    if (setSelectedVariantProp) {
                      setSelectedVariantProp(variant);
                    } else {
                      setSelectedVariantLocal(variant);
                    }
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  {/* COLOR BOX */}
                  <div
                    className={cn(
                      "w-[66px] h-[66px] rounded border-2 transition-all",
                      activeVariant?._id === variant._id
                        ? "border-[#B87D4C]"
                        : "border-gray-300"
                    )}
                    style={{ backgroundColor: colorHex }}
                  />

                  {/* COLOR NAME */}
                  <span className="text-[10px] uppercase">
                    {variant.color}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}


      {/* SIZE COUNTER */}
      {sizes.length > 0 && (
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p
                className={cn(
                  "text-[11px] font-semibold transition-all",

                  isCompleted
                    ? "text-green-600"
                    : isExceeded
                      ? "text-red-500"
                      : "text-[#B87D4C]"
                )}
              >
                Select {targetQty} pieces.
              </p>

              {isCompleted && (
                <span className="text-[10px] text-green-600 font-medium mt-[2px]">
                  Completed ✓
                </span>
              )}

              {isExceeded && (
                <span className="text-[10px] text-red-500 font-medium mt-[2px]">
                  Quantity exceeded
                </span>
              )}
            </div>

            <p
              className={cn(
                "text-[11px] font-semibold transition-all",

                isCompleted
                  ? "text-green-600"
                  : isExceeded
                    ? "text-red-500"
                    : "text-[#666]"
              )}
            >
              Selected {totalSelected}/
              {targetQty}
            </p>
          </div>

          {/* PROGRESS */}
          <div className="w-full h-[5px] bg-[#F5F1EA] rounded-full mt-3 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",

                isCompleted
                  ? "bg-green-500"
                  : isExceeded
                    ? "bg-red-500"
                    : "bg-[#B87D4C]"
              )}
              style={{
                width: `${Math.min(
                  (totalSelected /
                    targetQty) *
                  100,
                  100
                )}%`,
              }}
            />
          </div>

          {/* SIZE LIST */}
          <div className="mt-5 border-t border-[#E8E6E3]">
            {sizes.map((size: string) => {
              const disableAdd =
                totalSelected >= targetQty;

              return (
                <div
                  key={size}
                  className="h-[58px] border-b border-[#E8E6E3] flex items-center justify-between"
                >
                  <div className="text-[13px] text-[#333]">
                    {size}
                  </div>

                  <div className="flex items-center gap-5">
                    {/* MINUS */}
                    <button
                      onClick={() =>
                        updateQty(size, "dec")
                      }
                      className="w-[24px] h-[24px] rounded-full border border-[#E8E6E3] flex items-center justify-center hover:bg-[#F5F1EA]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    {/* QTY */}
                    <span className="w-[16px] text-center text-[13px] font-semibold">
                      {sizeQuantity[size] || 0}
                    </span>

                    {/* PLUS */}
                    <button
                      disabled={disableAdd}
                      onClick={() =>
                        updateQty(size, "inc")
                      }
                      className={cn(
                        "w-[24px] h-[24px] rounded-full border flex items-center justify-center transition-all",

                        disableAdd
                          ? "border-[#E8E6E3] bg-[#F5F1EA] opacity-50 cursor-not-allowed"
                          : "border-[#E8E6E3] hover:bg-[#F5F1EA]"
                      )}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BUY NOW */}
      <div className="mt-8">
        <Button 
          onClick={() => {
            if (!isCompleted) {
              alert(`Please select exactly ${targetQty} pieces across sizes before checking out.`);
              return;
            }
            setIsCheckoutOpen(true);
          }}
          className="w-full h-[58px] rounded-[4px] bg-[#171717] hover:bg-black text-white text-[14px] font-semibold tracking-wide"
        >
          <Lock className="w-4 h-4 mr-2" />
          BUY NOW
        </Button>
      </div>

      {/* CHECKOUT DIALOG */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md bg-white border border-[#E8E6E3] p-6 text-neutral-900 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Checkout & Place Order</DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 mt-1">
              Complete your delivery details to place your bulk order of {targetQty} pieces.
            </DialogDescription>
          </DialogHeader>

          {/* ORDER SUMMARY */}
          <div className="my-4 p-4 rounded bg-[#F9F9F9] border border-[#E8E6E3] text-sm space-y-2">
            <h4 className="font-semibold text-neutral-800 border-b pb-1.5 mb-1.5">Order Summary</h4>
            <div className="flex justify-between">
              <span className="text-neutral-500">Product:</span>
              <span className="font-medium">{title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Color:</span>
              <span className="font-medium uppercase">{activeVariant?.color || "Default"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">GSM:</span>
              <span className="font-medium">{selectedGsm} GSM</span>
            </div>
            {customizationText && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Custom Text:</span>
                <span className="font-medium truncate max-w-[200px]">{customizationText}</span>
              </div>
            )}
            <div className="flex justify-between text-[#B87D4C] font-bold border-t pt-1.5 mt-1.5">
              <span>Total Price:</span>
              <span>₹ {calculatePrice}</span>
            </div>
          </div>

          {/* DELIVERY DETAILS FORM */}
          {!isLoggedIn ? (
            <div className="space-y-4">
              <div className="p-4 rounded-md border border-[#E8E6E3] bg-white text-sm text-center">
                <p className="font-semibold text-neutral-800">Please log in to place your order</p>
                <p className="text-neutral-600 mt-1">
                  Orders are paid from your wallet, so you&apos;ll need an account to check out.
                </p>
              </div>
              <Button
                className="w-full h-[48px] bg-[#171717] hover:bg-black text-white rounded font-semibold text-sm"
                onClick={() => router.push("/login")}
              >
                Log in to continue
              </Button>
            </div>
          ) : hasSavedAddress && useSavedAddress ? (
            <div className="space-y-4">
              <div className="p-4 rounded-md border border-[#E8E6E3] bg-white text-sm">
                <p className="font-semibold text-neutral-800">Deliver to Saved Address:</p>
                <p className="text-neutral-700 mt-1 font-medium">{profileData?.name}</p>
                <p className="text-neutral-600">{profileData?.phone}</p>
                <p className="text-neutral-600 mt-1">
                  {profileData?.address?.street}, {profileData?.address?.city}, {profileData?.address?.state} - {profileData?.address?.pincode}
                </p>
                <button
                  type="button"
                  onClick={() => setUseSavedAddress(false)}
                  className="text-xs text-[#B87D4C] hover:underline mt-2 font-medium block text-left"
                >
                  Use a different address
                </button>
              </div>
              {checkoutError && <div className="text-sm text-red-600 font-medium">{checkoutError}</div>}
              <Button
                className="w-full h-[48px] bg-[#171717] hover:bg-black text-white rounded font-semibold text-sm"
                onClick={handlePlaceBulkOrder}
                disabled={loadingCheckout}
              >
                {loadingCheckout ? 'Placing order...' : 'Place Order'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-neutral-800">Delivery Details</h4>
                {hasSavedAddress && (
                  <button
                    type="button"
                    onClick={() => setUseSavedAddress(true)}
                    className="text-xs text-[#B87D4C] hover:underline font-medium"
                  >
                    Use saved address
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                <Input
                  placeholder="Phone"
                  value={deliveryDetails.phone}
                  onChange={(e) => setDeliveryDetails((d) => ({ ...d, phone: e.target.value }))}
                  className="h-[38px] text-xs border-[#E8E6E3]"
                />
                <Input
                  placeholder="Address"
                  value={deliveryDetails.address}
                  onChange={(e) => setDeliveryDetails((d) => ({ ...d, address: e.target.value }))}
                  className="h-[38px] text-xs border-[#E8E6E3]"
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="City"
                    value={deliveryDetails.city}
                    onChange={(e) => setDeliveryDetails((d) => ({ ...d, city: e.target.value }))}
                    className="h-[38px] text-xs border-[#E8E6E3]"
                  />
                  <Input
                    placeholder="State"
                    value={deliveryDetails.state}
                    onChange={(e) => setDeliveryDetails((d) => ({ ...d, state: e.target.value }))}
                    className="h-[38px] text-xs border-[#E8E6E3]"
                  />
                </div>
                <Input
                  placeholder="Pincode"
                  value={deliveryDetails.pincode}
                  onChange={(e) => setDeliveryDetails((d) => ({ ...d, pincode: e.target.value }))}
                  className="h-[38px] text-xs border-[#E8E6E3]"
                />
              </div>

              {checkoutError && <div className="text-sm text-red-600 font-medium">{checkoutError}</div>}
              
              <Button
                className="w-full h-[48px] bg-[#171717] hover:bg-black text-white rounded font-semibold text-sm"
                onClick={handlePlaceBulkOrder}
                disabled={loadingCheckout}
              >
                {loadingCheckout ? 'Placing order...' : 'Place Order'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* T-SHIRT DESIGNER MODAL */}
      <TShirtDesigner
        isOpen={isDesignerOpen}
        onClose={() => setIsDesignerOpen(false)}
        onSave={handleSaveCustomDesign}
        initialState={designerState}
      />

      {/* WALLET TOP-UP (shown when balance is insufficient at checkout) */}
      <WalletTopUpModal
        open={showTopUp}
        onClose={() => setShowTopUp(false)}
        currentBalance={walletBalance}
        onSuccess={(newBalance: number) => {
          setWalletBalance(newBalance);
          setShowTopUp(false);
          setCheckoutError("Wallet recharged. Click Place Order to complete your order.");
        }}
      />
    </motion.div>
  );
}