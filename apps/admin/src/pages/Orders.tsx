import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiX, FiDownload, FiUser, FiBox, FiCreditCard, FiActivity } from "react-icons/fi";
import Shell, { Card, StatusChip } from "../components/Shell";
import { api, inr, type AdminOrder } from "../lib/api";

const STATUSES = [
  "pending",
  "confirmed",
  "quality_check",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const LIFECYCLE: { key: (typeof STATUSES)[number]; label: string }[] = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "In Production" },
  { key: "quality_check", label: "Quality Check" },
  { key: "shipped", label: "Dispatched" },
  { key: "delivered", label: "Delivered" },
];

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "New" },
  { key: "confirmed", label: "In Production" },
  { key: "quality_check", label: "Quality Check" },
  { key: "shipped", label: "Dispatched" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const RANGES = [
  { key: 7, label: "Last 7 days" },
  { key: 30, label: "Last 30 days" },
  { key: 90, label: "Last 90 days" },
  { key: 0, label: "All time" },
];

// Mock-style status: colored dot + label. Payment failures win over status.
const STATUS_DOT: Record<string, { label: string; color: string }> = {
  pending: { label: "New", color: "#2563eb" },
  confirmed: { label: "In Production", color: "#ea580c" },
  quality_check: { label: "Quality Check", color: "#f59e0b" },
  shipped: { label: "Dispatched", color: "#3b82f6" },
  delivered: { label: "Delivered", color: "#16a34a" },
  cancelled: { label: "Cancelled", color: "#6b7280" },
  failed: { label: "Payment Failed", color: "#dc2626" },
};

function StatusDot({ order }: { order: AdminOrder }) {
  const key =
    order.paymentStatus === "failed" ? "failed" : order.orderStatus;
  const s = STATUS_DOT[key] ?? STATUS_DOT.pending;
  return (
    <span
      className="flex items-center gap-2 text-[13px] font-semibold"
      style={{ color: s.color }}
    >
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

const PAGE_SIZE = 10;

function fullDate(d?: string) {
  return d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
}

export default function Orders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setSearch(q);
  }, [searchParams]);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [nextStatus, setNextStatus] = useState<string>("confirmed");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [range, setRange] = useState(30);
  const [page, setPage] = useState(1);
  const [sellerProductIds, setSellerProductIds] = useState<Set<string>>(
    new Set(),
  );

  function load() {
    api<{ data: AdminOrder[] }>("/api/orders/admin/all")
      .then((j) => setOrders(j.data ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }
  useEffect(load, []);

  // Orders for seller-published catalog products get the "Seller" type chip
  useEffect(() => {
    api<{
      data: { sellerProducts: { publishedProductId?: { _id?: string } | string | null }[] };
    }>("/api/seller-products/admin?status=approved")
      .then((j) => {
        const ids = new Set<string>();
        for (const s of j.data?.sellerProducts ?? []) {
          const p = s.publishedProductId;
          const id = typeof p === "object" ? p?._id : p;
          if (id) ids.add(String(id));
        }
        setSellerProductIds(ids);
      })
      .catch(() => {});
  }, []);

  useEffect(() => setPage(1), [filter, search, range]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of STATUSES) c[s] = orders.filter((o) => o.orderStatus === s).length;
    return c;
  }, [orders]);

  const rows = orders.filter((o) => {
    if (filter !== "all" && o.orderStatus !== filter) return false;
    if (range > 0 && o.createdAt) {
      const age = (Date.now() - new Date(o.createdAt).getTime()) / 86400000;
      if (age > range) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        o.orderId.toLowerCase().includes(q) ||
        (o.userId?.name ?? "").toLowerCase().includes(q) ||
        (o.productId?.title ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const typeChip = (o: AdminOrder) =>
    o.customDesign
      ? { label: "Custom", cls: "bg-[#eef2ff] text-[#4f46e5]" }
      : o.productType === "bulk"
        ? { label: "Bulk", cls: "bg-[#dcfce7] text-[#16a34a]" }
        : o.productId?._id && sellerProductIds.has(String(o.productId._id))
          ? { label: "Seller", cls: "bg-[#f5f3ff] text-[#7c3aed]" }
          : { label: "Catalog", cls: "bg-[#f3f4f6] text-[#374151]" };

  async function updateStatus() {
    if (!selected) return;
    setUpdating(true);
    setError("");
    try {
      const j = await api<{ data: AdminOrder }>(
        `/api/orders/admin/${encodeURIComponent(selected.orderId)}/status`,
        { method: "PATCH", body: JSON.stringify({ orderStatus: nextStatus }) },
      );
      setSelected(j.data);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  }

  function exportCsv() {
    const header = ["Order ID","Customer","Email","Product","Type","Qty","Amount","Status","Date"];
    const lines = rows.map((o) =>
      [
        o.orderId,
        o.userId?.name ?? "",
        o.userId?.email ?? "",
        (o.productId?.title ?? "Custom order").replace(/,/g, " "),
        o.customDesign ? "Custom" : o.productType,
        o.quantity,
        o.totalAmount,
        o.orderStatus,
        o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : "",
      ].join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join(String.fromCharCode(10))], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const lifecycleIdx = selected
    ? LIFECYCLE.findIndex((l) => l.key === selected.orderStatus)
    : -1;

  // Shipping meta + internal note (drawer)
  const [meta, setMeta] = useState({ carrier: "", trackingNumber: "", internalNote: "" });
  const [savingMeta, setSavingMeta] = useState(false);
  useEffect(() => {
    if (!selected) return;
    setMeta({
      carrier: selected.carrier ?? "",
      trackingNumber: selected.trackingNumber ?? "",
      internalNote: selected.internalNote ?? "",
    });
  }, [selected?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveMeta() {
    if (!selected) return;
    setSavingMeta(true);
    setError("");
    try {
      const j = await api<{ data: AdminOrder }>(
        `/api/orders/admin/${encodeURIComponent(selected.orderId)}/meta`,
        { method: "PATCH", body: JSON.stringify(meta) },
      );
      setSelected(j.data);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingMeta(false);
    }
  }

  async function cancelOrder() {
    if (!selected) return;
    if (!window.confirm(`Cancel order #${selected.orderId.slice(-8)}? The customer keeps their payment unless you also issue a refund.`)) return;
    setUpdating(true);
    try {
      const j = await api<{ data: AdminOrder }>(
        `/api/orders/admin/${encodeURIComponent(selected.orderId)}/status`,
        { method: "PATCH", body: JSON.stringify({ orderStatus: "cancelled" }) },
      );
      setSelected(j.data);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setUpdating(false);
    }
  }

  async function refundOrder() {
    if (!selected) return;
    if (!window.confirm(`Refund ${inr(selected.totalAmount)} to ${selected.userId?.name ?? "the customer"}'s wallet and cancel the order? This cannot be undone.`)) return;
    setUpdating(true);
    setError("");
    try {
      const j = await api<{ message: string; data: AdminOrder }>(
        `/api/orders/admin/${encodeURIComponent(selected.orderId)}/refund`,
        { method: "POST", body: JSON.stringify({}) },
      );
      setSelected(j.data);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refund failed");
    } finally {
      setUpdating(false);
    }
  }

  function printOrder() {
    if (!selected) return;
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return;
    const addr = [
      selected.shippingAddress?.street,
      selected.shippingAddress?.city,
      selected.shippingAddress?.state,
      selected.shippingAddress?.pincode,
    ]
      .filter(Boolean)
      .join(", ");
    w.document.write(`<html><head><title>Order ${selected.orderId}</title>
      <style>body{font-family:system-ui;padding:32px;color:#111}h1{font-size:20px}table{border-collapse:collapse;margin-top:16px}td{padding:6px 16px 6px 0;font-size:14px}td:first-child{color:#666}</style>
      </head><body>
      <h1>AB Creation — Order #${selected.orderId}</h1>
      <table>
        <tr><td>Customer</td><td>${selected.userId?.name ?? "—"} (${selected.userId?.email ?? ""})</td></tr>
        <tr><td>Phone</td><td>${selected.phoneNumber ?? "—"}</td></tr>
        <tr><td>Product</td><td>${selected.productId?.title ?? "Custom order"}${selected.customDesign ? " — Custom Design" : ""}</td></tr>
        <tr><td>Details</td><td>${selected.color ?? ""} · ${selected.size ?? ""} · Qty ${selected.quantity}</td></tr>
        <tr><td>Amount</td><td>${inr(selected.totalAmount)} (${selected.paymentStatus})</td></tr>
        <tr><td>Status</td><td>${selected.orderStatus}</td></tr>
        <tr><td>Priority</td><td>${selected.shippingMethod ?? "standard"}</td></tr>
        <tr><td>Ship to</td><td>${addr || "—"}</td></tr>
        <tr><td>Carrier</td><td>${selected.carrier ?? "—"} ${selected.trackingNumber ? `· ${selected.trackingNumber}` : ""}</td></tr>
      </table>
      <script>window.print()</script></body></html>`);
    w.document.close();
  }

  return (
    <Shell
      title="All Orders"
      subtitle={`${orders.length} total`}
      actions={
        <>
          <button
            onClick={exportCsv}
            className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-4 text-[13px] font-bold text-black hover:border-black"
          >
            ⬇ Export CSV
          </button>
          <select
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="h-10 rounded-lg border border-[#e5e7eb] bg-[#f8f9fb] px-3 text-[13px] font-semibold text-[#374151] focus:border-black focus:outline-none"
          >
            {RANGES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
        </>
      }
    >
      {/* Filter chips + search */}
      <div className="flex flex-wrap items-center gap-3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
              filter === f.key
                ? "bg-black text-white"
                : "border border-[#e5e7eb] bg-white text-[#374151] hover:border-black"
            }`}
          >
            {f.label} ({counts[f.key] ?? 0})
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID, customer..."
          className="ml-auto h-10 w-[260px] rounded-lg border border-[#e5e7eb] bg-white px-4 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
        />
      </div>

      {/* Table */}
      <Card className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="bg-[#f8f9fb] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
              <th className="px-6 py-3.5">Order ID</th>
              <th className="px-3 py-3.5">Customer</th>
              <th className="px-3 py-3.5">Product</th>
              <th className="px-3 py-3.5">Type</th>
              <th className="px-3 py-3.5">Amount</th>
              <th className="px-3 py-3.5">Status</th>
              <th className="px-3 py-3.5">Date</th>
              <th className="px-6 py-3.5">Action</th>
            </tr>
          </thead>
          <tbody>
            {!loaded && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-[13px] text-[#9ca3af]">
                  Loading orders…
                </td>
              </tr>
            )}
            {loaded && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-[13px] text-[#9ca3af]">
                  No orders match.
                </td>
              </tr>
            )}
            {pageRows.map((o) => (
              <tr key={o._id} className="border-t border-[#f3f4f6] text-[13.5px]">
                <td className="px-6 py-4 font-bold text-black">
                  #{o.orderId.slice(-8)}
                </td>
                <td className="px-3 py-4 text-[#374151]">{o.userId?.name ?? "—"}</td>
                <td className="px-3 py-4">
                  <span className="flex items-center gap-3">
                    <span className="h-9 w-9 shrink-0 overflow-hidden rounded border border-[#e5e7eb] bg-[#f3f4f6]">
                      {o.variantId?.media?.images?.[0] && (
                        <img
                          src={o.variantId.media.images[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </span>
                    <span className="max-w-[200px] truncate text-[#374151]">
                      {o.productId?.title ?? "Custom order"}
                      {o.customDesign ? " — Custom" : ""}
                    </span>
                  </span>
                </td>
                <td className="px-3 py-4">
                  {(() => {
                    const t = typeChip(o);
                    return (
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${t.cls}`}
                      >
                        {t.label}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-3 py-4 text-[#374151]">
                  {inr(o.totalAmount)}
                  {o.quantity > 1 && (
                    <span className="block text-[11px] text-[#9ca3af]">
                      (x{o.quantity})
                    </span>
                  )}
                </td>
                <td className="px-3 py-4">
                  <StatusDot order={o} />
                </td>
                <td className="px-3 py-4 text-[#6b7280]">{fullDate(o.createdAt)}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      setSelected(o);
                      setError("");
                      const idx = STATUSES.indexOf(o.orderStatus);
                      setNextStatus(STATUSES[Math.min(idx + 1, 3)]);
                    }}
                    className="text-[13px] font-bold text-black hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f3f4f6] px-6 py-4">
          <p className="text-[12.5px] text-[#6b7280]">
            Showing {rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
            {(page - 1) * PAGE_SIZE + pageRows.length} of {rows.length}
          </p>
          {pages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[14px] text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter(
                  (n) => n <= 3 || n === pages || Math.abs(n - page) <= 1,
                )
                .reduce<(number | "…")[]>((acc, n) => {
                  const prev = acc[acc.length - 1];
                  if (typeof prev === "number" && n - prev > 1) acc.push("…");
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) =>
                  n === "…" ? (
                    <span key={`e${i}`} className="px-1 text-[13px] text-[#9ca3af]">
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`h-8 w-8 rounded-full text-[13px] font-bold ${
                        page === n
                          ? "bg-black text-white"
                          : "text-[#374151] hover:bg-[#f3f4f6]"
                      }`}
                    >
                      {n}
                    </button>
                  ),
                )}
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[14px] text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-40"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSelected(null)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-[500px] overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 flex items-start justify-between border-b border-[#e5e7eb] bg-white px-6 py-5">
              <div>
                <p className="flex items-center gap-3 text-[18px] font-bold text-black">
                  Order #{selected.orderId.slice(-8)}{" "}
                  <StatusChip status={selected.orderStatus} />
                </p>
                <p className="pt-1 text-[12.5px] text-[#6b7280]">
                  Placed {fullDate(selected.createdAt)} · Payment{" "}
                  {selected.paymentStatus}
                </p>
              </div>
              <button
                aria-label="Close"
                onClick={() => setSelected(null)}
                className="text-[#6b7280] hover:text-black"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-7 px-6 py-6">
              {/* Customer */}
              <section>
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                  <FiUser /> Customer Details
                </h3>
                <div className="grid grid-cols-2 gap-4 pt-3 text-[13.5px]">
                  <div>
                    <p className="text-[11.5px] text-[#9ca3af]">Name</p>
                    <p className="font-bold text-black">
                      {selected.userId?.name ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11.5px] text-[#9ca3af]">Email</p>
                    <p className="text-[#374151]">{selected.userId?.email ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11.5px] text-[#9ca3af]">Phone</p>
                    <p className="text-[#374151]">{selected.phoneNumber ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11.5px] text-[#9ca3af]">Address</p>
                    <p className="text-[#374151]">
                      {[
                        selected.shippingAddress?.street,
                        selected.shippingAddress?.city,
                        selected.shippingAddress?.state,
                        selected.shippingAddress?.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Product */}
              <section className="border-t border-[#f3f4f6] pt-6">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                  <FiBox /> Product Information
                </h3>
                <div className="flex gap-4 pt-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6]">
                    {selected.variantId?.media?.images?.[0] && (
                      <img
                        src={selected.variantId.media.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="text-[13.5px]">
                    <p className="text-[16px] font-bold leading-snug text-black">
                      {selected.productId?.title ?? "Custom order"}
                      {selected.customDesign ? " — Custom Design" : ""}
                    </p>
                    <p className="pt-1.5 text-[#374151]">
                      Color: <b>{selected.color ?? "—"}</b> · Size:{" "}
                      <b>{selected.size ?? "—"}</b> · Qty:{" "}
                      <b>{selected.quantity}</b>
                    </p>
                    {(selected.designFiles?.length ?? 0) > 0 && (
                      <a
                        href={selected.designFiles![0]}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-bold text-black underline"
                      >
                        <FiDownload /> Download Design File
                      </a>
                    )}
                  </div>
                </div>
              </section>

              {/* Pricing */}
              <section className="border-t border-[#f3f4f6] pt-6">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                  <FiCreditCard /> Pricing
                </h3>
                <div className="mt-3 rounded-lg bg-[#f8f9fb] p-4">
                  <div className="flex justify-between border-t-0 text-[15px] font-bold text-black">
                    <span>Total Amount</span>
                    <span>{inr(selected.totalAmount)}</span>
                  </div>
                  <p className="pt-1 text-[12px] text-[#6b7280]">
                    Paid via wallet · {selected.paymentStatus}
                  </p>
                </div>
              </section>

              {/* Lifecycle + status update */}
              <section className="border-t border-[#f3f4f6] pt-6">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                  <FiActivity /> Order Lifecycle
                </h3>
                <ol className="flex flex-col gap-0 pt-4">
                  {LIFECYCLE.map((l, i) => {
                    const done =
                      selected.orderStatus === "cancelled"
                        ? false
                        : i <= lifecycleIdx;
                    return (
                      <li key={l.key} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                              done
                                ? "bg-black text-white"
                                : "border border-[#d1d5db] text-[#d1d5db]"
                            }`}
                          >
                            ✓
                          </span>
                          {i < LIFECYCLE.length - 1 && (
                            <span
                              className={`h-6 w-px ${done ? "bg-black" : "bg-[#e5e7eb]"}`}
                            />
                          )}
                        </div>
                        <span
                          className={`pt-0.5 text-[13.5px] ${
                            done ? "font-bold text-black" : "text-[#9ca3af]"
                          }`}
                        >
                          {l.label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                {selected.orderStatus === "cancelled" && (
                  <p className="pt-2 text-[13px] font-bold text-[#ba1a1a]">
                    This order was cancelled.
                  </p>
                )}

                <div className="mt-5 rounded-xl border border-[#e5e7eb] p-4">
                  <div className="flex gap-3">
                    <select
                      value={nextStatus}
                      onChange={(e) => setNextStatus(e.target.value)}
                      className="h-10 flex-1 rounded-lg border border-[#e5e7eb] px-3 text-[13.5px] text-black focus:border-black focus:outline-none"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s === "pending"
                            ? "Order Placed"
                            : s === "confirmed"
                              ? "In Production"
                              : s === "quality_check"
                                ? "Quality Check"
                                : s === "shipped"
                                  ? "Dispatched"
                                  : s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => void updateStatus()}
                      disabled={updating || nextStatus === selected.orderStatus}
                      className="h-10 rounded-lg bg-black px-5 text-[13.5px] font-bold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
                    >
                      {updating ? "Updating…" : "Update"}
                    </button>
                  </div>
                  {error && (
                    <p className="pt-3 text-[12.5px] text-[#ba1a1a]">{error}</p>
                  )}
                </div>
              </section>

              {/* Shipping info + internal note */}
              <section className="border-t border-[#f3f4f6] pt-6">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                  Shipping Info
                </h3>
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11.5px] font-semibold text-[#374151]">
                      Carrier
                    </span>
                    <input
                      value={meta.carrier}
                      onChange={(e) =>
                        setMeta((m) => ({ ...m, carrier: e.target.value }))
                      }
                      placeholder="e.g. Delhivery, Bluedart"
                      className="h-10 rounded-lg border border-[#e5e7eb] px-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11.5px] font-semibold text-[#374151]">
                      Tracking Number
                    </span>
                    <input
                      value={meta.trackingNumber}
                      onChange={(e) =>
                        setMeta((m) => ({ ...m, trackingNumber: e.target.value }))
                      }
                      placeholder="e.g. 1234567890"
                      className="h-10 rounded-lg border border-[#e5e7eb] px-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
                    />
                  </label>
                </div>
                <label className="mt-3 flex flex-col gap-1.5">
                  <span className="text-[11.5px] font-semibold text-[#374151]">
                    Internal Note
                  </span>
                  <textarea
                    value={meta.internalNote}
                    onChange={(e) =>
                      setMeta((m) => ({ ...m, internalNote: e.target.value }))
                    }
                    rows={2}
                    placeholder="Only visible to admins…"
                    className="rounded-lg border border-[#e5e7eb] p-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
                  />
                </label>
                <button
                  onClick={() => void saveMeta()}
                  disabled={savingMeta}
                  className="mt-3 rounded-lg bg-black px-5 py-2 text-[13px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                >
                  {savingMeta ? "Saving…" : "Save Shipping Info"}
                </button>
              </section>

              {/* Actions footer */}
              <section className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f3f4f6] pt-6">
                <button
                  onClick={printOrder}
                  className="rounded-full border border-black px-5 py-2.5 text-[13.5px] font-bold text-black hover:bg-[#f3f4f6]"
                >
                  🖨 Print Order
                </button>
                <span className="flex items-center gap-4">
                  {selected.paymentStatus === "paid" && (
                    <button
                      onClick={() => void refundOrder()}
                      disabled={updating}
                      className="text-[13.5px] font-bold text-[#dc2626] hover:underline disabled:opacity-40"
                    >
                      Issue Refund
                    </button>
                  )}
                  {selected.paymentStatus === "refunded" && (
                    <span className="text-[13px] font-bold text-[#16a34a]">
                      ✓ Refunded
                    </span>
                  )}
                  {!["cancelled", "delivered"].includes(selected.orderStatus) && (
                    <button
                      onClick={() => void cancelOrder()}
                      disabled={updating}
                      className="text-[13.5px] font-bold text-[#dc2626] hover:underline disabled:opacity-40"
                    >
                      Cancel Order
                    </button>
                  )}
                </span>
              </section>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
