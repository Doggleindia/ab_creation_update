"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Archive, ChevronRight, Headset } from "lucide-react";
import AccountShell, { StatusChip } from "@/components/account/AccountShell";
import { apiFetch, getToken } from "@/lib/auth";

type ApiOrder = {
  _id: string;
  orderId?: string;
  orderStatus: string;
  productType?: "ready" | "bulk";
  createdAt?: string;
  totalAmount?: number;
  quantity?: number;
  size?: string;
  color?: string;
  customDesign?: string;
  designFiles?: string[];
  productId?: { title?: string; name?: string; slug?: string } | null;
  variantId?: { media?: { images?: string[] } } | null;
};

const TABS = [
  { id: "all", label: "All Orders" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

const PAGE_SIZE = 8;

const inTab = (o: ApiOrder, tab: string) =>
  tab === "all"
    ? true
    : tab === "active"
      ? !["delivered", "cancelled"].includes(o.orderStatus)
      : tab === "completed"
        ? o.orderStatus === "delivered"
        : o.orderStatus === "cancelled";

const shortId = (o: ApiOrder) => (o.orderId ?? o._id).slice(-8);

const dt = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

function OrdersView() {
  const params = useSearchParams();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<string>(params.get("tab") ?? "all");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const query = params.get("q");
    if (query !== null) setQ(query);
    const t = params.get("tab");
    if (t && TABS.some((x) => x.id === t)) setTab(t);
  }, [params]);

  useEffect(() => {
    if (!getToken()) return;
    apiFetch<{ data: ApiOrder[] }>("/api/orders/history")
      .then((j) => setOrders(j.data ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => setPage(1), [tab, q]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of TABS) c[t.id] = orders.filter((o) => inTab(o, t.id)).length;
    return c;
  }, [orders]);

  const rows = orders.filter((o) => {
    if (!inTab(o, tab)) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (o.orderId ?? o._id).toLowerCase().includes(s) ||
      (o.productId?.title ?? "").toLowerCase().includes(s)
    );
  });
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const subtitle = (o: ApiOrder) =>
    [
      o.customDesign || (o.designFiles?.length ?? 0) > 0 ? "Custom Design" : null,
      o.color,
      o.size,
      o.quantity ? `Qty: ${o.quantity}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

  const renderAction = (o: ApiOrder) => {
    const reorderHref = o.productId?.slug
      ? `/product/${o.productId.slug}`
      : o.customDesign || (o.designFiles?.length ?? 0) > 0
        ? "/design-studio"
        : "/collection";
    if (o.orderStatus === "shipped") {
      return (
        <Link
          href={`/track-order/${encodeURIComponent(o.orderId ?? o._id)}`}
          className="rounded-[8px] bg-black px-5 py-2 text-[11.5px] font-bold uppercase tracking-[0.5px] text-white hover:opacity-85"
        >
          Track
        </Link>
      );
    }
    if (["delivered", "cancelled"].includes(o.orderStatus)) {
      return (
        <Link
          href={reorderHref}
          className="rounded-[8px] border border-[#c4c7c7] px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.5px] text-black hover:bg-[#f3f4f6]"
        >
          Reorder
        </Link>
      );
    }
    return (
      <Link
        href={`/track-order/${encodeURIComponent(o.orderId ?? o._id)}`}
        aria-label="View order progress"
        className="p-2 text-[#6b7280] hover:text-black"
      >
        <ChevronRight className="h-5 w-5" />
      </Link>
    );
  };

  return (
    <AccountShell>
      <h1 className="text-[32px] font-bold tracking-[-0.6px] text-black">My Orders</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pt-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-[13.5px] font-bold ${
              tab === t.id
                ? "bg-black text-white"
                : "text-[#374151] hover:bg-[#eeeff1]"
            }`}
          >
            {t.label} ({counts[t.id] ?? 0})
          </button>
        ))}
      </div>

      {q && (
        <p className="pt-4 text-[13px] text-[#6b7280]">
          Filtering by “{q}” —{" "}
          <button onClick={() => setQ("")} className="font-bold text-black underline">
            clear
          </button>
        </p>
      )}

      {/* Orders table */}
      <div className="mt-5 overflow-x-auto rounded-[12px] border border-[#e5e7eb] bg-white">
        <table className="w-full min-w-[780px] text-left">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f8f9fb] text-[11px] font-bold uppercase tracking-[1px] text-[#6b7280]">
              <th className="px-6 py-4">Order Detail</th>
              <th className="px-3 py-4">Date</th>
              <th className="px-3 py-4">Amount</th>
              <th className="px-3 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loaded && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center text-[14px] text-[#6b7280]">
                  {q || tab !== "all" ? (
                    "No orders match this view."
                  ) : (
                    <>
                      No orders yet.{" "}
                      <Link href="/collection" className="font-semibold text-black underline">
                        Start shopping
                      </Link>
                    </>
                  )}
                </td>
              </tr>
            )}
            {pageRows.map((o) => (
              <tr key={o._id} className="border-b border-[#f3f4f6] last:border-b-0">
                <td className="px-6 py-4">
                  <span className="flex items-center gap-4">
                    <span className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-[#f3f4f6]">
                      {o.variantId?.media?.images?.[0] ? (
                        <Image
                          src={o.variantId.media.images[0]}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="68px"
                        />
                      ) : o.designFiles?.[0] ? (
                        /* eslint-disable-next-line @next/next/no-img-element -- customer artwork on S3 */
                        <img
                          src={o.designFiles[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Archive className="h-6 w-6 text-[#9ca3af]" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="max-w-[280px] truncate text-[15.5px] font-bold text-black">
                          #{shortId(o)} · {o.productId?.title || o.productId?.name || "Custom order"}
                        </span>
                        {o.productType === "bulk" && (
                          <span className="rounded-[6px] bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] text-white">
                            Bulk
                          </span>
                        )}
                      </span>
                      <span className="block truncate pt-0.5 text-[13px] text-[#6b7280]">
                        {subtitle(o) || "—"}
                      </span>
                    </span>
                  </span>
                </td>
                <td className="px-3 py-4 text-[14px] text-[#374151]">{dt(o.createdAt)}</td>
                <td className="px-3 py-4 text-[16px] font-bold text-black">
                  {typeof o.totalAmount === "number"
                    ? `₹${o.totalAmount.toLocaleString("en-IN")}`
                    : "—"}
                </td>
                <td className="px-3 py-4">
                  <StatusChip status={o.orderStatus} />
                </td>
                <td className="px-6 py-4">
                  <span className="flex justify-end">{renderAction(o)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {rows.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e7eb] bg-[#f8f9fb] px-6 py-3.5">
            <p className="text-[13px] text-[#6b7280]">
              Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, rows.length)} of{" "}
              {rows.length}
            </p>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-8 w-8 rounded-[6px] text-[13px] font-bold ${
                    page === n ? "bg-black text-white" : "text-[#374151] hover:bg-[#eeeff1]"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                aria-label="Next page"
                className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[#374151] hover:bg-[#eeeff1] disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Support banner */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[12px] bg-[#e7e9f5] px-6 py-5">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
            <Headset className="h-5 w-5 text-black" />
          </span>
          <span>
            <span className="block text-[16px] font-bold text-black">
              Need help with an order?
            </span>
            <span className="block text-[13.5px] text-[#374151]">
              Our support team is here for order inquiries and custom requests.
            </span>
          </span>
        </div>
        <Link
          href="/contact-us"
          className="rounded-[8px] bg-black px-6 py-3 text-[13.5px] font-bold text-white hover:opacity-85"
        >
          Contact Support
        </Link>
      </div>
    </AccountShell>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-white" />}>
      <OrdersView />
    </Suspense>
  );
}
