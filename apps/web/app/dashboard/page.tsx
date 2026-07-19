"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import AccountShell, { StatusChip } from "@/components/account/AccountShell";
import { apiFetch, getToken } from "@/lib/auth";

type ApiOrder = {
  orderId: string;
  orderStatus: string;
  createdAt?: string;
  totalAmount?: number;
  productId?: { title?: string; name?: string; slug?: string } | null;
  variantId?: { media?: { images?: string[] } } | null;
};

type SavedDesign = {
  image: string | null;
  colorName?: string;
  product?: { title?: string } | null;
};

function orderDate(o: ApiOrder) {
  return o.createdAt
    ? new Date(o.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })
    : "";
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [wallet, setWallet] = useState<number | null>(null);
  const [design, setDesign] = useState<SavedDesign | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!getToken()) return;
    apiFetch<{ data: ApiOrder[] }>("/api/orders/history")
      .then((j) => setOrders(j.data ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
    apiFetch<{ data: { balance: number } }>("/api/wallet/balance")
      .then((j) => setWallet(j.data?.balance ?? null))
      .catch(() => {});
    try {
      const raw =
        localStorage.getItem("ab:design") ?? sessionStorage.getItem("ab:design");
      if (raw) setDesign(JSON.parse(raw));
    } catch {
      // no saved design
    }
  }, []);

  const active = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.orderStatus),
  ).length;
  const recent = orders.slice(0, 3);

  return (
    <AccountShell>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 pb-8 text-[13px]">
        <Link href="/" className="text-[#6b7280] hover:text-brand-orange">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
        <span className="font-semibold text-black">My Account</span>
      </nav>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-[8px] border border-[#e5e7eb] p-6">
          <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#6b7280]">
            Active Orders
          </p>
          <p className="pt-2 text-[40px] font-bold leading-none text-black">
            {String(active).padStart(2, "0")}
          </p>
          <Link
            href="/dashboard/orders"
            className="mt-4 flex items-center gap-1 text-[14px] font-semibold text-black hover:text-brand-orange"
          >
            View <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-[8px] border border-[#e5e7eb] p-6">
          <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#6b7280]">
            Saved Designs
          </p>
          <p className="pt-2 text-[40px] font-bold leading-none text-black">
            {String(design ? 1 : 0).padStart(2, "0")}
          </p>
          <Link
            href="/design-studio"
            className="mt-4 flex items-center gap-1 text-[14px] font-semibold text-black hover:text-brand-orange"
          >
            Open Studio <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-[8px] border border-[#e5e7eb] p-6">
          <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#6b7280]">
            Wallet Balance
          </p>
          <p className="pt-2 text-[40px] font-bold leading-none text-black">
            {wallet !== null ? `₹${wallet.toLocaleString("en-IN")}` : "—"}
          </p>
          <Link
            href="/dashboard/wallet"
            className="mt-4 flex items-center gap-1 text-[14px] font-semibold text-black hover:text-brand-orange"
          >
            Recharge <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent orders */}
      <section className="mt-8 overflow-hidden rounded-[12px] border border-[#e5e7eb]">
        <div className="border-b border-[#e5e7eb] px-6 py-5">
          <h2 className="text-[22px] font-bold text-black">Recent Orders</h2>
        </div>
        {recent.length === 0 ? (
          <p className="px-6 py-10 text-center text-[14px] text-[#6b7280]">
            {loaded ? (
              <>
                No orders yet.{" "}
                <Link href="/collection" className="font-semibold text-black underline">
                  Start shopping
                </Link>
              </>
            ) : (
              "Loading orders…"
            )}
          </p>
        ) : (
          recent.map((o, i) => (
            <div
              key={o.orderId}
              className={`flex flex-wrap items-center gap-4 px-6 py-4 ${
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
                  {o.productId?.title || o.productId?.name || "Custom order"} •{" "}
                  {orderDate(o)}
                </p>
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
        <Link
          href="/dashboard/orders"
          className="flex items-center justify-center gap-1 bg-[#f9fafb] py-4 text-[13px] font-bold text-black hover:text-brand-orange"
        >
          View All Orders <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* Saved designs */}
      <section className="mt-8 rounded-[12px] border border-[#e5e7eb] p-6">
        <h2 className="text-[22px] font-bold text-black">Saved Designs</h2>
        {design ? (
          <div className="flex flex-wrap gap-6 pt-6">
            <div className="w-[200px]">
              <div className="relative flex h-[200px] items-center justify-center overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-[#f3f4f6]">
                {design.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={design.image}
                    alt="Saved design"
                    className="max-h-[80%] max-w-[80%] object-contain"
                  />
                ) : (
                  <span className="text-[12px] text-[#9ca3af]">No artwork</span>
                )}
              </div>
              <p className="pt-3 text-[14px] font-bold text-black">
                {design.product?.title
                  ? `${design.product.title} design`
                  : "My custom design"}
              </p>
              <p className="text-[12px] text-[#6b7280]">
                {design.colorName ? `${design.colorName} garment` : "Draft"}
              </p>
              <div className="flex gap-2 pt-3">
                <Link
                  href="/design-studio"
                  className="flex-1 rounded-[4px] border border-[#c4c7c7] py-1.5 text-center text-[12px] font-bold text-black hover:bg-[#f3f4f6]"
                >
                  Edit
                </Link>
                <Link
                  href="/design-studio/preview"
                  className="flex-1 rounded-[4px] bg-black py-1.5 text-center text-[12px] font-bold text-white hover:opacity-85"
                >
                  Order
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <p className="pt-6 text-[14px] text-[#6b7280]">
            No saved designs yet.{" "}
            <Link
              href="/design-studio"
              className="font-semibold text-black underline hover:text-brand-orange"
            >
              Start designing
            </Link>
          </p>
        )}
      </section>
    </AccountShell>
  );
}
