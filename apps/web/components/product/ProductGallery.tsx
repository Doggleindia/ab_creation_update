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
  const gallery = images.length ? images : ["/images/product/pdp-1.png"];

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-[#c4c7c7] bg-[#f9fafb]">
        <Image
          key={gallery[active]}
          src={gallery[active]}
          alt="Product image"
          fill
          priority
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 540px"
        />
        {wishlistItem && (
          <WishlistButton
            item={wishlistItem}
            iconClassName="h-5 w-5"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#c4c7c7] bg-white shadow-sm transition-colors hover:bg-[#f5f1ea]"
          />
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {gallery.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#f9fafb] ${
              active === i
                ? "border-2 border-black"
                : "border border-[#c4c7c7]"
            }`}
          >
            <Image
              src={img}
              alt=""
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
