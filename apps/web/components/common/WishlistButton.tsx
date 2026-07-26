"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import {
  type WishlistItem,
  inWishlist,
  subscribeWishlist,
  toggleWishlist,
} from "@/lib/wishlist";

export default function WishlistButton({
  item,
  className = "",
  iconClassName = "h-4 w-4",
}: {
  item: WishlistItem;
  className?: string;
  iconClassName?: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(inWishlist(item.slug));
    sync();
    return subscribeWishlist(sync);
  }, [item.slug]);

  return (
    <button
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        toggleWishlist(item);
      }}
      className={className}
    >
      <Heart
        className={`${iconClassName} transition-colors ${
          saved ? "fill-[#dc2626] text-[#dc2626]" : "text-[#1b1c1b]"
        }`}
      />
    </button>
  );
}
