"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Landmark, Wallet, TrendingUp, Clock } from "lucide-react";
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

export default function SellerEarningsPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

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
  const withdrawn = txns
    .filter((t) => t.type === "withdrawal")
    .reduce((s, t) => s + t.amount, 0);
  const hasPending = requests.some((r) => r.status === "pending");

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

  const dt = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "—";

  return (
    <SellerShell title="Earnings" subtitle="Wallet, margin credits and payouts.">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            icon: Wallet,
            label: "Wallet Balance",
            value: balance !== null ? inr(balance) : "—",
            sub: "Available to spend or withdraw",
          },
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
            sub: "Approved payout requests",
          },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="rounded-xl border border-[#e5e7eb] bg-white p-5">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#6b7280]">{label}</p>
              <Icon className="h-4 w-4 text-[#b07d1a]" />
            </div>
            <p className="pt-3 text-[26px] font-bold leading-none text-black">{value}</p>
            <p className="pt-2.5 text-[12.5px] text-[#6b7280]">{sub}</p>
          </div>
        ))}
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
        <div className="h-fit rounded-xl border border-[#e5e7eb] bg-white p-6">
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-black">
            <Landmark className="h-4 w-4" /> Request Payout
          </h3>
          <p className="pt-2 text-[13px] leading-5 text-[#6b7280]">
            Withdraw wallet balance to the bank account from your seller
            application. Requests are reviewed within 1–2 business days.
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
                placeholder={balance !== null ? `Up to ${balance}` : "Amount"}
                className="h-11 w-full rounded-lg border border-[#e5e7eb] px-4 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={busy || hasPending}
              className="mt-4 w-full rounded-full bg-brand-orange py-3 text-[14.5px] font-bold text-white hover:opacity-90 disabled:opacity-40"
            >
              {busy ? "Submitting…" : hasPending ? "Request Pending Review" : "Request Payout"}
            </button>
          </form>
          <p className="pt-3 text-[11.5px] leading-4 text-[#9ca3af]">
            Approved amounts are debited from your wallet and transferred to your
            bank. Update bank details via{" "}
            <Link href="/contact-us" className="underline">support</Link>.
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
                      {dt(r.createdAt)}
                      {r.bank?.accountLast4 ? ` · ****${r.bank.accountLast4}` : ""}
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
              {payouts.slice(0, 8).map((t) => (
                <div key={t._id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-[13px] text-[#374151]">
                    Order #{(t.requestId ?? "").replace("payout-seller-", "").slice(-8)} delivered
                    <span className="block text-[11.5px] text-[#9ca3af]">{dt(t.createdAt)}</span>
                  </span>
                  <span className="text-[14px] font-bold text-[#16a34a]">+ {inr(t.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SellerShell>
  );
}
