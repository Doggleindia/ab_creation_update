import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUserPlus,
  FiPackage,
  FiMail,
  FiShoppingBag,
  FiArchive,
} from "react-icons/fi";
import Shell, { Card } from "../components/Shell";
import {
  api,
  inr,
  shortOrderId,
  type AdminOrder,
  type Application,
  type AdminProduct,
} from "../lib/api";

const PRIORITY_CHIP: Record<string, { label: string; cls: string }> = {
  rush: { label: "Super Rush", cls: "bg-[#fdecc8] text-[#b45309]" },
  express: { label: "Rush", cls: "bg-[#fdf3dd] text-[#b07d1a]" },
  standard: { label: "Normal", cls: "bg-[#f3f4f6] text-[#6b7280]" },
};

const QUEUE_DOT: Record<string, { label: string; color: string }> = {
  pending: { label: "Queued", color: "#9ca3af" },
  confirmed: { label: "Confirmed", color: "#0891b2" },
  in_production: { label: "Printing", color: "#ea580c" },
  quality_check: { label: "Quality Check", color: "#f59e0b" },
  ready_to_pack: { label: "Ready to Pack", color: "#16a34a" },
  shipped: { label: "Dispatched", color: "#f59e0b" },
  delivered: { label: "Delivered", color: "#22c55e" },
  cancelled: { label: "Cancelled", color: "#ef4444" },
};

export default function Dashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [sellers, setSellers] = useState<number>(0);
  const [balance, setBalance] = useState<number | null>(null);
  const [contacts, setContacts] = useState<number>(0);
  const [awaiting, setAwaiting] = useState<number>(0);
  const [range, setRange] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    api<{ data: AdminOrder[] }>("/api/orders/admin/all")
      .then((j) => setOrders(j.data ?? []))
      .catch(() => {});
    api<{ data: { applications: Application[] } }>(
      "/api/applications?status=pending",
    )
      .then((j) => setApps(j.data?.applications ?? []))
      .catch(() => {});
    api<{ data: AdminProduct[] }>("/api/products/admin?limit=100")
      .then((j) =>
        setProducts(
          (Array.isArray(j.data) ? j.data : []).filter(
            (p) => !p.status || p.status === "published",
          ),
        ),
      )
      .catch(() => {});
    api<{ data: { users: { accountType?: string }[] } }>(
      "/api/admin/users/all",
    )
      .then((j) =>
        setSellers(
          (j.data?.users ?? []).filter((u) => u.accountType === "seller")
            .length,
        ),
      )
      .catch(() => {});
    api<{ data: { balance: number } }>("/api/admin/wallet/balance")
      .then((j) => setBalance(j.data?.balance ?? null))
      .catch(() => {});
    api<{ data: { sellerProducts: unknown[] } }>(
      "/api/seller-products/admin?status=pending",
    )
      .then((j) => setAwaiting((j.data?.sellerProducts ?? []).length))
      .catch(() => {});
    api<{ data: { contacts: { status?: string }[] } }>("/api/contacts")
      .then((j) =>
        setContacts(
          (j.data?.contacts ?? []).filter((c) => c.status === "new").length,
        ),
      )
      .catch(() => {});
  }, []);

  const now = new Date();
  const inMonth = (o: AdminOrder, offset: number) => {
    const d = o.createdAt ? new Date(o.createdAt) : null;
    if (!d) return false;
    const m = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
  };
  const revOf = (offset: number) =>
    orders
      .filter((o) => inMonth(o, offset) && o.orderStatus !== "cancelled")
      .reduce((s, o) => s + (o.totalAmount || 0), 0);
  const revenue = revOf(0);
  const lastRevenue = revOf(-1);
  const pct =
    lastRevenue > 0 ? Math.round(((revenue - lastRevenue) / lastRevenue) * 100) : null;
  const pendingProduction = orders.filter((o) =>
    ["pending", "confirmed", "in_production", "quality_check", "ready_to_pack"].includes(o.orderStatus),
  ).length;
  const queue = orders
    .filter((o) => !["delivered", "cancelled"].includes(o.orderStatus))
    .slice(0, 5);
  const sellerApps = apps.filter((a) => a.type === "seller");
  const bulkApps = apps.filter((a) => a.type === "bulk");

  // Smooth 30-day revenue curve (Catmull-Rom → cubic bezier)
  const chart = useMemo(() => {
    const days: number[] = Array.from({ length: range }, () => 0);
    for (const o of orders) {
      if (!o.createdAt || o.orderStatus === "cancelled") continue;
      const diff = Math.floor(
        (now.getTime() - new Date(o.createdAt).getTime()) / 86400000,
      );
      if (diff >= 0 && diff < range) days[range - 1 - diff] += o.totalAmount || 0;
    }
    const max = Math.max(...days, 1);
    const pts = days.map((v, i) => [
      (i / (range - 1)) * 100,
      42 - (v / max) * 34,
    ]) as [number, number][];
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
    }
    const end = pts[pts.length - 1];
    return { d, end };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, range]);

  const axisLabel = (daysAgo: number) =>
    new Date(now.getTime() - daysAgo * 86400000).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

  return (
    <Shell title="Admin Dashboard" subtitle="Overview of operations and pending tasks.">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
            Total Revenue (this month)
          </p>
          <p className="flex items-center gap-2 pt-2">
            <span className="text-[30px] font-bold leading-none text-black">
              {inr(revenue)}
            </span>
            {pct !== null && (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[12px] font-bold ${
                  pct >= 0
                    ? "bg-[#dcfce7] text-[#16a34a]"
                    : "bg-[#fee2e2] text-[#ba1a1a]"
                }`}
              >
                {pct >= 0 ? "+" : ""}
                {pct}%
              </span>
            )}
          </p>
          <p className="pt-3 text-[12.5px] text-[#6b7280]">
            {lastRevenue > 0 ? `vs ${inr(lastRevenue)} last month` : "First month of sales"}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
            Orders
          </p>
          <p className="flex items-center justify-between pt-2">
            <span className="text-[30px] font-bold leading-none text-black">
              {orders.length}
            </span>
            <span className="rounded-md bg-[#f3f4f6] px-2 py-1 text-[12px] font-bold text-[#374151]">
              Total
            </span>
          </p>
          <p className="pt-3 text-[12.5px] font-medium text-[#dc2626]">
            {pendingProduction} pending production
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
            Active Sellers
          </p>
          <p className="flex items-center justify-between pt-2">
            <span className="text-[30px] font-bold leading-none text-black">
              {sellers}
            </span>
            <FiShoppingBag className="h-5 w-5 text-[#b07d1a]" />
          </p>
          <p className="pt-3 text-[12.5px] font-medium text-[#b45309]">
            {sellerApps.length} application{sellerApps.length === 1 ? "" : "s"} pending
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
            Products Live
          </p>
          <p className="flex items-center justify-between pt-2">
            <span className="text-[30px] font-bold leading-none text-black">
              {products.length}
            </span>
            <FiArchive className="h-5 w-5 text-[#374151]" />
          </p>
          <p className="pt-3 text-[12.5px] font-medium text-[#b45309]">
            {awaiting > 0
              ? `${awaiting} awaiting approval`
              : balance !== null
                ? `Wallet ${inr(balance)}`
                : "—"}
          </p>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        {/* Production queue */}
        <Card>
          <div className="flex items-center justify-between border-b border-[#f3f4f6] px-6 py-4">
            <h2 className="text-[16px] font-bold text-black">
              Production Queue
            </h2>
            <Link
              to="/production"
              className="text-[13px] font-bold text-black hover:underline"
            >
              View All ›
            </Link>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8f9fb] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-3 py-3">Mockup</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Method</th>
                <th className="px-3 py-3">Priority</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[13px] text-[#9ca3af]">
                    Nothing in production.
                  </td>
                </tr>
              )}
              {queue.map((o) => {
                const dot = QUEUE_DOT[o.orderStatus] ?? QUEUE_DOT.pending;
                const mock =
                  o.designFiles?.[0] ?? o.variantId?.media?.images?.[0];
                return (
                  <tr key={o._id} className="border-t border-[#f3f4f6] text-[13.5px]">
                    <td className="px-6 py-4 font-bold text-black">
                      #{shortOrderId(o)}
                    </td>
                    <td className="px-3 py-4">
                      <span className="block h-10 w-10 overflow-hidden rounded border border-[#e5e7eb] bg-[#f3f4f6]">
                        {mock && (
                          <img
                            src={mock}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-[#374151]">
                      {o.userId?.name ?? "—"}
                    </td>
                    <td className="px-3 py-4 text-[#374151]">
                      {o.customDesign ? "DTF" : "Catalog"}
                    </td>
                    <td className="px-3 py-4">
                      {(() => {
                        const p = PRIORITY_CHIP[o.shippingMethod ?? "standard"];
                        return (
                          <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${p.cls}`}>
                            {p.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-4 text-[#374151]">{inr(o.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 text-[13px] font-medium" style={{ color: dot.color }}>
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: dot.color }}
                        />
                        {dot.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Pending actions */}
        <Card className="p-6">
          <h2 className="text-[16px] font-bold text-black">Pending Actions</h2>
          <div className="flex flex-col gap-6 pt-6">
            <div className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fdf3dd] text-[#b45309]">
                <FiUserPlus className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[14px] font-bold text-black">
                  {sellerApps.length} Seller Application
                  {sellerApps.length === 1 ? "" : "s"}
                </p>
                <p className="text-[12.5px] text-[#6b7280]">
                  New creators waiting for review.
                </p>
                <Link
                  to="/sellers"
                  className="mt-1 inline-block text-[12.5px] font-bold text-black underline"
                >
                  Review Applications
                </Link>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fdf3dd] text-[#b45309]">
                <FiPackage className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[14px] font-bold text-black">
                  {bulkApps.length} Bulk Quote Request
                  {bulkApps.length === 1 ? "" : "s"}
                </p>
                <p className="text-[12.5px] text-[#6b7280]">
                  Organizations awaiting a proposal.
                </p>
                <Link
                  to="/bulk-orders"
                  className="mt-1 inline-block text-[12.5px] font-bold text-black underline"
                >
                  Review Requests
                </Link>
              </div>
            </div>
            <div className="flex gap-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  contacts > 0
                    ? "bg-[#fee2e2] text-[#dc2626]"
                    : "bg-[#f3f4f6] text-[#6b7280]"
                }`}
              >
                <FiMail className="h-4 w-4" />
              </span>
              <div>
                <p
                  className={`text-[14px] font-bold ${
                    contacts > 0 ? "text-[#dc2626]" : "text-black"
                  }`}
                >
                  {contacts} Contact Message{contacts === 1 ? "" : "s"}
                </p>
                <p className="text-[12.5px] text-[#6b7280]">
                  Customer enquiries from the contact form.
                </p>
                <Link
                  to="/messages"
                  className="mt-1 inline-block text-[12.5px] font-bold text-black underline"
                >
                  Open Messages
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue trend */}
      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-black">
            Revenue Trend (Last {range} Days)
          </h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[12px] text-[#6b7280]">
              <span className="h-2 w-2 rounded-full bg-black" /> Revenue in ₹
            </span>
            <div className="flex overflow-hidden rounded-lg border border-[#e5e7eb]">
              {([7, 30, 90] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-[12.5px] font-semibold ${
                    range === r
                      ? "bg-black text-white"
                      : "bg-[#f8f9fb] text-[#374151] hover:bg-[#f3f4f6]"
                  }`}
                >
                  {r}D
                </button>
              ))}
            </div>
          </div>
        </div>
        <svg viewBox="0 0 100 46" preserveAspectRatio="none" className="mt-6 h-[190px] w-full">
          {[12, 24, 36].map((y) => (
            <line
              key={y}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.3"
              strokeDasharray="1.5 1.5"
            />
          ))}
          <path
            d={chart.d}
            fill="none"
            stroke="#171717"
            strokeWidth="0.9"
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx={chart.end[0]}
            cy={chart.end[1]}
            r="1.1"
            fill="#f0c96b"
            stroke="#171717"
            strokeWidth="0.3"
          />
        </svg>
        <div className="flex justify-between pt-2 text-[11px] text-[#9ca3af]">
          <span>{axisLabel(range - 1)}</span>
          <span>{axisLabel(Math.round((range - 1) * 0.75))}</span>
          <span>{axisLabel(Math.round((range - 1) * 0.5))}</span>
          <span>{axisLabel(Math.round((range - 1) * 0.25))}</span>
          <span>Today</span>
        </div>
      </Card>
    </Shell>
  );
}
