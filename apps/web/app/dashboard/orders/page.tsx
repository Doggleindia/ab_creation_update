"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import AccountShell, { StatusChip } from "@/components/account/AccountShell";
import { apiFetch, getToken } from "@/lib/auth";

type ApiOrder = {
  orderId: string;
  orderStatus: string;
  createdAt?: string;
  totalAmount?: number;
  quantity?: number;
  size?: string;
  color?: string;
  productId?: { title?: string; name?: string; slug?: string } | null;
  variantId?: { media?: { images?: string[] } } | null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!getToken()) return;
    apiFetch<{ data: ApiOrder[] }>("/api/orders/history")
      .then((j) => setOrders(j.data ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <AccountShell>
      <nav className="flex items-center gap-2 pb-8 text-[13px]">
        <Link href="/" className="text-[#6b7280] hover:text-brand-orange">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
        <Link
          href="/dashboard"
          className="text-[#6b7280] hover:text-brand-orange"
        >
          My Account
        </Link>
        <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
        <span className="font-semibold text-black">Orders</span>
      </nav>

      <h1 className="pb-6 text-[28px] font-bold tracking-[-0.5px] text-black">
        My Orders
      </h1>

      <section className="overflow-hidden rounded-[12px] border border-[#e5e7eb]">
        {!loaded ? (
          <p className="px-6 py-12 text-center text-[14px] text-[#6b7280]">
            Loading orders…
          </p>
        ) : orders.length === 0 ? (
          <p className="px-6 py-12 text-center text-[14px] text-[#6b7280]">
            No orders yet.{" "}
            <Link
              href="/collection"
              className="font-semibold text-black underline"
            >
              Start shopping
            </Link>
          </p>
        ) : (
          orders.map((o, i) => (
            <div
              key={o.orderId}
              className={`flex flex-wrap items-center gap-4 px-6 py-5 ${
                i > 0 ? "border-t border-[#f3f4f6]" : ""
              }`}
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-[#f3f4f6]">
                {o.variantId?.media?.images?.[0] && (
                  <Image
                    src={o.variantId.media.images[0]}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-black">
                  #{o.orderId}
                </p>
                <p className="truncate text-[13px] text-[#6b7280]">
                  {o.productId?.title || o.productId?.name || "Custom order"}
                  {o.color ? ` · ${o.color}` : ""}
                  {o.size ? ` · ${o.size}` : ""}
                  {o.quantity ? ` · Qty ${o.quantity}` : ""}
                  {o.createdAt
                    ? ` · ${new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}`
                    : ""}
                </p>
                {typeof o.totalAmount === "number" && (
                  <p className="pt-0.5 text-[14px] font-semibold text-black">
                    ₹{o.totalAmount.toLocaleString("en-IN")}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusChip status={o.orderStatus} />
                <div className="flex items-center gap-3">
                  <Link
                    href={`/track-order/${encodeURIComponent(o.orderId)}`}
                    className="rounded-[4px] border border-[#c4c7c7] px-3 py-1 text-[12px] font-bold text-black hover:bg-[#f3f4f6]"
                  >
                    Track
                  </Link>
                  <Link
                    href={
                      o.productId?.slug
                        ? `/product/${o.productId.slug}`
                        : "/collection"
                    }
                    className="text-[12px] font-bold text-black underline hover:text-brand-orange"
                  >
                    Reorder
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </AccountShell>
  );
}
