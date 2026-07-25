"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BadgeCheck,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  XCircle,
} from "lucide-react";
import { BACKEND, getToken } from "@/lib/auth";

type Quote = {
  amount?: number;
  notes?: string;
  status?: "sent" | "accepted" | "declined" | "in_production" | "completed";
  sentAt?: string;
  changeRequest?: { note?: string; at?: string };
  items?: {
    name?: string;
    qty?: number;
    sizeBreakdown?: string;
    unitPrice?: number;
    total?: number;
  }[];
  printingCost?: number;
  shippingCost?: number;
  advancePct?: number;
  validUntil?: string;
  estimatedDelivery?: string;
  advancePaid?: { amount?: number; at?: string };
};

type QuoteData = {
  businessName: string;
  contactName: string;
  expectedVolume?: string;
  productsToSell?: string;
  portfolioFiles?: string[];
  applicationStatus?: "pending" | "approved" | "rejected";
  submittedAt?: string;
  quote: Quote | null;
};

type Business = { email?: string; phone?: string };

const fullDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

export default function BulkQuotePage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const [data, setData] = useState<QuoteData | null>(null);
  const [business, setBusiness] = useState<Business>({});
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [changesOpen, setChangesOpen] = useState(false);
  const [changeNote, setChangeNote] = useState("");

  useEffect(() => {
    fetch(`${BACKEND}/api/applications/${encodeURIComponent(id)}/quote`)
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const j = await r.json();
        setData(j.data);
        setState("ok");
      })
      .catch(() => setState("missing"));
    // Business contact details for the help links
    fetch(`${BACKEND}/api/site-content`)
      .then((r) => r.json())
      .then((j) => setBusiness(j?.data?.settings?.business ?? {}))
      .catch(() => {});
  }, [id]);

  async function respond(decision: "accepted" | "declined" | "changes") {
    if (
      decision === "declined" &&
      !window.confirm(
        "Decline this quote? Our team can prepare a revised one if the pricing doesn't work for you.",
      )
    )
      return;
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch(
        `${BACKEND}/api/applications/${encodeURIComponent(id)}/quote/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            decision === "changes" ? { decision, note: changeNote } : { decision },
          ),
        },
      );
      const j = await r.json();
      if (!r.ok) throw new Error(j?.message || "Could not submit your response");
      setMessage(j.message);
      setChangesOpen(false);
      setData((d) =>
        d
          ? {
              ...d,
              quote:
                decision === "changes"
                  ? { ...d.quote, changeRequest: { note: changeNote } }
                  : { ...d.quote, status: decision },
            }
          : d,
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  // Accept + pay the advance from the wallet (logged-in linked account)
  async function payAdvance() {
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch(
        `${BACKEND}/api/applications/${encodeURIComponent(id)}/quote/pay-advance`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const j = await r.json();
      if (!r.ok) throw new Error(j?.message || "Payment failed");
      setMessage(j.message);
      setData((d) => (d ? { ...d, quote: j.data.quote } : d));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function downloadPdf() {
    if (!data?.quote) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("AB Creation — Bulk Order Proposal", 20, 22);
    doc.setFontSize(11);
    doc.text(`Request: BLK-${id.slice(-4).toUpperCase()}`, 20, 34);
    doc.text(`Prepared for: ${data.contactName} — ${data.businessName}`, 20, 41);
    doc.text(`Sent: ${fullDate(data.quote.sentAt)}`, 20, 48);
    doc.line(20, 54, 190, 54);
    doc.setFontSize(13);
    doc.text(
      `Quoted Amount: Rs ${(data.quote.amount ?? 0).toLocaleString("en-IN")}`,
      20,
      64,
    );
    doc.setFontSize(10);
    const lines = (data.quote.notes ?? "").split(" · ");
    lines.forEach((l, i) => doc.text(`• ${l}`, 20, 74 + i * 7));
    const y = 74 + lines.length * 7 + 8;
    doc.line(20, y, 190, y);
    doc.setFontSize(9);
    doc.text(
      "Respond to this proposal from your quote link. Generated from abcreation.",
      20,
      y + 8,
    );
    doc.save(`ab-creation-proposal-BLK-${id.slice(-4).toUpperCase()}.pdf`);
  }

  const quote = data?.quote;
  const noteLines = (quote?.notes ?? "").split(" · ").filter(Boolean);
  const itemLines = noteLines.filter((l) => /×|x .*@|@ ₹/.test(l));
  const metaLines = noteLines.filter((l) => !itemLines.includes(l));

  // Production timeline stage index
  const stageIdx = !quote
    ? 0
    : quote.status === "sent"
      ? 1
      : quote.status === "accepted"
        ? 2
        : quote.status === "in_production"
          ? 3
          : quote.status === "completed"
            ? 4
            : 1;

  const TIMELINE = [
    { label: "Request received", detail: `Submitted ${fullDate(data?.submittedAt)}` },
    {
      label: quote ? "Proposal sent" : "Proposal in preparation",
      detail: quote
        ? `Sent ${fullDate(quote.sentAt)}`
        : "Our team is preparing your custom proposal",
    },
    { label: "Approval & payment", detail: "Waiting for your green light" },
    { label: "Full production", detail: "Manufacturing and printing" },
    { label: "QC, packing & dispatch", detail: "Quality checked and shipped" },
  ];
  const declined = quote?.status === "declined" || data?.applicationStatus === "rejected";

  return (
    <main className="w-full bg-[#f8f9fb] px-4 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1140px]">
        <nav className="flex items-center gap-2 pb-8 text-[13px]">
          <Link href="/" className="text-[#6b7280] hover:text-brand-orange">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <Link href="/bulk-order" className="text-[#6b7280] hover:text-brand-orange">
            Bulk Orders
          </Link>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <span className="font-semibold text-black">
            #BLK-{id.slice(-4).toUpperCase()}
          </span>
        </nav>

        {state === "loading" && (
          <p className="py-16 text-center text-[14px] text-[#9ca3af]">Loading your request…</p>
        )}

        {state === "missing" && (
          <div className="mx-auto max-w-[560px] rounded-[12px] border border-[#e5e7eb] bg-white p-12 text-center">
            <h1 className="text-[22px] font-bold text-black">Request not found</h1>
            <p className="pt-2 text-[14px] leading-6 text-[#6b7280]">
              This link is invalid. If you received it by email, double-check the
              link — or contact us and we&apos;ll resend it.
            </p>
            <Link
              href="/contact-us"
              className="mt-6 inline-block rounded-full bg-black px-7 py-2.5 text-[14px] font-bold text-white hover:opacity-85"
            >
              Contact Us
            </Link>
          </div>
        )}

        {state === "ok" && data && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            {/* LEFT: proposal / tracking */}
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-[26px] font-bold tracking-[-0.5px] text-black">
                    {quote ? "Bulk Order Proposal" : "Quote Request"}
                  </h1>
                  <span
                    className={`rounded-full px-3 py-1 text-[11.5px] font-bold ${
                      declined
                        ? "bg-[#fee2e2] text-[#ba1a1a]"
                        : quote
                          ? "bg-[#e0e7ff] text-[#4f46e5]"
                          : "bg-[#fef9c3] text-[#a16207]"
                    }`}
                  >
                    {declined
                      ? "Declined"
                      : quote
                        ? quote.status === "sent"
                          ? "Proposal Received"
                          : quote.status === "accepted"
                            ? "Accepted"
                            : quote.status === "in_production"
                              ? "In Production"
                              : "Completed"
                        : "In Review"}
                  </span>
                </div>
                <p className="pt-1 text-[13.5px] text-[#6b7280]">
                  {quote
                    ? `Sent by AB Creation on ${fullDate(quote.sentAt)}`
                    : `Submitted ${fullDate(data.submittedAt)} · proposals typically arrive within 24 hours`}
                </p>
              </div>

              {/* Products & pricing */}
              <section className="rounded-[12px] border border-[#e5e7eb] bg-white p-6">
                <h2 className="flex items-center gap-2 text-[16px] font-bold text-black">
                  <FileText className="h-4 w-4" /> {quote ? "Products & Pricing" : "Your Request"}
                </h2>
                <p className="pt-3 text-[14.5px] font-semibold text-black">
                  {data.productsToSell || data.expectedVolume || "Bulk order enquiry"}
                </p>
                {quote && (quote.items?.length ?? 0) > 0 ? (
                  <>
                    <div className="mt-4 overflow-x-auto rounded-[10px] border border-[#f3f4f6]">
                      <table className="w-full min-w-[480px] text-left text-[13.5px]">
                        <thead>
                          <tr className="bg-[#f8f9fb] text-[11px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
                            <th className="px-4 py-3">Product</th>
                            <th className="px-3 py-3">Qty</th>
                            <th className="px-3 py-3">Size Breakdown</th>
                            <th className="px-3 py-3">Unit Price</th>
                            <th className="px-4 py-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quote.items!.map((it, i) => (
                            <tr key={i} className="border-t border-[#f3f4f6]">
                              <td className="px-4 py-3 font-semibold text-black">{it.name}</td>
                              <td className="px-3 py-3 text-[#374151]">{it.qty}</td>
                              <td className="px-3 py-3 text-[#374151]">
                                {it.sizeBreakdown?.replaceAll(" ", ", ") || "—"}
                              </td>
                              <td className="px-3 py-3 text-[#374151]">
                                ₹{(it.unitPrice ?? 0).toLocaleString("en-IN")}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-black">
                                ₹{(it.total ?? 0).toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="ml-auto mt-4 max-w-[320px] text-[13.5px]">
                      <div className="flex justify-between py-1 text-[#374151]">
                        <span>Subtotal</span>
                        <span>
                          ₹
                          {quote
                            .items!.reduce((s, it) => s + (it.total ?? 0), 0)
                            .toLocaleString("en-IN")}
                        </span>
                      </div>
                      {(quote.printingCost ?? 0) > 0 && (
                        <div className="flex justify-between py-1 text-[#374151]">
                          <span>Custom Printing (DTF)</span>
                          <span>₹{quote.printingCost!.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1 text-[#374151]">
                        <span>Shipping</span>
                        {(quote.shippingCost ?? 0) > 0 ? (
                          <span>₹{quote.shippingCost!.toLocaleString("en-IN")}</span>
                        ) : (
                          <span className="font-bold text-[#16a34a]">FREE</span>
                        )}
                      </div>
                      <div className="mt-2 flex justify-between border-t border-[#e5e7eb] pt-2.5">
                        <span className="text-[16px] font-bold text-black">Total</span>
                        <span className="text-[22px] font-bold text-black">
                          ₹{(quote.amount ?? 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                    {(quote.advancePct ?? 0) > 0 && (
                      <div className="mt-4 rounded-[10px] bg-[#f8f9fb] p-4 text-[13.5px] leading-6 text-[#374151]">
                        <p className="font-bold text-black">Payment Terms</p>
                        <p>
                          ✓ {quote.advancePct}% Advance (₹
                          {Math.round(((quote.amount ?? 0) * (quote.advancePct ?? 0)) / 100).toLocaleString("en-IN")}
                          ) to start production
                        </p>
                        <p>
                          ✓ {100 - (quote.advancePct ?? 0)}% Balance (₹
                          {((quote.amount ?? 0) -
                            Math.round(((quote.amount ?? 0) * (quote.advancePct ?? 0)) / 100)).toLocaleString("en-IN")}
                          ) before final dispatch
                        </p>
                      </div>
                    )}
                    {quote.estimatedDelivery && (
                      <p className="mt-4 rounded-[10px] bg-[#f0fdf4] px-4 py-3 text-[13.5px] font-semibold text-[#166534]">
                        ✦ Estimated delivery: {fullDate(quote.estimatedDelivery)}
                      </p>
                    )}
                    {quote.notes && (
                      <div className="mt-4 rounded-[10px] bg-[#f8f9fb] p-4">
                        <p className="text-[14px] font-bold text-black">Notes from AB Creation</p>
                        <p className="whitespace-pre-line pt-1.5 text-[13px] italic leading-6 text-[#374151]">
                          “{quote.notes}”
                        </p>
                      </div>
                    )}
                  </>
                ) : quote ? (
                  <div className="mt-4 rounded-[10px] bg-[#f8f9fb] p-5 text-[13.5px]">
                    {itemLines.map((l) => (
                      <p key={l} className="py-0.5 text-[#374151]">
                        {l}
                      </p>
                    ))}
                    {metaLines.map((l) => (
                      <p key={l} className="py-0.5 text-[#6b7280]">
                        {l}
                      </p>
                    ))}
                    <div className="mt-3 flex items-center justify-between border-t border-[#e5e7eb] pt-3">
                      <span className="text-[15px] font-bold text-black">Total</span>
                      <span className="text-[22px] font-bold text-black">
                        ₹{(quote.amount ?? 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="pt-2 text-[13px] leading-6 text-[#6b7280]">
                    Our team is reviewing your requirements and will email your
                    itemized proposal to review right here.
                  </p>
                )}
              </section>

              {/* Design files */}
              {(data.portfolioFiles?.length ?? 0) > 0 && (
                <section className="rounded-[12px] border border-[#e5e7eb] bg-white p-6">
                  <h2 className="text-[16px] font-bold text-black">Your Design Files</h2>
                  <div className="flex flex-wrap gap-3 pt-4">
                    {data.portfolioFiles!.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block h-24 w-24 overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-[#f3f4f6]"
                      >
                        {/\.(png|jpe?g|webp)(\?|$)/i.test(url) ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={url} alt="Design file" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[11px] font-bold text-[#6b7280]">
                            FILE
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Production timeline */}
              {!declined && (
                <section className="rounded-[12px] border border-[#e5e7eb] bg-white p-6">
                  <h2 className="flex items-center gap-2 text-[16px] font-bold text-black">
                    <Clock className="h-4 w-4" /> Production Timeline
                  </h2>
                  <ol className="flex flex-col pt-5">
                    {TIMELINE.map((t, i) => {
                      const done = i < stageIdx;
                      const current = i === stageIdx;
                      return (
                        <li key={t.label} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                                done
                                  ? "bg-black text-white"
                                  : current
                                    ? "border-2 border-black bg-white text-black"
                                    : "border border-[#d1d5db] bg-white text-[#d1d5db]"
                              }`}
                            >
                              {done ? "✓" : ""}
                            </span>
                            {i < TIMELINE.length - 1 && (
                              <span
                                className={`min-h-[26px] w-px flex-1 ${done ? "bg-black" : "bg-[#e5e7eb]"}`}
                              />
                            )}
                          </div>
                          <div className="pb-5">
                            <p
                              className={`text-[14px] ${
                                done || current ? "font-bold text-black" : "text-[#9ca3af]"
                              }`}
                            >
                              {t.label}
                              {current && (
                                <span className="pl-2 text-[10.5px] font-bold uppercase tracking-[0.5px] text-[#b45309]">
                                  {i === 1 && !quote ? "In progress" : "Awaiting action"}
                                </span>
                              )}
                            </p>
                            <p className="pt-0.5 text-[12.5px] text-[#6b7280]">{t.detail}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}

              {/* Change request already sent */}
              {quote?.changeRequest?.note && quote.status === "sent" && (
                <p className="rounded-[10px] bg-[#fef9c3] px-4 py-3 text-[13.5px] text-[#854d0e]">
                  <b>Change request sent:</b> “{quote.changeRequest.note}” — our team
                  is revising the proposal.
                </p>
              )}
            </div>

            {/* RIGHT: decision rail */}
            <div className="flex h-fit flex-col gap-4">
              <section className="rounded-[12px] border border-[#e5e7eb] bg-white p-6">
                <h2 className="text-[17px] font-bold text-black">
                  {quote && quote.status === "sent" ? "Your Decision" : "Status"}
                </h2>

                {message && (
                  <p className="mt-4 rounded-[8px] bg-[#f0fdf4] px-4 py-3 text-[13.5px] font-medium text-[#166534]">
                    {message}
                  </p>
                )}

                {quote && quote.status === "sent" && (
                  <div className="flex flex-col gap-3 pt-4">
                    {getToken() && (quote.advancePct ?? 0) > 0 ? (
                      <>
                        <button
                          onClick={() => void payAdvance()}
                          disabled={busy}
                          className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand-orange text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                          <BadgeCheck className="h-4 w-4" /> Accept &amp; Pay Advance (₹
                          {Math.round(((quote.amount ?? 0) * (quote.advancePct ?? 0)) / 100).toLocaleString("en-IN")}
                          )
                        </button>
                        <p className="-mt-1 text-center text-[11.5px] text-[#9ca3af]">
                          Paid from your wallet ·{" "}
                          <Link href="/dashboard/wallet" className="underline">
                            top up
                          </Link>{" "}
                          if the balance is short
                        </p>
                      </>
                    ) : (
                      <button
                        onClick={() => void respond("accepted")}
                        disabled={busy}
                        className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand-orange text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        <BadgeCheck className="h-4 w-4" /> Accept Quote
                      </button>
                    )}
                    <button
                      onClick={() => setChangesOpen((v) => !v)}
                      disabled={busy}
                      className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#c4c7c7] text-[15px] font-bold text-black transition-colors hover:border-black disabled:opacity-50"
                    >
                      <MessageSquare className="h-4 w-4" /> Request Changes
                    </button>
                    {changesOpen && (
                      <div className="rounded-[10px] border border-[#e5e7eb] p-3">
                        <textarea
                          rows={3}
                          value={changeNote}
                          onChange={(e) => setChangeNote(e.target.value)}
                          placeholder="What should we change? (quantities, pricing, timeline…)"
                          className="w-full rounded-[8px] border border-[#e5e7eb] p-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
                        />
                        <button
                          onClick={() => void respond("changes")}
                          disabled={busy || !changeNote.trim()}
                          className="mt-2 w-full rounded-[8px] bg-black py-2.5 text-[13px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                        >
                          {busy ? "Sending…" : "Send Change Request"}
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => void respond("declined")}
                      disabled={busy}
                      className="py-1 text-[13.5px] font-bold text-[#dc2626] hover:underline disabled:opacity-50"
                    >
                      Decline Quote
                    </button>
                    {quote.validUntil && (
                      <p className="flex items-center justify-between border-t border-[#f3f4f6] pt-3 text-[13px]">
                        <span className="font-semibold text-[#b45309]">⏱ Quote valid until:</span>
                        <span className="font-bold text-black">{fullDate(quote.validUntil)}</span>
                      </p>
                    )}
                    <p className="pt-1 text-center text-[12px] text-[#9ca3af]">
                      {getToken() && (quote.advancePct ?? 0) > 0
                        ? "Accepting pays the advance from your wallet and moves your order into production scheduling."
                        : "Accepting confirms the proposal — our team then arranges the advance payment and starts production."}
                    </p>
                  </div>
                )}

                {quote && quote.status !== "sent" && (
                  <p
                    className={`flex items-start gap-2 pt-4 text-[14.5px] font-bold ${
                      quote.status === "declined" ? "text-[#ba1a1a]" : "text-[#16a34a]"
                    }`}
                  >
                    {quote.status === "declined" ? (
                      <>
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> You declined this quote.
                      </>
                    ) : quote.status === "accepted" ? (
                      <>
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />{" "}
                        {quote.advancePaid?.amount
                          ? `Accepted — advance of ₹${quote.advancePaid.amount.toLocaleString("en-IN")} paid from your wallet.`
                          : "Accepted — our team will contact you to arrange payment."}
                      </>
                    ) : quote.status === "in_production" ? (
                      <>
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" /> Your order is in
                        production.
                      </>
                    ) : (
                      <>
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" /> This bulk order is
                        complete. Thank you!
                      </>
                    )}
                  </p>
                )}

                {!quote && !declined && (
                  <p className="pt-4 text-[13.5px] leading-6 text-[#6b7280]">
                    Your request is with our team. The proposal will appear here and
                    in your inbox — typically within 24 hours.
                  </p>
                )}
                {declined && !quote && (
                  <p className="pt-4 text-[13.5px] leading-6 text-[#ba1a1a]">
                    This request was declined. Contact us if you&apos;d like to discuss
                    an alternative.
                  </p>
                )}

                <div className="mt-5 flex flex-col gap-2.5 border-t border-[#f3f4f6] pt-4 text-[13.5px]">
                  {business.email && (
                    <a
                      href={`mailto:${business.email}?subject=${encodeURIComponent(`Bulk request BLK-${id.slice(-4).toUpperCase()}`)}`}
                      className="flex items-center gap-2.5 text-[#374151] hover:text-black"
                    >
                      <Mail className="h-4 w-4" /> Email support
                    </a>
                  )}
                  {business.phone && (
                    <a
                      href={`tel:${business.phone.replace(/[^+\d]/g, "")}`}
                      className="flex items-center gap-2.5 text-[#374151] hover:text-black"
                    >
                      <Phone className="h-4 w-4" /> Call us — {business.phone}
                    </a>
                  )}
                  <Link
                    href="/contact-us"
                    className="flex items-center gap-2.5 text-[#374151] hover:text-black"
                  >
                    <MessageSquare className="h-4 w-4" /> Contact form
                  </Link>
                </div>
              </section>

              {quote && (
                <button
                  onClick={() => void downloadPdf()}
                  className="flex items-center justify-center gap-2 rounded-[12px] border border-[#e5e7eb] bg-white py-3 text-[13.5px] font-bold text-black hover:border-black"
                >
                  <Download className="h-4 w-4" /> Download Proposal as PDF
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
