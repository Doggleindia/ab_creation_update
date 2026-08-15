"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, Eye, Target } from "lucide-react";
import SellerShell from "@/components/seller/SellerShell";
import { Button } from "@/components/ui/button";
import {
  ORDER_CHIP,
  type SellerOrder,
  type SellerSubmission,
  getSellerOrders,
  getSubmissions,
  inr,
  marginOf,
  publishedId,
} from "@/lib/seller";

const RANGES = [
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "90", label: "Last 90 days", days: 90 },
  { id: "all", label: "All time", days: null },
] as const;

export default function SellerAnalyticsPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [subs, setSubs] = useState<SellerSubmission[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [range, setRange] = useState<string>("all");

  useEffect(() => {
    Promise.allSettled([
      getSellerOrders().then(setOrders),
      getSubmissions().then(setSubs),
    ]).finally(() => setLoaded(true));
  }, []);

  const days = RANGES.find((r) => r.id === range)?.days ?? null;
  const cutoff = days ? Date.now() - days * 86400000 : null;
  const inRange = (o: SellerOrder) =>
    cutoff === null || (!!o.createdAt && new Date(o.createdAt).getTime() >= cutoff);

  const paid = useMemo(
    () =>
      orders.filter(
        (o) => o.paymentStatus === "paid" && o.orderStatus !== "cancelled" && inRange(o),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders, range],
  );

  // KPI deltas: current vs previous month (independent of range filter)
  const monthDelta = useMemo(() => {
    const allPaid = orders.filter(
      (o) => o.paymentStatus === "paid" && o.orderStatus !== "cancelled",
    );
    const now = new Date();
    const sum = (offset: number, pick: (o: SellerOrder) => number) =>
      allPaid
        .filter((o) => {
          if (!o.createdAt) return false;
          const d = new Date(o.createdAt);
          const m = new Date(now.getFullYear(), now.getMonth() + offset, 1);
          return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
        })
        .reduce((s, o) => s + pick(o), 0);
    const pct = (cur: number, prev: number) =>
      prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null;
    return {
      revenue: pct(sum(0, (o) => o.totalAmount), sum(-1, (o) => o.totalAmount)),
      units: pct(sum(0, (o) => o.quantity || 0), sum(-1, (o) => o.quantity || 0)),
    };
  }, [orders]);

  // 6-month revenue trend (always all-time months, independent of range)
  const chart = useMemo(() => {
    const allPaid = orders.filter(
      (o) => o.paymentStatus === "paid" && o.orderStatus !== "cancelled",
    );
    const now = new Date();
    const months: { label: string; total: number; units: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString("en-IN", { month: "short" }),
        total: 0,
        units: 0,
      });
    }
    for (const o of allPaid) {
      if (!o.createdAt) continue;
      const d = new Date(o.createdAt);
      const idx =
        5 - ((now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth());
      if (idx >= 0 && idx < 6) {
        months[idx].total += o.totalAmount;
        months[idx].units += o.quantity || 0;
      }
    }
    const max = Math.max(...months.map((m) => m.total), 1);
    return { months, max };
  }, [orders]);

  // Per-product performance within the range
  const products = useMemo(() => {
    return subs
      .filter((s) => s.status === "approved")
      .map((s) => {
        const pid = publishedId(s) ?? "";
        const mine = paid.filter((o) => String(o.productId?._id ?? "") === pid);
        const units = mine.reduce((n, o) => n + (o.quantity || 0), 0);
        const revenue = mine.reduce((n, o) => n + o.totalAmount, 0);
        const margin = marginOf(s) * units;
        const views =
          typeof s.publishedProductId === "object" ? (s.publishedProductId?.views ?? 0) : 0;
        const slug =
          typeof s.publishedProductId === "object" ? s.publishedProductId?.slug : undefined;
        return {
          id: s._id,
          title: s.title,
          image: s.images[0],
          price: s.retailPrice,
          units,
          revenue,
          margin,
          views,
          slug,
          conversion: views > 0 ? Math.min(100, Math.round((units / views) * 100)) : null,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [subs, paid]);

  const totals = {
    revenue: paid.reduce((s, o) => s + o.totalAmount, 0),
    units: paid.reduce((s, o) => s + (o.quantity || 0), 0),
    margin: products.reduce((s, p) => s + p.margin, 0),
    views: products.reduce((s, p) => s + p.views, 0),
  };

  // Order status breakdown within the range
  const statusBreakdown = useMemo(() => {
    const mine = orders.filter(inRange);
    const order = [
      "pending",
      "confirmed",
      "in_production",
      "quality_check",
      "ready_to_pack",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const rows = order
      .map((st) => ({ st, count: mine.filter((o) => o.orderStatus === st).length }))
      .filter((r) => r.count > 0);
    return { rows, total: mine.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, range]);

  const BAR_COLOR: Record<string, string> = {
    pending: "#2563eb",
    confirmed: "#0e7490",
    in_production: "#b45309",
    quality_check: "#eab308",
    ready_to_pack: "#65a30d",
    shipped: "#3b82f6",
    delivered: "#16a34a",
    cancelled: "#dc2626",
  };

  const topSeller = products.find((p) => p.revenue > 0);
  const mostViewed = [...products].sort((a, b) => b.views - a.views).find((p) => p.views > 0);
  const bestConversion = [...products]
    .filter((p) => p.conversion !== null && p.units > 0)
    .sort((a, b) => (b.conversion ?? 0) - (a.conversion ?? 0))[0];

  const deltaText = (pct: number | null) =>
    pct === null ? null : (
      <span className={`font-semibold ${pct >= 0 ? "text-[#16a34a]" : "text-[#ba1a1a]"}`}>
        {pct >= 0 ? "↗ +" : "↘ "}
        {pct}% vs last mo
      </span>
    );

  const highlights = [
    topSeller && {
      icon: Award,
      label: "Top Seller",
      product: topSeller,
      metric: `${inr(topSeller.revenue)} revenue · ${topSeller.units} sold`,
    },
    mostViewed && {
      icon: Eye,
      label: "Most Viewed",
      product: mostViewed,
      metric: `${mostViewed.views} lifetime view${mostViewed.views === 1 ? "" : "s"}`,
    },
    bestConversion && {
      icon: Target,
      label: "Best Conversion",
      product: bestConversion,
      metric: `${bestConversion.conversion}% views → sales`,
    },
  ].filter(Boolean) as {
    icon: typeof Award;
    label: string;
    product: NonNullable<typeof topSeller>;
    metric: string;
  }[];

  return (
    <SellerShell title="Analytics" subtitle="Sales reports and product performance.">
      {/* Range filter */}
      <div className="flex flex-wrap gap-1.5">
        {RANGES.map((r) => (
          <Button
            key={r.id}
            onClick={() => setRange(r.id)}
            className={`rounded-full px-4 py-2 text-[12.5px] font-bold ${
              range === r.id
                ? "bg-black text-white"
                : "bg-white text-[#374151] ring-1 ring-inset ring-[#e5e7eb] hover:ring-black"
            }`}
          >
            {r.label}
          </Button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 pt-5 xl:grid-cols-4">
        {[
          {
            label: "Revenue",
            value: inr(totals.revenue),
            sub: deltaText(monthDelta.revenue) ?? "Paid orders of your products",
          },
          {
            label: "Units Sold",
            value: String(totals.units),
            sub: deltaText(monthDelta.units) ?? "Across all sizes & colours",
          },
          {
            label: "Your Margin",
            value: inr(totals.margin),
            sub: "Earned on sold units",
          },
          {
            label: "Product Views",
            value: String(totals.views),
            sub: "Lifetime storefront views",
          },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-xl border border-[#e5e7eb] bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#6b7280]">{label}</p>
            <p className="pt-2.5 text-[24px] font-bold leading-none text-black">
              {loaded ? value : "—"}
            </p>
            <p className="pt-2 text-[12px] text-[#6b7280]">{sub}</p>
          </div>
        ))}
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, label, product, metric }) => (
            <div key={label} className="flex items-center gap-3.5 rounded-xl border border-[#e5e7eb] bg-white p-4">
              <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6]">
                {product.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={product.image} alt="" className="h-full w-full object-cover" />
                )}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#b07d1a]">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </span>
                <span className="block truncate pt-0.5 text-[14px] font-bold text-black">
                  {product.title}
                </span>
                <span className="block text-[12px] text-[#6b7280]">{metric}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 pt-6 xl:grid-cols-[1fr_360px]">
        {/* Revenue trend */}
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-6">
          <h3 className="text-[15px] font-bold text-black">Revenue — Last 6 Months</h3>
          <div className="flex items-end gap-3 pt-6" style={{ height: 190 }}>
            {chart.months.map((m) => (
              <div
                key={m.label}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                title={`${m.units} unit${m.units === 1 ? "" : "s"}`}
              >
                <span className="text-[11px] font-semibold text-[#374151]">
                  {m.total > 0 ? inr(m.total) : ""}
                </span>
                <div
                  className="w-full max-w-[56px] rounded-t-md bg-black/85"
                  style={{ height: `${Math.max(m.total > 0 ? 6 : 2, (m.total / chart.max) * 120)}px` }}
                />
                <span className="text-[11.5px] text-[#6b7280]">
                  {m.label}
                  {m.units > 0 && (
                    <span className="block text-center text-[10px] text-[#9ca3af]">
                      {m.units} pcs
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="h-fit rounded-xl border border-[#e5e7eb] bg-white p-6">
          <h3 className="text-[15px] font-bold text-black">
            Order Status{" "}
            <span className="text-[12px] font-medium text-[#6b7280]">
              {statusBreakdown.total} order{statusBreakdown.total === 1 ? "" : "s"}
            </span>
          </h3>
          {statusBreakdown.total === 0 ? (
            <p className="pt-5 text-[13px] text-[#9ca3af]">No orders in this period.</p>
          ) : (
            <>
              <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-[#f3f4f6]">
                {statusBreakdown.rows.map((r) => (
                  <span
                    key={r.st}
                    style={{
                      width: `${(r.count / statusBreakdown.total) * 100}%`,
                      background: BAR_COLOR[r.st],
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-2.5 pt-4">
                {statusBreakdown.rows.map((r) => {
                  const chip = ORDER_CHIP[r.st];
                  return (
                    <div key={r.st} className="flex items-center justify-between text-[13px]">
                      <span className="flex items-center gap-2 text-[#374151]">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: BAR_COLOR[r.st] }}
                        />
                        {chip?.label ?? r.st}
                      </span>
                      <span className="font-bold text-black">{r.count}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Product performance */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-[#e5e7eb] bg-white">
        <h3 className="border-b border-[#f3f4f6] px-5 py-4 text-[15px] font-bold text-black">
          Product Performance
        </h3>
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="bg-[#f8f9fb] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
              <th className="px-5 py-3">Product</th>
              <th className="px-3 py-3">Price</th>
              <th className="px-3 py-3">Units Sold</th>
              <th className="px-3 py-3">Revenue</th>
              <th className="px-3 py-3">Your Margin</th>
              <th className="px-3 py-3">Views (lifetime)</th>
              <th className="px-5 py-3">View → Sale</th>
            </tr>
          </thead>
          <tbody>
            {loaded && products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-[#9ca3af]">
                  Publish a product to see its performance here.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-t border-[#f3f4f6] text-[13.5px]">
                <td className="px-5 py-3">
                  <span className="flex items-center gap-2.5">
                    <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6]">
                      {p.image && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={p.image} alt="" className="h-full w-full object-cover" />
                      )}
                    </span>
                    {p.slug ? (
                      <Link
                        href={`/product/${p.slug}`}
                        className="max-w-[220px] truncate font-semibold text-black hover:underline"
                      >
                        {p.title}
                      </Link>
                    ) : (
                      <span className="max-w-[220px] truncate font-semibold text-black">
                        {p.title}
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-3 py-3 text-[#374151]">{inr(p.price)}</td>
                <td className="px-3 py-3 text-[#374151]">{p.units}</td>
                <td className="px-3 py-3 font-bold text-black">{inr(p.revenue)}</td>
                <td className="px-3 py-3 font-semibold text-[#16a34a]">
                  {p.units > 0 ? inr(p.margin) : "—"}
                </td>
                <td className="px-3 py-3 text-[#374151]">{p.views}</td>
                <td className="px-5 py-3">
                  {p.conversion !== null ? (
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[#f3f4f6]">
                        <span
                          className="block h-full rounded-full bg-black"
                          style={{ width: `${Math.max(4, p.conversion)}%` }}
                        />
                      </span>
                      <span className="text-[12.5px] font-semibold text-[#374151]">
                        {p.conversion}%
                      </span>
                    </span>
                  ) : (
                    <span className="text-[#9ca3af]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="pt-4 text-[12.5px] text-[#9ca3af]">
        Revenue, units and margin respect the selected period; product views are
        lifetime storefront counts, so conversion is an all-time rate.
      </p>
    </SellerShell>
  );
}
