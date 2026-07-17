"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Lock, RotateCcw, Zap } from "lucide-react";
import {
  type CartItem,
  getCart,
  cartSubtotal,
  clearCart,
} from "@/lib/cart";

const SHIPPING = [
  { id: "standard", label: "Standard", time: "5-7 days", price: 0, days: 7 },
  { id: "express", label: "Express", time: "2-3 days", price: 149, days: 3 },
  { id: "rush", label: "Super Rush", time: "24-48 hrs", price: 299, days: 2 },
];

const COD_FEE = 49;

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
    <label className="flex flex-col gap-2">
      <span className="text-[14px] font-medium text-black">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "h-11 w-full rounded-[8px] border border-[#c4c7c7] bg-white px-4 text-[15px] text-black placeholder:text-[#6b7280] focus:border-brand-orange focus:outline-none";

/* Custom radio dot matching the Figma states: selected = black disc with
   white inner dot, unselected = white circle with light border. */
function RadioDot({ selected, size = 18 }: { selected: boolean; size?: number }) {
  return selected ? (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-black"
      style={{ width: size, height: size }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white" />
    </span>
  ) : (
    <span
      className="shrink-0 rounded-full border border-[#e2e2e2] bg-white"
      style={{ width: size, height: size }}
    />
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [shipping, setShipping] = useState("standard");
  const [payment, setPayment] = useState<"razorpay" | "cod">("razorpay");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(getCart());
  }, []);

  const subtotal = cartSubtotal(items);
  const method = SHIPPING.find((s) => s.id === shipping) ?? SHIPPING[0];
  const codFee = payment === "cod" ? COD_FEE : 0;
  const total = subtotal + method.price + codFee;

  const eta = new Date();
  eta.setDate(eta.getDate() + method.days);
  const etaLabel = eta.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPlacing(true);
    // NOTE: real order submission (wallet/Razorpay via /api/orders) is a
    // follow-up. For now we confirm the UI flow and clear the cart.
    const fd = new FormData(e.currentTarget);
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const orderId = `ABC-${ymd}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
    const addressParts = [
      [fd.get("fullName"), fd.get("addr1"), fd.get("addr2")]
        .filter(Boolean)
        .join(", "),
      `${fd.get("city")}, ${fd.get("state")} ${fd.get("pin")}`,
    ];
    try {
      sessionStorage.setItem(
        "ab:lastOrder",
        JSON.stringify({
          orderId,
          email: fd.get("email"),
          address: addressParts,
          items: items.map(({ title, variant, image, price, quantity }) => ({
            title,
            variant,
            image,
            price,
            quantity,
          })),
          subtotal,
          shipping: method,
          payment,
          codFee,
          total,
          etaLabel,
        }),
      );
    } catch {
      // sessionStorage unavailable — confirmation page falls back to defaults
    }
    clearCart();
    router.push(`/order-confirmed?orderId=${orderId}`);
  }

  if (!mounted) return <div className="min-h-[60vh] bg-white" />;

  return (
    <main className="min-h-[60vh] w-full bg-white px-4 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1152px]">
        <form
          onSubmit={placeOrder}
          className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_420px]"
        >
          {/* LEFT: form */}
          <div className="flex flex-col gap-12">
            {/* Contact */}
            <section>
              <h2 className="mb-6 text-[18px] font-semibold text-black">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email Address">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="email@example.com"
                    className={inputCls}
                  />
                </Field>
                <Field label="Phone Number">
                  <div className="flex h-11 overflow-hidden rounded-[8px] border border-[#c4c7c7] focus-within:border-brand-orange">
                    <span className="flex items-center border-r border-[#c4c7c7] bg-[#f9f9f9] px-3 text-[15px] text-[#444748]">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="00000 00000"
                      className="min-w-0 flex-1 px-4 text-[15px] text-black placeholder:text-[#6b7280] focus:outline-none"
                    />
                  </div>
                </Field>
              </div>
            </section>

            {/* Shipping address */}
            <section>
              <h2 className="mb-6 text-[18px] font-semibold text-black">
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Full Name">
                    <input name="fullName" required placeholder="Enter your full name" className={inputCls} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Address Line 1">
                    <input name="addr1" required placeholder="House no., Building, Street" className={inputCls} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Address Line 2 (Optional)">
                    <input name="addr2" placeholder="Landmark, Area, Colony" className={inputCls} />
                  </Field>
                </div>
                <Field label="City">
                  <input name="city" required placeholder="City" className={inputCls} />
                </Field>
                <Field label="State">
                  <select name="state" required defaultValue="" className={inputCls}>
                    <option value="" disabled>Select State</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="PIN Code">
                  <input name="pin" required pattern="\d{6}" placeholder="6-digit PIN" className={inputCls} />
                </Field>
                <Field label="Country">
                  <input
                    value="India"
                    readOnly
                    className={`${inputCls} bg-[#eeeeee] text-[#444748]`}
                  />
                </Field>
              </div>
              <label className="mt-5 flex cursor-pointer items-center gap-3 text-[14px] text-black">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#c4c7c7] accent-black"
                />
                Save this address for future orders
              </label>
            </section>

            {/* Shipping method */}
            <section>
              <h2 className="mb-6 text-[18px] font-semibold text-black">
                Shipping Method
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {SHIPPING.map((s) => {
                  const selected = shipping === s.id;
                  return (
                    <label
                      key={s.id}
                      className={`relative cursor-pointer rounded-[12px] bg-white p-[17px] ${
                        selected
                          ? "border-2 border-black"
                          : "border border-[#c4c7c7]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        checked={selected}
                        onChange={() => setShipping(s.id)}
                        className="sr-only"
                      />
                      <span className="absolute right-4 top-4">
                        <RadioDot selected={selected} size={selected ? 18 : 16} />
                      </span>
                      <p className="flex items-center gap-1 text-[16px] font-semibold text-black">
                        {s.label}
                        {s.id === "rush" && (
                          <Zap className="h-3 w-3 fill-[#7B5804] text-[#7B5804]" />
                        )}
                      </p>
                      <p className="mt-1 text-[14px] text-[#444748]">{s.time}</p>
                      <p className="mt-4 text-[16px] font-bold text-[#1a1c1c]">
                        {s.price === 0 ? "Free" : `₹${s.price}`}
                      </p>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="mb-6 text-[18px] font-semibold text-black">
                Payment Method
              </h2>
              <div className="flex flex-col gap-4">
                <label
                  className={`cursor-pointer rounded-[12px] border border-[#c4c7c7] p-[25px] ${
                    payment === "razorpay" ? "bg-[#f3f3f4]" : "bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === "razorpay"}
                    onChange={() => setPayment("razorpay")}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <RadioDot selected={payment === "razorpay"} size={16} />
                      <span className="text-[16px] font-semibold text-[#1a1c1c]">
                        Razorpay Secure Checkout
                      </span>
                    </span>
                    <span className="flex gap-2">
                      {["UPI", "VISA", "CARD"].map((chip) => (
                        <span
                          key={chip}
                          className="flex h-5 w-8 items-center justify-center rounded-[4px] border border-[#c4c7c7] bg-white text-[8px] font-bold text-[#1a1c1c]"
                        >
                          {chip}
                        </span>
                      ))}
                    </span>
                  </div>
                  <p className="mt-4 text-[14px] leading-[19.6px] text-[#444748]">
                    Securely pay via UPI, Credit/Debit cards, or Net Banking.
                    You will be redirected to Razorpay.
                  </p>
                </label>

                <label
                  className={`flex cursor-pointer items-center justify-between rounded-[12px] border border-[#c4c7c7] p-[25px] ${
                    payment === "cod" ? "bg-[#f3f3f4]" : "bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === "cod"}
                    onChange={() => setPayment("cod")}
                    className="sr-only"
                  />
                  <span className="flex items-center gap-3">
                    <RadioDot selected={payment === "cod"} size={20} />
                    <span>
                      <span className="block text-[16px] font-semibold text-[#1a1c1c]">
                        Cash on Delivery
                      </span>
                      <span className="block text-[14px] text-[#444748]">
                        Pay when you receive the product
                      </span>
                    </span>
                  </span>
                  <span className="text-[14px] font-bold text-[#444748]">
                    + ₹{COD_FEE} fee
                  </span>
                </label>
              </div>
            </section>

            {/* CTA */}
            <div>
              <button
                type="submit"
                disabled={items.length === 0 || placing}
                className="w-full rounded-full bg-brand-orange py-4 text-[18px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placing ? "Placing order…" : "Place Order"}
              </button>
              <p className="mt-6 text-center text-[14px] text-[#444748]">
                By placing an order, you agree to our{" "}
                <Link href="/contact-us" className="underline hover:text-black">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/contact-us" className="underline hover:text-black">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          {/* RIGHT: order review */}
          <aside className="h-fit rounded-[12px] border border-[#c4c7c7] bg-white p-[33px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] lg:sticky lg:top-24">
            <h2 className="text-[18px] font-semibold text-black">
              Order Review
            </h2>

            <div className="mt-8 flex flex-col gap-6">
              {items.length === 0 ? (
                <p className="text-[14px] text-[#444748]">
                  Your cart is empty.{" "}
                  <Link href="/collection" className="text-brand-orange underline">
                    Shop now
                  </Link>
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[8px] border border-[#c4c7c7] bg-[#eeeeee]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                      <p className="truncate text-[16px] font-medium text-black">
                        {item.title}
                      </p>
                      <div className="flex items-end justify-between">
                        <span className="text-[14px] text-[#444748]">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-[16px] font-semibold text-[#1a1c1c]">
                          {item.quantity > 1
                            ? `₹${item.price.toLocaleString("en-IN")} × ${item.quantity}`
                            : `₹${item.price.toLocaleString("en-IN")}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="my-8 h-px w-full bg-[#c4c7c7]" />

            <div className="flex flex-col gap-4 text-[16px] text-[#444748]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping ({method.label})</span>
                <span>{method.price === 0 ? "Free" : `₹${method.price}`}</span>
              </div>
              {codFee > 0 && (
                <div className="flex justify-between">
                  <span>COD Fee</span>
                  <span>₹{codFee}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[16px] font-semibold text-black">
                  Total
                </span>
                <span className="text-[24px] font-bold text-black">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-[8px] bg-[#ecfdf5] p-4">
              <BadgeCheck className="h-5 w-5 shrink-0 text-[#22c55e]" />
              <span className="text-[14px] font-semibold text-[#22c55e]">
                Expected delivery: {etaLabel}
              </span>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-[12px] text-[#444748]">
                <Lock className="h-3 w-3" /> Secure SSL Payment
              </span>
              <span className="flex items-center gap-2 text-[12px] text-[#444748]">
                <RotateCcw className="h-3 w-3" /> Easy Returns
              </span>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
