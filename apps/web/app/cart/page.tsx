"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import {
  type CartItem,
  getCart,
  updateQuantity,
  removeItem,
  cartSubtotal,
  subscribeCart,
} from "@/lib/cart";

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
  const shipping = subtotal > 0 && subtotal < 1000 ? 60 : 0;
  const total = subtotal + shipping;
  const count = items.reduce((s, i) => s + i.quantity, 0);

  if (!mounted) {
    return <div className="min-h-[60vh] bg-[#f9fafb]" />;
  }

  return (
    <main className="min-h-[60vh] w-full bg-[#f9fafb] px-4 py-8 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1152px]">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-[13px] text-[#6b7280]">
          <Link href="/" className="hover:text-brand-orange">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#111827]">Cart</span>
        </nav>

        <h1 className="mb-6 font-poppins text-2xl font-bold text-[#111827]">
          Your Cart {count > 0 && `(${count} item${count > 1 ? "s" : ""})`}
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e8e6e3] bg-white py-24 text-center">
            <ShoppingBag className="h-12 w-12 text-[#d1d5db]" />
            <p className="mt-4 text-[16px] font-medium text-[#111827]">
              Your cart is empty
            </p>
            <p className="mt-1 text-[14px] text-[#6b7280]">
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
                  className="flex gap-4 rounded-2xl border border-[#e8e6e3] bg-white p-4"
                >
                  <div className="relative h-[110px] w-[90px] shrink-0 overflow-hidden rounded-xl bg-[#f0edeb]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="90px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-[15px] font-bold text-[#111827]">
                          {item.title}
                        </h3>
                        <p className="mt-0.5 text-[13px] text-[#6b7280]">
                          {item.variant}
                        </p>
                        {item.seller && (
                          <p className="mt-0.5 text-[12px] text-[#9ca3af]">
                            by {item.seller}
                          </p>
                        )}
                      </div>
                      <button
                        aria-label="Remove item"
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-[#9ca3af] hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center gap-3">
                        {item.custom && (
                          <Link
                            href={`/product/${item.slug}`}
                            className="text-[13px] font-semibold text-brand-orange hover:underline"
                          >
                            Edit Design
                          </Link>
                        )}
                        <div className="flex items-center rounded-full border border-[#e8e6e3]">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="flex h-8 w-8 items-center justify-center text-[#111827]"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-[14px] font-medium">
                            {item.quantity}
                          </span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center text-[#111827]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <span className="text-[16px] font-bold text-[#111827]">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: summary */}
            <aside className="h-fit rounded-2xl border border-[#e8e6e3] bg-white p-6 lg:sticky lg:top-24">
              <h2 className="text-[18px] font-bold text-[#111827]">
                Order Summary
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-[14px]">
                <div className="flex justify-between text-[#4b5563]">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[#4b5563]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                <div className="border-t border-[#e8e6e3] pt-3">
                  <label className="mb-2 block text-[13px] font-medium text-[#111827]">
                    Promo code
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={promo}
                      onChange={(e) => setPromo(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 rounded-lg border border-[#e8e6e3] px-3 py-2 text-[14px] focus:border-brand-orange focus:outline-none"
                    />
                    <button className="rounded-lg bg-[#111827] px-4 py-2 text-[13px] font-semibold text-white">
                      Apply
                    </button>
                  </div>
                </div>
                <div className="flex justify-between border-t border-[#e8e6e3] pt-3 text-[18px] font-bold text-[#111827]">
                  <span>Total</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block rounded-full bg-brand-orange py-3 text-center text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/collection"
                className="mt-3 block text-center text-[14px] font-medium text-[#6b7280] hover:text-brand-orange"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
