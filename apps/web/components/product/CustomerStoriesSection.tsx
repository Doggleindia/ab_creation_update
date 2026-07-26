"use client";

import { Star } from "lucide-react";

export default function CustomerStoriesSection() {
  const reviews = [
    {
      name: "Rahul M.",
      verified: true,
      stars: 5,
      comment:
        '"The 180 GSM cotton feels incredibly premium. It\'s thick enough to feel high-end but breathable for daily wear."',
      ordered: "Ordered: 50x DTF Print White",
    },
    {
      name: "Sneha Kapur",
      verified: true,
      stars: 5,
      comment:
        '"Best fitting t-shirt I\'ve found for my brand. The shoulder seams are clean and the neck doesn\'t sag after washes."',
      ordered: "Ordered: 120x Screen Print Navy",
    },
    {
      name: "David L.",
      verified: true,
      stars: 5,
      comment:
        '"Print quality is sharp. I used the DTF option for my complex logo and it came out perfectly."',
      ordered: "Ordered: 5x DTF Print Black",
    },
  ];

  return (
    <section className="w-full border-t border-[#e9e9e9] bg-white px-4 py-14 sm:px-8 lg:px-[86.5px]">
      <div className="mx-auto max-w-[1280px]">
        {/* Header line */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8">
          <div>
            <h2 className="font-poppins text-[22px] font-bold text-[#1b1c1b]">
              Customer Stories
            </h2>
            <p className="text-[13px] text-[#6b7280]">
              Based on 128 verified purchases
            </p>
          </div>

          <button className="rounded-lg border border-[#1b1c1b] px-5 py-2 text-[14px] font-semibold text-[#1b1c1b] transition-colors hover:bg-black hover:text-white">
            Write a Review
          </button>
        </div>

        {/* 3 Review Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.map((rev) => (
            <div
              key={rev.name}
              className="flex flex-col justify-between rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div>
                {/* Name & Stars */}
                <div className="flex items-center justify-between">
                  <span className="font-poppins text-[16px] font-bold text-[#1b1c1b]">
                    {rev.name}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: rev.stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-black text-black"
                      />
                    ))}
                  </div>
                </div>

                {/* Verified Buyer */}
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                  VERIFIED BUYER
                </span>

                {/* Quote */}
                <p className="mt-4 text-[14px] leading-relaxed text-[#374151]">
                  {rev.comment}
                </p>
              </div>

              {/* Ordered variant footer */}
              <div className="mt-6 pt-4 text-[12px] font-medium text-[#6b7280]">
                {rev.ordered}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
