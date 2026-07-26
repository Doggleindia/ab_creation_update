"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Archive,
  Check,
  CheckCircle2,
  ChevronRight,
  Headset,
  Minus,
  Plus,
  X,
} from "lucide-react";
import AccountShell, { StatusChip } from "@/components/account/AccountShell";
import { BACKEND, apiFetch, getToken } from "@/lib/auth";
import { addToCart } from "@/lib/cart";

type ApiOrder = {
  _id: string;
  orderId?: string;
  orderStatus: string;
  paymentStatus?: string;
  productType?: "ready" | "bulk";
  createdAt?: string;
  updatedAt?: string;
  totalAmount?: number;
  quantity?: number;
  size?: string;
  color?: string;
  carrier?: string;
  trackingNumber?: string;
  customDesign?: string;
  designFiles?: string[];
  phoneNumber?: string;
  shippingAddress?: { street?: string; city?: string; state?: string; pincode?: string };
  productId?: { _id?: string; title?: string; name?: string; slug?: string } | null;
  variantId?: { _id?: string; media?: { images?: string[] } } | null;
};

type LiveProduct = {
  _id: string;
  slug: string;
  title: string;
  basePrice: number;
  discountPercentage?: number;
  sizes?: string[];
  colors?: string[];
  customizationTypes?: string[];
  variants?: { _id: string; color?: string; media?: { images?: string[] } }[];
};

const TABS = [
  { id: "all", label: "All Orders" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

const PAGE_SIZE = 8;
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

const TIMELINE = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "in_production", label: "In Production" },
  { key: "quality_check", label: "Quality Check" },
  { key: "ready_to_pack", label: "Packing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const inTab = (o: ApiOrder, tab: string) =>
  tab === "all"
    ? true
    : tab === "active"
      ? !["delivered", "cancelled"].includes(o.orderStatus)
      : tab === "completed"
        ? o.orderStatus === "delivered"
        : o.orderStatus === "cancelled";

const shortId = (o: ApiOrder) => (o.orderId ?? o._id).slice(-8);
const isCustom = (o: ApiOrder) => !!(o.customDesign || (o.designFiles?.length ?? 0) > 0);
const unitPrice = (o: ApiOrder) =>
  o.quantity && o.totalAmount ? Math.round(o.totalAmount / o.quantity) : (o.totalAmount ?? 0);

const dt = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

function OrdersView() {
  const router = useRouter();
  const params = useSearchParams();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<string>(params.get("tab") ?? "all");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");

  // Modals
  const [track, setTrack] = useState<ApiOrder | null>(null);
  const [reorder, setReorder] = useState<ApiOrder | null>(null);
  const [live, setLive] = useState<LiveProduct | null>(null);
  const [sel, setSel] = useState({ size: "M", color: "", qty: 1 });

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

  // Deep links: ?track=<id> / ?reorder=<id> auto-open once orders arrive
  useEffect(() => {
    if (orders.length === 0) return;
    const find = (v: string | null) =>
      v ? orders.find((o) => o.orderId === v || o._id === v) : undefined;
    const t = find(params.get("track"));
    if (t) setTrack(t);
    const r = find(params.get("reorder"));
    if (r) openReorder(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, params]);

  useEffect(() => setPage(1), [tab, q]);

  const flash = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 2500);
  };

  function openReorder(o: ApiOrder) {
    setReorder(o);
    setLive(null);
    setSel({ size: o.size || "M", color: o.color || "", qty: o.quantity || 1 });
    if (o.productId?.slug) {
      fetch(`${BACKEND}/api/products/slug/${encodeURIComponent(o.productId.slug)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => j?.data?._id && setLive(j.data))
        .catch(() => {});
    }
  }

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
    [isCustom(o) ? "Custom Design" : null, o.color, o.size, o.quantity ? `Qty: ${o.quantity}` : null]
      .filter(Boolean)
      .join(" · ");

  // ---- Reorder actions ----
  const reorderUnit = (o: ApiOrder) =>
    live ? Math.round(live.basePrice * (1 - (live.discountPercentage || 0) / 100)) : unitPrice(o);

  function buildCartItem(o: ApiOrder) {
    const title = o.productId?.title || o.productId?.name || "Custom order";
    const variant = live?.variants?.find(
      (v) => (v.color ?? "").toLowerCase() === sel.color.toLowerCase(),
    );
    return {
      id: `re-${o._id}-${Date.now()}`,
      slug: o.productId?.slug ?? "custom-design",
      title: isCustom(o) ? `${title} — Custom Design` : title,
      variant: [sel.color, `Size ${sel.size}`].filter(Boolean).join(" · "),
      image: variant?.media?.images?.[0] ?? o.designFiles?.[0] ?? o.variantId?.media?.images?.[0] ?? "",
      price: reorderUnit(o),
      quantity: sel.qty,
      custom: isCustom(o),
      productId: o.productId?._id,
      productType: "ready" as const,
      variantId: variant?._id ?? o.variantId?._id,
      color: sel.color || undefined,
      size: sel.size,
      customDesign: o.customDesign || undefined,
      designFiles: o.designFiles?.length ? o.designFiles : undefined,
    };
  }

  function addReorder(o: ApiOrder, buyNow: boolean) {
    addToCart(buildCartItem(o));
    setReorder(null);
    if (buyNow) router.push("/checkout");
    else flash("Added to cart");
  }

  // ---- Track modal (rendered via function call) ----
  const renderTrack = (o: ApiOrder) => {
    const cancelled = o.orderStatus === "cancelled";
    const idx = TIMELINE.findIndex((s) => s.key === o.orderStatus);
    return (
      <div
        className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-10"
        onClick={() => setTrack(null)}
      >
        <div
          className="w-full max-w-[520px] rounded-[16px] bg-white p-7"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[20px] font-bold text-black">Track Order</h3>
              <p className="text-[13px] text-[#6b7280]">
                #{shortId(o)} · placed {dt(o.createdAt)}
              </p>
            </div>
            <button aria-label="Close" onClick={() => setTrack(null)} className="p-1 text-[#6b7280] hover:text-black">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-[10px] bg-[#f8f9fb] p-3.5">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white">
              {(o.variantId?.media?.images?.[0] ?? o.designFiles?.[0]) && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={o.variantId?.media?.images?.[0] ?? o.designFiles?.[0]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-bold text-black">
                {o.productId?.title || "Custom order"}
              </span>
              <span className="block text-[12.5px] text-[#6b7280]">{subtitle(o)}</span>
            </span>
            <StatusChip status={o.orderStatus} />
          </div>

          {cancelled ? (
            <p className="mt-5 rounded-[10px] bg-[#fef2f2] px-4 py-3.5 text-[13.5px] text-[#ba1a1a]">
              This order was cancelled
              {o.paymentStatus === "refunded" ? " and the payment refunded to your wallet." : "."}
            </p>
          ) : (
            <div className="mt-6 flex flex-col">
              {TIMELINE.map((s, i) => {
                const done = i <= idx;
                const current = i === idx;
                return (
                  <div key={s.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                          done ? "border-black bg-black text-white" : "border-[#e5e7eb] bg-white"
                        }`}
                      >
                        {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </span>
                      {i < TIMELINE.length - 1 && (
                        <span className={`min-h-[22px] w-0.5 flex-1 ${i < idx ? "bg-black" : "bg-[#e5e7eb]"}`} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className={`text-[14px] ${current ? "font-bold text-black" : done ? "font-semibold text-black" : "text-[#9ca3af]"}`}>
                        {s.label}
                      </p>
                      {current && (
                        <p className="text-[12px] text-[#6b7280]">
                          {s.key === "delivered"
                            ? `Delivered · last update ${dt(o.updatedAt)}`
                            : `Current stage · updated ${dt(o.updatedAt)}`}
                        </p>
                      )}
                      {s.key === "shipped" && done && (o.carrier || o.trackingNumber) && (
                        <p className="text-[12px] text-[#6b7280]">
                          {[o.carrier, o.trackingNumber].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {o.shippingAddress?.street && (
            <div className="mt-2 rounded-[10px] border border-[#e5e7eb] p-4 text-[13px] leading-6 text-[#374151]">
              <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#9ca3af]">
                Shipping to
              </p>
              <p className="pt-1">
                {o.shippingAddress.street},{" "}
                {[o.shippingAddress.city, o.shippingAddress.state].filter(Boolean).join(", ")}{" "}
                {o.shippingAddress.pincode}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-5">
            <p className="text-[15px] font-bold text-black">
              ₹{(o.totalAmount ?? 0).toLocaleString("en-IN")}
              <span className="pl-2 text-[12px] font-medium capitalize text-[#6b7280]">
                {o.paymentStatus}
              </span>
            </p>
            <Link
              href={`/track-order/${encodeURIComponent(o.orderId ?? o._id)}`}
              className="text-[13px] font-bold text-black underline underline-offset-4 hover:text-brand-orange"
            >
              Open shareable tracking page →
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // ---- Reorder modal (rendered via function call) ----
  const renderReorder = (o: ApiOrder) => {
    const title = o.productId?.title || o.productId?.name || "Custom order";
    const sizes = live?.sizes?.length ? live.sizes : ALL_SIZES;
    const colors = live?.colors?.length ? live.colors : o.color ? [o.color] : [];
    const unit = reorderUnit(o);
    const img =
      live?.variants?.find((v) => (v.color ?? "").toLowerCase() === sel.color.toLowerCase())
        ?.media?.images?.[0] ??
      o.designFiles?.[0] ??
      o.variantId?.media?.images?.[0];
    return (
      <div
        className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-10"
        onClick={() => setReorder(null)}
      >
        <div
          className="w-full max-w-[520px] rounded-[16px] bg-white p-7"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
            <h3 className="text-[20px] font-bold text-black">Reorder</h3>
            <button aria-label="Close" onClick={() => setReorder(null)} className="p-1 text-[#6b7280] hover:text-black">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 border-b border-[#e5e7eb] py-5">
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-[#f3f4f6]">
              {img && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={img} alt="" className="h-full w-full object-cover" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-bold leading-snug text-black">
                {title}
                {isCustom(o) ? " — Custom Design" : ""}
              </span>
              <span className="block text-[13px] text-[#6b7280]">
                {[o.color, isCustom(o) ? "DTF Print" : null].filter(Boolean).join(" · ")}
              </span>
              <span className="block text-[13px] text-[#6b7280]">
                Ordered on {dt(o.createdAt)}
              </span>
            </span>
            <span className="text-[18px] font-bold text-black">
              ₹{unit.toLocaleString("en-IN")}
            </span>
          </div>

          <p className="pt-5 text-[14px] font-bold text-black">Size</p>
          <div className="flex flex-wrap gap-2 pt-2.5">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSel((x) => ({ ...x, size: s }))}
                className={`min-w-[52px] rounded-full px-4 py-2.5 text-[13px] font-bold ${
                  sel.size === s
                    ? "bg-black text-white"
                    : "border border-[#c4c7c7] text-black hover:border-black"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {colors.length > 0 && (
            <div className="flex items-center justify-between pt-5">
              <p className="text-[14px] font-bold text-black">Color</p>
              <div className="flex items-center gap-2.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSel((x) => ({ ...x, color: c }))}
                    className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${
                      sel.color.toLowerCase() === c.toLowerCase()
                        ? "bg-black text-white"
                        : "border border-[#c4c7c7] text-black hover:border-black"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-5">
            <p className="text-[14px] font-bold text-black">Quantity</p>
            <div className="flex items-center overflow-hidden rounded-[8px] border border-[#c4c7c7]">
              <button
                aria-label="Decrease quantity"
                onClick={() => setSel((x) => ({ ...x, qty: Math.max(1, x.qty - 1) }))}
                className="px-3.5 py-2.5 text-black hover:bg-[#f3f4f6]"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[44px] border-x border-[#c4c7c7] py-2.5 text-center text-[14px] font-bold text-black">
                {sel.qty}
              </span>
              <button
                aria-label="Increase quantity"
                onClick={() => setSel((x) => ({ ...x, qty: Math.min(99, x.qty + 1) }))}
                className="px-3.5 py-2.5 text-black hover:bg-[#f3f4f6]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-[10px] bg-[#f8f9fb] p-5 text-[14px]">
            <div className="flex justify-between text-[#6b7280]">
              <span>Unit price</span>
              <span>₹{unit.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between pt-1.5 text-[#6b7280]">
              <span>Quantity</span>
              <span>× {sel.qty}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-[#e5e7eb] pt-3 text-[16px] font-bold text-black">
              <span>Total</span>
              <span>₹{(unit * sel.qty).toLocaleString("en-IN")}</span>
            </div>
          </div>

          <button
            onClick={() => addReorder(o, false)}
            className="mt-6 w-full rounded-[10px] bg-black py-4 text-[15px] font-bold uppercase tracking-[0.5px] text-white hover:opacity-85"
          >
            Add to Cart
          </button>
          <button
            onClick={() => addReorder(o, true)}
            className="mt-3 w-full rounded-[10px] border border-black py-4 text-[15px] font-bold uppercase tracking-[0.5px] text-black hover:bg-[#f3f4f6]"
          >
            Buy Now
          </button>

          {isCustom(o) && (
            <div className="pt-4 text-center">
              <p className="text-[13px] text-[#6b7280]">Your original design will be used</p>
              {o.designFiles?.[0] && (
                <a
                  href={o.designFiles[0]}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13.5px] font-bold text-black underline underline-offset-4 hover:text-brand-orange"
                >
                  Preview design
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAction = (o: ApiOrder) => {
    if (o.orderStatus === "shipped") {
      return (
        <button
          onClick={() => setTrack(o)}
          className="rounded-[8px] bg-black px-5 py-2 text-[11.5px] font-bold uppercase tracking-[0.5px] text-white hover:opacity-85"
        >
          Track
        </button>
      );
    }
    if (["delivered", "cancelled"].includes(o.orderStatus)) {
      return (
        <button
          onClick={() => openReorder(o)}
          className="rounded-[8px] border border-[#c4c7c7] px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.5px] text-black hover:bg-[#f3f4f6]"
        >
          Reorder
        </button>
      );
    }
    return (
      <button
        onClick={() => setTrack(o)}
        aria-label="View order progress"
        className="p-2 text-[#6b7280] hover:text-black"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    );
  };

  return (
    <AccountShell>
      {toast && (
        <div className="fixed right-6 top-6 z-[90] flex items-center gap-2.5 rounded-[10px] bg-black px-5 py-3.5 text-[14px] font-semibold text-white shadow-lg">
          <CheckCircle2 className="h-[18px] w-[18px] text-[#4ade80]" />
          {toast}
        </div>
      )}
      {track && renderTrack(track)}
      {reorder && renderReorder(reorder)}

      <h1 className="text-[32px] font-bold tracking-[-0.6px] text-black">My Orders</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pt-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-[13.5px] font-bold ${
              tab === t.id ? "bg-black text-white" : "text-[#374151] hover:bg-[#eeeff1]"
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
                    <button
                      onClick={() => setTrack(o)}
                      className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-[#f3f4f6]"
                      aria-label={`Order ${shortId(o)} details`}
                    >
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
                        <img src={o.designFiles[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Archive className="h-6 w-6 text-[#9ca3af]" />
                      )}
                    </button>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <button
                          onClick={() => setTrack(o)}
                          className="max-w-[280px] truncate text-left text-[15.5px] font-bold text-black hover:underline"
                        >
                          #{shortId(o)} · {o.productId?.title || o.productId?.name || "Custom order"}
                        </button>
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
