"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  IndianRupee,
  PackageOpen,
  ShoppingBag,
} from "lucide-react";
import SellerShell from "@/components/seller/SellerShell";
import { apiFetch } from "@/lib/auth";

type Submission = {
  _id: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "changes";
  retailPrice: number;
  publishedProductId?: { slug?: string } | string | null;
};

type SellerOrder = {
  _id: string;
  orderId: string;
  quantity: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt?: string;
  productId?: { title?: string; slug?: string } | null;
};

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  pending: { label: "In Review", cls: "bg-[#eef2ff] text-[#4f46e5]" },
  approved: { label: "Live", cls: "bg-[#dcfce7] text-[#16a34a]" },
  rejected: { label: "Rejected", cls: "bg-[#fee2e2] text-[#ba1a1a]" },
  changes: { label: "Changes Requested", cls: "bg-[#fdf3dd] text-[#b45309]" },
};

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export default function SellerOverviewPage() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      apiFetch<{ data: { sellerProducts: Submission[] } }>(
        "/api/seller-products/mine",
      ).then((j) => setSubs(j.data?.sellerProducts ?? [])),
      apiFetch<{ data: { orders: SellerOrder[] } }>(
        "/api/orders/seller/mine",
      ).then((j) => setOrders(j.data?.orders ?? [])),
    ]).finally(() => setLoaded(true));
  }, []);

  const live = subs.filter((s) => s.status === "approved");
  const inReview = subs.filter((s) => s.status === "pending");
  const needsAction = subs.filter(
    (s) => s.status === "changes" || s.status === "rejected",
  );
  const soldUnits = orders
    .filter((o) => o.orderStatus !== "cancelled")
    .reduce((n, o) => n + (o.quantity || 0), 0);
  const revenue = orders
    .filter(
      (o) => o.paymentStatus === "paid" && o.orderStatus !== "cancelled",
    )
    .reduce((n, o) => n + (o.totalAmount || 0), 0);

  const stats = [
    {
      icon: ShoppingBag,
      label: "Live Products",
      value: live.length,
      sub: `${inReview.length} in review`,
    },
    {
      icon: PackageOpen,
      label: "Units Sold",
      value: soldUnits,
      sub: `${orders.length} order${orders.length === 1 ? "" : "s"}`,
    },
    {
      icon: IndianRupee,
      label: "Sales Value",
      value: inr(revenue),
      sub: "Margins are credited to your wallet on delivery",
    },
    {
      icon: Clock,
      label: "Needs Attention",
      value: needsAction.length,
      sub: "Rejected / changes requested",
    },
  ];

  return (
    <SellerShell
      title="Overview"
      subtitle="How your designs are performing on the storefront."
    >
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="rounded-[12px] border border-[#e5e7eb] p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fdf3dd] text-[#b07d1a]">
              <Icon className="h-4 w-4" />
            </span>
            <p className="pt-4 text-[26px] font-bold leading-none text-black">
              {loaded ? value : "—"}
            </p>
            <p className="pt-2 text-[13px] font-bold text-black">{label}</p>
            <p className="pt-0.5 text-[12px] text-[#6b7280]">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 pt-10 lg:grid-cols-2">
        {/* Recent orders of my products */}
        <section>
          <h2 className="text-[16px] font-bold text-black">
            Recent Orders of Your Products
          </h2>
          <div className="mt-4 flex flex-col divide-y divide-[#f3f4f6] rounded-[12px] border border-[#e5e7eb]">
            {loaded && orders.length === 0 && (
              <p className="p-8 text-center text-[13px] text-[#9ca3af]">
                No orders yet — once buyers purchase your published products
                they appear here.
              </p>
            )}
            {orders.slice(0, 6).map((o) => (
              <div key={o._id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-bold text-black">
                    {o.productId?.title ?? "Product"}
                  </p>
                  <p className="text-[12px] text-[#6b7280]">
                    #{o.orderId.slice(-8)} · Qty {o.quantity} ·{" "}
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[13.5px] font-bold text-black">
                    {inr(o.totalAmount)}
                  </p>
                  <p className="text-[11.5px] capitalize text-[#6b7280]">
                    {o.orderStatus.replace("_", " ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* My submissions snapshot */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-black">My Products</h2>
            <Link
              href="/seller/products"
              className="text-[13px] font-bold text-black underline hover:text-[#b45309]"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-[#f3f4f6] rounded-[12px] border border-[#e5e7eb]">
            {loaded && subs.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-[13px] text-[#9ca3af]">
                  You haven&apos;t submitted a design yet.
                </p>
                <Link
                  href="/seller/new"
                  className="mt-4 inline-block rounded-full bg-black px-6 py-2.5 text-[13px] font-bold text-white hover:opacity-85"
                >
                  Submit Your First Design
                </Link>
              </div>
            )}
            {subs.slice(0, 6).map((s) => {
              const chip = STATUS_CHIP[s.status] ?? STATUS_CHIP.pending;
              const slug =
                typeof s.publishedProductId === "object"
                  ? s.publishedProductId?.slug
                  : undefined;
              return (
                <div key={s._id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-bold text-black">
                      {s.title}
                    </p>
                    <p className="text-[12px] text-[#6b7280]">
                      {inr(s.retailPrice)}
                      {slug && (
                        <>
                          {" · "}
                          <Link
                            href={`/product/${slug}`}
                            className="underline hover:text-black"
                          >
                            View listing
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${chip.cls}`}
                  >
                    {s.status === "approved" ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Live
                      </span>
                    ) : (
                      chip.label
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </SellerShell>
  );
}
