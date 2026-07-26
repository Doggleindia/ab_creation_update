"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import CollectionFilterBar from "./CollectionFilterBar";
import ProductCard, { type Product } from "./ProductCard";
import type { FilterOption } from "./FilterDropdown";
import type { ProductsMeta } from "@/lib/api";

const FILTER_KEYS = [
  "category",
  "printMethod",
  "size",
  "color",
  "priceRange",
  "search",
] as const;

export default function CollectionView({
  products = [],
  meta,
  categories = [],
}: {
  products?: Product[];
  meta?: ProductsMeta;
  categories?: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const activeChips = FILTER_KEYS.map((key) => {
    const value = searchParams.get(key);
    if (!value) return null;
    const label =
      key === "category"
        ? safeCategories.find((c) => c.value === value)?.label ?? value
        : value;
    return { key, value, label };
  }).filter(Boolean) as { key: string; value: string; label: string }[];

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  function pageHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  const { page = 1, totalPages = 1, total = 86 } = meta || {};

  return (
    <>
      {/* Title Header */}
      <section className="w-full bg-white px-4 pt-10 pb-6 sm:px-8 lg:px-[86.5px]">
        <div className="mx-auto max-w-[1280px]">
          <h1 className="font-poppins text-3xl font-extrabold text-[#111827] sm:text-[36px]">
            Choose a base product
          </h1>
          <p className="mt-2 font-poppins text-[16px] text-[#6b7280] sm:text-[18px]">
            Select the garment you want to put your design on
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <CollectionFilterBar total={total || 86} categories={safeCategories} />

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="w-full bg-white px-4 pt-4 sm:px-8 lg:px-[86.5px]">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3">
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="flex items-center gap-1.5 rounded-full border border-[#d1d5db] bg-[#f9fafb] px-3.5 py-1 font-poppins text-[13px] font-medium text-[#1f2937]"
              >
                {chip.label}
                <button
                  aria-label={`Remove ${chip.label}`}
                  onClick={() => removeFilter(chip.key)}
                  className="rounded-full p-0.5 hover:bg-gray-200"
                >
                  <X className="h-3.5 w-3.5 text-[#6b7280]" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAll}
              className="font-poppins text-[13px] font-bold text-brand-orange underline hover:text-brand-orange/80"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <section className="w-full bg-white px-4 py-10 sm:px-8 lg:px-[86.5px]">
        {safeProducts.length === 0 ? (
          <div className="mx-auto max-w-[1280px] py-20 text-center">
            <p className="font-poppins text-[18px] font-medium text-[#6b7280]">
              No products match your selection.
            </p>
            {activeChips.length > 0 && (
              <button
                onClick={clearAll}
                className="mt-4 font-poppins text-[15px] font-bold text-brand-orange underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {safeProducts.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mx-auto mt-12 flex max-w-[1280px] flex-col items-center gap-4 font-poppins">
              <p className="text-[14px] font-medium text-[#6b7280]">
                Showing {safeProducts.length} of {total || 86} products
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={pageHref(1)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-[14px] font-bold ${
                    page === 1
                      ? "bg-[#7c2d12] text-white"
                      : "bg-[#f5ece4] text-[#1f2937] hover:bg-[#ece0d6]"
                  }`}
                >
                  1
                </Link>
                <Link
                  href={pageHref(2)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-[14px] font-bold ${
                    page === 2
                      ? "bg-[#7c2d12] text-white"
                      : "bg-[#f5ece4] text-[#1f2937] hover:bg-[#ece0d6]"
                  }`}
                >
                  2
                </Link>
                <Link
                  href={pageHref(3)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-[14px] font-bold ${
                    page === 3
                      ? "bg-[#7c2d12] text-white"
                      : "bg-[#f5ece4] text-[#1f2937] hover:bg-[#ece0d6]"
                  }`}
                >
                  3
                </Link>
                <Link
                  href={pageHref(page < (totalPages || 3) ? page + 1 : 2)}
                  className="flex h-10 items-center justify-center rounded-lg bg-[#f5ece4] px-4 text-[14px] font-bold text-[#1f2937] hover:bg-[#ece0d6]"
                >
                  Next
                </Link>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
