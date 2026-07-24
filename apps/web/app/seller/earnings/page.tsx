"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Clock, Landmark, TrendingUp, Wallet } from "lucide-react";
import SellerShell from "@/components/seller/SellerShell";
import { apiFetch } from "@/lib/auth";
import { inr } from "@/lib/seller";

type Txn = {
  _id: string;
  type: string;
  amount: number;
  status: string;
  requestId?: string;
  createdAt?: string;
};

type PayoutRequest = {
  _id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt?: string;
  resolvedAt?: string;
  bank?: { accountLast4?: string; ifsc?: string };
};

const REQ_CHIP: Record<string, string> = {
  pending: "bg-[#fef3c7] text-[#b45309]",
  approved: "bg-[#dcfce7] text-[#16a34a]",
  rejected: "bg-[#fee2e2] text-[#ba1a1a]",
};

const MIN_PAYOUT = 500;

const dt = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

export default function SellerEarningsPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [showAllCredits, setShowAllCredits] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    apiFetch<{ data: { balance: number } }>("/api/wallet/balance")
      .then((j) => setBalance(j.data?.balance ?? null))
      .catch(() => {});
    apiFetch<{ data: { transactions: Txn[] } }>("/api/wallet/transactions?limit=200")
      .then((j) => setTxns(j.data?.transactions ?? []))
      .catch(() => {});
    apiFetch<{ data: { requests: PayoutRequest[] } }>("/api/wallet/payout-requests")
      .then((j) => setRequests(j.data?.requests ?? []))
      .catch(() => {});
  }, []);
  useEffect(load, [load]);

  const payouts = txns.filter((t) => t.type === "payout");
  const lifetimeEarnings = payouts.reduce((s, t) => s + t.amount, 0);
  const withdrawn = txns.filter((t) => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0);
  const pendingReq = requests.find((r) => r.status === "pending") ?? null;
  const lastBank = requests.find((r) => r.bank?.accountLast4)?.bank;

  // Margin credits by month, last 6 months
  const chart = useMemo(() => {
    const now = new Date();
    const months: { label: string; total: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString("en-IN", { month: "short" }),
        total: 0,
        count: 0,
      });
    }
    for (const t of payouts) {
      if (!t.createdAt) continue;
      const d = new Date(t.createdAt);
      const idx =
        5 - ((now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth());
      if (idx >= 0 && idx < 6) {
        months[idx].total += t.amount;
        months[idx].count += 1;
      }
    }
    const max = Math.max(...months.map((m) => m.total), 1);
    const thisMo = months[5].total;
    const lastMo = months[4].total;
    const pct = lastMo > 0 ? Math.round(((thisMo - lastMo) / lastMo) * 100) : null;
    return { months, max, thisMo, pct };
  }, [payouts]);

  async function requestPayout(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFlash(null);
    try {
      const j = await apiFetch<{ message: string }>("/api/wallet/payout-request", {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount) }),
      });
      setFlash({ kind: "ok", text: j.message });
      setAmount("");
      load();
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Request failed" });
    } finally {
      setBusy(false);
    }
  }

  const quickAmounts = useMemo(() => {
    if (balance === null || balance < MIN_PAYOUT) return [];
    const opts = [
      { label: inr(MIN_PAYOUT), value: MIN_PAYOUT },
      { label: "50%", value: Math.floor(balance / 2) },
      { label: "Max", value: Math.floor(balance) },
    ];
    const seen = new Set<number>();
    return opts.filter((o) => o.value >= MIN_PAYOUT && !seen.has(o.value) && seen.add(o.value));
  }, [balance]);

  const visibleCredits = showAllCredits ? payouts : payouts.slice(0, 8);

  return (
    <SellerShell title="Earnings" subtitle="Wallet, margin credits and bank payouts.">
      {/* Hero + stats */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr_1fr]">
        <div className="rounded-xl bg-[#111214] p-6 text-white">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[1px] text-white/60">
              Available Balance
            </p>
            <Wallet className="h-4 w-4 text-[#e8c56b]" />
          </div>
          <p className="pt-3 text-[36px] font-bold leading-none">
            {balance !== null ? inr(balance) : "—"}
          </p>
          <p className="pt-2.5 text-[12.5px] leading-5 text-white/60">
            One wallet across AB Creation — margin credits, top-ups and purchases
            all move through it.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={() => {
                formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                formRef.current?.querySelector("input")?.focus();
              }}
              className="rounded-full bg-brand-orange px-6 py-2.5 text-[13.5px] font-bold text-white hover:opacity-90"
            >
              Withdraw to Bank
            </button>
            {pendingReq && (
              <span className="rounded-full bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-[#e8c56b]">
                {inr(pendingReq.amount)} payout under review
              </span>
            )}
          </div>
        </div>
        {[
          {
            icon: TrendingUp,
            label: "Lifetime Margin Earnings",
            value: inr(lifetimeEarnings),
            sub: `${payouts.length} delivered-order credit${payouts.length === 1 ? "" : "s"}`,
          },
          {
            icon: Landmark,
            label: "Withdrawn to Bank",
            value: inr(withdrawn),
            sub: lastBank?.accountLast4
              ? `Account ****${lastBank.accountLast4}`
              : "Approved payout requests",
          },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="rounded-xl border border-[#e5e7eb] bg-white p-5">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#6b7280]">
                {label}
              </p>
              <Icon className="h-4 w-4 text-[#b07d1a]" />
            </div>
            <p className="pt-3 text-[26px] font-bold leading-none text-black">{value}</p>
            <p className="pt-2.5 text-[12.5px] text-[#6b7280]">{sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly margin chart */}
      <div className="mt-6 rounded-xl border border-[#e5e7eb] bg-white p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[15px] font-bold text-black">Margin Credits — Last 6 Months</h3>
          <p className="text-[12.5px] text-[#6b7280]">
            This month: <span className="font-bold text-black">{inr(chart.thisMo)}</span>
            {chart.pct !== null && (
              <span
                className={`pl-1.5 font-semibold ${chart.pct >= 0 ? "text-[#16a34a]" : "text-[#ba1a1a]"}`}
              >
                {chart.pct >= 0 ? "↗ +" : "↘ "}
                {chart.pct}% vs last month
              </span>
            )}
          </p>
        </div>
        <div className="flex items-end gap-3 pt-6" style={{ height: 170 }}>
          {chart.months.map((m) => (
            <div
              key={m.label}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              title={`${m.count} credit${m.count === 1 ? "" : "s"}`}
            >
              <span className="text-[11px] font-semibold text-[#374151]">
                {m.total > 0 ? inr(m.total) : ""}
              </span>
              <div
                className={`w-full max-w-[56px] rounded-t-md ${m.total > 0 ? "bg-[#16a34a]" : "bg-[#f3f4f6]"}`}
                style={{ height: `${Math.max(m.total > 0 ? 6 : 3, (m.total / chart.max) * 110)}px` }}
              />
              <span className="text-[11.5px] text-[#6b7280]">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {flash && (
        <p
          className={`mt-5 w-fit rounded-lg px-3.5 py-2.5 text-[13px] font-medium ${
            flash.kind === "ok" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#ba1a1a]"
          }`}
        >
          {flash.text}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 pt-6 xl:grid-cols-[380px_1fr]">
        {/* Request payout */}
        <div ref={formRef} className="h-fit rounded-xl border border-[#e5e7eb] bg-white p-6">
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-black">
            <Landmark className="h-4 w-4" /> Request Payout
          </h3>
          <p className="pt-2 text-[13px] leading-5 text-[#6b7280]">
            Withdraw wallet balance to the bank account from your seller
            application{lastBank?.accountLast4 ? ` (****${lastBank.accountLast4})` : ""}. Reviewed
            within 1–2 business days.
          </p>
          <form onSubmit={(e) => void requestPayout(e)} className="pt-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-semibold text-[#374151]">
                Amount (min {inr(MIN_PAYOUT)})
              </span>
              <input
                type="number"
                required
                min={MIN_PAYOUT}
                max={balance ?? undefined}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={balance !== null ? `Up to ${Math.floor(balance)}` : "Amount"}
                className="h-11 w-full rounded-lg border border-[#e5e7eb] px-4 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
              />
            </label>
            {quickAmounts.length > 0 && (
              <div className="flex gap-2 pt-2.5">
                {quickAmounts.map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => setAmount(String(o.value))}
                    className="rounded-full border border-[#e5e7eb] px-3.5 py-1.5 text-[12px] font-bold text-[#374151] hover:border-black"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
            <button
              type="submit"
              disabled={busy || !!pendingReq}
              className="mt-4 w-full rounded-full bg-brand-orange py-3 text-[14.5px] font-bold text-white hover:opacity-90 disabled:opacity-40"
            >
              {busy ? "Submitting…" : pendingReq ? "Request Pending Review" : "Request Payout"}
            </button>
          </form>
          <p className="pt-3 text-[11.5px] leading-4 text-[#9ca3af]">
            Approved amounts are debited from your wallet and transferred to your
            bank. To change bank details, contact{" "}
            <Link href="/contact-us" className="underline">
              support
            </Link>
            .
          </p>
        </div>

        {/* History */}
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-[#e5e7eb] bg-white">
            <h3 className="border-b border-[#f3f4f6] px-5 py-4 text-[15px] font-bold text-black">
              Payout Requests
            </h3>
            <div className="flex flex-col divide-y divide-[#f3f4f6]">
              {requests.length === 0 && (
                <p className="px-5 py-8 text-center text-[13px] text-[#9ca3af]">
                  No payout requests yet.
                </p>
              )}
              {requests.map((r) => (
                <div key={r._id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <span>
                    <span className="block text-[14px] font-bold text-black">{inr(r.amount)}</span>
                    <span className="block text-[11.5px] text-[#9ca3af]">
                      Requested {dt(r.createdAt)}
                      {r.bank?.accountLast4 ? ` · ****${r.bank.accountLast4}` : ""}
                      {r.status !== "pending" && r.resolvedAt ? ` · resolved ${dt(r.resolvedAt)}` : ""}
                      {r.adminNote ? ` · “${r.adminNote}”` : ""}
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase ${REQ_CHIP[r.status]}`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#e5e7eb] bg-white">
            <h3 className="flex items-center gap-2 border-b border-[#f3f4f6] px-5 py-4 text-[15px] font-bold text-black">
              <Clock className="h-4 w-4" /> Margin Credits
            </h3>
            <div className="flex flex-col divide-y divide-[#f3f4f6]">
              {payouts.length === 0 && (
                <p className="px-5 py-8 text-center text-[13px] text-[#9ca3af]">
                  Margins appear here when orders of your products are delivered.
                </p>
              )}
              {visibleCredits.map((t) => (
                <div key={t._id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-[13px] text-[#374151]">
                    Order #{(t.requestId ?? "").replace("payout-seller-", "").slice(-8)} delivered
                    <span className="block text-[11.5px] text-[#9ca3af]">{dt(t.createdAt)}</span>
                  </span>
                  <span className="text-[14px] font-bold text-[#16a34a]">+ {inr(t.amount)}</span>
                </div>
              ))}
            </div>
            {payouts.length > 8 && (
              <button
                onClick={() => setShowAllCredits((v) => !v)}
                className="w-full border-t border-[#f3f4f6] py-3 text-[12.5px] font-bold text-black hover:bg-[#fafafa]"
              >
                {showAllCredits ? "Show fewer" : `Show all ${payouts.length} credits`}
              </button>
            )}
          </div>
        </div>
      </div>
    </SellerShell>
  );
}
