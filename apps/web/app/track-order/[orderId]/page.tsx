"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Mail,
} from "lucide-react";

type LastOrder = {
  orderId: string;
  address: string[];
  items: {
    title: string;
    variant: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  shipping: { label: string; time: string; price: number };
  payment: "razorpay" | "cod";
  codFee: number;
  total: number;
  etaLabel: string;
};

type StepState = "done" | "current" | "pending";

export default function TrackOrderPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = decodeURIComponent(params.orderId ?? "");
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = sessionStorage.getItem("ab:lastOrder");
      if (raw) {
        const parsed = JSON.parse(raw) as LastOrder;
        if (!orderId || parsed.orderId === orderId) setOrder(parsed);
      }
    } catch {
      // fall through to mock data
    }
  }, [orderId]);

  const item = order?.items?.[0];
  const placedOn = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const steps: {
    label: string;
    detail: string;
    state: StepState;
    chip?: string;
    quote?: string;
  }[] = [
    { label: "Order Confirmed", detail: "10 July, 09:24 AM", state: "done" },
    { label: "Design Verified", detail: "10 July, 02:15 PM", state: "done" },
    {
      label: "In Production",
      detail: "Started 11 July, 10:00 AM",
      state: "current",
      chip: "Active",
      quote: '"Your apparel is being printed using DTF method"',
    },
    {
      label: "Quality Check",
      detail: "Pending completion of production",
      state: "pending",
    },
    {
      label: "Dispatched",
      detail: "Awaiting shipping partner",
      state: "pending",
    },
    {
      label: "Delivered",
      detail: `Estimated delivery by ${order?.etaLabel ?? "15 July"}`,
      state: "pending",
    },
  ];

  if (!mounted) return <div className="min-h-[60vh] bg-white" />;

  return (
    <main className="min-h-[60vh] w-full bg-white px-4 py-8 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1152px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[13px]">
          <Link href="/" className="text-[#6b7280] hover:text-brand-orange">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <span className="text-[#6b7280]">My Account</span>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <span className="text-[#6b7280]">Orders</span>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <span className="font-semibold text-black">#{orderId}</span>
        </nav>

        {/* Page header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[40px] font-bold leading-tight tracking-[-0.8px] text-black">
              Track Order
            </h1>
            <p className="mt-2 text-[16px] text-[#444748]">
              Order placed on {placedOn}
            </p>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-[#fdcd74] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.6px] text-[#785601]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#785601]" />
            In Production
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
          {/* LEFT: timeline + banner */}
          <div className="flex flex-col">
            <section className="rounded-[12px] border border-[#c4c7c7] bg-white p-[33px]">
              <h2 className="mb-8 text-[24px] font-bold tracking-[-0.48px] text-[#1a1c1c]">
                Journey Status
              </h2>
              <ol className="flex flex-col">
                {steps.map((step, i) => (
                  <li key={step.label} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      {step.state === "done" ? (
                        <span className="z-[2] flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16a34a]">
                          <Check
                            className="h-3 w-3 text-white"
                            strokeWidth={3}
                          />
                        </span>
                      ) : step.state === "current" ? (
                        <span className="z-[2] h-6 w-6 shrink-0 rounded-full border-2 border-white bg-[#3b82f6]" />
                      ) : (
                        <span className="z-[2] h-6 w-6 shrink-0 rounded-full border border-[#c4c7c7] bg-[#e8e8e8]" />
                      )}
                      {i < steps.length - 1 &&
                        (step.state === "done" ? (
                          <span className="w-[2px] flex-1 bg-[#16a34a]" />
                        ) : (
                          <span className="flex-1 border-l-2 border-dashed border-[#c4c7c7]" />
                        ))}
                    </div>
                    <div
                      className={`flex flex-col ${
                        i < steps.length - 1 ? "pb-10" : ""
                      } ${step.state === "pending" ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <h3
                          className={`text-[16px] font-bold ${
                            step.state === "pending"
                              ? "text-[#444748]"
                              : "text-black"
                          }`}
                        >
                          {step.label}
                        </h3>
                        {step.chip && (
                          <span className="rounded-[4px] bg-[#fdcd74] px-2 py-0.5 text-[10px] font-bold uppercase leading-[15px] text-[#785601]">
                            {step.chip}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[14px] ${
                          step.state === "pending"
                            ? "text-[#1a1c1c]"
                            : "text-[#444748]"
                        }`}
                      >
                        {step.detail}
                      </p>
                      {step.quote && (
                        <p className="pt-2 text-[16px] italic leading-[25.6px] text-[#1a1c1c]">
                          {step.quote}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Bottom action banner */}
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] bg-[#d4a853] p-6">
              <div>
                <p className="text-[16px] font-bold text-white">
                  Need a change?
                </p>
                <p className="text-[14px] text-white/80">
                  You can still modify the shipping address before dispatch.
                </p>
              </div>
              <button className="rounded-[8px] bg-white px-6 py-2 text-[16px] font-bold text-black transition-colors hover:bg-[#f3f3f4]">
                Edit Address
              </button>
            </section>
          </div>

          {/* RIGHT: order details */}
          <div className="flex flex-col gap-4">
            <aside className="overflow-hidden rounded-[12px] border border-[#c4c7c7] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              <div className="flex h-[200px] items-center justify-center bg-[#e8e8e8] p-4">
                {item?.image ? (
                  <div className="relative h-[168px] w-[168px]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain"
                      sizes="168px"
                    />
                  </div>
                ) : (
                  <div className="h-[168px] w-[168px] rounded bg-[#d9d6ee]" />
                )}
              </div>
              <div className="flex flex-col gap-6 p-6">
                <div className="border-b border-[#c4c7c7] pb-6">
                  <h3 className="text-[24px] font-bold leading-[31.2px] tracking-[-0.48px] text-black">
                    {item?.title ?? "Round Neck T-Shirt — Custom Design"}
                  </h3>
                  <p className="mt-1 text-[14px] text-[#444748]">
                    {item
                      ? `${item.variant} · Qty: ${item.quantity}`
                      : "White · Size L · DTF Print · Qty: 1"}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-[16px] text-[#444748]">
                    <span>Subtotal</span>
                    <span>
                      ₹{(order?.subtotal ?? 449).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-[16px] text-[#444748]">
                    <span>Shipping</span>
                    <span>
                      {order
                        ? order.shipping.price === 0
                          ? "Free"
                          : `₹${order.shipping.price}`
                        : "₹48"}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#c4c7c7] pt-3 text-[16px] font-bold text-black">
                    <span>Order Total</span>
                    <span>₹{(order?.total ?? 497).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-[#16a34a]" />
                    <span className="text-[12px] font-semibold text-[#16a34a]">
                      {order?.payment === "cod"
                        ? "Cash on Delivery"
                        : "Paid via UPI"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-[8px] bg-[#eeeeee] p-4">
                  <h4 className="text-[12px] font-semibold uppercase leading-3 tracking-[0.6px] text-[#444748]">
                    Shipping Address
                  </h4>
                  <div className="text-[14px] leading-[22.75px] text-[#1a1c1c]">
                    {(order?.address?.length
                      ? order.address
                      : [
                          "Rahul Sharma",
                          "Flat 402, Green Meadows, 12th Main Road",
                          "Indiranagar, Bengaluru",
                          "Karnataka, 560038",
                        ]
                    ).map((line, i) => (
                      <p key={i} className={i === 0 ? "font-bold" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#747878] py-[13px] text-[16px] font-semibold text-black transition-colors hover:bg-[#f3f3f4]">
                    <Download className="h-4 w-4" /> Download Invoice
                  </button>
                  <Link
                    href="/contact-us"
                    className="text-center text-[16px] font-bold text-black underline hover:text-brand-orange"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            </aside>

            <aside className="flex items-start gap-3 rounded-[8px] border border-dashed border-[#c4c7c7] p-[17px]">
              <Mail className="h-5 w-5 shrink-0 text-[#7B5804]" />
              <div>
                <p className="text-[14px] font-bold text-[#1a1c1c]">
                  Email Notifications On
                </p>
                <p className="text-[12px] leading-[15px] text-[#444748]">
                  We&apos;ll send you an update when the item is dispatched.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
