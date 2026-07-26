"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import FilterDropdown, { type FilterOption } from "./FilterDropdown";

const PRINT_METHODS: FilterOption[] = [
  { label: "DTF Print", value: "DTF" },
  { label: "Screen Print", value: "Screen" },
  { label: "Embroidery", value: "Embroidery" },
  { label: "Heat Transfer", value: "Heat Transfer" },
];

const SIZES: FilterOption[] = ["XS", "S", "M", "L", "XL", "XXL"].map((s) => ({
  label: s,
  value: s,
}));

const COLORS: FilterOption[] = [
  "Black",
  "White",
  "Navy",
  "Gray",
  "Red",
  "Blue",
  "Green",
].map((c) => ({ label: c, value: c }));

const PRICE_RANGES: FilterOption[] = [
  { label: "$0 – $25", value: "0-25" },
  { label: "$25 – $50", value: "25-50" },
  { label: "$50 – $100", value: "50-100" },
  { label: "$100+", value: "100+" },
];

const SORT_OPTIONS: FilterOption[] = [
  { label: "Recommended", value: "" },
  { label: "Price: Low to High", value: "priceLowToHigh" },
  { label: "Price: High to Low", value: "priceHighToLow" },
  { label: "Newest", value: "latest" },
  { label: "Oldest", value: "oldest" },
];

export default function CollectionFilterBar({
  total = 86,
  categories = [],
}: {
  total?: number;
  categories?: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "";
  const safeCategories = Array.isArray(categories) ? categories : [];

  function onSortChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("sort", value);
    else params.delete("sort");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="sticky top-[73px] z-40 w-full border-b border-[#e9e9e9] bg-white shadow-sm">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-[86.5px]">
        <div className="flex flex-wrap items-center gap-3">
          {safeCategories.length > 0 && (
            <FilterDropdown label="Category" paramKey="category" options={safeCategories} />
          )}
          <FilterDropdown label="Print Method" paramKey="printMethod" options={PRINT_METHODS} />
          <FilterDropdown label="Size" paramKey="size" options={SIZES} />
          <FilterDropdown label="Color" paramKey="color" options={COLORS} />
          <FilterDropdown label="Price Range" paramKey="priceRange" options={PRICE_RANGES} />
        </div>

        <div className="flex items-center gap-6 font-poppins">
          <span className="text-[14px] font-bold text-brand-orange">
            {total || 86} products
          </span>
          <label className="flex items-center gap-2 text-[14px]">
            <span className="font-semibold text-[#1f2937]">Sort By:</span>
            <span className="relative">
              <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none bg-transparent pr-5 font-poppins text-[14px] font-medium text-[#1f2937] focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.label} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1f2937]" />
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
