"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import CollectionFilterBar from "./CollectionFilterBar";
import ProductCard, { type Product } from "./ProductCard";
import type { FilterOption } from "./FilterDropdown";
import type { ProductsMeta } from "@/lib/api";
import { Button } from "@/components/ui/button";

const FILTER_KEYS = [
  "category",
  "printMethod",
  "size",
  "color",
  "priceRange",
  "search",
] as const;

export default function CollectionView({
  products,
  meta,
  categories,
}: {
  products: Product[];
  meta: ProductsMeta;
  categories: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeChips = FILTER_KEYS.map((key) => {
    const value = searchParams.get(key);
    if (!value) return null;
    const label =
      key === "category"
        ? categories.find((c) => c.value === value)?.label ?? value
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

  const { page, totalPages, total } = meta;

  return (
    <>
      <section className="w-full bg-white px-4 pt-8 sm:px-8 lg:px-[86.5px]">
        <div className="mx-auto max-w-[1280px]">
          <h1 className="font-poppins text-2xl font-bold text-[#111827] sm:text-[30px]">
            Choose a base product
          </h1>
          <p className="mt-1 text-[15px] text-[#6b7280] sm:text-[16px]">
            Select the garment you want to put your design on
          </p>
        </div>
      </section>

      <CollectionFilterBar total={total} categories={categories} />

      {activeChips.length > 0 && (
        <div className="w-full bg-white px-4 pt-4 sm:px-8 lg:px-[86.5px]">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3">
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="flex items-center gap-1.5 rounded-full bg-[#f0edeb] px-3 py-1 text-[13px] text-[#1b1c1b]"
              >
                {chip.label}
                <Button
                  aria-label={`Remove ${chip.label}`}
                  onClick={() => removeFilter(chip.key)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </span>
            ))}
            <Button
              onClick={clearAll}
              className="text-[13px] font-medium text-brand-orange underline"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      <section className="w-full bg-white px-4 py-8 sm:px-8 lg:px-[86.5px]">
        {products.length === 0 ? (
          <div className="mx-auto max-w-[1280px] py-20 text-center">
            <p className="text-[16px] text-[#6b7280]">
              No products match your selection.
            </p>
            {activeChips.length > 0 && (
              <Button
                onClick={clearAll}
                className="mt-3 text-[14px] font-medium text-brand-orange underline"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>

            <div className="mx-auto mt-10 flex max-w-[1280px] flex-col items-center gap-4">
              <p className="text-[14px] text-[#6b7280]">
                Showing {products.length} of {total} products
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(0, 5)
                    .map((n) => (
                      <Link
                        key={n}
                        href={pageHref(n)}
                        className={`flex h-10 w-10 items-center justify-center rounded-md text-[14px] font-medium ${
                          n === page
                            ? "bg-[#a04100] text-white"
                            : "bg-[#f5ece4] text-[#1b1c1b] hover:bg-[#ece0d6]"
                        }`}
                      >
                        {n}
                      </Link>
                    ))}
                  {page < totalPages && (
                    <Link
                      href={pageHref(page + 1)}
                      className="flex h-10 items-center justify-center rounded-md bg-[#f5ece4] px-4 text-[14px] font-medium text-[#1b1c1b] hover:bg-[#ece0d6]"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}
