"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  ArchiveRestore,
  Headphones,
} from "lucide-react";
import {
  type CartItem,
  getCart,
  updateQuantity,
  removeItem,
  cartSubtotal,
  subscribeCart,
} from "@/lib/cart";

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Secure Payment" },
  { icon: ArchiveRestore, label: "Easy Returns" },
  { icon: Headphones, label: "Premium Support" },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [promo, setPromo] = useState("");

  useEffect(() => {
    setMounted(true);
    const sync = () => setItems(getCart());
    sync();
    return subscribeCart(sync);
  }, []);

  const subtotal = cartSubtotal(items);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  if (!mounted) {
    return <div className="min-h-[60vh] bg-white" />;
  }

  return (
    <main className="min-h-[60vh] w-full bg-white px-4 py-8 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1152px]">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-[13px]">
          <Link href="/" className="text-[#6b7280] hover:text-brand-orange">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <span className="font-semibold text-black">Cart</span>
        </nav>

        <h1 className="mb-6 text-[24px] font-bold tracking-[-0.48px] text-black">
          Your Cart {count > 0 && `(${count} item${count > 1 ? "s" : ""})`}
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[12px] border border-[#c4c7c7] bg-white py-24 text-center">
            <ShoppingBag className="h-12 w-12 text-[#d1d5db]" />
            <p className="mt-4 text-[16px] font-medium text-black">
              Your cart is empty
            </p>
            <p className="mt-1 text-[14px] text-[#444748]">
              Add some products to get started.
            </p>
            <Link
              href="/collection"
              className="mt-6 rounded-full bg-brand-orange px-8 py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
            {/* LEFT: items */}
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-6 rounded-[12px] border border-[#c4c7c7] bg-white p-[25px]"
                >
                  <div className="relative h-[160px] w-[128px] shrink-0 overflow-hidden rounded-[8px] bg-[#f3f3f4]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>

                  {/* middle: title / variant / edit link */}
                  <div className="flex flex-1 flex-col pt-[3px]">
                    <h3 className="text-[16px] font-semibold leading-[25.6px] text-black">
                      {item.title}
                      {item.seller ? ` by ${item.seller}` : ""}
                    </h3>
                    <p className="mt-[3px] text-[13px] leading-[19.5px] text-[#444748]">
                      {item.variant}
                    </p>
                    {item.custom && (
                      <Link
                        href={`/product/${item.slug}`}
                        className="mt-2 w-fit text-[13px] font-semibold text-black underline hover:text-brand-orange"
                      >
                        Edit Design
                      </Link>
                    )}
                  </div>

                  {/* right: price / qty / remove */}
                  <div className="flex w-[117px] shrink-0 flex-col items-end justify-between">
                    <div className="flex flex-col items-end">
                      <span className="text-[16px] font-semibold leading-[25.6px] text-black">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[12px] text-[#444748]">
                          ₹{item.price.toLocaleString("en-IN")} ×{" "}
                          {item.quantity}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-[11px]">
                      <div className="flex h-9 items-center rounded-[8px] border border-[#c4c7c7]">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="flex h-full items-center justify-center px-3 text-black"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[24px] text-center text-[16px] text-[#1a1c1c]">
                          {item.quantity}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="flex h-full items-center justify-center px-3 text-black"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[13px] text-[#ba1a1a] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: summary */}
            <aside className="h-fit rounded-[12px] border border-[#c4c7c7] bg-white p-[25px] lg:sticky lg:top-24">
              <h2 className="text-[24px] font-bold tracking-[-0.48px] text-black">
                Order Summary
              </h2>

              <div className="mt-4 flex flex-col gap-4 border-b border-[#c4c7c7] pb-6">
                <div className="flex items-center justify-between">
                  <span className="text-[16px] text-[#444748]">Subtotal</span>
                  <span className="text-[16px] font-semibold text-black">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-[#444748]">Shipping</span>
                  <span className="text-[#444748]">Calculated at checkout</span>
                </div>
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-[#444748]">Estimated Delivery</span>
                  <span className="text-black">5-7 business days</span>
                </div>
              </div>

              {/* Promo code */}
              <div className="mt-4 flex gap-2">
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Promo code"
                  className="h-11 min-w-0 flex-1 rounded-[8px] border border-[#c4c7c7] bg-[#f9f9f9] px-4 text-[16px] text-black placeholder:text-[#6b7280] focus:border-brand-orange focus:outline-none"
                />
                <button className="h-11 rounded-[8px] border border-[#c4c7c7] bg-[#f9f9f9] px-6 text-[16px] font-semibold text-black transition-colors hover:bg-[#f0f0f0]">
                  Apply
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between pb-4 pt-2">
                <span className="text-[24px] font-bold tracking-[-0.48px] text-black">
                  Total
                </span>
                <span className="text-[20px] text-black">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <Link
                href="/checkout"
                className="block rounded-[26px] bg-brand-orange py-4 text-center text-[18px] font-bold leading-[28px] text-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05),0px_4px_6px_-4px_rgba(0,0,0,0.05)] transition-opacity hover:opacity-90"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/collection"
                className="mt-4 block pb-6 text-center text-[14px] font-semibold text-black hover:text-brand-orange"
              >
                Continue Shopping
              </Link>

              {/* Trust badges */}
              <div className="flex items-start justify-center gap-4 border-t border-[#c4c7c7] pt-8">
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <Icon className="h-[17px] w-[17px] text-[#7B5804]" />
                    <span className="text-center text-[10px] font-semibold uppercase leading-[12.5px] tracking-[0.5px] text-[#444748]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
