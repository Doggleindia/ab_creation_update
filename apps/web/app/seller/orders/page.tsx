"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  Download,
  Factory,
  PackageOpen,
  Search,
  Truck,
} from "lucide-react";
import SellerShell from "@/components/seller/SellerShell";
import {
  ORDER_CHIP,
  type SellerOrder,
  type SellerSubmission,
  getSellerOrders,
  getSubmissions,
  inr,
  marginOf,
  publishedId,
  shortOrderId,
} from "@/lib/seller";

const TABS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "production", label: "In Production" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
] as const;

const TAB_STATUSES: Record<string, string[]> = {
  new: ["pending"],
  production: ["confirmed", "in_production", "quality_check", "ready_to_pack"],
  shipped: ["shipped"],
  delivered: ["delivered"],
  cancelled: ["cancelled"],
};

const dt = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

function SellerOrdersView() {
  const params = useSearchParams();
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [subs, setSubs] = useState<SellerSubmission[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [tab, setTab] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const query = params.get("q");
    if (query !== null) setQ(query);
  }, [params]);

  useEffect(() => {
    Promise.allSettled([
      getSellerOrders().then(setOrders),
      getSubmissions().then(setSubs),
    ]).finally(() => setLoaded(true));
  }, []);

  const subOf = (o: SellerOrder) =>
    subs.find((x) => publishedId(x) === String(o.productId?._id ?? ""));

  const marginFor = (o: SellerOrder) => {
    const sub = subOf(o);
    if (!sub) return null;
    return marginOf(sub) * (o.quantity || 0);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const [id, statuses] of Object.entries(TAB_STATUSES)) {
      c[id] = orders.filter((o) => statuses.includes(o.orderStatus)).length;
    }
    return c;
  }, [orders]);

  const stats = useMemo(() => {
    const active = orders.filter(
      (o) => !["delivered", "cancelled", "shipped"].includes(o.orderStatus),
    );
    const delivered = orders.filter((o) => o.orderStatus === "delivered");
    const creditedMargin = delivered.reduce((s, o) => s + (marginFor(o) ?? 0), 0);
    const upcomingMargin = orders
      .filter((o) => !["delivered", "cancelled"].includes(o.orderStatus))
      .reduce((s, o) => s + (marginFor(o) ?? 0), 0);
    return [
      {
        icon: Factory,
        label: "In Production",
        value: String(active.length),
        sub: "Being made by AB Creation",
      },
      {
        icon: Truck,
        label: "Shipped",
        value: String(counts.shipped ?? 0),
        sub: "On the way to buyers",
      },
      {
        icon: CheckCircle2,
        label: "Delivered",
        value: String(delivered.length),
        sub: `${inr(creditedMargin)} margin credited`,
      },
      {
        icon: PackageOpen,
        label: "Margin In Pipeline",
        value: inr(upcomingMargin),
        sub: "Credited when orders deliver",
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, subs, counts]);

  const rows = orders.filter((o) => {
    if (tab !== "all" && !TAB_STATUSES[tab]?.includes(o.orderStatus)) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (o.orderId ?? "").toLowerCase().includes(s) ||
      (o.productId?.title ?? "").toLowerCase().includes(s)
    );
  });

  function exportCsv() {
    const head = ["Order ID", "Product", "Qty", "Size", "Color", "Order Value", "Your Margin", "Status", "Date"];
    const lines = rows.map((o) => {
      const m = marginFor(o);
      return [
        o.orderId ?? o._id,
        `"${(o.productId?.title ?? "Product").replace(/"/g, '""')}"`,
        o.quantity,
        o.size ?? "",
        o.color ?? "",
        o.totalAmount,
        m ?? "",
        o.orderStatus,
        o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : "",
      ].join(",");
    });
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "seller-orders.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Expanded row detail — rendered via function call, not an inline component
  const renderDetail = (o: SellerOrder) => {
    const sub = subOf(o);
    const margin = marginFor(o);
    const base =
      sub && typeof sub.baseProductId === "object" ? (sub.baseProductId?.basePrice ?? null) : null;
    const slug =
      sub && typeof sub.publishedProductId === "object" ? sub.publishedProductId?.slug : undefined;
    const delivered = o.orderStatus === "delivered";
    const cancelled = o.orderStatus === "cancelled";
    return (
      <tr key={`${o._id}-detail`} className="border-t border-[#f3f4f6] bg-[#f8f9fb]">
        <td colSpan={7} className="px-5 py-4">
          <div className="grid grid-cols-1 gap-4 text-[12.5px] sm:grid-cols-3">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                Order
              </p>
              <p className="pt-1 text-[#374151]">
                Full ID: <span className="font-semibold text-black">{o.orderId ?? o._id}</span>
              </p>
              <p className="text-[#374151]">
                Payment:{" "}
                <span className="font-semibold capitalize text-black">{o.paymentStatus}</span>
              </p>
              <p className="text-[#374151]">
                Variant: {[o.color, o.size].filter(Boolean).join(" · ") || "—"} × {o.quantity}
              </p>
            </div>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                Your Earnings
              </p>
              {margin !== null && base !== null && sub ? (
                <>
                  <p className="pt-1 text-[#374151]">
                    {inr(sub.retailPrice)} retail − {inr(base)} base = {inr(marginOf(sub))} margin ×{" "}
                    {o.quantity}
                  </p>
                  <p className="font-bold text-black">
                    {inr(margin)}{" "}
                    <span
                      className={`font-semibold ${
                        delivered ? "text-[#16a34a]" : cancelled ? "text-[#ba1a1a]" : "text-[#b07d1a]"
                      }`}
                    >
                      {delivered
                        ? "· credited to your wallet"
                        : cancelled
                          ? "· not payable (cancelled)"
                          : "· credited on delivery"}
                    </span>
                  </p>
                </>
              ) : (
                <p className="pt-1 text-[#9ca3af]">
                  Margin unavailable — product submission not found.
                </p>
              )}
            </div>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                Fulfilment
              </p>
              <p className="pt-1 text-[#374151]">
                Produced, packed and shipped by AB Creation — nothing to do on your side.
              </p>
              {slug && (
                <Link
                  href={`/product/${slug}`}
                  className="mt-1 inline-block font-bold text-black underline"
                >
                  View product on storefront →
                </Link>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <SellerShell
      title="Orders"
      subtitle={`${orders.length} order${orders.length === 1 ? "" : "s"} of your products, fulfilled by AB Creation.`}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="rounded-xl border border-[#e5e7eb] bg-white p-5">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#6b7280]">
                {label}
              </p>
              <Icon className="h-4 w-4 text-[#b07d1a]" />
            </div>
            <p className="pt-3 text-[24px] font-bold leading-none text-black">
              {loaded ? value : "—"}
            </p>
            <p className="pt-2.5 text-[12.5px] text-[#6b7280]">{sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs + search + export */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3.5 py-2 text-[12.5px] font-bold ${
                tab === t.id
                  ? "bg-black text-white"
                  : "bg-white text-[#374151] ring-1 ring-inset ring-[#e5e7eb] hover:ring-black"
              }`}
            >
              {t.label}
              <span className={tab === t.id ? "pl-1.5 text-white/60" : "pl-1.5 text-[#9ca3af]"}>
                {counts[t.id] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Order ID or product…"
              className="h-10 w-[230px] rounded-full border border-[#e5e7eb] bg-white pl-10 pr-4 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
            />
          </span>
          <button
            onClick={exportCsv}
            disabled={rows.length === 0}
            className="flex h-10 items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-4 text-[12.5px] font-bold text-black hover:border-black disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-[#e5e7eb] bg-white">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="bg-[#f8f9fb] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
              <th className="px-5 py-3">Order ID</th>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Qty</th>
              <th className="px-3 py-3">Order Value</th>
              <th className="px-3 py-3">Your Margin</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loaded && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-[13px] text-[#9ca3af]">
                  {q || tab !== "all"
                    ? "No orders match this view."
                    : "No orders of your products yet — they appear as soon as buyers purchase them."}
                </td>
              </tr>
            )}
            {rows.flatMap((o) => {
              const chip = ORDER_CHIP[o.orderStatus] ?? ORDER_CHIP.pending;
              const sub = subOf(o);
              const margin = marginFor(o);
              const expanded = open === o._id;
              const main = (
                <tr
                  key={o._id}
                  onClick={() => setOpen(expanded ? null : o._id)}
                  className="cursor-pointer border-t border-[#f3f4f6] text-[13.5px] hover:bg-[#fafafa]"
                >
                  <td className="px-5 py-3.5 font-bold text-black">
                    <span className="flex items-center gap-1.5">
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-[#9ca3af] transition-transform ${expanded ? "rotate-180" : ""}`}
                      />
                      #{shortOrderId(o)}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="flex items-center gap-2.5">
                      <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6]">
                        {sub?.images[0] && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={sub.images[0]} alt="" className="h-full w-full object-cover" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-[220px] truncate text-[#374151]">
                          {o.productId?.title ?? "Product"}
                        </span>
                        <span className="block text-[11.5px] text-[#9ca3af]">
                          {[o.color, o.size].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-[#374151]">{o.quantity}</td>
                  <td className="px-3 py-3.5 font-semibold text-black">{inr(o.totalAmount)}</td>
                  <td className="px-3 py-3.5">
                    {margin !== null ? (
                      <span
                        className={`font-bold ${
                          o.orderStatus === "delivered"
                            ? "text-[#16a34a]"
                            : o.orderStatus === "cancelled"
                              ? "text-[#9ca3af] line-through"
                              : "text-black"
                        }`}
                      >
                        {inr(margin)}
                      </span>
                    ) : (
                      <span className="text-[#9ca3af]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold ${chip.cls}`}>
                      {chip.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[#6b7280]">{dt(o.createdAt)}</td>
                </tr>
              );
              return expanded ? [main, renderDetail(o)] : [main];
            })}
          </tbody>
        </table>
      </div>
      <p className="pt-4 text-[12.5px] text-[#9ca3af]">
        Click a row for the margin breakdown. Margins are credited to your{" "}
        <Link href="/seller/earnings" className="font-semibold text-[#6b7280] underline">
          wallet
        </Link>{" "}
        when orders are delivered.
      </p>
    </SellerShell>
  );
}

export default function SellerOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-white" />}>
      <SellerOrdersView />
    </Suspense>
  );
}
