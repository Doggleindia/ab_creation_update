"use client";

import { Star } from "lucide-react";

export type Spec = { label: string; value: string };
export type RatingBar = {
  star: number;
  count: string;
  pct: number;
  color: string;
};
export type Review = {
  initials: string;
  name: string;
  rating: number;
  date: string;
  text: string;
  avatarBg: string;
  avatarText: string;
};

export type ProductInfo = {
  productDetails: string[];
  specifications: Spec[];
  material: string;
  careInstructions: string;
  rating: number;
  ratingCount: string;
  ratingBars: RatingBar[];
  reviews: Review[];
};

const DEFAULT_PRODUCT_DETAILS = [
  "Blue T-shirt for men",
  "Typography Printed",
  "Regular Length",
  "Short Sleeves,Regular Sleeves",
  "Round neckline",
  "Knitted cotton",
  "Slip-on closure",
];

const DEFAULT_SPECS: Spec[] = [
  { label: "Fabrics", value: "Cotton, Cotton" },
  { label: "Fashion Trends", value: "Typography or Slogan Print" },
  { label: "Fit", value: "Relaxed Fit" },
  { label: "Type", value: "Long Sleeve Tee" },
  { label: "Neck", value: "Round Neck" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating ? "fill-[#ff8c00] text-[#ff8c00]" : "text-[#d1d5db]"
          }`}
        />
      ))}
    </div>
  );
}

export default function ProductDetailInfo({ info }: { info: ProductInfo }) {
  const details = info.productDetails.length
    ? info.productDetails
    : DEFAULT_PRODUCT_DETAILS;
  const specs = info.specifications.length ? info.specifications : DEFAULT_SPECS;

  return (
    <section className="w-full border-t border-[#e9e9e9] bg-white px-4 py-14 sm:px-8 lg:px-[86.5px]">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Column 1: Details, Material & Care, Ratings & Reviews */}
          <div className="flex flex-col gap-10">
            {/* Product Details */}
            <div className="flex flex-col gap-4">
              <h2 className="font-poppins text-[20px] font-bold uppercase tracking-wide text-[#1b1c1b]">
                Product Details
              </h2>
              <ul className="flex flex-col gap-1.5 list-disc pl-5 text-[14px] leading-relaxed text-[#374151]">
                {details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            {/* Material & Care */}
            <div className="flex flex-col gap-3 pt-2">
              <h2 className="font-poppins text-[20px] font-bold uppercase tracking-wide text-[#1b1c1b]">
                MATERIAL &amp; CARE
              </h2>
              <div className="flex flex-col gap-3 text-[14px]">
                <div>
                  <span className="font-bold text-[#1b1c1b]">Material: </span>
                  <span className="text-[#4b5563]">
                    {info.material || "Upper: Synthetic, Sole: Rubber"}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-[#1b1c1b]">
                    Care Instructions:{" "}
                  </span>
                  <p className="mt-1 leading-relaxed text-[#4b5563]">
                    {info.careInstructions ||
                      "Wipe with a clean, dry cloth to remove dust. Use a branded leather conditioner if needed. Avoid washing in a machine."}
                  </p>
                </div>
              </div>
            </div>

            {/* Ratings & Reviews */}
            <div className="flex flex-col gap-6 pt-2">
              <h2 className="font-poppins text-[20px] font-bold uppercase tracking-wide text-[#1b1c1b]">
                RATINGS &amp; REVIEWS
              </h2>

              {/* Overall rating score */}
              <div className="flex items-center gap-4">
                <span className="font-poppins text-[40px] font-bold text-[#1b1c1b]">
                  {info.rating.toFixed(1)}
                </span>
                <div className="flex flex-col gap-1">
                  <Stars rating={Math.round(info.rating)} />
                  <span className="text-[13px] font-medium text-[#6b7280]">
                    54.3k Verified Buyers
                  </span>
                </div>
              </div>

              {/* Progress bars */}
              <div className="flex max-w-md flex-col gap-2.5">
                {info.ratingBars.map((b) => (
                  <div key={b.star} className="flex items-center gap-3">
                    <span className="w-3 text-[12px] font-bold text-[#1b1c1b]">
                      {b.star}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f3f4f6]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${b.pct}%`, backgroundColor: b.color }}
                      />
                    </div>
                    <span className="w-10 text-right text-[12px] text-[#6b7280]">
                      {b.count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Individual review cards */}
              <div className="mt-4 flex flex-col gap-4">
                {info.reviews.map((r) => (
                  <div
                    key={r.name}
                    className="flex flex-col gap-3 rounded-2xl border border-[#f3f4f6] bg-[#fafafa] p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold"
                          style={{
                            backgroundColor: r.avatarBg,
                            color: r.avatarText,
                          }}
                        >
                          {r.initials}
                        </span>
                        <div>
                          <p className="font-poppins text-[15px] font-bold text-[#1b1c1b]">
                            {r.name}
                          </p>
                          <Stars rating={r.rating} />
                        </div>
                      </div>
                      <span className="text-[11px] font-medium uppercase text-[#9ca3af]">
                        {r.date}
                      </span>
                    </div>

                    <p className="text-[14px] leading-relaxed text-[#4b5563]">
                      {r.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Specifications */}
          <div className="flex flex-col gap-4">
            <h2 className="font-poppins text-[20px] font-bold uppercase tracking-wide text-[#1b1c1b]">
              SPECIFICATIONS
            </h2>
            <div className="flex flex-col border-t border-b border-[#e5e7eb]">
              {specs.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between border-b border-[#e5e7eb] py-3.5 last:border-b-0"
                >
                  <span className="text-[14px] font-bold text-[#1b1c1b]">
                    {s.label}
                  </span>
                  <span className="text-[13.5px] font-medium text-[#4b5563]">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
