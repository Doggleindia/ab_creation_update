"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, MapPin } from "lucide-react";

const TIMELINE = [
  { label: "Order Placed", done: true },
  { label: "Confirmed", done: true },
  { label: "Processing", done: false },
  { label: "Shipped", done: false },
  { label: "Delivered", done: false },
];

function Confirmation() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "ABC-20260717-0047";

  return (
    <main className="min-h-[60vh] w-full bg-[#f9fafb] px-4 py-12 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[720px]">
        {/* Success header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>
          <h1 className="mt-4 font-poppins text-2xl font-bold text-[#111827] sm:text-3xl">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-[15px] text-[#6b7280]">
            Thank you for your order. We&apos;ve emailed your receipt and will
            notify you when it ships.
          </p>
          <p className="mt-3 rounded-full bg-white px-4 py-1.5 text-[14px] font-semibold text-[#111827] shadow-sm">
            Order #{orderId}
          </p>
        </div>

        {/* Timeline */}
        <section className="mt-10 rounded-2xl border border-[#e8e6e3] bg-white p-6">
          <h2 className="mb-6 text-[16px] font-bold text-[#111827]">
            Order Timeline
          </h2>
          <ol className="flex items-center justify-between">
            {TIMELINE.map((step, i) => (
              <li key={step.label} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {i > 0 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        step.done ? "bg-green-500" : "bg-[#e8e6e3]"
                      }`}
                    />
                  )}
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                      step.done
                        ? "bg-green-500 text-white"
                        : "bg-[#e8e6e3] text-[#9ca3af]"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        TIMELINE[i + 1].done ? "bg-green-500" : "bg-[#e8e6e3]"
                      }`}
                    />
                  )}
                </div>
                <span className="mt-2 text-center text-[11px] font-medium text-[#4b5563]">
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Info cards */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
            <div className="flex items-center gap-2 text-[15px] font-bold text-[#111827]">
              <Package className="h-4 w-4" /> What&apos;s next
            </div>
            <p className="mt-2 text-[13px] leading-5 text-[#6b7280]">
              Your custom items go into production and quality check before
              dispatch. Track progress anytime from your dashboard.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
            <div className="flex items-center gap-2 text-[15px] font-bold text-[#111827]">
              <MapPin className="h-4 w-4" /> Shipping
            </div>
            <p className="mt-2 text-[13px] leading-5 text-[#6b7280]">
              Standard delivery, 5–7 business days. You&apos;ll get an email and
              SMS with tracking once your order ships.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/track-order/${orderId}`}
            className="rounded-full bg-brand-orange px-8 py-3 text-center text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Track Order
          </Link>
          <Link
            href="/collection"
            className="rounded-full border border-[#111827] px-8 py-3 text-center text-[15px] font-semibold text-[#111827] transition-colors hover:bg-[#111827] hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-[#f9fafb]" />}>
      <Confirmation />
    </Suspense>
  );
}
