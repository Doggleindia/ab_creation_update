// ProductGallery.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const defaultImages = [
  "/images/apparel-order/big.png",
  "/images/apparel-order/small.png",
  "/images/apparel-order/small.png",
  "/images/apparel-order/small.png",
];

export default function ProductGallery({
  images: propImages,
  videos: propVideos,
}: {
  images?: string[];
  videos?: string[];
}) {
  const galleryImages =
    propImages && propImages.length ? propImages : defaultImages;

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [propImages]);

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
        className="relative overflow-hidden bg-white border border-[#E8E6E3]"
      >
        <div className="relative h-[610px] w-full">
          <Image
            src={active}
            alt="product"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* LEFT BTN */}
        <button
          onClick={prevImage}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition"
        >
          <ChevronLeft size={18} />
        </button>

        {/* RIGHT BTN */}
        <button
          onClick={nextImage}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition"
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
            className={`relative h-[120px] border overflow-hidden transition ${
              activeIndex === index
                ? "border-[#B87D4C]"
                : "border-[#E8E6E3]"
            }`}
          >
            <Image
              src={img}
              alt={`Product thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}