"use client";

import { Suspense, useEffect, useState } from "react";
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
const CURRENT_STEP = 1; // In Production

function Confirmation() {
  const params = useSearchParams();
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = sessionStorage.getItem("ab:lastOrder");
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      // fall through to defaults
    }
  }, []);

  const orderId = order?.orderId || params.get("orderId") || "ABC-20260710-0047";

  if (!mounted) return <div className="min-h-[60vh] bg-white" />;

  return (
    <main className="w-full bg-white px-4 pb-20 pt-20">
      <div className="mx-auto flex max-w-[700px] flex-col">
        {/* Success header */}
        <div className="flex flex-col items-center pb-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#bbf7d0] bg-[#f0fdf4]">
            <Check className="h-8 w-8 text-[#22c55e]" strokeWidth={3} />
          </div>
          <h1 className="pt-5 text-[24px] font-bold tracking-[-0.48px] text-black">
            Order Placed Successfully!
          </h1>
          <p className="pt-1 text-[16px] font-medium text-[#6b7280]">
            Order #{orderId}
          </p>
          <p className="pt-1 text-[14px] text-[#6b7280]">
            Thank you for your order! You&apos;ll receive a confirmation email
            {order?.email ? (
              <>
                {" "}
                at <span className="text-black">{order.email}</span>
              </>
            ) : (
              " shortly"
            )}
            .
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Order summary card */}
          <section className="rounded-[12px] border border-[#c4c7c7] bg-white p-[25px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
            <h2 className="text-[12px] font-semibold uppercase leading-3 tracking-[1.2px] text-[#444748]">
              Order Summary
            </h2>

            <div className="pt-2">
              {(order?.items?.length
                ? order.items
                : [
                    {
                      title: "Your order",
                      variant: "",
                      image: "",
                      price: 0,
                      quantity: 1,
                    },
                  ]
              ).map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[8px] bg-[#eeeeee]">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[16px] font-bold text-black">
                      {item.title}
                    </p>
                    {item.variant && (
                      <p className="text-[14px] text-[#444748]">
                        {item.variant}
                      </p>
                    )}
                  </div>
                  <span className="text-[16px] font-bold text-black">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#c4c7c7]" />

            <div className="flex flex-col gap-3 pt-6 text-[14px]">
              <div className="flex items-center justify-between">
                <span className="text-[#444748]">Payment</span>
                <span className="font-medium text-black">
                  {order?.payment === "cod"
                    ? "Cash on Delivery"
                    : "Razorpay — UPI"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#444748]">Shipping</span>
                <span className="font-medium text-black">
                  {order
                    ? `${order.shipping.label} Delivery (${order.shipping.time.replace("days", "business days")})`
                    : "Standard Delivery (5-7 business days)"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#444748]">Estimated Delivery</span>
                <span className="font-medium text-black">
                  {order?.etaLabel ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-[#c4c7c7] pt-3">
                <span className="text-[16px] font-bold text-black">Total:</span>
                <span className="text-[24px] font-bold tracking-[-0.48px] text-black">
                  {order ? `₹${order.total.toLocaleString("en-IN")}` : "—"}
                </span>
              </div>
            </div>
          </section>

          {/* Shipping address card */}
          <section className="rounded-[12px] border border-[#c4c7c7] bg-white p-[25px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 shrink-0 text-black" />
              <div>
                <h2 className="text-[14px] font-semibold text-black">
                  Shipping Address
                </h2>
                <div className="text-[14px] leading-[22.75px] text-[#444748]">
                  {(order?.address?.length
                    ? order.address
                    : ["Address on file"]
                  ).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Order status */}
          <section className="flex flex-col gap-8 pt-6">
            <h2 className="text-center text-[16px] font-bold text-black">
              Order Status
            </h2>
            <div className="relative flex items-start justify-between px-4">
              <div className="absolute left-[15%] right-[15%] top-[14px] h-[2px] bg-[#e8e8e8]" />
              <div className="absolute left-[15%] right-[60%] top-[14px] h-[2px] bg-[#22c55e]" />
              {STEPS.map((label, i) => (
                <div
                  key={label}
                  className="relative flex flex-1 flex-col items-center gap-3"
                >
                  {i < CURRENT_STEP ? (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22c55e]">
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </span>
                  ) : i === CURRENT_STEP ? (
                    <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-black ring-2 ring-black/25">
                      <span className="h-2 w-2 rounded-full bg-white" />
                    </span>
                  ) : (
                    <span className="h-7 w-7 rounded-full bg-[#e8e8e8]" />
                  )}
                  <span
                    className={`text-[12px] ${
                      i < CURRENT_STEP
                        ? "font-bold text-[#16a34a]"
                        : i === CURRENT_STEP
                          ? "font-bold text-black"
                          : "font-medium text-[#444748]"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 rounded-[8px] border border-[#c4c7c7]/30 bg-[#f3f3f4] p-[17px]">
              <Printer className="h-4 w-4 shrink-0 text-[#444748]" />
              <p className="text-[14px] text-[#444748]">
                Current Status: <span className="text-black">In Production</span>{" "}
                — Your custom design is being printed
              </p>
            </div>
          </section>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row">
            <Link
              href={`/track-order/${orderId}`}
              className="flex h-[52px] min-w-[200px] items-center justify-center gap-2 rounded-[26px] bg-brand-orange px-9 text-[16px] font-bold text-white transition-opacity hover:opacity-90"
            >
              Track Order <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/collection"
              className="flex h-[52px] min-w-[200px] items-center justify-center rounded-[8px] border border-[#c4c7c7] bg-white px-6 text-[16px] font-bold text-black transition-colors hover:bg-[#f3f3f4]"
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
