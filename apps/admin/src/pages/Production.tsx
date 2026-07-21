import { useEffect, useState } from "react";
import Shell, { Card } from "../components/Shell";
import { api, inr, type AdminOrder } from "../lib/api";

const COLUMNS: {
  key: AdminOrder["orderStatus"];
  label: string;
  dot: string;
  next: AdminOrder["orderStatus"] | null;
  nextLabel: string | null;
}[] = [
  { key: "pending", label: "Queued", dot: "#9ca3af", next: "confirmed", nextLabel: "Confirm Order" },
  { key: "confirmed", label: "Confirmed", dot: "#0891b2", next: "in_production", nextLabel: "Start Production" },
  { key: "in_production", label: "In Production", dot: "#ea580c", next: "quality_check", nextLabel: "Send to QC" },
  { key: "quality_check", label: "Quality Check", dot: "#f59e0b", next: "shipped", nextLabel: "QC Pass — Dispatch" },
  { key: "shipped", label: "Dispatched", dot: "#3b82f6", next: "delivered", nextLabel: "Mark Delivered" },
  { key: "delivered", label: "Delivered", dot: "#22c55e", next: null, nextLabel: null },
];

export default function Production() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    api<{ data: AdminOrder[] }>("/api/orders/admin/all")
      .then((j) => setOrders(j.data ?? []))
      .catch(() => {});
  }
  useEffect(load, []);

  async function advance(o: AdminOrder, to: AdminOrder["orderStatus"]) {
    setBusyId(o._id);
    try {
      await api(`/api/orders/admin/${encodeURIComponent(o.orderId)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ orderStatus: to }),
      });
      load();
    } catch {
      // surfaced by reload state staying put
    } finally {
      setBusyId(null);
    }
  }

  const pendingCount = orders.filter((o) =>
    ["pending", "confirmed", "in_production", "quality_check"].includes(o.orderStatus),
  ).length;

  return (
    <Shell
      title="Production Queue"
      subtitle={`${pendingCount} jobs pending`}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-6">
        {COLUMNS.map((col) => {
          const items = orders
            .filter((o) => o.orderStatus === col.key)
            .slice(0, col.key === "delivered" ? 6 : 30);
          return (
            <div key={col.key}>
              <div className="flex items-center gap-2 pb-3">
                <span
                  className="h-2.5 w-2.5 rounded-[3px]"
                  style={{ background: col.dot }}
                />
                <span className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#374151]">
                  {col.label}
                </span>
                <span className="rounded-full bg-[#e5e7eb] px-2 py-0.5 text-[11px] font-bold text-[#374151]">
                  {orders.filter((o) => o.orderStatus === col.key).length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {items.length === 0 && (
                  <Card className="p-5 text-center text-[12px] text-[#c4c7c7]">
                    Empty
                  </Card>
                )}
                {items.map((o) => (
                  <Card key={o._id} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[13.5px] font-bold text-black">
                        #{o.orderId.slice(-8)}
                      </span>
                      {o.customDesign && (
                        <span className="rounded bg-[#eef2ff] px-2 py-0.5 text-[10px] font-bold text-[#4f46e5]">
                          CUSTOM
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 pt-3">
                      <span className="h-11 w-11 shrink-0 overflow-hidden rounded border border-[#e5e7eb] bg-[#f3f4f6]">
                        {o.variantId?.media?.images?.[0] && (
                          <img
                            src={o.variantId.media.images[0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </span>
                      <span className="min-w-0 text-[12.5px]">
                        <span className="block truncate font-semibold text-black">
                          {o.productId?.title ?? "Custom order"}
                        </span>
                        <span className="block text-[#6b7280]">
                          Qty {o.quantity}
                          {o.size ? ` · ${o.size}` : ""} · {inr(o.totalAmount)}
                        </span>
                        <span className="block text-[#9ca3af]">
                          {o.userId?.name ?? ""}
                        </span>
                      </span>
                    </div>
                    {col.next && (
                      <button
                        onClick={() => void advance(o, col.next!)}
                        disabled={busyId === o._id}
                        className="mt-3 w-full rounded-lg bg-black py-2 text-[12px] font-bold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
                      >
                        {busyId === o._id ? "Updating…" : col.nextLabel}
                      </button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
