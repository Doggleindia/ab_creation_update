import { useEffect, useState } from "react";
import Shell, { Card } from "../components/Shell";
import { api, inr, type WalletTxn } from "../lib/api";

const TXN_CHIP: Record<string, string> = {
  payment: "bg-[#dcfce7] text-[#16a34a]",
  recharge: "bg-[#dbeafe] text-[#2563eb]",
  refund: "bg-[#fee2e2] text-[#ba1a1a]",
};

export default function Financials() {
  const [balance, setBalance] = useState<number | null>(null);
  const [txns, setTxns] = useState<WalletTxn[]>([]);
  const [report, setReport] = useState<
    { name?: string; email?: string; balance?: number }[]
  >([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api<{ data: { balance: number } }>("/api/admin/wallet/balance")
      .then((j) => setBalance(j.data?.balance ?? null))
      .catch(() => {});
    api<{ data: { transactions?: WalletTxn[] } | WalletTxn[] }>(
      "/api/admin/wallet/transactions?limit=25",
    )
      .then((j) => {
        const d = j.data as { transactions?: WalletTxn[] } | WalletTxn[];
        setTxns(Array.isArray(d) ? d : (d?.transactions ?? []));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
    api<{ data: { reports?: unknown } }>("/api/admin/wallet/users-report")
      .then((j) => {
        const r = j.data as Record<string, unknown>;
        const list = (r?.reports ?? r?.users ?? r) as unknown;
        if (Array.isArray(list)) setReport(list.slice(0, 8));
      })
      .catch(() => {});
  }, []);

  const inflow = txns
    .filter((t) => t.type === "payment" && t.status === "completed")
    .reduce((s, t) => s + t.amount, 0);
  const refunds = txns.filter((t) => t.type === "refund").length;

  return (
    <Shell title="Financials" subtitle="Platform revenue, wallet and transactions.">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          {
            label: "Platform Wallet Balance",
            value: balance !== null ? inr(balance) : "—",
            sub: "Credited from paid orders",
          },
          {
            label: "Recent Order Inflow",
            value: inr(inflow),
            sub: `Across last ${txns.length} transactions`,
          },
          {
            label: "Refunds",
            value: String(refunds),
            sub: "In recent transactions",
          },
        ].map((s) => (
          <Card key={s.label} className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
              {s.label}
            </p>
            <p className="pt-2 text-[30px] font-bold leading-none text-black">
              {s.value}
            </p>
            <p className="pt-3 text-[12.5px] text-[#6b7280]">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        {/* Transaction log */}
        <Card>
          <div className="border-b border-[#f3f4f6] px-6 py-4">
            <h2 className="text-[16px] font-bold text-black">Transaction Log</h2>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8f9fb] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
                <th className="px-6 py-3">Date</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Ref</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loaded && txns.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[13px] text-[#9ca3af]">
                    No transactions yet.
                  </td>
                </tr>
              )}
              {txns.map((t) => (
                <tr key={t._id} className="border-t border-[#f3f4f6] text-[13px]">
                  <td className="px-6 py-3.5 text-[#374151]">
                    {t.createdAt
                      ? new Date(t.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-3 py-3.5">
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-bold capitalize ${
                        TXN_CHIP[t.type] ?? "bg-[#f3f4f6] text-[#6b7280]"
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 font-mono text-[11.5px] text-[#6b7280]">
                    {t.requestId?.slice(0, 18) ?? "—"}
                  </td>
                  <td
                    className={`px-6 py-3.5 text-right font-bold ${
                      t.type === "refund" ? "text-[#ba1a1a]" : "text-[#16a34a]"
                    }`}
                  >
                    {t.type === "refund" ? "-" : "+"}
                    {inr(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* User balances */}
        <Card className="h-fit">
          <div className="border-b border-[#f3f4f6] px-6 py-4">
            <h2 className="text-[16px] font-bold text-black">User Wallets</h2>
          </div>
          {report.length === 0 ? (
            <p className="px-6 py-8 text-center text-[13px] text-[#9ca3af]">
              No wallet report available.
            </p>
          ) : (
            <div className="flex flex-col">
              {report.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-t border-[#f3f4f6] px-6 py-3.5 first:border-t-0"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-bold text-black">
                      {r.name ?? "—"}
                    </span>
                    <span className="block truncate text-[11.5px] text-[#6b7280]">
                      {r.email ?? ""}
                    </span>
                  </span>
                  <span className="text-[13.5px] font-bold text-black">
                    {typeof r.balance === "number" ? inr(r.balance) : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
