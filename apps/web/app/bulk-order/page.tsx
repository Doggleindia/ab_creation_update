import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  FileText,
  Phone,
  ReceiptText,
  Star,
  Truck,
} from "lucide-react";
import ProductsCatalogSection from "@/components/seller/ProductsCatalogSection";
import FaqSection from "@/components/bulk/FaqSection";

export const metadata: Metadata = {
  title: "Bulk Orders | AB Creation",
  description:
    "Custom printing at scale — 50 to 5,000 pieces of branded apparel for your team, event, or business. Printing, packing, and delivery handled.",
};

const HERO_POINTS = [
  "Free samples (500+ orders)",
  "Pan-India delivery",
  "7-day production",
];

const PROCESS = [
  {
    num: "01",
    icon: FileText,
    title: "Tell us what you need",
    copy: "Fill out our quick form with quantity, garment type, and print placement details.",
  },
  {
    num: "02",
    icon: ReceiptText,
    title: "Get a custom quote",
    copy: "Our experts will calculate the best price based on your volume and design complexity.",
  },
  {
    num: "03",
    icon: BadgeCheck,
    title: "Approve a sample",
    copy: "Review a digital mockup or physical sample to ensure everything is perfect before production.",
  },
  {
    num: "04",
    icon: Truck,
    title: "Start Earning",
    copy: "Start selling your design on our platform and start earning and make profit.",
  },
];

const PRICING = {
  tiers: ["50-99", "100-249", "250-499", "500+"],
  columns: [
    { label: "T-Shirts from", prices: ["₹249", "₹219", "₹199"] },
    { label: "Polos from", prices: ["₹399", "₹349", "₹319"] },
    { label: "Hoodies from", prices: ["₹549", "₹499", "₹449"] },
  ],
};

const CLIENT_LOGOS = ["Ascend", "Northside", "Cinder Co.", "Loop Labs"];

export default function BulkOrderPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-[#171717]">
        <Image
          src="/images/bulk/hero-stack.png"
          alt="Stack of custom printed apparel"
          fill
          priority
          className="object-cover opacity-80"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative mx-auto max-w-[1280px] px-6 py-20 lg:px-10 lg:py-24">
          <span className="flex w-fit items-center gap-2 rounded-full bg-[#fdf9ef] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[1px] text-[#b07d1a]">
            <Star className="h-3 w-3 fill-[#b07d1a]" /> Bulk Orders
          </span>
          <h1 className="max-w-[560px] pt-5 font-poppins text-[36px] font-semibold leading-tight text-white sm:text-[44px]">
            Custom Printing at Scale
          </h1>
          <p className="max-w-[480px] pt-4 text-[16px] leading-7 text-white/80">
            From 50 to 5,000 pieces — branded apparel for your team, event, or
            business. We handle printing, packing, and delivery.
          </p>
          <div className="flex flex-wrap gap-4 pt-8">
            <Link
              href="/bulk-order/quote"
              className="rounded-full bg-brand-orange px-7 py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
            >
              Request a Quote
            </Link>
            <a
              href="tel:+919876543210"
              className="flex items-center gap-2 rounded-full border border-brand-orange px-7 py-3.5 text-[15px] font-bold text-brand-orange transition-colors hover:bg-brand-orange hover:text-white"
            >
              <Phone className="h-4 w-4" /> Call Us: +91 98765 43210
            </a>
          </div>
          <div className="flex flex-wrap gap-8 border-t border-white/20 pt-6 mt-10">
            {HERO_POINTS.map((p) => (
              <span
                key={p}
                className="flex items-center gap-2 text-[13px] text-white/90"
              >
                <CheckCircle2 className="h-4 w-4 text-[#f0c96b]" /> {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="w-full border-b border-[#f3f4f6] bg-white py-6">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-6 px-6 lg:px-10">
          <span className="text-[15px] font-bold text-[#242424]">
            Trusted by 200+ organizations
          </span>
          <div className="hidden items-center gap-10 md:flex">
            {CLIENT_LOGOS.map((l) => (
              <span
                key={l}
                className="font-poppins text-[15px] font-semibold uppercase tracking-wide text-[#c8c6c5]"
              >
                {l}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-2 text-[13px] text-[#374151]">
            <span className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-[#f0b429] text-[#f0b429]"
                />
              ))}
            </span>
            4.8/5 average rating from bulk clients
          </span>
        </div>
      </section>

      {/* How bulk ordering works */}
      <section className="w-full bg-[#0d0d0d] py-20">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <h2 className="mb-12 text-center font-poppins text-[28px] font-semibold text-white sm:text-[32px]">
            How bulk ordering works
          </h2>
          <span className="mx-auto -mt-9 mb-12 block h-[3px] w-12 rounded-full bg-brand-orange" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map(({ num, icon: Icon, title, copy }) => (
              <div
                key={num}
                className="flex flex-col gap-4 rounded-[12px] border border-brand-orange/60 bg-[#121212] p-6"
              >
                <div className="flex items-start justify-between">
                  <span className="font-poppins text-[28px] font-bold text-brand-orange">
                    {num}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-brand-orange">
                    <Icon className="h-4 w-4 text-white" />
                  </span>
                </div>
                <h3 className="text-[16px] font-bold text-white">{title}</h3>
                <p className="text-[13px] leading-5 text-white/60">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing table */}
      <section className="w-full bg-[#faf3ea] py-16">
        <div className="mx-auto max-w-[860px] px-6">
          <h2 className="mb-10 text-center font-poppins text-[26px] font-semibold text-[#242424] sm:text-[30px]">
            Bulk pricing that scales with your order
          </h2>
          <div className="overflow-x-auto rounded-[12px] bg-white shadow-sm">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-[#f3f4f6] text-[13px] text-[#6b7280]">
                  <th className="px-6 py-4 font-medium">Quantity</th>
                  {PRICING.columns.map((c) => (
                    <th key={c.label} className="px-6 py-4 font-medium">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[14px] text-[#242424]">
                {PRICING.tiers.map((tier, row) => (
                  <tr
                    key={tier}
                    className={row % 2 === 1 ? "bg-[#f9fafb]" : ""}
                  >
                    <td className="px-6 py-4 font-medium">{tier}</td>
                    {PRICING.columns.map((c) => (
                      <td
                        key={c.label}
                        className={`px-6 py-4 ${row === 3 ? "font-bold" : ""}`}
                      >
                        {row === 3 ? "Custom quote" : c.prices[row]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pt-4 text-center text-[12px] text-[#9ca3af]">
            Final pricing depends on print method, number of colors, and
            garment selection. Request a quote for exact pricing.
          </p>
        </div>
      </section>

      {/* Products */}
      <ProductsCatalogSection
        eyebrow={null}
        title="Products available for bulk"
        sub={null}
        background="bg-white"
      />

      {/* CTA band */}
      <section className="relative w-full overflow-hidden bg-[#faf3ea]">
        <div className="mx-auto flex min-h-[280px] max-w-[1280px] flex-col items-start justify-center gap-4 px-6 py-12 lg:px-10">
          <div className="relative z-10 max-w-[520px]">
            <h2 className="font-poppins text-3xl font-semibold text-[#111827] sm:text-[36px]">
              Ready to place a bulk order?
            </h2>
            <p className="mt-3 text-[17px] font-medium text-black">
              Get a custom quote in under 24 hours from our team.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <Link
                href="/bulk-order/quote"
                className="rounded-full bg-brand-orange px-6 py-2.5 text-[13px] font-bold text-white shadow-[0px_7px_10px_-2px_#fed7aa] transition-opacity hover:opacity-90"
              >
                Request a quote
              </Link>
              <Link
                href="/contact-us"
                className="rounded-full border border-black bg-white px-6 py-2.5 text-[13px] font-bold text-black transition-colors hover:bg-black hover:text-white"
              >
                Contact us
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-[420px] lg:block">
            <Image
              src="/images/home/seller-partner.png"
              alt="Bulk apparel order in a cart"
              fill
              className="object-contain object-bottom"
              sizes="420px"
            />
          </div>
        </div>
      </section>

      <FaqSection />
    </main>
  );
}
