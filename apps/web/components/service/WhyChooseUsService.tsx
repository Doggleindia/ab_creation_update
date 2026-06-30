"use client";

import Image from "next/image";
import { Wallet, Zap, Eye, Printer } from "lucide-react";

const FEATURES = [
  {
    icon: Wallet,
    title: "WALLET SECURITY",
    desc: "Instant, secure one-click payments through our integrated digital wallet.",
  },
  {
    icon: Zap,
    title: "PRODUCTION SPEED",
    desc: "Fast production, your design from screen to print in record time.",
  },
  {
    icon: Eye,
    title: "TOTAL VISIBILITY",
    desc: "Track every moving stage of your order, from the first drop to delivery.",
  },
  {
    icon: Printer,
    title: "MULTI-METHOD PRINTING",
    desc: "Professional grade DTF and Screen Printing results that surpass the competition.",
  },
];

const STATS = [
  { value: "287", label: "PRODUCTS" },
  { value: "84", label: "CATEGORIES" },
  { value: "970", label: "DESIGNS" },
  { value: "15+", label: "YEARS OF EXPERTISE" },
];

export default function WhyChooseUsService() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* BACKGROUND */}
      <Image
        src="/images/home/choose-us-bg.png"
        alt=""
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-white/70" />

      <div className="relative max-w-[1200px] mx-auto px-4 py-20">
        {/* PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] rounded-2xl overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]">
          {/* LEFT: FEATURES */}
          <div className="bg-white p-8 sm:p-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title}>
                  <Icon
                    className="h-7 w-7 text-[#B87D4C]"
                    strokeWidth={1.75}
                  />
                  <h4 className="mt-4 text-[14px] font-bold tracking-wide text-[#171717]">
                    {title}
                  </h4>
                  <p className="mt-2 text-[13px] text-[#777] leading-[20px]">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: BROWN CARD */}
          <div className="bg-[#7A4A2B] text-white p-8 sm:p-12 flex flex-col justify-center">
            <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-white/70 mb-4">
              Why Choose Us
            </p>
            <h2 className="text-[26px] sm:text-[30px] font-bold leading-tight">
              The Smarter Way to Print and Pay
            </h2>
            <p className="mt-5 text-[14px] leading-[24px] text-white/85">
              We focus on the two pillars of your business — advanced production
              and financial convenience. A frictionless experience that
              traditional print shops cannot match.
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center text-center"
            >
              <span className="text-[40px] sm:text-[48px] font-bold text-[#171717] leading-none">
                {s.value}
              </span>
              <span className="mt-2 text-[12px] font-semibold tracking-wide uppercase text-[#777]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
