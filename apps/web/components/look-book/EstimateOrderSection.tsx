"use client";

import Link from "next/link";
import FeatureStrip from "@/components/common/FeatureStrip";

export default function EstimateOrderSection() {
  return (
    <>
      {/* ESTIMATE YOUR ORDER CTA */}
      <section className="w-full bg-white">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-24 py-12">
          <div className="mx-auto max-w-[640px] rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-[#171717] text-[22px] sm:text-[24px] font-bold leading-tight">
                Estimate Your Order
              </h3>
              <p className="mt-1 text-[#6B7280] text-[15px]">
                Simple. Fast. No hidden costs.
              </p>
            </div>

            <Link
              href="/request-quote"
              className="
                whitespace-nowrap
                rounded-md
                bg-[#B87D4C]
                hover:bg-[#a66e40]
                text-white
                text-[13px]
                font-semibold
                tracking-wide
                uppercase
                px-6
                py-3
                transition-colors
              "
            >
              Request a Quote Now
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <FeatureStrip />
    </>
  );
}
