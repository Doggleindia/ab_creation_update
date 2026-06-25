"use client";

import { Zap, Eye, Wallet, Printer } from "lucide-react";

const features = [
  {
    number: "01",
    icon: Wallet,
    title: "Wallet Security",
    description:
      "Your payments are protected at every step. Funds are held safely and released only when your order is confirmed and delivered.",
  },
  {
    number: "02",
    icon: Zap,
    title: "Production Speed",
    description:
      "We move fast. From order confirmation to production, your prints are processed and dispatched with zero unnecessary delays.",
  },
  {
    number: "03",
    icon: Eye,
    title: "Total Visibility",
    description:
      "Track every stage of your order in real time. No guessing, no waiting — you always know exactly where your order stands.",
  },
  {
    number: "04",
    icon: Printer,
    title: "Multi-Method Printing",
    description:
      "Choose from DTF, Embroidery, and Screen Printing all under one roof. The right method for every product and every budget.",
  },
];

export default function SmarterWaySection() {
  return (
    <section className="bg-[#171717] text-white py-20 md:py-28 font-sans">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* HEADING */}
        <div className="text-center mb-16">
          <p className="text-[#CBAA75] text-[13px] font-bold tracking-[0.2em] uppercase mb-5">
            Why Choose Us
          </p>
          <h2 className="text-4xl md:text-[44px] font-bold mb-6 text-white tracking-tight">
            The Smarter Way to Print and Pay
          </h2>
          <p className="text-[#a1a1aa] text-[15px] md:text-[17px] max-w-3xl mx-auto leading-relaxed">
            We focus on the two pillars of your business — advanced production <br className="hidden md:block"/>
            and financial convenience. A frictionless experience that traditional print shops cannot match.
          </p>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.number}
                className="bg-[#18181b] border border-[#B87D4C] rounded-[16px] p-8 flex flex-col"
              >
                <div className="flex justify-between items-start mb-14">
                  <span className="text-2xl font-bold text-[#B87D4C] leading-none">
                    {feature.number}
                  </span>
                  <Icon className="w-[26px] h-[26px] text-[#B87D4C]" strokeWidth={2} />
                </div>
                <h3 className="text-[22px] font-bold mb-4 text-white">
                  {feature.title}
                </h3>
                <p className="text-[#a1a1aa] leading-relaxed text-[15px]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}