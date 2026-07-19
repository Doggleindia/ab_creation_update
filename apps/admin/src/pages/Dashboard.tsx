import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiUserPlus, FiPackage, FiMail } from "react-icons/fi";
import Shell, { Card, StatusChip } from "../components/Shell";
import {
  api,
  inr,
  shortDate,
  type AdminOrder,
  type Application,
  type AdminProduct,
} from "../lib/api";

export default function Dashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [contacts, setContacts] = useState<number>(0);

  useEffect(() => {
    api<{ data: AdminOrder[] }>("/api/orders/admin/all")
      .then((j) => setOrders(j.data ?? []))
      .catch(() => {});
    api<{ data: { applications: Application[] } }>(
      "/api/applications?status=pending",
    )
      .then((j) => setApps(j.data?.applications ?? []))
      .catch(() => {});
    api<{ data: AdminProduct[] }>("/api/products/admin")
      .then((j) => setProducts(Array.isArray(j.data) ? j.data : []))
      .catch(() => {});
    api<{ data: { balance: number } }>("/api/admin/wallet/balance")
      .then((j) => setBalance(j.data?.balance ?? null))
      .catch(() => {});
    api<{ data?: unknown[]; count?: number }>("/api/contacts")
      .then((j) =>
        setContacts(
          typeof j.count === "number" ? j.count : (j.data?.length ?? 0),
        ),
      )
      .catch(() => {});
  }, []);

  const now = new Date();
  const monthOrders = orders.filter((o) => {
    const d = o.createdAt ? new Date(o.createdAt) : null;
    return (
      d &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });
  const revenue = monthOrders
    .filter((o) => o.orderStatus !== "cancelled")
    .reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingProduction = orders.filter((o) =>
    ["pending", "confirmed"].includes(o.orderStatus),
  ).length;
  const queue = orders
    .filter((o) => !["delivered", "cancelled"].includes(o.orderStatus))
    .slice(0, 5);
  const sellerApps = apps.filter((a) => a.type === "seller");
  const bulkApps = apps.filter((a) => a.type === "bulk");

  // Simple 30-day revenue sparkline
  const spark = useMemo(() => {
    const days: number[] = Array.from({ length: 30 }, () => 0);
    for (const o of orders) {
      if (!o.createdAt || o.orderStatus === "cancelled") continue;
      const diff = Math.floor(
        (now.getTime() - new Date(o.createdAt).getTime()) / 86400000,
      );
      if (diff >= 0 && diff < 30) days[29 - diff] += o.totalAmount || 0;
    }
    const max = Math.max(...days, 1);
    const pts = days
      .map(
        (v, i) =>
          `${((i / 29) * 100).toFixed(2)},${(40 - (v / max) * 34).toFixed(2)}`,
      )
      .join(" ");
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  return (
    <Shell title="Admin Dashboard" subtitle="Overview of operations and pending tasks.">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Revenue (this month)",
            value: inr(revenue),
            sub: `${monthOrders.length} orders this month`,
            subCls: "text-[#16a34a]",
          },
          {
            label: "Orders",
            value: String(orders.length),
            sub: `${pendingProduction} pending production`,
            subCls: "text-[#dc2626]",
          },
          {
            label: "Pending Applications",
            value: String(apps.length),
            sub: `${sellerApps.length} seller · ${bulkApps.length} bulk`,
            subCls: "text-[#b45309]",
          },
          {
            label: "Products Live",
            value: String(products.length),
            sub: balance !== null ? `Wallet ${inr(balance)}` : "—",
            subCls: "text-[#b45309]",
          },
        ].map((s) => (
          <Card key={s.label} className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
              {s.label}
            </p>
            <p className="pt-2 text-[30px] font-bold leading-none text-black">
              {s.value}
            </p>
            <p className={`pt-3 text-[12.5px] font-medium ${s.subCls}`}>
              {s.sub}
            </p>
          </Card>
        ))}
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
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-[#9ca3af]">
                    Nothing in production.
                  </td>
                </tr>
              )}
              {queue.map((o) => (
                <tr key={o._id} className="border-t border-[#f3f4f6] text-[13.5px]">
                  <td className="px-6 py-4 font-bold text-black">#{o.orderId.slice(-8)}</td>
                  <td className="px-3 py-4 text-[#374151]">
                    {o.userId?.name ?? "—"}
                  </td>
                  <td className="px-3 py-4 text-[#374151]">{inr(o.totalAmount)}</td>
                  <td className="px-3 py-4 text-[#6b7280]">{shortDate(o.createdAt)}</td>
                  <td className="px-6 py-4">
                    <StatusChip status={o.orderStatus} />
                  </td>
                </tr>
              ))}
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
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fdf3dd] text-[#b45309]">
                <FiMail className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[14px] font-bold text-black">
                  {contacts} Contact Message{contacts === 1 ? "" : "s"}
                </p>
                <p className="text-[12.5px] text-[#6b7280]">
                  Customer enquiries from the contact form.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue trend */}
      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-black">
            Revenue Trend (Last 30 Days)
          </h2>
          <span className="text-[12px] text-[#6b7280]">● Revenue in ₹</span>
        </div>
        <svg
          viewBox="0 0 100 44"
          preserveAspectRatio="none"
          className="mt-6 h-[180px] w-full"
        >
          {[10, 20, 30].map((y) => (
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
          <polyline
            points={spark}
            fill="none"
            stroke="#171717"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="flex justify-between pt-2 text-[11px] text-[#9ca3af]">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </Card>
    </Shell>
  );
}
