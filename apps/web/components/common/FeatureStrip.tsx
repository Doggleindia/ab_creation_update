"use client";

import { Award, ShieldCheck, Truck, Headphones } from "lucide-react";

const FEATURES = [
  {
    icon: Award,
    title: "High Quality",
    subtitle: "crafted from top materials",
  },
  {
    icon: ShieldCheck,
    title: "Warranty Protection",
    subtitle: "Over 2 years",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    subtitle: "Order over 150 $",
  },
  {
    icon: Headphones,
    title: "24 / 7 Support",
    subtitle: "Dedicated support",
  },
];

export default function FeatureStrip() {
  return (
    <section className="w-full bg-[#F5F1EA]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-24 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map(({ icon: Icon, title, subtitle }) => (
            <div key={title} className="flex items-center gap-4">
              <Icon className="h-9 w-9 text-[#171717] shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-[#171717] text-[16px] font-semibold leading-tight">
                  {title}
                </p>
                <p className="text-[#6B7280] text-[14px] leading-tight">
                  {subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
