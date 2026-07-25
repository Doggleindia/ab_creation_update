import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiDownload,
  FiInfo,
  FiPercent,
  FiRotateCw,
  FiTrendingUp,
  FiZap,
  FiClock,
} from "react-icons/fi";
import { BsBank } from "react-icons/bs";
import Shell, { Card } from "../components/Shell";
import { api, inr, shortOrderId, type AdminOrder, type WalletTxn } from "../lib/api";

const CHART_RANGES = [
  { key: 7, label: "7D" },
  { key: 30, label: "30D" },
  { key: 90, label: "90D" },
  { key: 365, label: "1Y" },
] as const;

const PAGE_SIZE = 10;

type BankAccount = { bankName?: string; accountHolder?: string; last4?: string };
type PayoutGroup = {
  sellerId: string;
  name: string;
  email: string;
  sales: number;
  revenue: number;
  payout: number;
};
type PayoutSummary = {
  pending: PayoutGroup[];
  upcoming: PayoutGroup[];
  products: { productId: string; sellerId: string; name: string; marginPerUnit: number }[];
};

type UserPayoutRequest = {
  _id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  bank?: { accountLast4?: string; ifsc?: string; accountHolder?: string };
  userId?: { name?: string; email?: string; accountType?: string } | null;
};
type Flash = { kind: "ok" | "err"; text: string } | null;

// Platform-ledger view; rows that don't touch the platform wallet are dropped.
type LedgerRow = {
  txn: WalletTxn;
  kind: "sale" | "refund" | "payout" | "withdrawal";
  signed: number;
  description: string;
  ref: string;
};

function toLedger(t: WalletTxn, bank: BankAccount | null): LedgerRow | null {
  const rid = t.requestId ?? "";
  if (t.type === "payment" && rid.startsWith("APAY-")) {
    const ref = rid.replace("APAY-", "");
    return {
      txn: t,
      kind: "sale",
      signed: t.amount,
      ref: `#${ref.slice(-8)}`,
      description: ref.startsWith("CART-")
        ? "Cart checkout received"
        : "Order payment received",
    };
  }
  if (t.type === "refund" && rid.startsWith("refund-admin-")) {
    return {
      txn: t,
      kind: "refund",
      signed: -t.amount,
      ref: `#${rid.replace("refund-admin-", "").slice(-8)}`,
      description: "Refund issued to customer",
    };
  }
  if (t.type === "refund" && rid.startsWith("payout-admin-")) {
    return {
      txn: t,
      kind: "payout",
      signed: -t.amount,
      ref: `#${rid.replace("payout-admin-", "").slice(-8)}`,
      description: "Seller margin settlement",
    };
  }
  // User payout withdrawals carry a userId and debit the USER's wallet,
  // not the platform wallet — they don't belong in this ledger.
  if (t.type === "withdrawal" && !t.userId) {
    return {
      txn: t,
      kind: "withdrawal",
      signed: -t.amount,
      ref: `#${rid.slice(-8)}`,
      description: bank?.last4
        ? `Withdrawal to ${bank.bankName} ****${bank.last4}`
        : "Withdrawal to bank account",
    };
  }
  return null;
}

const TYPE_CHIP: Record<LedgerRow["kind"], { label: string; cls: string }> = {
  sale: { label: "Sale", cls: "bg-[#dcfce7] text-[#16a34a]" },
  refund: { label: "Refund", cls: "bg-[#fee2e2] text-[#dc2626]" },
  payout: { label: "Payout", cls: "bg-[#dbeafe] text-[#2563eb]" },
  withdrawal: { label: "Withdrawal", cls: "bg-[#f3f4f6] text-[#6b7280]" },
};

const dt = (d?: string) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

export default function Financials() {
  const [balance, setBalance] = useState<number | null>(null);
  const [txns, setTxns] = useState<WalletTxn[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [bank, setBank] = useState<BankAccount | null>(null);
  const [minWithdrawal, setMinWithdrawal] = useState(500);
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [month, setMonth] = useState(monthKey(new Date()));
  const [chartRange, setChartRange] = useState<number>(30);
  const [payoutTab, setPayoutTab] = useState<"pending" | "processed" | "all">("pending");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [busySeller, setBusySeller] = useState<string | null>(null);
  const [flash, setFlash] = useState<Flash>(null);
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: "", accountHolder: "", accountNumber: "" });
  const [userRequests, setUserRequests] = useState<UserPayoutRequest[]>([]);
  const [busyRequestId, setBusyRequestId] = useState<string | null>(null);

  const load = useCallback(() => {
    api<{ data: { balance: number } }>("/api/admin/wallet/balance")
      .then((j) => setBalance(j.data?.balance ?? null))
      .catch(() => {});
    api<{ data: { transactions?: WalletTxn[] } }>("/api/admin/wallet/transactions?limit=1000")
      .then((j) => setTxns(j.data?.transactions ?? []))
      .catch(() => {});
    api<{ data: AdminOrder[] }>("/api/orders/admin/all")
      .then((j) => setOrders(j.data ?? []))
      .catch(() => {});
    api<{ data: PayoutSummary }>("/api/orders/admin/payouts/summary")
      .then((j) => setSummary(j.data))
      .catch(() => {});
    api<{ data: { requests: UserPayoutRequest[] } }>(
      "/api/admin/wallet/payout-requests",
    )
      .then((j) => setUserRequests(j.data?.requests ?? []))
      .catch(() => {});
    api<{ data: { bankAccount: BankAccount | null; minWithdrawal?: number } }>(
      "/api/admin/wallet/bank",
    )
      .then((j) => {
        setBank(j.data?.bankAccount ?? null);
        if (j.data?.minWithdrawal) setMinWithdrawal(j.data.minWithdrawal);
      })
      .catch(() => {});
  }, []);
  useEffect(load, [load]);

  const marginByProduct = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of summary?.products ?? []) m.set(p.productId, p.marginPerUnit);
    return m;
  }, [summary]);

  // ---- Month cards ----
  const monthOptions = useMemo(() => {
    const keys = new Set<string>([monthKey(new Date())]);
    for (const o of orders) if (o.createdAt) keys.add(monthKey(new Date(o.createdAt)));
    return [...keys]
      .sort((a, b) => {
        const [ay, am] = a.split("-").map(Number);
        const [by, bm] = b.split("-").map(Number);
        return by * 12 + bm - (ay * 12 + am);
      })
      .slice(0, 8);
  }, [orders]);

  const inMonth = (d: string | undefined, key: string) =>
    !!d && monthKey(new Date(d)) === key;
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const monthPaid = paidOrders.filter((o) => inMonth(o.createdAt, month));
  const prevKey = (() => {
    const [y, m] = month.split("-").map(Number);
    return monthKey(new Date(y, m - 1, 1));
  })();
  const revOf = (key: string) =>
    paidOrders.filter((o) => inMonth(o.createdAt, key)).reduce((s, o) => s + o.totalAmount, 0);
  const revenue = revOf(month);
  const prevRevenue = revOf(prevKey);
  const pct = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : null;

  const sellerOrdersInMonth = monthPaid.filter(
    (o) => o.productId?._id && marginByProduct.has(String(o.productId._id)),
  );
  const commission = sellerOrdersInMonth.reduce((s, o) => {
    const margin = (marginByProduct.get(String(o.productId!._id)) ?? 0) * o.quantity;
    return s + Math.max(0, o.totalAmount - margin);
  }, 0);
  const customRevenue = monthPaid
    .filter((o) => o.customDesign)
    .reduce((s, o) => s + o.totalAmount, 0);

  const pendingPayoutTotal = (summary?.pending ?? []).reduce((s, g) => s + g.payout, 0);
  const upcomingPayoutTotal = (summary?.upcoming ?? []).reduce((s, g) => s + g.payout, 0);
  const awaitingSellers = new Set([
    ...(summary?.pending ?? []).map((g) => g.sellerId),
    ...(summary?.upcoming ?? []).map((g) => g.sellerId),
  ]).size;

  // ---- Ledger + chart ----
  const ledger = useMemo(() => {
    const rows = txns
      .map((t) => toLedger(t, bank))
      .filter((r): r is LedgerRow => r !== null);
    let bal = balance ?? 0;
    return rows.map((r) => {
      const withBal = { ...r, balanceAfter: bal };
      bal -= r.signed;
      return withBal;
    });
  }, [txns, bank, balance]);

  const chart = useMemo(() => {
    const buckets = chartRange === 365 ? 12 : chartRange === 90 ? 12 : chartRange;
    const daysPer = chartRange / buckets;
    const now = Date.now();
    const rev: number[] = Array.from({ length: buckets }, () => 0);
    const pay: number[] = Array.from({ length: buckets }, () => 0);
    const idxOf = (d?: string) => {
      if (!d) return -1;
      const diff = (now - new Date(d).getTime()) / 86400000;
      if (diff < 0 || diff >= chartRange) return -1;
      return buckets - 1 - Math.floor(diff / daysPer);
    };
    for (const o of paidOrders) {
      const i = idxOf(o.createdAt);
      if (i >= 0) rev[i] += o.totalAmount;
    }
    for (const r of ledger) {
      if (r.kind !== "payout") continue;
      const i = idxOf(r.txn.createdAt);
      if (i >= 0) pay[i] += -r.signed;
    }
    const max = Math.max(...rev, ...pay, 1);
    return { rev, pay, max, buckets };
  }, [paidOrders, ledger, chartRange]);

  // ---- Refunds & returns ----
  const refundRows = ledger.filter((r) => r.kind === "refund");
  const cancelledOrders = orders.filter(
    (o) => o.orderStatus === "cancelled" && o.paymentStatus !== "refunded",
  );
  const refundedOrders = orders.filter((o) => o.paymentStatus === "refunded");
  const recentReturns = [...refundedOrders.map((o) => ({ o, kind: "refund" as const })), ...cancelledOrders.map((o) => ({ o, kind: "cancel" as const }))]
    .sort((a, b) => (b.o.updatedAt ?? "").localeCompare(a.o.updatedAt ?? ""))
    .slice(0, 4);

  // ---- Payout table rows ----
  const processedGroups = useMemo(() => {
    const m = new Map<string, PayoutGroup>();
    for (const t of txns) {
      if (t.type !== "payout") continue;
      const u = typeof t.userId === "object" ? t.userId : null;
      const id = u ? String((u as { _id?: string })._id ?? "") : String(t.userId ?? "");
      const g = m.get(id) ?? {
        sellerId: id,
        name: u?.name ?? "Seller",
        email: u?.email ?? "",
        sales: 0,
        revenue: 0,
        payout: 0,
      };
      g.sales += 1;
      g.payout += t.amount;
      m.set(id, g);
    }
    return [...m.values()];
  }, [txns]);

  const payoutRows =
    payoutTab === "pending"
      ? (summary?.pending ?? [])
      : payoutTab === "processed"
        ? processedGroups
        : [...(summary?.pending ?? []), ...processedGroups];

  // ---- Actions ----
  async function processPayouts(sellerId?: string) {
    if (
      !window.confirm(
        sellerId
          ? "Settle this seller's pending payouts now?"
          : `Process all pending payouts (${inr(pendingPayoutTotal)})?`,
      )
    )
      return;
    if (sellerId) setBusySeller(sellerId);
    else setBusy(true);
    setFlash(null);
    try {
      const j = await api<{ message: string }>("/api/orders/admin/payouts/process", {
        method: "POST",
        body: JSON.stringify(sellerId ? { sellerId } : {}),
      });
      setFlash({ kind: "ok", text: j.message });
      load();
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Payout run failed" });
    } finally {
      setBusy(false);
      setBusySeller(null);
    }
  }

  async function resolveRequest(r: UserPayoutRequest, action: "approve" | "reject") {
    const note =
      action === "reject"
        ? window.prompt("Reason for rejecting (shown to the user)?", "") ?? undefined
        : undefined;
    if (action === "reject" && note === undefined) return;
    if (
      action === "approve" &&
      !window.confirm(
        `Approve ₹${r.amount.toLocaleString("en-IN")} payout to ${r.userId?.name ?? "user"} (****${r.bank?.accountLast4 ?? "????"})? Their wallet is debited now; make the bank transfer manually.`,
      )
    )
      return;
    setBusyRequestId(r._id);
    setFlash(null);
    try {
      const j = await api<{ message: string }>(
        `/api/admin/wallet/payout-requests/${r._id}`,
        { method: "PATCH", body: JSON.stringify({ action, note }) },
      );
      setFlash({ kind: "ok", text: j.message });
      load();
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Could not update request" });
    } finally {
      setBusyRequestId(null);
    }
  }

  function exportReport() {
    const rows = ledger.filter((r) => inMonth(r.txn.createdAt, month));
    const header = ["Date", "Type", "Description", "Ref", "Amount", "Balance"];
    const lines = rows.map((r) =>
      [dt(r.txn.createdAt), r.kind, r.description, r.ref, r.signed, r.balanceAfter]
        .map((v) => String(v).replace(/,/g, " "))
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join(String.fromCharCode(10))], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `financial-report-${monthLabel(month).replace(" ", "-")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function saveBank(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFlash(null);
    try {
      const j = await api<{ message: string; data: { bankAccount: BankAccount } }>(
        "/api/admin/wallet/bank",
        { method: "PATCH", body: JSON.stringify(bankForm) },
      );
      setBank(j.data.bankAccount);
      setEditingBank(false);
      setFlash({ kind: "ok", text: j.message });
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Could not save bank" });
    } finally {
      setBusy(false);
    }
  }

  async function withdraw() {
    if (!bank?.last4) {
      setFlash({ kind: "err", text: "Add a bank account before requesting a withdrawal." });
      setEditingBank(true);
      return;
    }
    const raw = window.prompt(
      `Amount to withdraw (₹${minWithdrawal} minimum, ${inr(balance ?? 0)} available):`,
      String(balance ?? ""),
    );
    if (raw === null) return;
    setBusy(true);
    setFlash(null);
    try {
      const j = await api<{ message: string }>("/api/admin/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount: Number(raw.replace(/[^\d]/g, "")) }),
      });
      setFlash({ kind: "ok", text: j.message });
      load();
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Withdrawal failed" });
    } finally {
      setBusy(false);
    }
  }

  const pages = Math.max(1, Math.ceil(ledger.length / PAGE_SIZE));
  const pageRows = ledger.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statCards = [
    {
      icon: FiTrendingUp,
      label: "Total Revenue",
      value: inr(revenue),
      sub: prevRevenue > 0 ? `vs ${inr(prevRevenue)} last month` : "Paid orders this month",
      chip: pct !== null ? `${pct >= 0 ? "+" : ""}${pct}%` : null,
      chipCls: pct !== null && pct >= 0 ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fee2e2] text-[#ba1a1a]",
    },
    {
      icon: FiPercent,
      label: "Platform Share",
      value: inr(commission),
      sub: "From seller sales (base cost retained)",
      chip: null,
      chipCls: "",
    },
    {
      icon: FiZap,
      label: "Custom Order Revenue",
      value: inr(customRevenue),
      sub: "Direct custom orders",
      chip: null,
      chipCls: "",
    },
    {
      icon: FiClock,
      label: "Pending Payouts",
      value: inr(pendingPayoutTotal + upcomingPayoutTotal),
      sub: `${awaitingSellers} seller${awaitingSellers === 1 ? "" : "s"} awaiting settlement`,
      chip: null,
      chipCls: "",
    },
  ];

  const inputCls =
    "h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";

  return (
    <Shell
      title="Financials"
      subtitle="Revenue, commissions, payouts and the platform ledger."
      actions={
        <>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[13px] font-semibold text-[#374151] focus:border-black focus:outline-none"
          >
            {monthOptions.map((k) => (
              <option key={k} value={k}>
                {k === monthKey(new Date()) ? `This Month: ${monthLabel(k)}` : monthLabel(k)}
              </option>
            ))}
          </select>
          <button
            onClick={exportReport}
            className="flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-[13px] font-bold text-black hover:border-black"
          >
            <FiDownload className="h-3.5 w-3.5" /> Export Report
          </button>
        </>
      }
    >
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ icon: Icon, label, value, sub, chip, chipCls }) => (
          <Card key={label} className="p-6">
            <div className="flex items-start justify-between">
              <p className="text-[13px] font-semibold text-[#6b7280]">{label}</p>
              {chip ? (
                <span className={`rounded-md px-1.5 py-0.5 text-[11.5px] font-bold ${chipCls}`}>
                  {chip}
                </span>
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#374151]">
                  <Icon className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <p className="pt-2 text-[28px] font-bold leading-none text-black">{value}</p>
            <p className="pt-2.5 text-[12.5px] text-[#6b7280]">{sub}</p>
          </Card>
        ))}
      </div>

      {flash && (
        <p
          className={`mt-4 w-fit rounded-lg px-3.5 py-2.5 text-[13px] font-medium ${
            flash.kind === "ok" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#ba1a1a]"
          }`}
        >
          {flash.text}
        </p>
      )}

      {/* Revenue overview */}
      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[16px] font-bold text-black">Revenue Overview</h2>
          <div className="flex overflow-hidden rounded-lg bg-[#f3f4f6] p-1">
            {CHART_RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setChartRange(r.key)}
                className={`rounded-md px-3.5 py-1.5 text-[12.5px] font-semibold ${
                  chartRange === r.key ? "bg-black text-white" : "text-[#6b7280]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <svg viewBox="0 0 100 48" preserveAspectRatio="none" className="mt-6 h-[220px] w-full">
          {[12, 24, 36].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#f3f4f6" strokeWidth="0.3" />
          ))}
          {chart.rev.map((v, i) => {
            const bw = 100 / chart.buckets;
            const x = i * bw + bw * 0.15;
            const w = bw * 0.7;
            const h = (v / chart.max) * 40;
            const y = 44 - h;
            const py = 44 - (chart.pay[i] / chart.max) * 40;
            return (
              <g key={i}>
                {v > 0 && (
                  <>
                    <rect x={x} y={y} width={w} height={h} fill="#f3f4f6" />
                    <rect x={x} y={y} width={w} height={0.9} fill="#171717" />
                  </>
                )}
                {chart.pay[i] > 0 && (
                  <line
                    x1={x}
                    x2={x + w}
                    y1={py}
                    y2={py}
                    stroke="#6b7280"
                    strokeWidth="0.5"
                    strokeDasharray="1.2 0.8"
                  />
                )}
              </g>
            );
          })}
        </svg>
        <div className="flex items-center gap-6 pt-3 text-[12.5px] text-[#6b7280]">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-black" /> Total Revenue
          </span>
          <span className="flex items-center gap-2">
            <span className="h-0 w-4 border-t-2 border-dashed border-[#6b7280]" /> Seller Payouts
          </span>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        {/* Seller payouts */}
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
            <h2 className="text-[16px] font-bold text-black">Seller Payouts</h2>
            <div className="flex items-center gap-5 text-[13.5px] font-semibold">
              {(
                [
                  ["pending", `Pending (${(summary?.pending ?? []).length})`],
                  ["processed", `Processed (${processedGroups.length})`],
                  ["all", "All"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setPayoutTab(k)}
                  className={`border-b-2 pb-1 ${
                    payoutTab === k
                      ? "border-black text-black"
                      : "border-transparent text-[#6b7280] hover:text-black"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="bg-[#f8f9fb] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
                  <th className="px-6 py-3">Seller</th>
                  <th className="px-3 py-3">Sales</th>
                  <th className="px-3 py-3">Revenue</th>
                  <th className="px-3 py-3">Platform Share</th>
                  <th className="px-3 py-3">Payout</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {payoutRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-[13px] text-[#9ca3af]">
                      {payoutTab === "pending"
                        ? "No payouts awaiting settlement."
                        : "Nothing here yet."}
                    </td>
                  </tr>
                )}
                {payoutRows.map((g, i) => {
                  const isPending = (summary?.pending ?? []).some(
                    (p) => p.sellerId === g.sellerId && p === g,
                  );
                  return (
                    <tr key={`${g.sellerId}-${i}`} className="border-t border-[#f3f4f6] text-[13.5px]">
                      <td className="px-6 py-3.5">
                        <span className="block font-bold text-black">{g.name}</span>
                        <span className="block text-[11.5px] text-[#9ca3af]">{g.email}</span>
                      </td>
                      <td className="px-3 py-3.5 text-[#374151]">{g.sales}</td>
                      <td className="px-3 py-3.5 text-[#374151]">
                        {g.revenue ? inr(g.revenue) : "—"}
                      </td>
                      <td className="px-3 py-3.5 text-[#374151]">
                        {g.revenue ? inr(Math.max(0, g.revenue - g.payout)) : "—"}
                      </td>
                      <td className="px-3 py-3.5 font-bold text-black">{inr(g.payout)}</td>
                      <td className="px-6 py-3.5 text-right">
                        {isPending ? (
                          <button
                            onClick={() => void processPayouts(g.sellerId)}
                            disabled={busySeller === g.sellerId || busy}
                            className="rounded-md bg-black px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-white hover:opacity-85 disabled:opacity-40"
                          >
                            {busySeller === g.sellerId ? "…" : "Process"}
                          </button>
                        ) : (
                          <span className="text-[11.5px] font-bold uppercase tracking-[0.5px] text-[#16a34a]">
                            Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[#f3f4f6] p-5">
            <button
              onClick={() => void processPayouts()}
              disabled={busy || pendingPayoutTotal === 0}
              className="w-full rounded-xl bg-black py-3.5 text-[14.5px] font-bold text-white hover:opacity-85 disabled:opacity-40"
            >
              {busy
                ? "Processing…"
                : `Process All Pending (${inr(pendingPayoutTotal)})`}
            </button>
            {upcomingPayoutTotal > 0 && (
              <p className="pt-2.5 text-center text-[12px] text-[#9ca3af]">
                Plus {inr(upcomingPayoutTotal)} settles automatically as orders in
                production are delivered.
              </p>
            )}
          </div>
        </Card>

        {/* Refunds & returns + user payout requests */}
        <div className="flex h-fit flex-col gap-6">
        <Card className="p-6">
          <h2 className="text-[16px] font-bold text-black">
            Wallet Payout Requests
            {userRequests.filter((r) => r.status === "pending").length > 0 && (
              <span className="ml-2 rounded-full bg-[#fdf3dd] px-2.5 py-0.5 text-[11.5px] font-bold text-[#b45309]">
                {userRequests.filter((r) => r.status === "pending").length} pending
              </span>
            )}
          </h2>
          <div className="flex flex-col gap-3 pt-4">
            {userRequests.length === 0 && (
              <p className="rounded-lg border border-[#f3f4f6] p-5 text-center text-[12.5px] text-[#9ca3af]">
                No withdrawal requests from users yet.
              </p>
            )}
            {userRequests.slice(0, 6).map((r) => (
              <div key={r._id} className="rounded-xl border border-[#f3f4f6] p-4">
                <div className="flex items-center justify-between">
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-bold text-black">
                      {r.userId?.name ?? "User"}
                      {r.userId?.accountType === "seller" && (
                        <span className="pl-1.5 text-[10.5px] font-bold uppercase text-[#7c3aed]">
                          Seller
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-[11.5px] text-[#9ca3af]">
                      ****{r.bank?.accountLast4 ?? "????"}
                      {r.bank?.ifsc ? ` · ${r.bank.ifsc}` : ""} · {dt(r.createdAt)}
                    </span>
                  </span>
                  <span className="text-[15px] font-bold text-black">{inr(r.amount)}</span>
                </div>
                {r.status === "pending" ? (
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={() => void resolveRequest(r, "approve")}
                      disabled={busyRequestId === r._id}
                      className="flex-1 rounded-lg bg-[#22c55e] py-1.5 text-[12px] font-bold text-white hover:opacity-90 disabled:opacity-40"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => void resolveRequest(r, "reject")}
                      disabled={busyRequestId === r._id}
                      className="flex-1 rounded-lg border border-[#fca5a5] py-1.5 text-[12px] font-bold text-[#dc2626] hover:bg-[#fef2f2] disabled:opacity-40"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <p
                    className={`pt-2 text-[11.5px] font-bold uppercase tracking-[0.5px] ${
                      r.status === "approved" ? "text-[#16a34a]" : "text-[#ba1a1a]"
                    }`}
                  >
                    {r.status}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="h-fit p-6">
          <h2 className="text-[16px] font-bold text-black">Refunds &amp; Returns</h2>
          <div className="grid grid-cols-3 divide-x divide-[#f3f4f6] pt-5 text-center">
            {[
              ["Refunds", refundRows.length, "#dc2626"],
              ["Cancellations", cancelledOrders.length, "#374151"],
              ["Chargebacks", 0, "#374151"],
            ].map(([label, n, color]) => (
              <div key={String(label)}>
                <p className="text-[12.5px] text-[#6b7280]">{label}</p>
                <p className="pt-1 text-[22px] font-bold" style={{ color: String(color) }}>
                  {String(n)}
                </p>
              </div>
            ))}
          </div>
          <p className="pt-6 text-[10.5px] font-bold uppercase tracking-[1px] text-[#6b7280]">
            Recent Transactions
          </p>
          <div className="flex flex-col gap-3 pt-3">
            {recentReturns.length === 0 && (
              <p className="rounded-lg border border-[#f3f4f6] p-5 text-center text-[12.5px] text-[#9ca3af]">
                No refunds or cancellations yet.
              </p>
            )}
            {recentReturns.map(({ o, kind }) => (
              <div key={o._id} className="rounded-xl border border-[#f3f4f6] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-bold text-black">
                    Order #{shortOrderId(o)}
                  </span>
                  <span
                    className={`text-[14px] font-bold ${
                      kind === "refund" ? "text-[#dc2626]" : "text-black"
                    }`}
                  >
                    {inr(o.totalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[12.5px] text-[#6b7280]">
                    {o.userId?.name ?? "Customer"}
                    {o.internalNote ? ` · “${o.internalNote.slice(0, 32)}”` : ""}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10.5px] font-bold ${
                      kind === "refund"
                        ? "bg-[#fee2e2] text-[#dc2626]"
                        : "bg-[#f3f4f6] text-[#6b7280]"
                    }`}
                  >
                    {kind === "refund" ? "Refund Issued" : "Cancelled"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        </div>
      </div>

      {/* Transaction log */}
      <Card className="mt-6">
        <div className="px-6 py-5">
          <h2 className="text-[16px] font-bold text-black">Transaction Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="bg-[#f8f9fb] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
                <th className="px-6 py-3">Date</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Description</th>
                <th className="px-3 py-3">Order/Ref</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-6 py-3">Balance</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[13px] text-[#9ca3af]">
                    No transactions yet.
                  </td>
                </tr>
              )}
              {pageRows.map((r) => (
                <tr key={r.txn._id} className="border-t border-[#f3f4f6] text-[13.5px]">
                  <td className="px-6 py-4 text-[#374151]">{dt(r.txn.createdAt)}</td>
                  <td className="px-3 py-4">
                    <span
                      className={`rounded px-2 py-1 text-[10.5px] font-bold ${TYPE_CHIP[r.kind].cls}`}
                    >
                      {TYPE_CHIP[r.kind].label}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-[#374151]">{r.description}</td>
                  <td className="px-3 py-4 font-mono text-[12px] text-[#6b7280]">{r.ref}</td>
                  <td
                    className={`px-3 py-4 font-bold ${
                      r.signed >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"
                    }`}
                  >
                    {r.signed >= 0 ? "+ " : "− "}
                    {inr(Math.abs(r.signed))}
                  </td>
                  <td className="px-6 py-4 text-[#374151]">{inr(r.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f3f4f6] px-6 py-4">
          <p className="text-[12.5px] text-[#6b7280]">
            Showing {ledger.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
            {(page - 1) * PAGE_SIZE + pageRows.length} of {ledger.length} transactions
          </p>
          {pages > 1 && (
            <span className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#374151] hover:border-black disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-8 w-8 rounded-lg text-[12.5px] font-bold ${
                    page === n
                      ? "bg-black text-white"
                      : "border border-[#e5e7eb] text-[#374151] hover:border-black"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#374151] hover:border-black disabled:opacity-40"
              >
                ›
              </button>
            </span>
          )}
        </div>
      </Card>

      {/* Withdrawal settings (platform balance) */}
      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-bold text-black">Platform Balance &amp; Withdrawals</h2>
            <p className="pt-1 text-[13px] text-[#6b7280]">
              Available balance:{" "}
              <b className="text-black">{balance !== null ? inr(balance) : "—"}</b>
            </p>
          </div>
          <button
            onClick={() => void withdraw()}
            disabled={busy}
            className="rounded-lg bg-black px-6 py-2.5 text-[13.5px] font-bold text-white hover:opacity-85 disabled:opacity-40"
          >
            Request Withdrawal
          </button>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {editingBank ? (
            <form onSubmit={(e) => void saveBank(e)} className="flex max-w-[360px] flex-col gap-3">
              <input
                required
                placeholder="Bank name"
                value={bankForm.bankName}
                onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))}
                className={inputCls}
              />
              <input
                required
                placeholder="Account holder"
                value={bankForm.accountHolder}
                onChange={(e) => setBankForm((f) => ({ ...f, accountHolder: e.target.value }))}
                className={inputCls}
              />
              <input
                required
                minLength={6}
                placeholder="Account number (only last 4 stored)"
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm((f) => ({ ...f, accountNumber: e.target.value }))}
                className={inputCls}
              />
              <span className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-black px-5 py-2 text-[13px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBank(false)}
                  className="rounded-lg border border-[#e5e7eb] px-5 py-2 text-[13px] font-bold text-[#374151] hover:border-black"
                >
                  Cancel
                </button>
              </span>
            </form>
          ) : (
            <div className="flex max-w-[420px] items-center justify-between gap-4 rounded-xl border border-[#e5e7eb] p-4">
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f6] text-black">
                  <BsBank className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-bold text-black">
                    {bank?.last4 ? `${bank.bankName} ****${bank.last4}` : "No bank account yet"}
                  </span>
                  <span className="block truncate text-[12px] text-[#6b7280]">
                    {bank?.accountHolder ?? "Add one to enable withdrawals"}
                  </span>
                </span>
              </span>
              <button
                onClick={() => {
                  setEditingBank(true);
                  setBankForm({
                    bankName: bank?.bankName ?? "",
                    accountHolder: bank?.accountHolder ?? "",
                    accountNumber: "",
                  });
                }}
                className="shrink-0 text-[13px] font-bold text-black underline hover:text-[#b45309]"
              >
                {bank?.last4 ? "Change" : "Add"}
              </button>
            </div>
          )}
          <div className="text-[13px] text-[#374151]">
            <p className="flex items-center gap-2">
              <FiInfo className="h-3.5 w-3.5 shrink-0 text-[#6b7280]" />
              Minimum withdrawal: {inr(minWithdrawal)}
            </p>
            <p className="flex items-center gap-2 pt-2">
              <FiRotateCw className="h-3.5 w-3.5 shrink-0 text-[#6b7280]" />
              Seller margins settle automatically when orders are delivered.
            </p>
          </div>
        </div>
      </Card>
    </Shell>
  );
}
