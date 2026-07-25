"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Boxes, Plus } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import { apiFetch, getToken } from "@/lib/auth";

type MyApplication = {
  _id: string;
  businessName?: string;
  contactName?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  expectedVolume?: string;
  productsToSell?: string;
  quote?: {
    amount?: number;
    status?: "sent" | "accepted" | "declined" | "in_production" | "completed";
    sentAt?: string;
    respondedAt?: string;
    notes?: string;
  };
};

// One chip per pipeline stage, derived from application + quote state
const stageOf = (a: MyApplication): { label: string; cls: string; hint: string } => {
  if (a.status === "rejected")
    return { label: "Not Approved", cls: "bg-[#fee2e2] text-[#ba1a1a]", hint: "This request wasn't approved — contact us for details." };
  if (!a.quote?.status)
    return a.status === "pending"
      ? { label: "Under Review", cls: "bg-[#fef3c7] text-[#b45309]", hint: "Our team is reviewing your requirements." }
      : { label: "Preparing Quote", cls: "bg-[#dbeafe] text-[#2563eb]", hint: "Approved — we're preparing your proposal." };
  switch (a.quote.status) {
    case "sent":
      return { label: "Quote Sent", cls: "bg-[#dbeafe] text-[#2563eb]", hint: "Your proposal is ready — review and respond." };
    case "accepted":
      return { label: "Accepted", cls: "bg-[#dcfce7] text-[#16a34a]", hint: "Quote accepted — production is being scheduled." };
    case "in_production":
      return { label: "In Production", cls: "bg-[#fdecc8] text-[#c2410c]", hint: "Your bulk order is being produced." };
    case "completed":
      return { label: "Completed", cls: "bg-[#dcfce7] text-[#16a34a]", hint: "Order completed — thank you!" };
    case "declined":
      return { label: "Declined", cls: "bg-[#f3f4f6] text-[#6b7280]", hint: "You declined this quote. Start a new request any time." };
    default:
      return { label: "In Progress", cls: "bg-[#f3f4f6] text-[#6b7280]", hint: "" };
  }
};

const dt = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

export default function BulkQuotesPage() {
  const [apps, setApps] = useState<MyApplication[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!getToken()) return;
    apiFetch<{ data: { applications: MyApplication[] } }>("/api/applications/mine")
      .then((j) => setApps(j.data?.applications ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <AccountShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[32px] font-bold tracking-[-0.6px] text-black">
          Bulk Quotes{" "}
          {loaded && (
            <span className="text-[18px] font-medium text-[#6b7280]">
              ({apps.length} request{apps.length === 1 ? "" : "s"})
            </span>
          )}
        </h1>
        <Link
          href="/bulk-order"
          className="flex items-center gap-2 rounded-[10px] bg-black px-5 py-3 text-[14px] font-bold text-white hover:opacity-85"
        >
          <Plus className="h-4 w-4" /> Request New Quote
        </Link>
      </div>

      {loaded && apps.length === 0 ? (
        <div className="mt-6 rounded-[12px] border border-[#e5e7eb] bg-white p-14 text-center">
          <Boxes className="mx-auto h-8 w-8 text-[#e5e7eb]" />
          <p className="pt-4 text-[16px] font-semibold text-black">No bulk requests yet</p>
          <p className="pt-1.5 text-[13.5px] text-[#6b7280]">
            Tell us what you need — quantities, garments, artwork — and our team
            will send a tailored proposal.
          </p>
          <Link
            href="/bulk-order"
            className="mt-6 inline-block rounded-[8px] bg-black px-7 py-3 text-[13.5px] font-bold text-white hover:opacity-85"
          >
            Start a Bulk Request
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-5">
          {apps.map((a) => {
            const stage = stageOf(a);
            const actionable = a.quote?.status === "sent";
            return (
              <div key={a._id} className="rounded-[12px] border border-[#e5e7eb] bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-3">
                      <span className="text-[17px] font-bold text-black">
                        {a.businessName || "Bulk request"}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.5px] ${stage.cls}`}
                      >
                        {stage.label}
                      </span>
                    </p>
                    <p className="pt-1 text-[13px] text-[#6b7280]">
                      Requested {dt(a.createdAt)}
                      {a.expectedVolume ? ` · ${a.expectedVolume}` : ""}
                    </p>
                  </div>
                  {typeof a.quote?.amount === "number" && (
                    <p className="text-right">
                      <span className="block text-[11px] font-bold uppercase tracking-[1px] text-[#9ca3af]">
                        Quoted Amount
                      </span>
                      <span className="block text-[24px] font-bold text-black">
                        ₹{a.quote.amount.toLocaleString("en-IN")}
                      </span>
                    </p>
                  )}
                </div>

                {a.productsToSell && (
                  <p className="line-clamp-2 pt-3 text-[13.5px] leading-6 text-[#374151]">
                    {a.productsToSell}
                  </p>
                )}
                <p className="pt-3 text-[13px] text-[#6b7280]">{stage.hint}</p>

                <div className="flex flex-wrap items-center gap-3 border-t border-[#f3f4f6] pt-4">
                  <Link
                    href={`/bulk-order/quote/${a._id}`}
                    className={`flex items-center gap-1.5 rounded-[8px] px-5 py-2.5 text-[13px] font-bold ${
                      actionable
                        ? "bg-black text-white hover:opacity-85"
                        : "border border-[#c4c7c7] text-black hover:bg-[#f3f4f6]"
                    }`}
                  >
                    {actionable ? "Review Proposal" : "Open Tracker"}{" "}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  {a.quote?.sentAt && (
                    <span className="text-[12.5px] text-[#9ca3af]">
                      Quote sent {dt(a.quote.sentAt)}
                      {a.quote.respondedAt ? ` · responded ${dt(a.quote.respondedAt)}` : ""}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="pt-4 text-[12.5px] text-[#9ca3af]">
        Bulk production and payment terms are settled per-quote with our team —
        your regular wallet and cart aren&apos;t used for bulk orders.
      </p>
    </AccountShell>
  );
}
