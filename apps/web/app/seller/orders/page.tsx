"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SellerShell from "@/components/seller/SellerShell";
import {
  ORDER_CHIP,
  type SellerOrder,
  type SellerSubmission,
  getSellerOrders,
  getSubmissions,
  inr,
  publishedId,
} from "@/lib/seller";

function SellerOrdersView() {
  const params = useSearchParams();
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [subs, setSubs] = useState<SellerSubmission[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState(params.get("q") ?? "");

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

  const rows = orders.filter((o) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      o.orderId.toLowerCase().includes(s) ||
      (o.productId?.title ?? "").toLowerCase().includes(s)
    );
  });

  const thumbOf = (o: SellerOrder) =>
    subs.find((x) => publishedId(x) === String(o.productId?._id ?? ""))?.images[0];

  return (
    <SellerShell
      title="Orders"
      subtitle={`${orders.length} order${orders.length === 1 ? "" : "s"} of your products`}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by order ID or product…"
        className="h-11 w-full max-w-[340px] rounded-full border border-[#e5e7eb] bg-white px-5 text-[13.5px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
      />

      <div className="mt-5 overflow-x-auto rounded-xl border border-[#e5e7eb] bg-white">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="bg-[#f8f9fb] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
              <th className="px-5 py-3">Order ID</th>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Qty</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loaded && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-[13px] text-[#9ca3af]">
                  {q ? "No orders match your search." : "No orders of your products yet."}
                </td>
              </tr>
            )}
            {rows.map((o) => {
              const chip = ORDER_CHIP[o.orderStatus] ?? ORDER_CHIP.pending;
              const img = thumbOf(o);
              return (
                <tr key={o._id} className="border-t border-[#f3f4f6] text-[13.5px]">
                  <td className="px-5 py-3.5 font-bold text-black">#{o.orderId.slice(-8)}</td>
                  <td className="px-3 py-3.5">
                    <span className="flex items-center gap-2.5">
                      <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6]">
                        {img && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={img} alt="" className="h-full w-full object-cover" />
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
                    <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold ${chip.cls}`}>
                      {chip.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[#6b7280]">
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="pt-4 text-[12.5px] text-[#9ca3af]">
        Margins from these orders are credited to your wallet when they&apos;re
        delivered.
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
