"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "What is the Minimum Order Quantity (MOQ)?",
    a: "Our minimum order quantity is 50 pieces per design. The 50 pieces can be split across sizes and colors of the same garment.",
  },
  {
    q: "Can I request a physical sample first?",
    a: "Yes — we ship a prototype of your custom product for approval before full production. Samples are free for orders of 500+ pieces; for smaller runs the sample cost is adjusted in your final invoice.",
  },
  {
    q: "What printing methods do you offer?",
    a: "DTF (Direct to Film), screen printing, DTG, embroidery and heat transfer. Our team recommends the best method for your artwork, fabric and volume during quoting.",
  },
  {
    q: "What is the standard production timeline?",
    a: "Standard production is 7-10 business days after design approval, plus shipping. Rush production (24-48 hours) is available for select products — mention your deadline in the quote request.",
  },
  {
    q: "What are the available payment options?",
    a: "50% advance to begin production and the balance before dispatch. We accept UPI, cards, net banking and bank transfer, and provide GST invoices for B2B orders.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto max-w-[760px] px-6">
        <h2 className="mb-10 text-center font-poppins text-[28px] font-semibold text-[#242424] sm:text-[32px]">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4">
          {FAQS.map((f, i) => (
            <div
              key={f.q}
              className="rounded-[8px] border border-[#e5e7eb] bg-white"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-[15px] font-semibold text-[#242424]">
                  {f.q}
                </span>
                {open === i ? (
                  <Minus className="h-4 w-4 shrink-0 text-[#6b7280]" />
                ) : (
                  <Plus className="h-4 w-4 shrink-0 text-[#6b7280]" />
                )}
              </button>
              {open === i && (
                <p className="px-6 pb-5 text-[14px] leading-6 text-[#6b7280]">
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
