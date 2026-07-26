import { Printer, Leaf } from "lucide-react";
import type { ProductMeasurement } from "@/lib/api";

// Generic fallback used when the garment has no measurements configured yet.
const CHART: ProductMeasurement[] = [
  { size: "XS", chest: 36, length: 26, sleeve: 7.5 },
  { size: "S", chest: 38, length: 27, sleeve: 8 },
  { size: "M", chest: 40, length: 28, sleeve: 8.5 },
  { size: "L", chest: 42, length: 29, sleeve: 9 },
  { size: "XL", chest: 44, length: 30, sleeve: 9.5 },
];

const METHODS = [
  {
    icon: Printer,
    title: "DTF Excellence",
    copy: "We use state-of-the-art Direct to Film printing which allows for photorealistic details and vibrant gold accents that won't crack or fade over time. The feel is soft and flexible on the garment.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Inks",
    copy: "Our inks are OEKO-TEX® certified, meaning they are safe for skin contact and environmentally conscious. We minimize water waste during our production process.",
  },
];

export default function SizeChartSection({
  measurements,
}: {
  measurements?: ProductMeasurement[];
}) {
  const rows = measurements?.length ? measurements : CHART;
  const hasShoulder = rows.some((r) => r.shoulder != null);
  return (
    <section
      id="size-chart"
      className="w-full scroll-mt-24 border-t border-[#e9e9e9] bg-white px-4 py-14 sm:px-8 lg:px-[86.5px]"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-14 lg:grid-cols-2">
        {/* Size chart */}
        <div>
          <h2 className="pb-8 font-poppins text-[24px] font-bold text-black">
            Size Chart
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-[14px]">
              <thead>
                <tr className="border-b-2 border-black text-[11px] font-bold uppercase tracking-[0.5px] text-[#374151]">
                  <th className="py-3 pr-4">Size</th>
                  <th className="py-3 pr-4">Chest (in)</th>
                  <th className="py-3 pr-4">Length (in)</th>
                  {hasShoulder && <th className="py-3 pr-4">Shoulder (in)</th>}
                  <th className="py-3">Sleeve (in)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.size}
                    className={`border-b border-[#f3f4f6] ${
                      r.size === "M" ? "bg-[#f9fafb]" : ""
                    }`}
                  >
                    <td className="py-4 pr-4 font-bold text-black">{r.size}</td>
                    <td className="py-4 pr-4 text-[#374151]">{r.chest ?? "—"}</td>
                    <td className="py-4 pr-4 text-[#374151]">{r.length ?? "—"}</td>
                    {hasShoulder && (
                      <td className="py-4 pr-4 text-[#374151]">{r.shoulder ?? "—"}</td>
                    )}
                    <td className="py-4 text-[#374151]">{r.sleeve ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printing methods */}
        <div>
          <h2 className="pb-8 font-poppins text-[24px] font-bold text-black">
            Our Printing Methods
          </h2>
          <div className="flex flex-col gap-8">
            {METHODS.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="flex gap-5">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] ${
                    title === "DTF Excellence"
                      ? "bg-black text-white"
                      : "border border-[#c4c7c7] text-black"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[16px] font-bold text-black">{title}</h3>
                  <p className="pt-2 text-[14px] leading-6 text-[#6b7280]">
                    {copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
