"use client";

import { useState } from "react";
import Image from "next/image";
import WishlistButton from "@/components/common/WishlistButton";
import type { WishlistItem } from "@/lib/wishlist";

export default function ProductGallery({
  images,
  wishlistItem,
}: {
  images: string[];
  wishlistItem?: WishlistItem;
}) {
  const [active, setActive] = useState(0);
  const gallery =
    // Only the product's own photos — never pad with unrelated stock art.
    images;

  return (
    <div className="flex flex-col gap-4">
      {/* Main image box */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#e5e7eb] bg-[#f9fafb]">
        <Image
          key={gallery[active]}
          src={gallery[active]!}
          alt="Product main image"
          fill
          priority
          className="object-contain p-6"
          sizes="(max-width: 1024px) 100vw, 540px"
        />
        {wishlistItem && (
          <WishlistButton
            item={wishlistItem}
            iconClassName="h-5 w-5 text-gray-700"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-transform hover:scale-105"
          />
        )}
      </div>

      {/* 6 Thumbnails Grid */}
      <div className="grid grid-cols-6 gap-2">
        {gallery.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            className={`relative aspect-square w-full overflow-hidden rounded-lg bg-[#f9fafb] transition-all ${
              active === i
                ? "border-2 border-black"
                : "border border-[#e5e7eb] opacity-80 hover:opacity-100"
            }`}
          >
            <Image
              src={img}
              alt=""
              fill
              className="object-cover p-1"
              sizes="80px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
