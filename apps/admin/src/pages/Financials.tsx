import { useCallback, useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiInfo, FiRotateCw } from "react-icons/fi";
import { BsBank } from "react-icons/bs";
import Shell, { Card } from "../components/Shell";
import { api, inr, type AdminOrder, type WalletTxn } from "../lib/api";

const TABS = [
  { key: "all", label: "All" },
  { key: "credit", label: "Credits" },
  { key: "refund", label: "Refunds" },
  { key: "withdrawal", label: "Withdrawals" },
] as const;

const PAGE_SIZE = 8;

type BankAccount = { bankName?: string; accountHolder?: string; last4?: string };

// Platform-ledger view of a raw wallet transaction. Sign is from the
// platform's perspective; rows that don't touch the platform wallet
// (user recharges, user-side debits/credits) are excluded.
type LedgerRow = {
  txn: WalletTxn;
  kind: "credit" | "refund" | "withdrawal";
  signed: number;
  description: string;
};

function toLedger(t: WalletTxn, bank: BankAccount | null): LedgerRow | null {
  const rid = t.requestId ?? "";
  if (t.type === "payment" && rid.startsWith("APAY-")) {
    const ref = rid.replace("APAY-", "");
    return {
      txn: t,
      kind: "credit",
      signed: t.amount,
      description: ref.startsWith("CART-")
        ? `Cart checkout #${ref.slice(-8)} received`
        : `Order #${ref.slice(-8)} payment received`,
    };
  }
  if (t.type === "refund" && rid.startsWith("refund-admin-")) {
    return {
      txn: t,
      kind: "refund",
      signed: -t.amount,
      description: `Refund issued — Order #${rid.replace("refund-admin-", "").slice(-8)}`,
    };
  }
  if (t.type === "withdrawal") {
    return {
      txn: t,
      kind: "withdrawal",
      signed: -t.amount,
      description: bank?.last4
        ? `Withdrawal to ${bank.bankName} ****${bank.last4}`
        : "Withdrawal to bank account",
    };
  }
  return null;
}

function shortDay(d?: string) {
  return d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "—";
}

export default function Financials() {
  const [balance, setBalance] = useState<number | null>(null);
  const [txns, setTxns] = useState<WalletTxn[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [bank, setBank] = useState<BankAccount | null>(null);
  const [minWithdrawal, setMinWithdrawal] = useState(500);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [page, setPage] = useState(1);
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: "", accountHolder: "", accountNumber: "" });
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(() => {
    api<{ data: { balance: number } }>("/api/admin/wallet/balance")
      .then((j) => setBalance(j.data?.balance ?? null))
      .catch(() => {});
    api<{ data: { transactions?: WalletTxn[] } }>(
      "/api/admin/wallet/transactions?limit=1000",
    )
      .then((j) => setTxns(j.data?.transactions ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
    api<{ data: { bankAccount: BankAccount | null; minWithdrawal?: number } }>(
      "/api/admin/wallet/bank",
    )
      .then((j) => {
        setBank(j.data?.bankAccount ?? null);
        if (j.data?.minWithdrawal) setMinWithdrawal(j.data.minWithdrawal);
      })
      .catch(() => {});
    api<{ data: AdminOrder[] }>("/api/orders/admin/all")
      .then((j) => setOrders(j.data ?? []))
      .catch(() => {});
  }, []);
  useEffect(load, [load]);
  useEffect(() => setPage(1), [tab]);

  // Platform ledger, newest first, with running balance walked back from now.
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

  const totalEarnings = ledger
    .filter((r) => r.kind === "credit")
    .reduce((s, r) => s + r.signed, 0);

  const inProduction = orders.filter(
    (o) =>
      o.paymentStatus === "paid" &&
      ["pending", "confirmed", "quality_check"].includes(o.orderStatus),
  );
  const pendingSettlement = inProduction.reduce((s, o) => s + o.totalAmount, 0);

  const rows = ledger.filter((r) => tab === "all" || r.kind === tab);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Monthly earnings, last 6 calendar months
  const chart = useMemo(() => {
    const now = new Date();
    const months: { label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString("en-IN", { month: "short" }),
        total: 0,
      });
    }
    for (const r of ledger) {
      if (r.kind !== "credit" || !r.txn.createdAt) continue;
      const d = new Date(r.txn.createdAt);
      const idx =
        5 - ((now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth());
      if (idx >= 0 && idx < 6) months[idx].total += r.signed;
    }
    const max = Math.max(...months.map((m) => m.total), 1);
    const pts = months.map(
      (m, i) => [(i / 5) * 100, 44 - (m.total / max) * 38] as [number, number],
    );
    const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    return { months, max, line, area: `${line} L 100,46 L 0,46 Z` };
  }, [ledger]);

  const gridLabel = (frac: number) => {
    const v = chart.max * frac;
    return v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${Math.round(v)}`;
  };

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
      setBankForm({ bankName: "", accountHolder: "", accountNumber: "" });
      setFlash({ kind: "ok", text: j.message });
    } catch (err) {
      setFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not save bank account",
      });
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
    const amount = Number(raw.replace(/[^\d]/g, ""));
    setBusy(true);
    setFlash(null);
    try {
      const j = await api<{ message: string }>("/api/admin/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
      setFlash({ kind: "ok", text: j.message });
      load();
    } catch (err) {
      setFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Withdrawal failed",
      });
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";

  return (
    <Shell
      title="Earnings & Payouts"
      subtitle="Platform revenue, ledger and withdrawals."
    >
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
            Available Balance
          </p>
          <p className="pt-2 text-[32px] font-bold leading-none text-black">
            {balance !== null ? inr(balance) : "—"}
          </p>
          <button
            onClick={() => void withdraw()}
            disabled={busy}
            className="mt-4 w-full rounded-lg border border-[#c4c7c7] py-2.5 text-[14px] font-bold text-black hover:border-black disabled:opacity-40"
          >
            Withdraw
          </button>
        </Card>
        <Card className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
            Total Earnings
          </p>
          <p className="pt-2 text-[32px] font-bold leading-none text-black">
            {inr(totalEarnings)}
          </p>
          <p className="pt-3 text-[13px] text-[#6b7280]">All time</p>
        </Card>
        <Card className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
            Pending Settlement
          </p>
          <p className="pt-2 text-[32px] font-bold leading-none text-black">
            {inr(pendingSettlement)}
          </p>
          <p className="pt-3 text-[13px] text-[#6b7280]">
            From {inProduction.length} order{inProduction.length === 1 ? "" : "s"} in
            production
          </p>
        </Card>
      </div>

      {flash && (
        <p
          className={`mt-4 w-fit rounded-lg px-3.5 py-2.5 text-[13px] font-medium ${
            flash.kind === "ok"
              ? "bg-[#dcfce7] text-[#166534]"
              : "bg-[#fee2e2] text-[#ba1a1a]"
          }`}
        >
          {flash.text}
        </p>
      )}

      {/* Earnings overview */}
      <Card className="mt-6 p-6">
        <h2 className="text-[16px] font-bold text-black">Earnings Overview</h2>
        <div className="flex gap-3 pt-6">
          <div className="flex h-[190px] flex-col justify-between pb-4 text-right text-[11.5px] text-[#6b7280]">
            {[1, 0.75, 0.5, 0.25].map((f) => (
              <span key={f}>{gridLabel(f)}</span>
            ))}
            <span>0</span>
          </div>
          <div className="min-w-0 flex-1">
            <svg viewBox="0 0 100 46" preserveAspectRatio="none" className="h-[190px] w-full">
              <defs>
                <linearGradient id="earn-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e5e7eb" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[6, 15.5, 25, 34.5].map((y) => (
                <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#f3f4f6" strokeWidth="0.3" />
              ))}
              <path d={chart.area} fill="url(#earn-fill)" />
              <path
                d={chart.line}
                fill="none"
                stroke="#171717"
                strokeWidth="0.8"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="flex justify-between pt-2 text-[12px] text-[#6b7280]">
              {chart.months.map((m, i) => (
                <span key={`${m.label}${i}`}>{m.label}</span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Transaction history */}
      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <h2 className="text-[16px] font-bold text-black">Transaction History</h2>
          <div className="flex overflow-hidden rounded-lg bg-[#f3f4f6] p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-md px-4 py-1.5 text-[13px] font-semibold ${
                  tab === t.key ? "bg-white text-black shadow-sm" : "text-[#6b7280]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="bg-[#f8f9fb] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
                <th className="px-6 py-3">Date</th>
                <th className="px-3 py-3">Description</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-6 py-3">Balance</th>
              </tr>
            </thead>
            <tbody>
              {loaded && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[13px] text-[#9ca3af]">
                    No {tab === "all" ? "" : `${tab} `}transactions yet.
                  </td>
                </tr>
              )}
              {pageRows.map((r) => (
                <tr key={r.txn._id} className="border-t border-[#f3f4f6] text-[13.5px]">
                  <td className="px-6 py-4 text-[#374151]">{shortDay(r.txn.createdAt)}</td>
                  <td className="px-3 py-4 text-[#374151]">{r.description}</td>
                  <td className="px-3 py-4">
                    <span
                      className={`rounded px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.5px] ${
                        r.signed >= 0
                          ? "bg-[#f3f4f6] text-[#374151]"
                          : "bg-[#f3f4f6] text-[#6b7280]"
                      }`}
                    >
                      {r.signed >= 0 ? "Credit" : "Debit"}
                    </span>
                  </td>
                  <td
                    className={`px-3 py-4 font-bold ${
                      r.signed >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"
                    }`}
                  >
                    {r.signed >= 0 ? "+" : "−"}
                    {inr(Math.abs(r.signed))}
                  </td>
                  <td className="px-6 py-4 text-[#374151]">{inr(r.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#f3f4f6] px-6 py-4">
          <p className="text-[12.5px] text-[#6b7280]">
            Showing {pageRows.length} of {rows.length} transactions
          </p>
          <span className="flex items-center gap-2">
            <button
              aria-label="Previous page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#374151] hover:border-black disabled:opacity-40"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Next page"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#374151] hover:border-black disabled:opacity-40"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </span>
        </div>
      </Card>

      {/* Withdrawal settings */}
      <Card className="mt-6 p-6">
        <h2 className="text-[16px] font-bold text-black">Withdrawal Settings</h2>
        <div className="grid grid-cols-1 gap-6 pt-5 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
              Bank Account on File
            </p>
            {editingBank ? (
              <form onSubmit={(e) => void saveBank(e)} className="flex max-w-[360px] flex-col gap-3 pt-3">
                <input
                  required
                  placeholder="Bank name (e.g. HDFC Bank)"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))}
                  className={inputCls}
                />
                <input
                  required
                  placeholder="Account holder name"
                  value={bankForm.accountHolder}
                  onChange={(e) => setBankForm((f) => ({ ...f, accountHolder: e.target.value }))}
                  className={inputCls}
                />
                <input
                  required
                  minLength={6}
                  placeholder="Account number (only last 4 digits are stored)"
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
                    {busy ? "Saving…" : "Save Account"}
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
              <div className="mt-3 flex max-w-[420px] items-center justify-between gap-4 rounded-xl border border-[#e5e7eb] p-4">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f6] text-black">
                    <BsBank className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14.5px] font-bold text-black">
                      {bank?.last4
                        ? `${bank.bankName} ****${bank.last4}`
                        : "No bank account yet"}
                    </span>
                    <span className="block truncate text-[12.5px] text-[#6b7280]">
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
                  className="shrink-0 text-[13.5px] font-bold text-black underline hover:text-[#b45309]"
                >
                  {bank?.last4 ? "Change" : "Add"}
                </button>
              </div>
            )}
            <p className="flex items-center gap-2 pt-4 text-[13px] text-[#374151]">
              <FiInfo className="h-3.5 w-3.5 shrink-0 text-[#6b7280]" />
              Minimum withdrawal: {inr(minWithdrawal)}
            </p>
            <p className="flex items-center gap-2 pt-2 text-[13px] text-[#374151]">
              <FiRotateCw className="h-3.5 w-3.5 shrink-0 text-[#6b7280]" />
              Settlement cycle: Every Monday for completed orders
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#c4c7c7] p-8 text-center">
            <p className="text-[15px] font-semibold text-black">
              Ready to payout your earnings?
            </p>
            <button
              onClick={() => void withdraw()}
              disabled={busy}
              className="mt-4 rounded-lg bg-black px-8 py-3 text-[14.5px] font-bold text-white hover:opacity-85 disabled:opacity-40"
            >
              {busy ? "Working…" : "Request Withdrawal"}
            </button>
            <p className="pt-3 text-[12.5px] text-[#6b7280]">
              Funds typically reach your account in 2-3 business days.
            </p>
          </div>
        </div>
      </Card>
    </Shell>
  );
}
