// ProductGallery.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import type { SyntheticEvent } from "react";

const defaultImages = [
  "/images/apparel-order/big.png",
  "/images/apparel-order/small.png",
  "/images/apparel-order/small.png",
  "/images/apparel-order/small.png",
];

export default function ProductGallery({
  images: propImages,
  variants,
  selectedVariant,
}: {
  images?: string[];
  variants?: any[];
  selectedVariant?: any;
}) {
  // Extract unique images from variants
  const variantImages = useMemo(() => {
    if (!variants || variants.length === 0) return [];
    const uniqueImages = new Set<string>();
    variants.forEach((variant) => {
      if (variant.images && Array.isArray(variant.images)) {
        variant.images.forEach((img: string) => uniqueImages.add(img));
      }
    });
    return Array.from(uniqueImages);
  }, [variants]);

  // If a specific variant is selected, prefer its images
  const selectedVariantImages =
    selectedVariant && Array.isArray(selectedVariant.images) && selectedVariant.images.length
      ? selectedVariant.images
      : null;

  const galleryImages: string[] =
    (propImages && propImages.length ? propImages : null) ||
    (selectedVariantImages as string[]) ||
    (variantImages && variantImages.length ? variantImages : null) ||
    defaultImages;

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [propImages, variantImages, selectedVariant]);

  const active = galleryImages[activeIndex];

  if (!galleryImages.length) return null;

  const prevImage = () => {
    setActiveIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setActiveIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="w-full">
      {/* MAIN IMAGE */}
      <motion.div
        key={active}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden bg-white border border-[#e8e8e8]"
      >
        <div className="relative h-[610px] w-full">
          <Image
            src={active}
            alt="product"
            fill
            className="object-cover"
            onError={(e: SyntheticEvent<HTMLImageElement>) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/apparel-order/big.png";
            }}
          />
        </div>

        {/* LEFT BTN */}
        <button
          onClick={prevImage}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center"
        >
          <ChevronLeft size={18} />
        </button>

        {/* RIGHT BTN */}
        <button
          onClick={nextImage}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center"
        >
          <ChevronRight size={18} />
        </button>
      </motion.div>

      {/* THUMBNAILS */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        {galleryImages.map((img, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`relative h-[120px] border overflow-hidden ${
              activeIndex === index
                ? "border-[#ff6b00]"
                : "border-[#e5e5e5]"
            }`}
          >
            <Image
              src={img}
              alt=""
              fill
              className="object-cover"
              onError={(e: SyntheticEvent<HTMLImageElement>) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/apparel-order/big.png";
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}