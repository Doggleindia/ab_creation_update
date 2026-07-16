"use client";

import { ChevronDown } from "lucide-react";

const FILTERS = ["Category", "Print Method", "Size", "Color", "Price Range"];

const SORT_OPTIONS = [
  "Recommended",
  "Price: Low to High",
  "Price: High to Low",
  "Newest",
];

export default function CollectionFilterBar({
  total,
  sort,
  onSortChange,
}: {
  total: number;
  sort: string;
  onSortChange: (value: string) => void;
}) {
  return (
    <div className="sticky top-[73px] z-40 w-full border-b border-[#e9e9e9] bg-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-16">
        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              className="flex h-[38px] items-center gap-1.5 rounded-full border border-[#262626] bg-[#f0edeb] px-4 font-poppins text-[14px] tracking-[0.14px] text-[#1b1c1b] transition-colors hover:bg-[#e6e1dd]"
            >
              {f}
              <ChevronDown className="h-3 w-3" />
            </button>
          ))}
        </div>

        {/* Count + sort */}
        <div className="flex items-center gap-6">
          <span className="font-poppins text-[14px] tracking-[0.14px] text-brand-orange">
            {total} products
          </span>
          <label className="flex items-center gap-2">
            <span className="font-poppins text-[14px] font-semibold tracking-[0.14px] text-[#1b1c1b]">
              Sort By:
            </span>
            <span className="relative">
              <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none bg-transparent pr-5 font-poppins text-[14px] tracking-[0.14px] text-[#1b1c1b] focus:outline-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 text-[#1b1c1b]" />
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
