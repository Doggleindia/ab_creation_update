"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Minus,
  Plus,
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
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
  { icon: ShieldCheck, label: "SECURE PAYMENT" },
  { icon: RotateCcw, label: "EASY RETURNS" },
  { icon: Headphones, label: "PREMIUM SUPPORT" },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(() => 
    typeof window !== "undefined" ? getCart() : []
  );
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [promo, setPromo] = useState("");
  const [promoMsg, setPromoMsg] = useState("");

  useEffect(() => {
    const sync = () => setItems(getCart());
    return subscribeCart(sync);
  }, []);

  const subtotal = cartSubtotal(items);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  if (!mounted) {
    return <div className="min-h-[60vh] bg-white" />;
  }

  return (
    <main className="min-h-[70vh] w-full bg-white px-4 py-8 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1152px]">
        {/* Breadcrumbs */}
        <nav className="mb-4 flex items-center gap-2 text-[13px] text-[#6b7280]">
          <Link href="/" className="hover:text-brand-orange">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#9ca3af]" />
          <span className="font-semibold text-black">Cart</span>
        </nav>

        {/* Title */}
        <h1 className="mb-6 font-poppins text-[28px] font-bold tracking-tight text-black sm:text-[32px]">
          Your Cart {count > 0 && `(${count} item${count > 1 ? "s" : ""})`}
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e5e7eb] bg-white py-24 text-center">
            <ShoppingBag className="h-14 w-14 text-[#9ca3af]" />
            <p className="mt-4 text-[18px] font-bold text-black">
              Your cart is empty
            </p>
            <p className="mt-1 text-[14px] text-[#6b7280]">
              Add some products to get started.
            </p>
            <Link
              href="/collection"
              className="mt-6 rounded-full bg-brand-orange px-8 py-3.5 text-[15px] font-bold text-white shadow-md transition-opacity hover:opacity-90"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            {/* LEFT: Cart Items List */}
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm sm:flex-row sm:items-center"
                >
                  {/* Left: Image & Info */}
                  <div className="flex items-center gap-5">
                    <div className="relative h-[110px] w-[110px] shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-[#f9fafb]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain p-2"
                        sizes="110px"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <h3 className="font-poppins text-[16px] font-bold leading-snug text-black">
                        {item.title}
                        {item.seller ? ` by ${item.seller}` : ""}
                      </h3>
                      <p className="text-[13px] text-[#6b7280]">
                        {item.variant}
                      </p>
                      {item.custom && (
                        <Link
                          href="/design-studio"
                          className="mt-1.5 w-fit text-[13px] font-bold text-black underline hover:text-brand-orange"
                        >
                          Edit Design
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Right: Price & Quantity Counter & Remove */}
                  <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end sm:justify-between">
                    <div className="flex flex-col sm:items-end">
                      <span className="font-poppins text-[18px] font-bold text-black">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[12px] text-[#6b7280]">
                          ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                      <div className="flex h-9 items-center rounded-lg border border-[#d1d5db] bg-white">
                        <Button
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-full w-8 items-center justify-center text-[#374151] hover:bg-gray-100"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-[14px] font-semibold text-black">
                          {item.quantity}
                        </span>
                        <Button
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-full w-8 items-center justify-center text-[#374151] hover:bg-gray-100"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        onClick={() => removeItem(item.id)}
                        className="text-[13px] font-medium text-[#dc2626] hover:underline"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: Order Summary Card */}
            <aside className="h-fit rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="font-poppins text-[20px] font-bold text-black">
                Order Summary
              </h2>

              <div className="mt-4 flex flex-col gap-3.5 border-b border-[#e5e7eb] pb-5">
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-[#6b7280]">Subtotal</span>
                  <span className="font-bold text-black">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13.5px]">
                  <span className="text-[#6b7280]">Shipping</span>
                  <span className="text-[#6b7280]">Calculated at checkout</span>
                </div>
                <div className="flex items-center justify-between text-[13.5px]">
                  <span className="text-[#6b7280]">Estimated Delivery</span>
                  <span className="font-medium text-black">5-7 business days</span>
                </div>
              </div>

              {/* Promo Code Box */}
              <div className="mt-5 flex gap-2">
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Promo code"
                  className="h-11 min-w-0 flex-1 rounded-lg border border-[#d1d5db] bg-[#f9fafb] px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                />
                <Button
                  onClick={() =>
                    setPromoMsg(
                      promo.trim()
                        ? "This code isn't valid or has expired."
                        : "Enter a promo code first.",
                    )
                  }
                  className="h-11 rounded-lg border border-[#d1d5db] bg-[#f3f4f6] px-5 text-[14px] font-bold text-black transition-colors hover:bg-gray-200"
                >
                  Apply
                </Button>
              </div>

              {promoMsg && (
                <p className="mt-2 text-[13px] text-[#dc2626]">{promoMsg}</p>
              )}

              {/* Total line */}
              <div className="mt-5 flex items-center justify-between border-t border-[#e5e7eb] pt-4">
                <span className="font-poppins text-[18px] font-bold text-black">
                  Total
                </span>
                <span className="font-poppins text-[24px] font-extrabold text-black">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="mt-5 block w-full rounded-xl bg-gradient-to-r from-[#ff6b00] to-[#ff4500] py-3.5 text-center font-poppins text-[16px] font-bold text-white shadow-md transition-opacity hover:opacity-95"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/collection"
                className="mt-3 block text-center text-[13.5px] font-semibold text-black hover:text-brand-orange hover:underline"
              >
                Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 flex items-start justify-center gap-2 border-t border-[#e5e7eb] pt-5 text-center">
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-1 flex-col items-center gap-1 text-center"
                  >
                    <Icon className="h-4 w-4 text-[#b07d1a]" />
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#4b5563]">
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
