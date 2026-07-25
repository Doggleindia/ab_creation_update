"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Heart } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import { BACKEND } from "@/lib/auth";
import { addToCart } from "@/lib/cart";
import {
  type WishlistItem,
  getWishlist,
  removeFromWishlist,
  subscribeWishlist,
} from "@/lib/wishlist";

type LiveVariant = {
  _id: string;
  color?: string;
  media?: { images?: string[] };
  availableStock?: number;
  isOutOfStock?: boolean;
};

type LiveProduct = {
  _id: string;
  slug: string;
  title: string;
  basePrice: number;
  discountPercentage?: number;
  sizes?: string[];
  customizationTypes?: string[];
  variants?: LiveVariant[];
};

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [live, setLive] = useState<Map<string, LiveProduct>>(new Map());
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const sync = () => setItems(getWishlist());
    sync();
    setMounted(true);
    return subscribeWishlist(sync);
  }, []);

  // Live catalog data: current price + real stock per product
  useEffect(() => {
    fetch(`${BACKEND}/api/products?limit=200`)
      .then((r) => r.json())
      .then((j) => {
        const map = new Map<string, LiveProduct>();
        for (const p of (j?.data ?? []) as LiveProduct[]) map.set(p.slug, p);
        setLive(map);
      })
      .catch(() => {});
  }, []);

  const flash = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 2500);
  };

  const priceOf = (p: LiveProduct) =>
    Math.round(p.basePrice * (1 - (p.discountPercentage || 0) / 100));

  const inStock = (p: LiveProduct) =>
    (p.variants ?? []).some((v) => (v.availableStock ?? 0) > 0);

  function addItem(item: WishlistItem, p: LiveProduct) {
    const variant =
      (p.variants ?? []).find((v) => (v.availableStock ?? 0) > 0) ?? p.variants?.[0];
    const size = p.sizes?.[0] ?? "M";
    addToCart({
      id: `wl-${p._id}-${Date.now()}`,
      slug: p.slug,
      title: p.title,
      variant: [variant?.color, `Size ${size}`].filter(Boolean).join(" · "),
      image: variant?.media?.images?.[0] ?? item.image,
      price: priceOf(p),
      quantity: 1,
      productId: p._id,
      productType: "ready",
      variantId: variant?._id,
      color: variant?.color,
      size,
    });
    flash(`Added to cart — ${[variant?.color, size].filter(Boolean).join(" · ")}. Adjust in cart.`);
  }

  function remove(slug: string) {
    removeFromWishlist(slug);
    flash("Item removed from wishlist");
  }

  const rows = useMemo(
    () => items.map((item) => ({ item, product: live.get(item.slug) ?? null })),
    [items, live],
  );

  return (
    <AccountShell>
      {/* Toast */}
      {toast && (
        <div className="fixed right-6 top-6 z-[90] flex items-center gap-2.5 rounded-[10px] bg-black px-5 py-3.5 text-[14px] font-semibold text-white shadow-lg">
          <CheckCircle2 className="h-[18px] w-[18px] text-[#4ade80]" />
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[32px] font-bold tracking-[-0.6px] text-black">
          Wishlist{" "}
          {mounted && (
            <span className="text-[18px] font-medium text-[#6b7280]">
              ({items.length} item{items.length === 1 ? "" : "s"})
            </span>
          )}
        </h1>
        <Link
          href="/collection"
          className="rounded-[10px] border border-[#c4c7c7] bg-white px-6 py-3 text-[14px] font-bold text-black hover:border-black"
        >
          Continue Shopping
        </Link>
      </div>

      {mounted && items.length === 0 ? (
        <div className="mt-6 rounded-[12px] border border-[#e5e7eb] bg-white p-14 text-center">
          <Heart className="mx-auto h-8 w-8 text-[#e5e7eb]" />
          <p className="pt-4 text-[16px] font-semibold text-black">
            Your wishlist is empty
          </p>
          <p className="pt-1.5 text-[13.5px] text-[#6b7280]">
            Tap the heart on any product to save it here.
          </p>
          <Link
            href="/collection"
            className="mt-6 inline-block rounded-[8px] bg-black px-7 py-3 text-[13.5px] font-bold text-white hover:opacity-85"
          >
            Browse the Collection
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {rows.map(({ item, product }) => {
            const gone = mounted && live.size > 0 && !product;
            const stocked = product ? inStock(product) : true;
            const customizable = (product?.customizationTypes?.length ?? 0) > 0;
            return (
              <div
                key={item.slug}
                className="flex flex-col overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-white"
              >
                <Link
                  href={`/product/${item.slug}`}
                  className="relative block h-[240px] bg-[#f6f5f2]"
                >
                  {item.image && (
                    /* eslint-disable-next-line @next/next/no-img-element -- catalog imagery on S3 */
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <Heart className="absolute right-3 top-3 h-6 w-6 fill-[#dc2626] text-[#dc2626]" />
                  {product && !stocked && (
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-black bg-white px-4 py-1.5 text-[12px] font-bold uppercase tracking-[1px] text-black">
                      Out of Stock
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <Link
                    href={`/product/${item.slug}`}
                    className="truncate text-[16px] font-bold text-black hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="pt-1 text-[18px] font-bold text-black">
                    ₹{(product ? priceOf(product) : item.price).toLocaleString("en-IN")}
                  </p>
                  <p
                    className={`pt-1 text-[13px] font-semibold ${
                      gone
                        ? "text-[#9ca3af]"
                        : stocked
                          ? "text-[#16a34a]"
                          : "text-[#dc2626]"
                    }`}
                  >
                    {gone ? "No longer available" : stocked ? "In Stock" : "Out of Stock"}
                  </p>
                  <div className="mt-auto pt-3">
                    {gone ? (
                      <button
                        disabled
                        className="w-full cursor-not-allowed rounded-[8px] bg-[#e5e7eb] py-3 text-[12.5px] font-bold uppercase tracking-[0.5px] text-[#9ca3af]"
                      >
                        Unavailable
                      </button>
                    ) : customizable ? (
                      <button
                        onClick={() => router.push(`/design-studio?product=${item.slug}`)}
                        className="w-full rounded-[8px] bg-black py-3 text-[12.5px] font-bold uppercase tracking-[0.5px] text-white hover:opacity-85"
                      >
                        Customize
                      </button>
                    ) : (
                      <button
                        onClick={() => product && addItem(item, product)}
                        disabled={!product || !stocked}
                        className={`w-full rounded-[8px] py-3 text-[12.5px] font-bold uppercase tracking-[0.5px] ${
                          product && stocked
                            ? "bg-black text-white hover:opacity-85"
                            : "cursor-not-allowed bg-[#e5e7eb] text-[#9ca3af]"
                        }`}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => remove(item.slug)}
                    className="pt-3 text-center text-[11.5px] font-bold uppercase tracking-[1px] text-[#6b7280] hover:text-[#dc2626]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AccountShell>
  );
}
