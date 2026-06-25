"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as api from "@/lib/api";
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
        const existingIndex = localItems.findIndex(
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

      {/* BUTTON */}
      <div className="mt-8">
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
    </motion.div>
  );
}