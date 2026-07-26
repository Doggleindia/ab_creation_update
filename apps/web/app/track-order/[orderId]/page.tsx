"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { apiFetch, getToken } from "@/lib/auth";

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

// Backend order shape (GET /api/orders/:orderId), only the fields we render
type ApiOrder = {
  orderId: string;
  orderStatus: "pending" | "confirmed" | "in_production" | "quality_check" | "ready_to_pack" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  totalAmount: number;
  quantity: number;
  size?: string;
  color?: string;
  createdAt?: string;
  phoneNumber?: string;
  carrier?: string;
  trackingNumber?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  productId?: { name?: string; title?: string } | null;
  variantId?: { media?: { images?: string[] } } | null;
};

export default function TrackOrderPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = decodeURIComponent(params.orderId ?? "");
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [apiOrder, setApiOrder] = useState<ApiOrder | null>(null);
  const [mounted, setMounted] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = sessionStorage.getItem("ab:lastOrder");
      if (raw) {
        const parsed = JSON.parse(raw) as LastOrder;
        if (!orderId || parsed.orderId === orderId) setOrder(parsed);
      }
    } catch {
      // corrupted snapshot — the live fetch below may still find the order
    }

    // Fetch the live order when logged in; keep the snapshot as fallback.
    if (getToken() && orderId) {
      apiFetch<{ data: ApiOrder }>(
        `/api/orders/${encodeURIComponent(orderId)}`,
      )
        .then((j) => setApiOrder(j.data ?? null))
        .catch(() => {
          // not this user's order / offline — the snapshot (if any) stays
        })
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [orderId]);

  const item = order?.items?.[0];
  const placedOn = (
    apiOrder?.createdAt ? new Date(apiOrder.createdAt) : new Date()
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Map the backend's order status onto the 6-step journey.
  const status = apiOrder?.orderStatus ?? "confirmed";
  const delivered = status === "delivered";
  const currentIdx =
    status === "pending" || status === "cancelled"
      ? 0
      : status === "confirmed"
        ? 1
        : status === "quality_check" || status === "ready_to_pack"
          ? 3
          : status === "shipped"
            ? 4
            : status === "delivered"
              ? 5
              : 2; // in_production → In Production step
  const badgeLabel =
    status === "pending"
      ? "Order Placed"
      : status === "confirmed"
        ? "Confirmed"
        : status === "quality_check"
          ? "Quality Check"
          : status === "ready_to_pack"
            ? "Packing"
            : status === "shipped"
              ? "Dispatched"
              : status === "delivered"
                ? "Delivered"
                : status === "cancelled"
                  ? "Cancelled"
                  : "In Production";

  const stepState = (i: number): StepState =>
    delivered || i < currentIdx ? "done" : i === currentIdx ? "current" : "pending";

  const STEP_DEFS = [
    { label: "Order Confirmed", detail: `Placed on ${placedOn}` },
    { label: "Design Verified", detail: "Design checked by our team" },
    {
      label: "In Production",
      detail: "Your order is being printed",
      quote: '"Your apparel is being printed using DTF method"',
    },
    { label: "Quality Check", detail: "Pending completion of production" },
    { label: "Dispatched", detail: "Awaiting shipping partner" },
    {
      label: "Delivered",
      detail: order?.etaLabel
        ? `Estimated delivery by ${order.etaLabel}`
        : "Estimated 5–7 days after dispatch",
    },
  ];

  const steps: {
    label: string;
    detail: string;
    state: StepState;
    chip?: string;
    quote?: string;
  }[] = STEP_DEFS.map((s, i) => ({
    label: s.label,
    detail: s.detail,
    state: stepState(i),
    chip: stepState(i) === "current" ? "Active" : undefined,
    quote: stepState(i) === "current" && i === 2 ? s.quote : undefined,
  }));

  // Sidebar display values — live order wins, then checkout snapshot, then mock
  const displayTitle =
    apiOrder?.productId?.title ||
    apiOrder?.productId?.name ||
    item?.title ||
    "Your order";
  const displayVariant = apiOrder
    ? [
        apiOrder.color,
        apiOrder.size ? `Size ${apiOrder.size}` : null,
        `Qty: ${apiOrder.quantity}`,
      ]
        .filter(Boolean)
        .join(" · ")
    : item
      ? `${item.variant} · Qty: ${item.quantity}`
      : "—";
  const displaySubtotal = apiOrder?.totalAmount ?? order?.subtotal ?? 0;
  const displayShipping = apiOrder
    ? "Included"
    : order
      ? order.shipping.price === 0
        ? "Free"
        : `₹${order.shipping.price}`
      : "Included";
  const displayTotal = apiOrder?.totalAmount ?? order?.total ?? 0;
  const displayPaid = apiOrder
    ? apiOrder.paymentStatus === "paid"
      ? "Paid via Wallet"
      : "Payment pending"
    : order?.payment === "cod"
      ? "Cash on Delivery"
      : "Paid from Wallet";
  const displayImage =
    apiOrder?.variantId?.media?.images?.[0] || item?.image || null;
  const displayTracking =
    apiOrder?.carrier || apiOrder?.trackingNumber
      ? [apiOrder?.carrier, apiOrder?.trackingNumber].filter(Boolean).join(" · ")
      : null;
  const displayAddress = apiOrder?.shippingAddress
    ? [
        apiOrder.shippingAddress.street,
        `${apiOrder.shippingAddress.city}, ${apiOrder.shippingAddress.state}`,
        apiOrder.shippingAddress.pincode,
        apiOrder.phoneNumber,
      ].filter((l): l is string => Boolean(l))
    : order?.address?.length
      ? order.address
      : ["Address unavailable on this device"];

  async function downloadInvoice() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const line = (y: number) => doc.line(20, y, 190, y);
    doc.setFontSize(18);
    doc.text("AB Creation — Invoice", 20, 22);
    doc.setFontSize(11);
    doc.text(`Order: #${orderId}`, 20, 34);
    doc.text(`Date: ${placedOn}`, 20, 41);
    doc.text(`Status: ${badgeLabel}`, 20, 48);
    line(54);
    doc.text(`Item: ${displayTitle}`, 20, 63);
    doc.text(`Details: ${displayVariant}`, 20, 70);
    doc.text(`Subtotal: Rs. ${displaySubtotal.toLocaleString("en-IN")}`, 20, 80);
    doc.text(`Shipping: ${displayShipping}`, 20, 87);
    doc.setFontSize(13);
    doc.text(`Order Total: Rs. ${displayTotal.toLocaleString("en-IN")}`, 20, 97);
    doc.setFontSize(11);
    doc.text(`Payment: ${displayPaid}`, 20, 105);
    line(112);
    doc.text("Ship to:", 20, 121);
    displayAddress.forEach((l, i) => doc.text(String(l), 20, 128 + i * 7));
    doc.setFontSize(9);
    doc.text("Generated from abcreation — keep for your records.", 20, 170);
    doc.save(`invoice-${orderId}.pdf`);
  }

  if (!mounted || checking) return <div className="min-h-[60vh] bg-white" />;

  // No live order and no checkout snapshot — never invent one.
  if (!apiOrder && !order) {
    return (
      <main className="flex min-h-[60vh] w-full items-center justify-center bg-white px-4 py-16">
        <div className="w-full max-w-[480px] text-center">
          <h1 className="text-[28px] font-bold tracking-[-0.5px] text-black">
            We can&apos;t show this order here
          </h1>
          <p className="pt-3 text-[15px] leading-6 text-[#444748]">
            Order <span className="font-semibold text-black">#{orderId}</span>{" "}
            isn&apos;t linked to this browser session. Log in with the account
            that placed it to see live tracking.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={`/login?next=${encodeURIComponent(`/track-order/${orderId}`)}`}
              className="rounded-full bg-brand-orange py-3 text-[15px] font-bold text-white hover:opacity-90"
            >
              Log in to track
            </Link>
            <Link
              href="/dashboard/orders"
              className="rounded-full border border-[#c4c7c7] py-3 text-[15px] font-bold text-black hover:bg-[#f3f4f6]"
            >
              Open My Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
            {badgeLabel}
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
              <Link
                href="/contact-us"
                className="rounded-[8px] bg-white px-6 py-2 text-[16px] font-bold text-black transition-colors hover:bg-[#f3f3f4]"
              >
                Edit Address
              </Link>
            </section>
          </div>

          {/* RIGHT: order details */}
          <div className="flex flex-col gap-4">
            <aside className="overflow-hidden rounded-[12px] border border-[#c4c7c7] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              <div className="flex h-[200px] items-center justify-center bg-[#e8e8e8] p-4">
                {displayImage ? (
                  <div className="relative h-[168px] w-[168px]">
                    <Image
                      src={displayImage}
                      alt={displayTitle}
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
                    {displayTitle}
                  </h3>
                  <p className="mt-1 text-[14px] text-[#444748]">
                    {displayVariant}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-[16px] text-[#444748]">
                    <span>Subtotal</span>
                    <span>₹{displaySubtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[16px] text-[#444748]">
                    <span>Shipping</span>
                    <span>{displayShipping}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#c4c7c7] pt-3 text-[16px] font-bold text-black">
                    <span>Order Total</span>
                    <span>₹{displayTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-[#16a34a]" />
                    <span className="text-[12px] font-semibold text-[#16a34a]">
                      {displayPaid}
                    </span>
                  </div>
                </div>

                {displayTracking && (
                  <div className="flex items-center justify-between rounded-[8px] border border-[#c4c7c7] p-4">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.6px] text-[#444748]">
                      Courier
                    </span>
                    <span className="text-[14px] font-bold text-black">
                      {displayTracking}
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-3 rounded-[8px] bg-[#eeeeee] p-4">
                  <h4 className="text-[12px] font-semibold uppercase leading-3 tracking-[0.6px] text-[#444748]">
                    Shipping Address
                  </h4>
                  <div className="text-[14px] leading-[22.75px] text-[#1a1c1c]">
                    {displayAddress.map((line, i) => (
                      <p key={i} className={i === 0 ? "font-bold" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => void downloadInvoice()}
                    className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#747878] py-[13px] text-[16px] font-semibold text-black transition-colors hover:bg-[#f3f3f4]"
                  >
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
