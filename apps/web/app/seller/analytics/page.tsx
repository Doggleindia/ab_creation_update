"use client";

import { useEffect, useMemo, useState } from "react";
import SellerShell from "@/components/seller/SellerShell";
import {
  type SellerOrder,
  type SellerSubmission,
  getSellerOrders,
  getSubmissions,
  inr,
  publishedId,
} from "@/lib/seller";

export default function SellerAnalyticsPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [subs, setSubs] = useState<SellerSubmission[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      getSellerOrders().then(setOrders),
      getSubmissions().then(setSubs),
    ]).finally(() => setLoaded(true));
  }, []);

  const paid = orders.filter(
    (o) => o.paymentStatus === "paid" && o.orderStatus !== "cancelled",
  );

  // 6-month revenue trend
  const chart = useMemo(() => {
    const now = new Date();
    const months: { label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleDateString("en-IN", { month: "short" }), total: 0 });
    }
    for (const o of paid) {
      if (!o.createdAt) continue;
      const d = new Date(o.createdAt);
      const idx =
        5 - ((now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth());
      if (idx >= 0 && idx < 6) months[idx].total += o.totalAmount;
    }
    const max = Math.max(...months.map((m) => m.total), 1);
    return { months, max };
  }, [paid]);

  // Per-product performance
  const products = useMemo(() => {
    const rows = subs
      .filter((s) => s.status === "approved")
      .map((s) => {
        const pid = publishedId(s) ?? "";
        const mine = paid.filter((o) => String(o.productId?._id ?? "") === pid);
        const units = mine.reduce((n, o) => n + (o.quantity || 0), 0);
        const revenue = mine.reduce((n, o) => n + o.totalAmount, 0);
        const views =
          typeof s.publishedProductId === "object"
            ? (s.publishedProductId?.views ?? 0)
            : 0;
        return {
          id: s._id,
          title: s.title,
          image: s.images[0],
          price: s.retailPrice,
          units,
          revenue,
          views,
          conversion: views > 0 ? Math.min(100, Math.round((units / views) * 100)) : null,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
    return rows;
  }, [subs, paid]);

  const totals = {
    revenue: paid.reduce((s, o) => s + o.totalAmount, 0),
    units: paid.reduce((s, o) => s + (o.quantity || 0), 0),
    views: products.reduce((s, p) => s + p.views, 0),
    aov: paid.length ? paid.reduce((s, o) => s + o.totalAmount, 0) / paid.length : 0,
  };

  return (
    <SellerShell title="Analytics" subtitle="Sales reports and product performance.">
      {/* Totals */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          ["Total Revenue", inr(totals.revenue)],
          ["Units Sold", String(totals.units)],
          ["Product Views", String(totals.views)],
          ["Avg Order Value", totals.aov ? inr(totals.aov) : "—"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[#e5e7eb] bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#6b7280]">{label}</p>
            <p className="pt-2.5 text-[24px] font-bold leading-none text-black">
              {loaded ? value : "—"}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue trend */}
      <div className="mt-6 rounded-xl border border-[#e5e7eb] bg-white p-6">
        <h3 className="text-[15px] font-bold text-black">Revenue — Last 6 Months</h3>
        <div className="flex items-end gap-3 pt-6" style={{ height: 180 }}>
          {chart.months.map((m) => (
            <div key={m.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-[11px] font-semibold text-[#374151]">
                {m.total > 0 ? inr(m.total) : ""}
              </span>
              <div
                className="w-full max-w-[56px] rounded-t-md bg-black/85"
                style={{ height: `${Math.max(m.total > 0 ? 6 : 2, (m.total / chart.max) * 120)}px` }}
              />
              <span className="text-[11.5px] text-[#6b7280]">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Product performance */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-[#e5e7eb] bg-white">
        <h3 className="border-b border-[#f3f4f6] px-5 py-4 text-[15px] font-bold text-black">
          Product Performance
        </h3>
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="bg-[#f8f9fb] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
              <th className="px-5 py-3">Product</th>
              <th className="px-3 py-3">Price</th>
              <th className="px-3 py-3">Units Sold</th>
              <th className="px-3 py-3">Revenue</th>
              <th className="px-3 py-3">Views</th>
              <th className="px-5 py-3">View → Sale</th>
            </tr>
          </thead>
          <tbody>
            {loaded && products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-[#9ca3af]">
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
                    <span className="max-w-[220px] truncate font-semibold text-black">{p.title}</span>
                  </span>
                </td>
                <td className="px-3 py-3 text-[#374151]">{inr(p.price)}</td>
                <td className="px-3 py-3 text-[#374151]">{p.units}</td>
                <td className="px-3 py-3 font-bold text-black">{inr(p.revenue)}</td>
                <td className="px-3 py-3 text-[#374151]">{p.views}</td>
                <td className="px-5 py-3 text-[#374151]">
                  {p.conversion !== null ? `${p.conversion}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="pt-4 text-[12.5px] text-[#9ca3af]">
        Based on paid orders and storefront product-page views.
      </p>
    </SellerShell>
  );
}
