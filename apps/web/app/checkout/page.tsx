"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lock, RotateCcw } from "lucide-react";
import { type CartItem, getCart, clearCart, cartSubtotal } from "@/lib/cart";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
];

const SHIPPING_METHODS = [
  { id: "standard", label: "Standard", time: "5-7 days", price: 0 },
  { id: "express", label: "Express", time: "2-3 days", price: 149 },
  { id: "super_rush", label: "Super Rush ⚡", time: "24-48 hrs", price: 299 },
];

export default function CheckoutPage() {
  const router = useRouter();

  // Cart & items
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);

  // Selections
  const [shippingMethod, setShippingMethod] = useState("express");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">(
    "razorpay",
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(getCart());
  }, []);

  const subtotal = cartSubtotal(items);
  const selectedShipping =
    SHIPPING_METHODS.find((s) => s.id === shippingMethod) ?? SHIPPING_METHODS[1];
  const shippingFee = selectedShipping?.price ?? 149;
  const codFee = paymentMethod === "cod" ? 49 : 0;
  const grandTotal = subtotal + shippingFee + codFee;

  function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const orderId = `ABC-${Date.now().toString().slice(-8)}`;

    const lastOrder = {
      orderId,
      email: email || "customer@example.com",
      address: [
        fullName || "Customer",
        address1,
        address2,
        `${city}, ${state} - ${pincode}`,
        "India",
      ].filter(Boolean),
      items,
      subtotal,
      shipping: selectedShipping,
      payment: paymentMethod,
      codFee,
      total: grandTotal,
      etaLabel: "15 July 2026",
    };

    try {
      sessionStorage.setItem("ab:lastOrder", JSON.stringify(lastOrder));
    } catch {
      // ignore storage error
    }

    clearCart();
    setTimeout(() => {
      router.push(`/order-confirmed?orderId=${orderId}`);
    }, 600);
  }

  if (!mounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white font-poppins">
      {/* Top Header */}
      <header className="border-b border-[#e5e7eb] bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-[1152px] items-center justify-between">
          <Link href="/" className="text-[20px] font-bold text-black">
            AB CREATION
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-1 text-[13.5px] font-semibold text-[#4b5563] hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1152px] px-4 py-8 sm:px-8">
        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]"
        >
          {/* LEFT: Form Fields */}
          <div className="flex flex-col gap-8">
            {/* 1. Contact Information */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[17px] font-bold text-[#1b1c1b]">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-medium text-[#4b5563]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-lg border border-[#d1d5db] px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-medium text-[#4b5563]">
                    Phone Number
                  </label>
                  <div className="flex items-center rounded-lg border border-[#d1d5db] bg-white">
                    <span className="border-r border-[#d1d5db] bg-[#f9fafb] px-3 py-2.5 text-[13px] font-medium text-[#4b5563]">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="00000 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 w-full rounded-r-lg px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[17px] font-bold text-[#1b1c1b]">
                Shipping Address
              </h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-medium text-[#4b5563]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 rounded-lg border border-[#d1d5db] px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-medium text-[#4b5563]">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House no., Building, Street"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    className="h-11 rounded-lg border border-[#d1d5db] px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-medium text-[#4b5563]">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Landmark, Area, Colony"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    className="h-11 rounded-lg border border-[#d1d5db] px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-medium text-[#4b5563]">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-11 rounded-lg border border-[#d1d5db] px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-medium text-[#4b5563]">
                      State
                    </label>
                    <select
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="h-11 rounded-lg border border-[#d1d5db] bg-white px-3.5 text-[14px] text-black focus:border-brand-orange focus:outline-none"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-medium text-[#4b5563]">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="6-digit PIN"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="h-11 rounded-lg border border-[#d1d5db] px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-medium text-[#4b5563]">
                      Country
                    </label>
                    <input
                      type="text"
                      disabled
                      value="India"
                      className="h-11 rounded-lg border border-[#e5e7eb] bg-[#f3f4f6] px-3.5 text-[14px] text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 text-[13px] text-[#374151]">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  Save this address for future orders
                </label>
              </div>
            </div>

            {/* 3. Shipping Method */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[17px] font-bold text-[#1b1c1b]">
                Shipping Method
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {SHIPPING_METHODS.map((sm) => {
                  const isSelected = shippingMethod === sm.id;
                  return (
                    <button
                      key={sm.id}
                      type="button"
                      onClick={() => setShippingMethod(sm.id)}
                      className={`flex flex-col justify-between rounded-xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? "border-black bg-white"
                          : "border-[#e5e7eb] bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-poppins text-[14px] font-bold text-black">
                          {sm.label}
                        </span>
                        <div
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-black" : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-black" />
                          )}
                        </div>
                      </div>
                      <span className="mt-2 text-[12px] text-[#6b7280]">
                        {sm.time}
                      </span>
                      <span className="mt-3 text-[14px] font-bold text-black">
                        {sm.price === 0 ? "Free" : `₹${sm.price}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Payment Method */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[17px] font-bold text-[#1b1c1b]">
                Payment Method
              </h2>
              <div className="flex flex-col gap-3">
                {/* Razorpay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`flex flex-col rounded-xl border-2 p-4 text-left transition-all ${
                    paymentMethod === "razorpay"
                      ? "border-black bg-[#f9fafb]"
                      : "border-[#e5e7eb] bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "razorpay"
                            ? "border-black"
                            : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === "razorpay" && (
                          <div className="h-2 w-2 rounded-full bg-black" />
                        )}
                      </div>
                      <span className="text-[14px] font-bold text-black">
                        Razorpay Secure Checkout
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-gray-500">
                      <span className="rounded border px-1 py-0.5">UPI</span>
                      <span className="rounded border px-1 py-0.5">VISA</span>
                      <span className="rounded border px-1 py-0.5">CARD</span>
                    </div>
                  </div>

                  <p className="mt-3 text-[12px] leading-relaxed text-[#6b7280] pl-7">
                    Securely pay via UPI, Credit/Debit cards, or Net Banking. You
                    will be redirected to Razorpay.
                  </p>
                </button>

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex flex-col rounded-xl border-2 p-4 text-left transition-all ${
                    paymentMethod === "cod"
                      ? "border-black bg-[#f9fafb]"
                      : "border-[#e5e7eb] bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "cod"
                            ? "border-black"
                            : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === "cod" && (
                          <div className="h-2 w-2 rounded-full bg-black" />
                        )}
                      </div>
                      <span className="text-[14px] font-bold text-black">
                        Cash on Delivery
                      </span>
                    </div>
                    <span className="text-[12px] font-medium text-gray-600">
                      + ₹49 fee
                    </span>
                  </div>

                  <p className="mt-3 text-[12px] text-[#6b7280] pl-7">
                    Pay when you receive the product
                  </p>
                </button>
              </div>
            </div>

            {/* Place Order CTA */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full rounded-xl bg-gradient-to-r from-[#ff6b00] to-[#ff4500] py-4 font-poppins text-[17px] font-bold text-white shadow-lg transition-opacity hover:opacity-95 disabled:opacity-50"
              >
                {loading ? "Processing Order..." : "Place Order"}
              </button>
              <p className="text-center text-[12px] text-[#6b7280]">
                By placing an order, you agree to our{" "}
                <Link
                  href="/terms-and-conditions"
                  className="underline hover:text-black"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  className="underline hover:text-black"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          {/* RIGHT: Order Review Sidebar */}
          <aside className="h-fit rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="font-poppins text-[18px] font-bold text-black">
              Order Review
            </h2>

            {/* Item list */}
            <div className="mt-4 flex flex-col divide-y divide-[#f3f4f6]">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-[#f9fafb]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain p-1"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-black">
                      {item.title}
                    </p>
                    <p className="text-[12px] text-[#6b7280]">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-[14px] font-bold text-black">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="mt-4 flex flex-col gap-2.5 border-t border-[#e5e7eb] pt-4 text-[13.5px]">
              <div className="flex items-center justify-between text-[#6b7280]">
                <span>Subtotal</span>
                <span className="font-bold text-black">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#6b7280]">
                <span>Shipping ({selectedShipping.label})</span>
                <span className="font-medium text-black">
                  {shippingFee === 0 ? "Free" : `₹${shippingFee}`}
                </span>
              </div>
              {codFee > 0 && (
                <div className="flex items-center justify-between text-[#6b7280]">
                  <span>COD Fee</span>
                  <span className="font-medium text-black">₹{codFee}</span>
                </div>
              )}

              <div className="mt-2 flex items-center justify-between border-t border-[#e5e7eb] pt-3">
                <span className="font-poppins text-[16px] font-bold text-black">
                  Total
                </span>
                <span className="font-poppins text-[22px] font-extrabold text-black">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Green Delivery Banner */}
            <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-[#a7f3d0] bg-[#e8fbf0] p-3 text-[13px] font-medium text-[#10b981]">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#10b981]" />
              <span>Expected delivery: 15 July 2026</span>
            </div>

            {/* Footer trust notes */}
            <div className="mt-5 flex items-center justify-around border-t border-[#e5e7eb] pt-4 text-[11px] font-medium text-[#6b7280]">
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-gray-500" /> Secure SSL
                Payment
              </span>
              <span className="flex items-center gap-1">
                <RotateCcw className="h-3.5 w-3.5 text-gray-500" /> Easy Returns
              </span>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}
