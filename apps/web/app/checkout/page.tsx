"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";
import {
  type CartItem,
  getCart,
  cartSubtotal,
  clearCart,
} from "@/lib/cart";

const SHIPPING = [
  { id: "standard", label: "Standard", time: "5-7 days", price: 0 },
  { id: "express", label: "Express", time: "2-3 days", price: 149 },
  { id: "rush", label: "Rush", time: "24-48 hrs", price: 299 },
];

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Goa", "Gujarat", "Haryana",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-[#111827]">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "rounded-lg border border-[#e8e6e3] px-3 py-2.5 text-[14px] focus:border-brand-orange focus:outline-none";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [shipping, setShipping] = useState("standard");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(getCart());
  }, []);

  const subtotal = cartSubtotal(items);
  const shipCost = SHIPPING.find((s) => s.id === shipping)?.price ?? 0;
  const total = subtotal + shipCost;

  function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setPlacing(true);
    // NOTE: real order submission (wallet/Razorpay via /api/orders) is a
    // follow-up. For now we confirm the UI flow and clear the cart.
    clearCart();
    router.push("/order-confirmed");
  }

  if (!mounted) return <div className="min-h-[60vh] bg-[#f9fafb]" />;

  return (
    <main className="min-h-[60vh] w-full bg-[#f9fafb] px-4 py-8 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1152px]">
        <h1 className="mb-6 font-poppins text-2xl font-bold text-[#111827]">
          Checkout
        </h1>

        <form
          onSubmit={placeOrder}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]"
        >
          {/* LEFT: form */}
          <div className="flex flex-col gap-6">
            {/* Contact */}
            <section className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
              <h2 className="mb-4 text-[17px] font-bold text-[#111827]">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email Address">
                  <input type="email" required placeholder="email@example.com" className={inputCls} />
                </Field>
                <Field label="Phone Number">
                  <input type="tel" required placeholder="00000 00000" className={inputCls} />
                </Field>
              </div>
            </section>

            {/* Shipping address */}
            <section className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
              <h2 className="mb-4 text-[17px] font-bold text-[#111827]">
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Full Name">
                    <input required placeholder="Enter your full name" className={inputCls} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Address Line 1">
                    <input required placeholder="House no., Building, Street" className={inputCls} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Address Line 2 (Optional)">
                    <input placeholder="Landmark, Area, Colony" className={inputCls} />
                  </Field>
                </div>
                <Field label="City">
                  <input required placeholder="City" className={inputCls} />
                </Field>
                <Field label="State">
                  <select required defaultValue="" className={inputCls}>
                    <option value="" disabled>Select State</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="PIN Code">
                  <input required pattern="\d{6}" placeholder="6-digit PIN" className={inputCls} />
                </Field>
                <Field label="Country">
                  <input value="India" readOnly className={`${inputCls} bg-[#f9fafb]`} />
                </Field>
              </div>
            </section>

            {/* Shipping method */}
            <section className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
              <h2 className="mb-4 text-[17px] font-bold text-[#111827]">
                Shipping Method
              </h2>
              <div className="flex flex-col gap-3">
                {SHIPPING.map((s) => (
                  <label
                    key={s.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${
                      shipping === s.id
                        ? "border-brand-orange bg-[#fff7f2]"
                        : "border-[#e8e6e3]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shipping === s.id}
                        onChange={() => setShipping(s.id)}
                        className="accent-brand-orange"
                      />
                      <div>
                        <p className="text-[14px] font-semibold text-[#111827]">{s.label}</p>
                        <p className="text-[13px] text-[#6b7280]">{s.time}</p>
                      </div>
                    </div>
                    <span className="text-[14px] font-semibold text-[#111827]">
                      {s.price === 0 ? "Free" : `₹${s.price}`}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
              <h2 className="mb-3 text-[17px] font-bold text-[#111827]">
                Payment Method
              </h2>
              <p className="text-[14px] leading-6 text-[#4b5563]">
                Securely pay via UPI, Credit/Debit cards, or Net Banking. You
                will be redirected to complete payment.
              </p>
            </section>
          </div>

          {/* RIGHT: order review */}
          <aside className="h-fit rounded-2xl border border-[#e8e6e3] bg-white p-6 lg:sticky lg:top-24">
            <h2 className="text-[18px] font-bold text-[#111827]">Order Review</h2>

            <div className="mt-4 flex flex-col gap-3">
              {items.length === 0 ? (
                <p className="text-[14px] text-[#6b7280]">
                  Your cart is empty.{" "}
                  <Link href="/collection" className="text-brand-orange underline">
                    Shop now
                  </Link>
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f0edeb]">
                      <Image src={item.image} alt={item.title} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[#111827]">{item.title}</p>
                      <p className="text-[12px] text-[#6b7280]">{item.variant} · Qty {item.quantity}</p>
                    </div>
                    <span className="text-[13px] font-semibold">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-[#e8e6e3] pt-4 text-[14px]">
              <div className="flex justify-between text-[#4b5563]">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[#4b5563]">
                <span>Shipping</span>
                <span>{shipCost === 0 ? "Free" : `₹${shipCost}`}</span>
              </div>
              <div className="flex justify-between border-t border-[#e8e6e3] pt-2 text-[17px] font-bold text-[#111827]">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={items.length === 0 || placing}
              className="mt-5 w-full rounded-full bg-brand-orange py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {placing ? "Placing order…" : "Place Order"}
            </button>

            <div className="mt-4 flex items-center justify-between text-[11px] text-[#6b7280]">
              <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Secure</span>
              <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Fast delivery</span>
              <span className="flex items-center gap-1"><RotateCcw className="h-4 w-4" /> Easy returns</span>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
