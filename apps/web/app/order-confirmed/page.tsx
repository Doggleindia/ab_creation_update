"use client";

import { Suspense, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check, MapPin, Printer } from "lucide-react";

type LastOrder = {
  orderId: string;
  email: string;
  address: string[];
  items: {
    title: string;
    variant: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  shipping: { id: string; label: string; time: string; price: number };
  payment: "razorpay" | "cod";
  codFee: number;
  total: number;
  etaLabel: string;
};

const STEPS = ["Confirmed", "In Production", "Dispatched", "Delivered"];
const CURRENT_STEP = 0;

// React-blessed SSR hydration guard — no setState in effects needed
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function Confirmation() {
  const params = useSearchParams();
  const [order] = useState<LastOrder | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("ab:lastOrder");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const orderId = order?.orderId || params.get("orderId") || "ABC-20260710-0047";

  if (!mounted) return <div className="min-h-[60vh] bg-white" />;

  return (
    <main className="w-full bg-white px-4 pb-20 pt-16 font-poppins">
      <div className="mx-auto flex max-w-[680px] flex-col">
        {/* Success Header */}
        <div className="flex flex-col items-center pb-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#bbf7d0] bg-[#f0fdf4]">
            <Check className="h-8 w-8 text-[#22c55e]" strokeWidth={3} />
          </div>
          <h1 className="pt-5 text-[26px] font-bold tracking-tight text-black sm:text-[30px]">
            Order Placed Successfully!
          </h1>
          <p className="pt-1 text-[16px] font-semibold text-[#6b7280]">
            Order #{orderId}
          </p>
          <p className="pt-2 text-[14px] text-[#6b7280]">
            Thank you for your order! You&apos;ll receive a confirmation email
            {order?.email ? (
              <>
                {" "}
                at <span className="font-semibold text-black">{order.email}</span>
              </>
            ) : (
              " shortly"
            )}
            .
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Order Summary Card */}
          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-[#6b7280]">
              Order Summary
            </h2>

            <div className="divide-y divide-[#f3f4f6] pt-2">
              {(order?.items?.length
                ? order.items
                : // Honest placeholder when the snapshot is gone (direct
                  // visit/refresh) — never invent items or prices.
                  [
                    {
                      title: "Your order",
                      variant: "Details are in your dashboard orders",
                      image: "",
                      price: 0,
                      quantity: 1,
                    },
                  ]
              ).map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-3.5">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-[#f9fafb]">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain p-1"
                        sizes="64px"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-black">
                      {item.title}
                    </p>
                    {item.variant && (
                      <p className="text-[13px] text-[#6b7280]">{item.variant}</p>
                    )}
                    <p className="text-[12px] text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-[15px] font-bold text-black">
                    {item.price
                      ? `₹${(item.price * item.quantity).toLocaleString("en-IN")}`
                      : "—"}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e5e7eb]" />

            <div className="flex flex-col gap-2.5 pt-4 text-[14px]">
              <div className="flex items-center justify-between">
                <span className="text-[#6b7280]">Payment</span>
                <span className="font-semibold text-black">
                  {order
                    ? order.payment === "cod"
                      ? "Cash on Delivery"
                      : "Paid from Wallet"
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6b7280]">Shipping</span>
                <span className="font-semibold text-black">
                  {order
                    ? `${order.shipping.label} Delivery (${order.shipping.time})`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6b7280]">Estimated Delivery</span>
                <span className="font-semibold text-black">
                  {order?.etaLabel ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-[#e5e7eb] pt-3">
                <span className="text-[16px] font-bold text-black">Total:</span>
                <span className="text-[22px] font-extrabold text-black">
                  {order ? `₹${order.total.toLocaleString("en-IN")}` : "—"}
                </span>
              </div>
            </div>
          </section>

          {/* Shipping Address Card */}
          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 shrink-0 text-black mt-0.5" />
              <div>
                <h2 className="text-[14px] font-bold text-black">
                  Shipping Address
                </h2>
                <div className="mt-1 text-[13.5px] leading-relaxed text-[#4b5563]">
                  {(order?.address?.length
                    ? order.address
                    : ["Address on file — see your dashboard orders"]
                  ).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Order Status Stepper */}
          <section className="flex flex-col gap-6 pt-4">
            <h2 className="text-center text-[16px] font-bold text-black">
              Order Status
            </h2>
            <div className="relative flex items-start justify-between px-4">
              <div className="absolute left-[15%] right-[15%] top-[14px] h-[2px] bg-[#e5e7eb]" />
              <div className="absolute left-[15%] right-[85%] top-[14px] h-[2px] bg-[#22c55e]" />
              {STEPS.map((label, i) => (
                <div
                  key={label}
                  className="relative flex flex-1 flex-col items-center gap-2.5"
                >
                  {i < CURRENT_STEP ? (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22c55e]">
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </span>
                  ) : i === CURRENT_STEP ? (
                    <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-black ring-4 ring-black/10">
                      <span className="h-2 w-2 rounded-full bg-white" />
                    </span>
                  ) : (
                    <span className="h-7 w-7 rounded-full bg-[#e5e7eb]" />
                  )}
                  <span
                    className={`text-[12px] ${
                      i < CURRENT_STEP
                        ? "font-bold text-[#16a34a]"
                        : i === CURRENT_STEP
                          ? "font-bold text-black"
                          : "font-medium text-[#6b7280]"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4 text-center">
              <Printer className="h-4 w-4 shrink-0 text-[#6b7280]" />
              <p className="text-[13.5px] text-[#4b5563]">
                Current Status: <span className="font-bold text-black">Confirmed</span>{" "}
                — We&apos;re preparing your order for production
              </p>
            </div>
          </section>

          {/* Action CTAs */}
          <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
            <Link
              href={`/track-order/${orderId}`}
              className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b00] to-[#ff4500] px-8 text-[15px] font-bold text-white shadow-md transition-opacity hover:opacity-95"
            >
              Track Order <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/collection"
              className="flex h-12 w-full sm:w-auto items-center justify-center rounded-xl border border-gray-300 bg-white px-7 text-[15px] font-bold text-black transition-colors hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-white" />}>
      <Confirmation />
    </Suspense>
  );
}
