"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, Plus } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import { apiFetch, getToken, getUser } from "@/lib/auth";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

type Txn = {
  _id: string;
  type: string;
  amount: number;
  status: string;
  createdAt?: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function WalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [amount, setAmount] = useState("1000");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );

  const load = useCallback(() => {
    if (!getToken()) return;
    apiFetch<{ data: { balance: number } }>("/api/wallet/balance")
      .then((j) => setBalance(j.data?.balance ?? null))
      .catch(() => {});
    apiFetch<{ data: { transactions?: Txn[] } | Txn[] }>(
      "/api/wallet/transactions?limit=15",
    )
      .then((j) => {
        const d = j.data as { transactions?: Txn[] } | Txn[];
        setTxns(Array.isArray(d) ? d : (d?.transactions ?? []));
      })
      .catch(() => {});
  }, []);
  useEffect(load, [load]);

  async function recharge() {
    const amt = Number(amount);
    if (!amt || amt < 1) {
      setFlash({ kind: "err", text: "Enter a valid amount." });
      return;
    }
    setBusy(true);
    setFlash(null);
    try {
      const j = await apiFetch<{
        data: Record<string, unknown> & { keyId?: string };
      }>("/api/wallet/recharge/create", {
        method: "POST",
        body: JSON.stringify({ amount: amt }),
      });
      const d = j.data ?? {};
      const rzpOrderId = (d.orderId ?? d.id ?? d.razorpayOrderId) as
        | string
        | undefined;
      if (!d.keyId || !rzpOrderId) {
        throw new Error("Payment gateway is not configured yet.");
      }
      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) {
        throw new Error("Could not load the payment window. Check your connection.");
      }
      const user = getUser();
      const rzp = new window.Razorpay({
        key: d.keyId,
        order_id: rzpOrderId,
        amount: Math.round(amt * 100),
        currency: (d.currency as string) ?? "INR",
        name: "AB Creation",
        description: "Wallet recharge",
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#ff5c00" },
        handler: async (resp: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const v = await apiFetch<{ data: { balance: number } }>(
              "/api/wallet/recharge/verify",
              {
                method: "POST",
                body: JSON.stringify({
                  razorpayOrderId: resp.razorpay_order_id,
                  razorpayPaymentId: resp.razorpay_payment_id,
                  razorpaySignature: resp.razorpay_signature,
                }),
              },
            );
            setBalance(v.data?.balance ?? null);
            setFlash({ kind: "ok", text: "Wallet recharged successfully." });
            load();
          } catch (err) {
            setFlash({
              kind: "err",
              text:
                err instanceof Error
                  ? err.message
                  : "Payment made but verification failed — contact support.",
            });
          }
        },
      });
      rzp.open();
    } catch (err) {
      setFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not start recharge.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AccountShell>
      <h1 className="pb-6 text-[28px] font-bold tracking-[-0.5px] text-black">
        My Wallet
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* Balance + recharge */}
        <div className="flex h-fit flex-col gap-5">
          <div className="rounded-[12px] bg-black p-6 text-white">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1px] text-white/60">
              <Wallet className="h-3.5 w-3.5" /> Available Balance
            </p>
            <p className="pt-3 text-[40px] font-bold leading-none">
              {balance !== null ? `₹${balance.toLocaleString("en-IN")}` : "—"}
            </p>
            <p className="pt-3 text-[12.5px] text-white/60">
              Orders are paid instantly from this balance.
            </p>
          </div>

          <div className="rounded-[12px] border border-[#e5e7eb] p-6">
            <h2 className="text-[16px] font-bold text-black">Add Money</h2>
            <div className="flex flex-wrap gap-2 pt-4">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className={`rounded-full px-4 py-1.5 text-[13px] font-bold ${
                    amount === String(a)
                      ? "bg-black text-white"
                      : "border border-[#e5e7eb] text-[#374151] hover:border-black"
                  }`}
                >
                  ₹{a.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-4">
              <div className="flex h-11 flex-1 items-center rounded-[8px] border border-[#c4c7c7] px-3">
                <span className="pr-1 text-[15px] text-[#6b7280]">₹</span>
                <input
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value.replace(/[^\d]/g, ""))
                  }
                  inputMode="numeric"
                  className="w-full text-[15px] text-black focus:outline-none"
                />
              </div>
              <button
                onClick={() => void recharge()}
                disabled={busy}
                className="flex h-11 items-center gap-1.5 rounded-[8px] bg-brand-orange px-5 text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {busy ? "Opening…" : "Recharge"}
              </button>
            </div>
            {flash && (
              <p
                className={`mt-4 rounded-[8px] px-3 py-2.5 text-[13px] ${
                  flash.kind === "ok"
                    ? "bg-[#dcfce7] text-[#166534]"
                    : "bg-[#fef2f2] text-[#ba1a1a]"
                }`}
              >
                {flash.text}
              </p>
            )}
            <p className="pt-4 text-[12px] leading-5 text-[#9ca3af]">
              Payments are processed securely by Razorpay (UPI, cards, net
              banking). Your balance updates as soon as payment is verified.
            </p>
          </div>
        </div>

        {/* Transactions */}
        <section className="h-fit overflow-hidden rounded-[12px] border border-[#e5e7eb]">
          <div className="border-b border-[#f3f4f6] px-6 py-4">
            <h2 className="text-[16px] font-bold text-black">
              Recent Transactions
            </h2>
          </div>
          {txns.length === 0 ? (
            <p className="px-6 py-10 text-center text-[13px] text-[#9ca3af]">
              No transactions yet.
            </p>
          ) : (
            txns.map((t, i) => (
              <div
                key={t._id}
                className={`flex items-center justify-between px-6 py-4 ${
                  i > 0 ? "border-t border-[#f3f4f6]" : ""
                }`}
              >
                <span>
                  <span className="block text-[14px] font-bold capitalize text-black">
                    {t.type === "payment" ? "Order payment" : t.type}
                  </span>
                  <span className="block text-[12px] text-[#6b7280]">
                    {t.createdAt
                      ? new Date(t.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                    {" · "}
                    {t.status}
                  </span>
                </span>
                <span
                  className={`text-[15px] font-bold ${
                    t.type === "recharge" || t.type === "refund"
                      ? "text-[#16a34a]"
                      : "text-black"
                  }`}
                >
                  {t.type === "recharge" || t.type === "refund" ? "+" : "-"}₹
                  {t.amount.toLocaleString("en-IN")}
                </span>
              </div>
            ))
          )}
        </section>
      </div>
    </AccountShell>
  );
}
