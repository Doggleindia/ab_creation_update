"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import {
  type WishlistItem,
  getWishlist,
  removeFromWishlist,
  subscribeWishlist,
} from "@/lib/wishlist";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sync = () => setItems(getWishlist());
    sync();
    setMounted(true);
    return subscribeWishlist(sync);
  }, []);

  return (
    <AccountShell>
      <h1 className="pb-6 text-[28px] font-bold tracking-[-0.5px] text-black">
        Wishlist{mounted && items.length > 0 ? ` (${items.length})` : ""}
      </h1>

      {mounted && items.length === 0 ? (
        <div className="flex flex-col items-center rounded-[12px] border border-[#e5e7eb] py-20 text-center">
          <Heart className="h-10 w-10 text-[#d1d5db]" />
          <p className="pt-4 text-[15px] font-semibold text-black">
            Your wishlist is empty
          </p>
          <p className="pt-1 text-[13px] text-[#6b7280]">
            Tap the heart on any product to save it here.
          </p>
          <Link
            href="/collection"
            className="mt-6 rounded-full bg-brand-orange px-7 py-2.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
          >
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.slug}
              className="group relative overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-white"
            >
              <button
                aria-label={`Remove ${item.title} from wishlist`}
                onClick={() => removeFromWishlist(item.slug)}
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#6b7280] shadow-sm hover:text-black"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <Link href={`/product/${item.slug}`}>
                <div className="relative h-[160px] w-full bg-[#f8f9fb]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain p-3"
                    sizes="(max-width: 640px) 50vw, 220px"
                  />
                </div>
                <div className="px-4 pb-4 pt-3">
                  <p className="truncate text-[14px] font-bold text-black">
                    {item.title}
                  </p>
                  <p className="pt-0.5 text-[14px] text-[#374151]">
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
