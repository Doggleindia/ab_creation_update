"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Landmark,
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import SellerShell from "@/components/seller/SellerShell";
import { apiFetch, getUser } from "@/lib/auth";
import {
  ORDER_CHIP,
  type SellerOrder,
  type SellerSubmission,
  getSellerOrders,
  getSubmissions,
  inr,
  publishedId,
  shortOrderId,
} from "@/lib/seller";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

export default function SellerOverviewPage() {
  const [subs, setSubs] = useState<SellerSubmission[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const firstName = (getUser()?.name ?? "Seller").split(" ")[0];

  useEffect(() => {
    Promise.allSettled([
      getSubmissions().then(setSubs),
      getSellerOrders().then(setOrders),
      apiFetch<{ data: { balance: number } }>("/api/wallet/balance").then((j) =>
        setBalance(j.data?.balance ?? null),
      ),
    ]).finally(() => setLoaded(true));
  }, []);

  const paid = orders.filter(
    (o) => o.paymentStatus === "paid" && o.orderStatus !== "cancelled",
  );
  const now = new Date();
  const monthRevenue = (offset: number) =>
    paid
      .filter((o) => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        const m = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
      })
      .reduce((s, o) => s + o.totalAmount, 0);
  const revenue = paid.reduce((s, o) => s + o.totalAmount, 0);
  const thisMo = monthRevenue(0);
  const lastMo = monthRevenue(-1);
  const pct = lastMo > 0 ? Math.round(((thisMo - lastMo) / lastMo) * 100) : null;

  const active = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.orderStatus),
  );
  const pendingProduction = active.filter((o) =>
    ["pending", "confirmed", "in_production", "quality_check"].includes(o.orderStatus),
  ).length;
  const live = subs.filter((s) => s.status === "approved");
  const inReview = subs.filter((s) => s.status !== "approved").length;

  // Top performers over the last 30 days
  const [cutoff] = useState(() => Date.now() - 30 * 86400000);
  const perf = new Map<string, { title: string; image?: string; sales: number; revenue: number }>();
  for (const o of paid) {
    if (!o.createdAt || new Date(o.createdAt).getTime() < cutoff) continue;
    const id = o.productId?._id ? String(o.productId._id) : "?";
    const sub = subs.find((s) => publishedId(s) === id);
    const entry = perf.get(id) ?? {
      title: o.productId?.title ?? "Product",
      image: sub?.images[0],
      sales: 0,
      revenue: 0,
    };
    entry.sales += o.quantity || 0;
    entry.revenue += o.totalAmount;
    perf.set(id, entry);
  }
  const top = [...perf.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 3);
  const maxRev = Math.max(...top.map((t) => t.revenue), 1);

  const thumbOf = (o: SellerOrder) =>
    subs.find((s) => publishedId(s) === String(o.productId?._id ?? ""))?.images[0];

  const stats = [
    {
      label: "Total Revenue",
      icon: TrendingUp,
      value: inr(revenue),
      sub:
        pct !== null ? (
          <span className="font-semibold text-[#16a34a]">
            ↗ {pct >= 0 ? "+" : ""}
            {pct}% vs last mo
          </span>
        ) : (
          "Paid orders of your products"
        ),
    },
    {
      label: "Active Orders",
      icon: ShoppingBag,
      value: String(active.length),
      sub: `${pendingProduction} pending production`,
    },
    {
      label: "Products Live",
      icon: Package,
      value: String(live.length),
      sub: `${inReview} design${inReview === 1 ? "" : "s"} in review`,
    },
    {
      label: "Wallet Balance",
      icon: Wallet,
      value: balance !== null ? inr(balance) : "—",
      sub: (
        <Link
          href="/seller/earnings"
          className="font-bold uppercase tracking-[0.5px] text-[#b07d1a] hover:underline"
        >
          Request Payout →
        </Link>
      ),
    },
  ];

  return (
    <SellerShell
      title="Overview"
      subtitle="Your store at a glance."
    >
      <h2 className="text-[24px] font-bold tracking-[-0.4px] text-black">
        {greeting()}, {firstName}
      </h2>
      <p className="pt-1 text-[14px] text-[#6b7280]">
        {pct !== null && pct >= 0 ? (
          <>
            Your store&apos;s performance is up by{" "}
            <span className="font-bold text-[#b07d1a]">+{pct}%</span> compared to
            last month. Keep it up!
          </>
        ) : (
          "Here's how your designs are performing on the storefront."
        )}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, icon: Icon, value, sub }) => (
          <div key={label} className="rounded-xl border border-[#e5e7eb] bg-white p-5">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#6b7280]">
                {label}
              </p>
              <Icon className="h-4 w-4 text-[#b07d1a]" />
            </div>
            <p className="pt-3 text-[26px] font-bold leading-none text-black">
              {loaded ? value : "—"}
            </p>
            <p className="pt-2.5 text-[12.5px] text-[#6b7280]">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 pt-6 xl:grid-cols-[1fr_320px]">
        {/* Recent orders */}
        <div className="rounded-xl border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#f3f4f6] px-5 py-4">
            <h3 className="text-[15px] font-bold text-black">Recent Orders</h3>
            <Link
              href="/seller/orders"
              className="text-[13px] font-bold text-black hover:underline"
            >
              View All ›
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="bg-[#f8f9fb] text-[10px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
                  <th className="px-5 py-2.5">Order ID</th>
                  <th className="px-3 py-2.5">Product</th>
                  <th className="px-3 py-2.5">Amount</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-5 py-2.5">Date</th>
                </tr>
              </thead>
              <tbody>
                {loaded && orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-[13px] text-[#9ca3af]">
                      No orders yet — they appear as soon as buyers purchase your
                      published products.
                    </td>
                  </tr>
                )}
                {orders.slice(0, 5).map((o) => {
                  const chip = ORDER_CHIP[o.orderStatus] ?? ORDER_CHIP.pending;
                  const img = thumbOf(o);
                  return (
                    <tr key={o._id} className="border-t border-[#f3f4f6] text-[13px]">
                      <td className="px-5 py-3 font-bold text-black">
                        #{shortOrderId(o)}
                      </td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-2.5">
                          <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6]">
                            {img && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={img} alt="" className="h-full w-full object-cover" />
                            )}
                          </span>
                          <span className="max-w-[170px] truncate text-[#374151]">
                            {o.productId?.title ?? "Product"}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-black">
                        {inr(o.totalAmount)}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold ${chip.cls}`}>
                          {chip.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#6b7280]">
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
        </div>

        {/* Top performing */}
        <div className="h-fit rounded-xl border border-[#e5e7eb] bg-white p-5">
          <h3 className="text-[15px] font-bold text-black">
            Top Performing{" "}
            <span className="text-[12px] font-medium text-[#6b7280]">Last 30 days</span>
          </h3>
          <div className="flex flex-col gap-5 pt-5">
            {loaded && top.length === 0 && (
              <p className="text-[13px] text-[#9ca3af]">
                No sales in the last 30 days yet.
              </p>
            )}
            {top.map((t) => (
              <div key={t.title} className="flex items-center gap-3">
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6]">
                  {t.image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={t.image} alt="" className="h-full w-full object-cover" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold text-black">{t.title}</p>
                  <p className="text-[12px] text-[#6b7280]">
                    {t.sales} sale{t.sales === 1 ? "" : "s"} · {inr(t.revenue)}
                  </p>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#f3f4f6]">
                    <div
                      className="h-1.5 rounded-full bg-black"
                      style={{ width: `${Math.max(8, (t.revenue / maxRev) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-3">
        <Link
          href="/seller/new"
          className="flex flex-col items-center rounded-xl border-2 border-dashed border-[#c4c7c7] bg-white p-7 text-center hover:border-black"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
            <Plus className="h-5 w-5" />
          </span>
          <p className="pt-3 text-[15px] font-bold text-black">Create New Product</p>
          <p className="pt-1 text-[12.5px] text-[#6b7280]">
            Upload designs and launch new apparel items
          </p>
        </Link>
        <Link
          href="/seller/earnings"
          className="flex flex-col items-center rounded-xl border border-[#e5e7eb] bg-white p-7 text-center hover:border-black"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f4f6] text-black">
            <Landmark className="h-5 w-5" />
          </span>
          <p className="pt-3 text-[15px] font-bold text-black">Request Payout</p>
          <p className="pt-1 text-[12.5px] text-[#6b7280]">
            Transfer your earnings to your bank account
          </p>
        </Link>
        <Link
          href="/seller/analytics"
          className="flex flex-col items-center rounded-xl border border-[#e5e7eb] bg-white p-7 text-center hover:border-black"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f4f6] text-black">
            <BarChart3 className="h-5 w-5" />
          </span>
          <p className="pt-3 text-[15px] font-bold text-black">View Analytics</p>
          <p className="pt-1 text-[12.5px] text-[#6b7280]">
            Deep dive into sales reports and product data
          </p>
        </Link>
      </div>

      {live.length > 0 && (
        <p className="pt-6 text-[13px] text-[#6b7280]">
          <ArrowRight className="mr-1 inline h-3.5 w-3.5" />
          Margins from delivered orders are credited to your wallet automatically —
          see{" "}
          <Link href="/seller/earnings" className="font-bold text-black underline">
            Earnings
          </Link>
          .
        </p>
      )}
    </SellerShell>
  );
}
