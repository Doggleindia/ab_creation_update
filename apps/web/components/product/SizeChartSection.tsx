"use client";

import Image from "next/image";
import type { ProductMeasurement } from "@/lib/api";

const CHART: ProductMeasurement[] = [
  { size: "Small", chest: 38.0, length: 26.5, shoulder: 16.5 },
  { size: "Medium", chest: 40.0, length: 27.5, shoulder: 17.5 },
  { size: "Large", chest: 42.0, length: 28.5, shoulder: 18.5 },
  { size: "XL", chest: 44.0, length: 29.5, shoulder: 19.5 },
];

export default function SizeChartSection({
  measurements,
}: {
  measurements?: ProductMeasurement[];
}) {
  const rows = measurements?.length ? measurements : CHART;

  return (
    <section
      id="size-chart"
      className="w-full scroll-mt-24 border-t border-[#e9e9e9] bg-white px-4 py-14 sm:px-8 lg:px-[86.5px]"
    >
      <div className="mx-auto max-w-[1280px]">
        <h2 className="pb-8 font-poppins text-[22px] font-bold text-[#1b1c1b]">
          Size &amp; Fit Guide
        </h2>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          {/* Size table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-[#e5e7eb] text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">
                  <th className="py-3 pr-4">SIZE (IN)</th>
                  <th className="py-3 pr-4">CHEST</th>
                  <th className="py-3 pr-4">LENGTH</th>
                  <th className="py-3">SHOULDER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f6]">
                {rows.map((r) => {
                  const isHighlighted = r.size === "Medium";
                  return (
                    <tr
                      key={r.size}
                      className={`transition-colors ${
                        isHighlighted ? "bg-[#f9fafb]" : ""
                      }`}
                    >
                      <td className="py-4 pr-4 font-bold text-[#1b1c1b]">
                        {r.size}
                      </td>
                      <td className="py-4 pr-4 text-[#4b5563]">
                        {r.chest?.toFixed(1) ?? "—"}
                      </td>
                      <td className="py-4 pr-4 text-[#4b5563]">
                        {r.length?.toFixed(1) ?? "—"}
                      </td>
                      <td className="py-4 text-[#4b5563]">
                        {r.shoulder?.toFixed(1) ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right diagram illustration card */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e5e7eb] bg-[#fafafa] p-8 text-center">
            <div className="relative h-44 w-56 overflow-hidden rounded-lg bg-white p-4 shadow-sm">
              <Image
                src="/images/home/cat-polo.png"
                alt="Tee measurement guide"
                fill
                className="object-contain p-2 opacity-80"
              />
            </div>
            <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-[#6b7280]">
              Measure your favorite tee flat and compare for the best results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
