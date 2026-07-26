import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Zap, ShieldCheck } from "lucide-react";
import type { SiteContent } from "@/lib/api";

const FEATURES = [
  { icon: <Star className="h-5 w-5 fill-amber-400 text-amber-400" />, label: "4.9/5 RATED BY 10,000+ CUSTOMERS" },
  { icon: <Zap className="h-5 w-5 fill-amber-500 text-amber-500" />, label: "FAST 3-DAY EXPRESS DELIVERY" },
  { icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />, label: "100% SATISFACTION GUARANTEED" },
];

export default function Hero({
  content,
  trust,
}: {
  content?: SiteContent["hero"];
  trust?: SiteContent["trustBadges"];
}) {
  const heading1 = content?.heading1 || "Printed for You.";
  const heading2 = content?.heading2 || "Built for Your Brand.";
  const subheading =
    content?.subheading ||
    "Custom apparel and merchandise built for scale. Print on demand or bulk.";
  const cta1 = content?.cta1 || "Start Customizing";
  const cta2 = content?.cta2 || "Explore Collection";

  return (
    <section className="w-full bg-white">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-12 px-4 pb-12 pt-8 sm:px-8 lg:pt-12">
        {/* Hero row */}
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Copy (Left 6 cols) */}
          <div className="flex flex-col items-start gap-8 lg:col-span-6">
            <div className="flex flex-col gap-4">
              {content?.badge && (
                <span className="w-fit rounded-full bg-[#111827] px-4 py-1.5 text-[12px] font-bold uppercase tracking-[1px] text-white">
                  {content.badge}
                </span>
              )}
              <h1 className="font-poppins text-4xl font-extrabold tracking-tight text-[#111827] sm:text-5xl lg:text-[56px] lg:leading-[1.15]">
                {heading1}
                <br />
                {heading2}
              </h1>
              <p className="max-w-[540px] font-poppins text-[16px] leading-relaxed text-[#4b5563] sm:text-[18px]">
                {subheading}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/design-studio"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-orange px-8 py-3.5 text-[16px] font-bold text-white shadow-md transition-all hover:bg-brand-orange/90 hover:shadow-lg"
              >
                {cta1}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/collection"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#111827] px-8 py-3.5 text-[16px] font-bold text-[#111827] transition-all hover:bg-[#111827] hover:text-white"
              >
                {cta2}
              </Link>
            </div>
          </div>

          {/* Collage (Right 6 cols) */}
          <div className="relative mx-auto aspect-square w-full max-w-[520px] lg:col-span-6">
            <Image
              src="/images/home/hero-base.png"
              alt="Custom printed apparel"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 90vw, 520px"
            />
          </div>
        </div>

        {/* Feature / Trust Badges banner */}
        {trust?.visible !== false && (
          <div className="grid w-full grid-cols-1 gap-4 rounded-2xl border border-[#e5e7eb] bg-[#fafafa] p-3 shadow-sm sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 shadow-[0px_1px_3px_rgba(0,0,0,0.06)]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50">
                  {f.icon}
                </div>
                <span className="font-poppins text-[13px] font-bold tracking-wider text-[#111827]">
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
