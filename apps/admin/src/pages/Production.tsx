import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiPrinter, FiUser, FiXCircle, FiPackage } from "react-icons/fi";
import Shell, { Card } from "../components/Shell";
import { api, inr, shortOrderId, type AdminOrder } from "../lib/api";

const LANES: {
  key: string;
  label: string;
  dot: string;
  match: (o: AdminOrder) => boolean;
}[] = [
  {
    key: "queued",
    label: "Queued",
    dot: "#9ca3af",
    match: (o) => o.orderStatus === "pending" || o.orderStatus === "confirmed",
  },
  {
    key: "printing",
    label: "Printing",
    dot: "#3b82f6",
    match: (o) => o.orderStatus === "in_production",
  },
  {
    key: "qc",
    label: "Quality Check",
    dot: "#f59e0b",
    match: (o) => o.orderStatus === "quality_check",
  },
  {
    key: "pack",
    label: "Ready to Pack",
    dot: "#22c55e",
    match: (o) => o.orderStatus === "ready_to_pack",
  },
];

const PRIORITY_CHIP: Record<string, { label: string; cls: string }> = {
  rush: { label: "Super Rush", cls: "bg-[#fee2e2] text-[#dc2626]" },
  express: { label: "Rush", cls: "bg-[#fdf3dd] text-[#b07d1a]" },
  standard: { label: "Normal", cls: "bg-[#f3f4f6] text-[#6b7280]" },
};

const METHOD_TABS = [
  { key: "all", label: "All" },
  { key: "dtf", label: "Custom (DTF)" },
  { key: "catalog", label: "Catalog" },
  { key: "bulk", label: "Bulk" },
] as const;

const methodOf = (o: AdminOrder) =>
  o.customDesign ? "dtf" : o.productType === "bulk" ? "bulk" : "catalog";

const METHOD_TAG: Record<string, string> = {
  dtf: "DTF",
  catalog: "CATALOG",
  bulk: "BULK",
};

function hoursAgo(d?: string) {
  if (!d) return null;
  const hrs = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (hrs < 1) return "under an hour ago";
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const isToday = (d?: string) =>
  !!d && new Date(d).toDateString() === new Date().toDateString();

export default function Production() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof METHOD_TABS)[number]["key"]>("all");
  const [priority, setPriority] = useState("all");
  const [staff, setStaff] = useState("all");

  const load = useCallback(() => {
    api<{ data: AdminOrder[] }>("/api/orders/admin/all")
      .then((j) => setOrders(j.data ?? []))
      .catch(() => {});
  }, []);
  useEffect(load, [load]);

  useEffect(() => {
    api<{ data: { admins: { name: string }[] } }>("/api/admin")
      .then((j) => setAdmins((j.data?.admins ?? []).map((a) => a.name).filter(Boolean)))
      .catch(() => {});
  }, []);

  const board = orders.filter((o) =>
    LANES.some((l) => l.match(o)) &&
    o.paymentStatus !== "failed" &&
    (tab === "all" || methodOf(o) === tab) &&
    (priority === "all" || (o.shippingMethod ?? "standard") === priority) &&
    (staff === "all" || o.assignee === staff),
  );

  const allProduction = orders.filter((o) => LANES.some((l) => l.match(o)));
  const tabCount = (k: string) =>
    k === "all"
      ? allProduction.length
      : allProduction.filter((o) => methodOf(o) === k).length;

  const dispatchedToday = orders.filter(
    (o) => ["shipped", "delivered"].includes(o.orderStatus) && isToday(o.updatedAt),
  ).length;
  const printing = allProduction.filter((o) => o.orderStatus === "in_production").length;
  const queued = allProduction.filter((o) =>
    ["pending", "confirmed"].includes(o.orderStatus),
  ).length;
  const totalQcFails = orders.reduce((n, o) => n + (o.qcFails ?? 0), 0);
  // QC pass rate: orders that made it past QC vs recorded fail events
  const qcPassed = orders.filter((o) =>
    ["ready_to_pack", "shipped", "delivered"].includes(o.orderStatus),
  ).length;
  const qcRate =
    qcPassed + totalQcFails > 0
      ? Math.round((qcPassed / (qcPassed + totalQcFails)) * 100)
      : null;
  // Avg hours from production start to dispatch (last update of shipped+ orders)
  const prodDurations = orders
    .filter(
      (o) =>
        ["shipped", "delivered"].includes(o.orderStatus) &&
        o.productionStartedAt &&
        o.updatedAt,
    )
    .map(
      (o) =>
        (new Date(o.updatedAt!).getTime() - new Date(o.productionStartedAt!).getTime()) /
        3600000,
    )
    .filter((h) => h >= 0);
  const avgHours = prodDurations.length
    ? prodDurations.reduce((s, h) => s + h, 0) / prodDurations.length
    : null;

  const staffOptions = useMemo(() => {
    const set = new Set<string>(admins);
    for (const o of orders) if (o.assignee) set.add(o.assignee);
    return Array.from(set).sort();
  }, [admins, orders]);

  async function setStatus(
    o: AdminOrder,
    orderStatus: string,
    extra: Record<string, unknown> = {},
  ) {
    setBusyId(o._id);
    try {
      await api(`/api/orders/admin/${encodeURIComponent(o.orderId ?? o._id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ orderStatus, ...extra }),
      });
      load();
    } catch {
      // board reload keeps server truth
    } finally {
      setBusyId(null);
    }
  }

  async function assign(o: AdminOrder, assignee: string) {
    setBusyId(o._id);
    try {
      await api(`/api/orders/admin/${encodeURIComponent(o.orderId ?? o._id)}/meta`, {
        method: "PATCH",
        body: JSON.stringify({ assignee }),
      });
      load();
    } finally {
      setBusyId(null);
    }
  }

  function packAndLabel(o: AdminOrder) {
    const w = window.open("", "_blank", "width=480,height=640");
    if (w) {
      const addr = [
        o.shippingAddress?.street,
        o.shippingAddress?.city,
        o.shippingAddress?.state,
        o.shippingAddress?.pincode,
      ]
        .filter(Boolean)
        .join(", ");
      w.document.write(`<html><head><title>Label ${o.orderId ?? o._id}</title>
        <style>body{font-family:system-ui;padding:24px;color:#111}h2{margin:0 0 4px;font-size:16px}
        .box{border:2px solid #111;border-radius:8px;padding:20px;margin-top:12px}
        p{margin:4px 0;font-size:14px}.small{font-size:11px;color:#555}</style></head><body>
        <h2>AB Creation — Shipping Label</h2>
        <p class="small">Order #${o.orderId ?? o._id}</p>
        <div class="box">
          <p><b>SHIP TO</b></p>
          <p>${o.userId?.name ?? ""}</p>
          <p>${addr || "—"}</p>
          <p>${o.phoneNumber ?? ""}</p>
        </div>
        <div class="box">
          <p><b>${o.productId?.title ?? "Custom order"}</b>${o.customDesign ? " · Custom Design" : ""}</p>
          <p>Qty ${o.quantity}${o.size ? ` · Size ${o.size}` : ""}${o.color ? ` · ${o.color}` : ""}</p>
          <p class="small">Priority: ${(PRIORITY_CHIP[o.shippingMethod ?? "standard"] ?? PRIORITY_CHIP.standard).label}${o.carrier ? ` · Carrier: ${o.carrier}` : ""}</p>
        </div>
        <p class="small">Attach the courier label alongside. Generated ${new Date().toLocaleString("en-IN")}.</p>
        <script>window.print()</script></body></html>`);
      w.document.close();
    }
    void setStatus(o, "shipped");
  }

  function printDailyReport() {
    const w = window.open("", "_blank", "width=640,height=800");
    if (!w) return;
    const lines = allProduction
      .map(
        (o) =>
          `<tr><td>#${shortOrderId(o)}</td><td>${o.productId?.title ?? "Custom order"}</td><td>${o.quantity}</td><td>${(PRIORITY_CHIP[o.shippingMethod ?? "standard"] ?? PRIORITY_CHIP.standard).label}</td><td>${o.assignee ?? "—"}</td><td>${o.orderStatus.replace(/_/g, " ")}</td></tr>`,
      )
      .join("");
    w.document.write(`<html><head><title>Production Report ${new Date().toLocaleDateString("en-IN")}</title>
      <style>body{font-family:system-ui;padding:28px;color:#111}h1{font-size:20px}table{border-collapse:collapse;width:100%;margin-top:16px}
      th,td{border:1px solid #ddd;padding:6px 10px;font-size:12.5px;text-align:left}th{background:#f5f5f5}p{font-size:13px}</style></head><body>
      <h1>AB Creation — Daily Production Report</h1>
      <p>${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      <p><b>${queued}</b> queued · <b>${printing}</b> printing · <b>${allProduction.filter((o) => o.orderStatus === "quality_check").length}</b> in QC · <b>${allProduction.filter((o) => o.orderStatus === "ready_to_pack").length}</b> ready to pack · <b>${dispatchedToday}</b> dispatched today</p>
      <table><thead><tr><th>Order</th><th>Product</th><th>Qty</th><th>Priority</th><th>Assignee</th><th>Stage</th></tr></thead>
      <tbody>${lines || '<tr><td colspan="6">Nothing in production.</td></tr>'}</tbody></table>
      <script>window.print()</script></body></html>`);
    w.document.close();
  }

  const selectCls =
    "h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[13px] font-semibold text-[#374151] focus:border-black focus:outline-none";

  return (
    <Shell
      title="Production Queue"
      subtitle={`${allProduction.length} jobs pending`}
      actions={
        <>
          <span className="hidden items-center gap-2 rounded-lg bg-[#f3f4f6] px-3.5 py-2 text-[12.5px] font-semibold text-[#374151] lg:flex">
            <b>{dispatchedToday}</b> dispatched today ·{" "}
            <b>{printing}</b> printing · <b>{queued}</b> queued
          </span>
          <button
            onClick={printDailyReport}
            className="flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-[13px] font-bold text-black hover:border-black"
          >
            <FiPrinter className="h-3.5 w-3.5" /> Print Daily Report
          </button>
        </>
      }
    >
      {/* Method tabs + filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e7eb] pb-0">
        <div className="flex items-center gap-6">
          {METHOD_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`border-b-2 pb-3 text-[14px] font-semibold ${
                tab === t.key
                  ? "border-black text-black"
                  : "border-transparent text-[#6b7280] hover:text-black"
              }`}
            >
              {t.label} ({tabCount(t.key)})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 pb-3">
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectCls}>
            <option value="all">Priority: All</option>
            <option value="rush">Super Rush</option>
            <option value="express">Rush</option>
            <option value="standard">Normal</option>
          </select>
          <select value={staff} onChange={(e) => setStaff(e.target.value)} className={selectCls}>
            <option value="all">Staff: All</option>
            {staffOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Board */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {LANES.map((lane) => {
          const items = board.filter(lane.match);
          return (
            <div key={lane.key}>
              <div className="flex items-center gap-2 pb-3">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: lane.dot }} />
                <span className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#374151]">
                  {lane.label}
                </span>
                <span className="rounded-full bg-[#e5e7eb] px-2 py-0.5 text-[11px] font-bold text-[#374151]">
                  {items.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {items.length === 0 && (
                  <Card className="p-5 text-center text-[12px] text-[#c4c7c7]">Empty</Card>
                )}
                {items.map((o) => {
                  const pr = PRIORITY_CHIP[o.shippingMethod ?? "standard"] ?? PRIORITY_CHIP.standard;
                  const img = o.designFiles?.[0] ?? o.variantId?.media?.images?.[0];
                  const busy = busyId === o._id;
                  return (
                    <Card key={o._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[13.5px] font-bold text-black">
                          #{shortOrderId(o)}
                        </span>
                        {lane.key === "pack" ? (
                          <FiCheckCircle className="h-4 w-4 text-[#16a34a]" />
                        ) : (
                          <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${pr.cls}`}>
                            {pr.label}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3 pt-3">
                        <span className="h-11 w-11 shrink-0 overflow-hidden rounded border border-[#e5e7eb] bg-[#f3f4f6]">
                          {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                        </span>
                        <span className="min-w-0 text-[12.5px]">
                          <span className="block w-fit rounded bg-[#f3f4f6] px-1.5 py-0.5 text-[9.5px] font-bold tracking-[0.5px] text-[#374151]">
                            {METHOD_TAG[methodOf(o)]}
                          </span>
                          <span className="block truncate pt-1 font-semibold text-black">
                            {o.productId?.title ?? "Custom order"}
                          </span>
                          <span className="block text-[#6b7280]">
                            Qty {o.quantity}
                            {o.size ? ` · ${o.size}` : ""} · {inr(o.totalAmount)}
                          </span>
                        </span>
                      </div>

                      {/* Lane-specific detail + actions */}
                      {lane.key === "queued" && (
                        <div className="flex flex-col gap-2 pt-3">
                          <select
                            value={o.assignee ?? ""}
                            disabled={busy}
                            onChange={(e) => void assign(o, e.target.value)}
                            className="h-9 w-full rounded-lg border border-[#e5e7eb] bg-white px-2.5 text-[12.5px] font-semibold text-[#374151] focus:border-black focus:outline-none"
                          >
                            <option value="">Assign…</option>
                            {staffOptions.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => void setStatus(o, "in_production")}
                            disabled={busy}
                            className="w-full rounded-lg bg-black py-2 text-[12px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                          >
                            {busy ? "Updating…" : "Start Production"}
                          </button>
                        </div>
                      )}

                      {lane.key === "printing" && (
                        <div className="pt-3">
                          <p className="flex items-center gap-1.5 text-[12px] text-[#374151]">
                            <FiUser className="h-3 w-3" />
                            {o.assignee ? `Assigned to: ${o.assignee}` : "Unassigned"}
                            {o.productionStartedAt && (
                              <span className="ml-auto text-[#9ca3af]">
                                Started {hoursAgo(o.productionStartedAt)}
                              </span>
                            )}
                          </p>
                          <button
                            onClick={() => void setStatus(o, "quality_check")}
                            disabled={busy}
                            className="mt-2.5 w-full rounded-lg bg-black py-2 text-[12px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                          >
                            {busy ? "Updating…" : "Mark Complete → QC"}
                          </button>
                        </div>
                      )}

                      {lane.key === "qc" && (
                        <div className="pt-3">
                          <p className="text-[12px] text-[#374151]">
                            {o.assignee ? `Printed by: ${o.assignee}` : "Awaiting check"}
                            {(o.qcFails ?? 0) > 0 && (
                              <span className="pl-2 font-bold text-[#dc2626]">
                                {o.qcFails} fail{o.qcFails! > 1 ? "s" : ""}
                              </span>
                            )}
                          </p>
                          <div className="flex gap-2 pt-2.5">
                            <button
                              onClick={() => void setStatus(o, "ready_to_pack")}
                              disabled={busy}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#22c55e] py-2 text-[12px] font-bold text-white hover:opacity-90 disabled:opacity-40"
                            >
                              <FiCheckCircle className="h-3.5 w-3.5" /> QC Pass
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Fail QC and send back to printing? The fail is recorded on the order."))
                                  void setStatus(o, "in_production", { qcFail: true });
                              }}
                              disabled={busy}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#fca5a5] bg-white py-2 text-[12px] font-bold text-[#dc2626] hover:bg-[#fef2f2] disabled:opacity-40"
                            >
                              <FiXCircle className="h-3.5 w-3.5" /> QC Fail
                            </button>
                          </div>
                        </div>
                      )}

                      {lane.key === "pack" && (
                        <button
                          onClick={() => packAndLabel(o)}
                          disabled={busy}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-black py-2 text-[12px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                        >
                          <FiPackage className="h-3.5 w-3.5" />
                          {busy ? "Updating…" : "Pack & Generate Label"}
                        </button>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e7eb] pt-4 text-[13px] text-[#374151]">
        <span className="flex flex-wrap items-center gap-6">
          <span>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#22c55e]" />
            Today: <b>{dispatchedToday} dispatched</b>
          </span>
          {avgHours !== null && (
            <span>
              Avg production time:{" "}
              <b>
                {avgHours >= 48
                  ? `${(avgHours / 24).toFixed(1)} days`
                  : `${avgHours.toFixed(1)} hrs`}
              </b>
            </span>
          )}
          {qcRate !== null && (
            <span>
              QC pass rate: <b className="text-[#16a34a]">{qcRate}%</b>
            </span>
          )}
          <span>
            In production value:{" "}
            <b>{inr(allProduction.reduce((s, o) => s + o.totalAmount, 0))}</b>
          </span>
        </span>
        <Link to="/orders" className="font-bold text-black hover:underline">
          View completed orders →
        </Link>
      </div>
    </Shell>
  );
}
