"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as api from "@/lib/api";
import TShirtDesigner from "@/components/Bulk-Order/TShirtDesigner";
import { notifyCartUpdate, getLocalCart, setLocalCart, type CartItem } from "@/lib/cart";

export default function ProductFormRight({
  product,
  onVariantChange,
}: {
  product?: any;
  onVariantChange?: (images: string[], videos: string[]) => void;
}) {
  const router = useRouter();
  
  // ✅ normalize initial state
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes?.[0] || "S"
  );

  const [selectedColor, setSelectedColor] = useState(
    product?.variants?.[0]?.color?.toLowerCase() || "black"
  );

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  // ===== Online customization (design studio) =====
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [designerState, setDesignerState] = useState<any>(null);
  const [designUrls, setDesignUrls] = useState<string[]>([]);
  const [uploadingDesign, setUploadingDesign] = useState(false);

  // Save the designed previews: upload them to S3 and keep the resulting URLs
  const handleSaveDesign = async (
    previews: { front?: string; back?: string },
    editorState: any
  ): Promise<string[]> => {
    setDesignerState(editorState);
    const dataUrls = [previews.front, previews.back].filter(Boolean) as string[];
    if (dataUrls.length === 0) return [];

    setUploadingDesign(true);
    setCartError(null);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined;
      const files = await Promise.all(
        dataUrls.map(async (src, i) => {
          const blob = await (await fetch(src)).blob();
          const ext = (blob.type && blob.type.split("/")[1]) || "png";
          return new File([blob], `design-${i + 1}.${ext}`, {
            type: blob.type || "image/png",
          });
        })
      );
      const res = await api.uploadDesigns(files, token);
      const urls = res?.data?.urls || [];
      setDesignUrls(urls);
      return urls;
    } catch (err) {
      console.error("Design upload failed", err);
      setCartError("Failed to save your design. Please log in and try again.");
      return [];
    } finally {
      setUploadingDesign(false);
    }
  };

  // If the user designed in the Design Studio (/design-editor) and was sent here
  // to pick a product, pick up that stashed design and attach it automatically.
  // Only clear the stash once the upload actually succeeds, so a failure
  // (e.g. not logged in) can be retried on the next visit instead of losing it.
  useEffect(() => {
    const KEY = "kt-pending-design";
    const clear = () => {
      try {
        sessionStorage.removeItem(KEY);
      } catch {
        /* ignore */
      }
    };

    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(KEY);
    } catch {
      return;
    }
    if (!raw) return;

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      clear();
      return;
    }

    // Logged-in studio path already uploaded the artwork — just attach the URLs.
    if (Array.isArray(parsed?.urls) && parsed.urls.length > 0) {
      setDesignUrls(parsed.urls);
      if (parsed.state) setDesignerState(parsed.state);
      clear();
      return;
    }

    if (!parsed?.previews) {
      clear();
      return;
    }

    // Guest path: artwork still needs uploading, which requires login.
    // Keep the stash so it attaches once they log in and return to a product.
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined;
    if (!token) {
      if (parsed.state) setDesignerState(parsed.state);
      setCartError("Log in to attach the design you created in the studio.");
      return;
    }

    handleSaveDesign(parsed.previews, parsed.state).then((urls) => {
      if (urls.length > 0) clear();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sizes = product?.sizes || ["S", "M", "L", "XL", "XXL"];

  // ================= NORMALIZED COLOR VARIANTS =================
  const colorVariants = useMemo(() => {
    if (!product?.variants) return [];

    const map = new Map();

    product.variants.forEach((v: any) => {
      const key = v.color?.toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          ...v,
          color: key,
        });
      }
    });

    return Array.from(map.values());
  }, [product?.variants]);

  // ================= SELECTED VARIANT =================
  const selectedVariant = useMemo(() => {
    if (!product?.variants) return null;

    return product.variants.find(
      (v: any) => v.color?.toLowerCase() === selectedColor
    );
  }, [product?.variants, selectedColor]);

  // ================= INIT FIRST VARIANT =================
  useEffect(() => {
    if (product?.variants?.length) {
      const first = product.variants[0];

      const firstColor = first.color?.toLowerCase() || "black";
      setSelectedColor(firstColor);

      onVariantChange?.(
        first.media?.images || [],
        first.media?.videos || []
      );
    }
  }, [product]);

  // ================= PRICE =================
  const basePrice = product?.basePrice || 0;
  const discountPercentage = product?.discountPercentage || 0;

  // selected variant price adjustment
  const variantPercentage =
    selectedVariant?.addPercentageInBasePrice || 0;

  // final calculation
  const variantPrice = basePrice + (basePrice * variantPercentage) / 100;

  const discountedPrice =
    variantPrice - Math.round((variantPrice * discountPercentage) / 100);

  // ================= COLOR CHANGE =================
  const handleColorChange = (color: string) => {
    const normalized = color.toLowerCase();

    setSelectedColor(normalized);

    const variant = product?.variants?.find(
      (v: any) => v.color?.toLowerCase() === normalized
    );

    if (variant) {
      onVariantChange?.(
        variant.media?.images || [],
        variant.media?.videos || []
      );
    }
  };

  const isOutOfStock = selectedVariant?.availableStock === 0;
  const stockCount = selectedVariant?.availableStock || 0;

  // ================= ADD TO CART HANDLER =================
  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    if (!selectedVariant) {
      setCartError("Please select a valid variant.");
      return;
    }

    setCartError(null);
    setIsAdding(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined;

    if (token) {
      // Logged in user: add via API
      try {
        const payload = {
          productType: product?.productType || "ready",
          productId: product?._id,
          variantId: selectedVariant._id || selectedVariant.id || "",
          quantity,
          size: selectedSize,
          customDesign: designUrls.length ? "Online Customized Design" : undefined,
          designFiles: designUrls,
          designState: designUrls.length ? designerState || undefined : undefined,
        };

        await api.addToCart(payload, token);

        // Fetch updated cart from backend to sync localStorage cache and update badge
        try {
          const cartData = await api.getCart(token);
          if (cartData?.cartItems) {
            setLocalCart(cartData.cartItems);
          }
        } catch (err) {
          console.error("Failed to sync cart cache after add", err);
        }

        notifyCartUpdate();
        router.push("/add-to-cart");
      } catch (error: any) {
        console.error("Add to cart failed", error);
        setCartError(
          error?.response?.data?.message || error?.message || "Unable to add item to cart"
        );
      } finally {
        setIsAdding(false);
      }
    } else {
      // Guest user: add via Local Storage
      try {
        const localItems = getLocalCart();
        // A customized item is always its own line so its artwork is preserved.
        const existingIndex = designUrls.length
          ? -1
          : localItems.findIndex(
              (item) =>
                item.productId === product?._id &&
                item.variantId === (selectedVariant._id || selectedVariant.id || "") &&
                item.snapshot.size === selectedSize
            );

        const unitPrice = discountedPrice;
        const subtotal = unitPrice * quantity;
        const discount = Math.round((variantPrice * discountPercentage) / 100) * quantity;
        const finalTotal = subtotal;

        if (existingIndex > -1) {
          const existingItem = localItems[existingIndex];
          const newQuantity = existingItem.quantity + quantity;
          const newSubtotal = existingItem.pricing.unitPrice * newQuantity;
          const newDiscount = (existingItem.pricing.discount / existingItem.quantity) * newQuantity;
          localItems[existingIndex] = {
            ...existingItem,
            quantity: newQuantity,
            pricing: {
              ...existingItem.pricing,
              subtotal: newSubtotal,
              discount: newDiscount,
              finalTotal: newSubtotal - newDiscount,
            },
          };
        } else {
          const newItem: CartItem = {
            _id: Math.random().toString(36).substring(2, 9),
            productId: product?._id,
            variantId: selectedVariant._id || selectedVariant.id || "",
            quantity,
            snapshot: {
              title: product?.title || "Product Title",
              image: selectedVariant?.media?.images?.[0] || product?.media?.images?.[0] || "/images/home/Menclothing.png",
              size: selectedSize,
              color: selectedColor,
              customDesign: designUrls.length ? "Online Customized Design" : undefined,
              designFiles: designUrls,
              designState: designUrls.length ? designerState || undefined : undefined,
            },
            pricing: {
              unitPrice,
              subtotal,
              discount,
              finalTotal,
              currency: "INR",
            },
          };
          localItems.push(newItem);
        }

        setLocalCart(localItems);
        notifyCartUpdate();
        router.push("/add-to-cart");
      } catch (error: any) {
        console.error("Local add to cart failed", error);
        setCartError("Unable to add item to cart");
      } finally {
        setIsAdding(false);
      }
    }
  };

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* TITLE */}
      <h1 className="text-[28px] font-bold text-[#171717]">
        {product?.title || "Product Title"}
      </h1>

      {/* DESCRIPTION (ADD THIS) */}
      {product?.description && (
        <p className="mt-3 text-[13px] text-[#666] leading-[20px]">
          {product.description}
        </p>
      )}
      {/* ================= PRICE ================= */}
      <div className="mt-5 bg-[#f3f3f3] border border-[#ebebeb] rounded-sm px-5 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[34px] font-[700] text-[#171717]">
            ₹ {discountedPrice}.00
          </h2>

          {discountPercentage > 0 && (
            <>
              <span className="line-through text-[#9b9b9b] text-[15px]">
                ₹ {variantPrice.toFixed(0)}.00
              </span>

              <span className="bg-[#B87D4C] text-white text-[10px] px-2 py-[2px] rounded-sm font-semibold">
                SAVE {discountPercentage}%
              </span>
            </>
          )}
        </div>

        <p className="text-[11px] text-[#7a7a7a] mt-1">
          Inclusive of All Taxes
        </p>
      </div>

      {/* STOCK */}
      <div className="mt-3">
        {isOutOfStock ? (
          <p className="text-red-500">Out of Stock</p>
        ) : (
          <p className="text-green-600">
            In Stock - {stockCount}
          </p>
        )}
      </div>

      {/* SIZE */}
      <div className="mt-6">
        <p className="font-bold">Size</p>

        <div className="flex gap-2 mt-2">
          {sizes.map((size: string) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                "px-3 py-1 border rounded",
                selectedSize === size
                  ? "bg-black text-white"
                  : "bg-white"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="font-bold">Quantity</p>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="mt-2 w-24 border border-gray-300 rounded px-3 py-2"
        />
      </div>

      {/* COLORS */}
      <div className="mt-7">
        <p className="font-bold">
          Color:{" "}
          <span className="text-[#B87D4C] uppercase">
            {selectedColor}
          </span>
        </p>

        <div className="grid grid-cols-5 gap-4 mt-4">
          {colorVariants.map((v: any) => {
            const colorName =
              v.color?.toLowerCase() || "unknown";

            const colorHex = getColorHex(colorName);

            return (
              <button
                key={v._id}
                onClick={() =>
                  handleColorChange(v.color)
                }
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "w-[66px] h-[66px] rounded border-2",
                    selectedColor === colorName
                      ? "border-[#B87D4C]"
                      : "border-gray-300"
                  )}
                  style={{ backgroundColor: colorHex }}
                />

                <span className="text-[10px] uppercase">
                  {v.color}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CUSTOMIZE DESIGN ONLINE */}
      <div className="mt-7">
        <button
          type="button"
          onClick={() => setIsDesignerOpen(true)}
          disabled={uploadingDesign}
          className="w-full h-[52px] bg-[#F97316] hover:bg-[#ea6a0c] rounded-md text-white text-[14px] font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Palette className="w-4 h-4" />
          {uploadingDesign
            ? "Saving design..."
            : designUrls.length
            ? "Edit Your Design"
            : "Customize Design Online"}
        </button>

        {/* DESIGN PREVIEWS */}
        {designUrls.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {designUrls.map((img, index) => (
              <div
                key={index}
                className="relative w-[72px] h-[72px] rounded-md border border-[#E8E6E3] overflow-hidden bg-white"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src={img}
                  alt={`design-${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setDesignUrls((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full bg-black/70 text-white flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BUTTON */}
      <div className="mt-4">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className="w-full h-[56px] bg-black text-white"
        >
          <Lock className="w-4 h-4 mr-2" />
          {isOutOfStock ? "OUT OF STOCK" : isAdding ? "ADDING..." : "ADD TO CART"}
        </Button>
        {cartError && (
          <p className="mt-3 text-sm text-red-600">{cartError}</p>
        )}
      </div>

      {/* DESIGN STUDIO MODAL */}
      <TShirtDesigner
        isOpen={isDesignerOpen}
        onClose={() => setIsDesignerOpen(false)}
        onSave={handleSaveDesign}
        initialState={designerState}
      />
    </motion.div>
  );
}