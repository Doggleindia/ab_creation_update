"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BadgeCheck, ChevronRight, FileText, XCircle } from "lucide-react";
import { BACKEND } from "@/lib/auth";

type Quote = {
  amount?: number;
  notes?: string;
  status?: "sent" | "accepted" | "declined" | "in_production" | "completed";
  sentAt?: string;
};

type QuoteData = {
  businessName: string;
  contactName: string;
  expectedVolume?: string;
  quote: Quote;
};

export default function BulkQuotePage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const [data, setData] = useState<QuoteData | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${BACKEND}/api/applications/${encodeURIComponent(id)}/quote`)
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const j = await r.json();
        setData(j.data);
        setState("ok");
      })
      .catch(() => setState("missing"));
  }, [id]);

  async function respond(decision: "accepted" | "declined") {
    if (
      decision === "declined" &&
      !window.confirm("Decline this quote? Our team can prepare a revised one if the pricing doesn't work for you.")
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
          body: JSON.stringify({ decision }),
        },
      );
      const j = await r.json();
      if (!r.ok) throw new Error(j?.message || "Could not submit your response");
      setMessage(j.message);
      setData((d) =>
        d ? { ...d, quote: { ...d.quote, status: decision } } : d,
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const quote = data?.quote;

  return (
    <main className="w-full bg-white px-4 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[640px]">
        <nav className="flex items-center gap-2 pb-8 text-[13px]">
          <Link href="/" className="text-[#6b7280] hover:text-brand-orange">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <Link href="/bulk-order" className="text-[#6b7280] hover:text-brand-orange">
            Bulk Orders
          </Link>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <span className="font-semibold text-black">Quote</span>
        </nav>

        {state === "loading" && (
          <p className="py-16 text-center text-[14px] text-[#9ca3af]">
            Loading your quote…
          </p>
        )}

        {state === "missing" && (
          <div className="rounded-[12px] border border-[#e5e7eb] p-12 text-center">
            <h1 className="text-[22px] font-bold text-black">Quote not found</h1>
            <p className="pt-2 text-[14px] leading-6 text-[#6b7280]">
              This quote link is invalid or the quote hasn&apos;t been prepared
              yet. If you received it by email, double-check the link — or
              contact us and we&apos;ll resend it.
            </p>
            <Link
              href="/contact-us"
              className="mt-6 inline-block rounded-full bg-black px-7 py-2.5 text-[14px] font-bold text-white hover:opacity-85"
            >
              Contact Us
            </Link>
          </div>
        )}

        {state === "ok" && data && quote && (
          <div className="rounded-[12px] border border-[#e5e7eb] p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f4f6] text-black">
              <FileText className="h-5 w-5" />
            </span>
            <h1 className="pt-5 text-[26px] font-bold tracking-[-0.5px] text-black">
              Your Bulk Order Quote
            </h1>
            <p className="pt-1 text-[14px] text-[#6b7280]">
              Prepared for {data.contactName} · {data.businessName}
            </p>

            <div className="mt-6 rounded-[10px] bg-[#f8f9fb] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                Quoted Amount
              </p>
              <p className="pt-1 text-[36px] font-bold leading-none text-black">
                ₹{(quote.amount ?? 0).toLocaleString("en-IN")}
              </p>
              {data.expectedVolume && (
                <p className="pt-2 text-[13px] text-[#6b7280]">
                  For your enquiry of {data.expectedVolume}
                </p>
              )}
              {quote.notes && (
                <p className="mt-4 border-t border-[#e5e7eb] pt-4 text-[14px] leading-6 text-[#374151]">
                  {quote.notes}
                </p>
              )}
            </div>

            {message && (
              <p className="mt-5 rounded-[8px] bg-[#f0fdf4] px-4 py-3 text-[13.5px] font-medium text-[#166534]">
                {message}
              </p>
            )}

            {quote.status === "sent" ? (
              <div className="flex flex-col gap-3 pt-6 sm:flex-row">
                <button
                  onClick={() => void respond("accepted")}
                  disabled={busy}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand-orange text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <BadgeCheck className="h-4 w-4" /> Accept Quote
                </button>
                <button
                  onClick={() => void respond("declined")}
                  disabled={busy}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#c4c7c7] text-[15px] font-bold text-black transition-colors hover:border-black disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" /> Decline
                </button>
              </div>
            ) : (
              <p
                className={`mt-6 flex items-center gap-2 text-[15px] font-bold ${
                  quote.status === "declined" ? "text-[#ba1a1a]" : "text-[#16a34a]"
                }`}
              >
                {quote.status === "declined" ? (
                  <>
                    <XCircle className="h-4 w-4" /> You declined this quote.
                  </>
                ) : quote.status === "in_production" ? (
                  <>
                    <BadgeCheck className="h-4 w-4" /> Quote accepted — your
                    order is now in production.
                  </>
                ) : quote.status === "completed" ? (
                  <>
                    <BadgeCheck className="h-4 w-4" /> This bulk order has been
                    completed. Thank you!
                  </>
                ) : (
                  <>
                    <BadgeCheck className="h-4 w-4" /> You accepted this quote —
                    our team will contact you shortly.
                  </>
                )}
              </p>
            )}

            <p className="pt-6 text-[12.5px] leading-5 text-[#9ca3af]">
              Questions about the pricing or timeline?{" "}
              <Link href="/contact-us" className="underline hover:text-black">
                Contact us
              </Link>{" "}
              and mention your business name.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
