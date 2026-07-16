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
  { label: "₹0 – ₹500", value: "0-500" },
  { label: "₹500 – ₹1000", value: "500-1000" },
  { label: "₹1000 – ₹2000", value: "1000-2000" },
  { label: "₹2000+", value: "2000+" },
];

const SORT_OPTIONS: FilterOption[] = [
  { label: "Recommended", value: "" },
  { label: "Price: Low to High", value: "priceLowToHigh" },
  { label: "Price: High to Low", value: "priceHighToLow" },
  { label: "Newest", value: "latest" },
  { label: "Oldest", value: "oldest" },
];

export default function CollectionFilterBar({
  total,
  categories,
}: {
  total: number;
  categories: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "";

  function onSortChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("sort", value);
    else params.delete("sort");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="sticky top-[73px] z-40 w-full border-b border-[#e9e9e9] bg-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-16">
        <div className="flex flex-wrap items-center gap-3">
          {categories.length > 0 && (
            <FilterDropdown label="Category" paramKey="category" options={categories} />
          )}
          <FilterDropdown label="Print Method" paramKey="printMethod" options={PRINT_METHODS} />
          <FilterDropdown label="Size" paramKey="size" options={SIZES} />
          <FilterDropdown label="Color" paramKey="color" options={COLORS} />
          <FilterDropdown label="Price Range" paramKey="priceRange" options={PRICE_RANGES} />
        </div>

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
                  <option key={o.label} value={o.value}>
                    {o.label}
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
