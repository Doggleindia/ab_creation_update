"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AccountShell, { StatusChip } from "@/components/account/AccountShell";
import { apiFetch, getToken, getUser } from "@/lib/auth";
import {
  type DesignDraft,
  activateDesign,
  getDesigns,
  subscribeDesigns,
} from "@/lib/designs";
import { getWishlist, subscribeWishlist } from "@/lib/wishlist";

type ApiOrder = {
  _id: string;
  orderId?: string;
  orderStatus: string;
  createdAt?: string;
  totalAmount?: number;
  productId?: { title?: string; name?: string; slug?: string } | null;
  variantId?: { media?: { images?: string[] } } | null;
};

const shortId = (o: ApiOrder) => (o.orderId ?? o._id).slice(-8);

const dt = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "";

export default function DashboardPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [wallet, setWallet] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<DesignDraft[]>([]);
  const [wishCount, setWishCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [quotes, setQuotes] = useState<
    { _id: string; businessName?: string; status: string; quote?: { amount?: number; status?: string } }[]
  >([]);

  useEffect(() => {
    if (!getToken()) return;
    // Bulk accounts see their quote pipeline front and center
    if (getUser()?.accountType === "bulk") {
      apiFetch<{ data: { applications: typeof quotes } }>("/api/applications/mine")
        .then((j) => setQuotes(j.data?.applications ?? []))
        .catch(() => {});
    }
    apiFetch<{ data: ApiOrder[] }>("/api/orders/history")
      .then((j) => setOrders(j.data ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
    apiFetch<{ data: { balance: number } }>("/api/wallet/balance")
      .then((j) => setWallet(j.data?.balance ?? null))
      .catch(() => {});
    const syncDesigns = () => setDrafts(getDesigns());
    syncDesigns();
    const unsubDesigns = subscribeDesigns(syncDesigns);
    const syncWish = () => setWishCount(getWishlist().length);
    syncWish();
    const unsubWish = subscribeWishlist(syncWish);
    return () => {
      unsubDesigns();
      unsubWish();
    };
  }, []);

  const active = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.orderStatus),
  ).length;
  const recent = orders.slice(0, 3);

  const stats = [
    {
      label: "Active Orders",
      value: String(active).padStart(2, "0"),
      cta: "View",
      href: "/dashboard/orders?tab=active",
    },
    {
      label: "Saved Designs",
      value: String(drafts.length).padStart(2, "0"),
      cta: "Open Studio",
      href: "/design-studio",
    },
    {
      label: "Wishlist",
      value: String(wishCount).padStart(2, "0"),
      suffix: "items",
      cta: "View",
      href: "/dashboard/wishlist",
    },
    {
      label: "Wallet Balance",
      value: wallet !== null ? `₹${Math.round(wallet).toLocaleString("en-IN")}` : "—",
      cta: "Recharge",
      href: "/dashboard/wallet",
    },
  ];

  return (
    <AccountShell>
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[12px] border border-[#e5e7eb] bg-white p-6">
            <p className="text-[11.5px] font-bold uppercase tracking-[1.5px] text-[#6b7280]">
              {s.label}
            </p>
            <p className="pt-3 text-[38px] font-bold leading-none text-black">
              {loaded || s.value !== "00" ? s.value : "—"}
              {s.suffix && (
                <span className="pl-2 text-[15px] font-medium text-[#6b7280]">
                  {s.suffix}
                </span>
              )}
            </p>
            <Link
              href={s.href}
              className="mt-4 flex w-fit items-center gap-1.5 text-[14.5px] font-bold text-black hover:text-brand-orange"
            >
              {s.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      {/* Bulk pipeline (bulk accounts) */}
      {quotes.length > 0 && (
        <section className="mt-6 rounded-[12px] border border-[#e5e7eb] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-bold tracking-[-0.4px] text-black">
              Bulk Quotes
            </h2>
            <Link
              href="/dashboard/quotes"
              className="text-[14px] font-bold text-black hover:text-brand-orange"
            >
              View All ›
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-[#f3f4f6] pt-2">
            {quotes.slice(0, 3).map((a) => (
              <Link
                key={a._id}
                href={`/bulk-order/quote/${a._id}`}
                className="flex flex-wrap items-center justify-between gap-3 py-3.5 hover:bg-[#fafafa]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-bold text-black">
                    {a.businessName || "Bulk request"}
                  </span>
                  <span className="block text-[12.5px] capitalize text-[#6b7280]">
                    {(a.quote?.status ?? a.status).replace(/_/g, " ")}
                    {typeof a.quote?.amount === "number"
                      ? ` · ₹${a.quote.amount.toLocaleString("en-IN")}`
                      : ""}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#9ca3af]" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent orders */}
      <section className="mt-6 overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-white">
        <div className="px-6 pb-2 pt-6">
          <h2 className="text-[24px] font-bold tracking-[-0.4px] text-black">
            Recent Orders
          </h2>
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
          recent.map((o) => {
            const delivered = o.orderStatus === "delivered";
            return (
              <div
                key={o._id}
                className="flex flex-wrap items-center gap-4 border-t border-[#f3f4f6] px-6 py-4"
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
                  <p className="truncate text-[15.5px] font-bold text-black">
                    #{shortId(o)}
                  </p>
                  <p className="truncate text-[13.5px] text-[#6b7280]">
                    {o.productId?.title || o.productId?.name || "Custom order"} •{" "}
                    {dt(o.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusChip status={o.orderStatus} />
                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/dashboard/orders?track=${encodeURIComponent(o.orderId ?? o._id)}`}
                      className={`rounded-[6px] border px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.5px] ${
                        delivered
                          ? "border-[#e5e7eb] text-[#9ca3af] hover:text-[#6b7280]"
                          : "border-[#c4c7c7] text-black hover:bg-[#f3f4f6]"
                      }`}
                    >
                      Track
                    </Link>
                    <Link
                      href={`/dashboard/orders?reorder=${encodeURIComponent(o.orderId ?? o._id)}`}
                      className="text-[11.5px] font-bold uppercase tracking-[0.5px] text-black underline underline-offset-4 hover:text-brand-orange"
                    >
                      Reorder
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <Link
          href="/dashboard/orders"
          className="flex items-center justify-center gap-1.5 border-t border-[#f3f4f6] bg-[#f9fafb] py-4 text-[14px] font-bold text-black hover:text-brand-orange"
        >
          View All Orders <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Saved designs */}
      <section className="mt-6 rounded-[12px] border border-[#e5e7eb] bg-white p-6">
        <h2 className="text-[24px] font-bold tracking-[-0.4px] text-black">
          Saved Designs
        </h2>
        {drafts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 pt-6 sm:grid-cols-2 xl:grid-cols-4">
              {drafts.slice(0, 4).map((d) => (
                <div key={d.id} className="rounded-[10px] border border-[#e5e7eb] p-3">
                  <div
                    className="relative flex h-[190px] items-center justify-center overflow-hidden rounded-[8px]"
                    style={{ background: d.state.colorHex ?? "#f6f5f2" }}
                  >
                    {d.state.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.state.image}
                        alt={d.name}
                        className="max-h-[85%] max-w-[85%] object-contain"
                      />
                    ) : (
                      <span className="text-[12px] text-[#9ca3af]">No artwork</span>
                    )}
                  </div>
                  <p className="truncate pt-3 text-[14.5px] font-bold text-black">{d.name}</p>
                  <p className="text-[12.5px] text-[#6b7280]">
                    Saved{" "}
                    {new Date(d.savedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                  <div className="flex gap-2 pt-3">
                    <Link
                      href={`/design-studio?draft=${d.id}`}
                      className="flex-1 rounded-[6px] border border-[#c4c7c7] py-2 text-center text-[11.5px] font-bold uppercase tracking-[0.5px] text-black hover:bg-[#f3f4f6]"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        activateDesign(d);
                        window.location.href = "/design-studio/preview";
                      }}
                      className="flex-1 rounded-[6px] bg-black py-2 text-center text-[11.5px] font-bold uppercase tracking-[0.5px] text-white hover:opacity-85"
                    >
                      Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/designs"
              className="mt-5 flex w-fit items-center gap-1.5 text-[14px] font-bold text-black hover:text-brand-orange"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <p className="pt-6 text-[14px] text-[#6b7280]">
            No saved designs yet.{" "}
            <Link
              href="/design-studio"
              className="font-semibold text-black underline hover:text-brand-orange"
            >
              Start designing
            </Link>{" "}
            — your studio drafts appear here.
          </p>
        )}
      </section>
    </AccountShell>
  );
}
