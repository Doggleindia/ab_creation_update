import { Star } from "lucide-react";

export type Spec = { label: string; value: string };
export type RatingBar = { star: number; count: string; pct: number; color: string };
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

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating ? "fill-[#f5a623] text-[#f5a623]" : "text-[#d1d5db]"
          }`}
        />
      ))}
    </div>
  );
}

export default function ProductDetailInfo({ info }: { info: ProductInfo }) {
  return (
    <section className="w-full border-t border-[#e9e9e9] bg-white px-4 py-12 sm:px-8 lg:px-[86.5px]">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-2">
          {/* Product Details */}
          <div className="flex flex-col gap-4">
            <h2 className="font-poppins text-[20px] font-bold text-[#1b1c1b]">
              Product Details
            </h2>
            <ul className="list-disc pl-5 text-[14px] leading-[22.75px] text-[#3d3d3d]">
              {info.productDetails.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          <div className="flex flex-col gap-4">
            <h2 className="font-poppins text-[20px] font-bold text-[#1b1c1b]">
              Specifications
            </h2>
            <div className="flex flex-col">
              {info.specifications.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between border-b border-[#707070] py-2"
                >
                  <span className="text-[14px] font-bold text-black">
                    {s.label}
                  </span>
                  <span className="text-[12px] font-semibold text-[#1b1c1b]">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Material & Care */}
          <div className="flex flex-col gap-4">
            <h2 className="font-poppins text-[20px] font-bold text-[#1b1c1b]">
              Material &amp; Care
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[14px] font-bold text-[#1b1c1b]">
                  Material:
                </span>
                <span className="text-[14px] text-[#5a4136]">
                  {info.material}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[14px] font-bold text-[#1b1c1b]">
                  Care Instructions:
                </span>
                <span className="text-[14px] leading-[22.75px] text-[#5a4136]">
                  {info.careInstructions}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ratings & Reviews */}
        <div className="mt-12 flex flex-col gap-6">
          <h2 className="font-poppins text-[20px] font-bold text-[#1b1c1b]">
            Ratings &amp; Reviews
          </h2>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
            {/* Score + bars */}
            <div className="flex max-w-md flex-col gap-4">
              <div className="flex items-end gap-4">
                <span className="text-[36px] font-bold leading-none text-[#1b1c1b]">
                  {info.rating.toFixed(1)}
                </span>
                <div className="flex flex-col gap-1">
                  <Stars rating={Math.round(info.rating)} />
                  <span className="text-[12px] font-medium text-[#5a4136]">
                    {info.ratingCount} Verified Buyers
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {info.ratingBars.map((b) => (
                  <div key={b.star} className="flex items-center gap-3">
                    <span className="w-3 text-[10px] font-bold text-[#1b1c1b]">
                      {b.star}
                    </span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#f0edeb]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${b.pct}%`, backgroundColor: b.color }}
                      />
                    </div>
                    <span className="w-11 text-[10px] font-medium text-[#5a4136]">
                      {b.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="flex flex-col gap-4">
              {info.reviews.map((r) => (
                <div
                  key={r.name}
                  className="flex flex-col gap-3 rounded-xl border border-[#e2bfb0]/20 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-bold"
                        style={{ backgroundColor: r.avatarBg, color: r.avatarText }}
                      >
                        {r.initials}
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className="text-[14px] font-bold text-[#1b1c1b]">
                          {r.name}
                        </span>
                        <Stars rating={r.rating} />
                      </div>
                    </div>
                    <span className="text-[10px] font-medium uppercase text-[#5a4136]/60">
                      {r.date}
                    </span>
                  </div>
                  <p className="text-[14px] leading-[22.75px] text-[#5a4136]">
                    {r.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
