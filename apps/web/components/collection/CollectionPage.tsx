"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import CollectionFilterBar from "./CollectionFilterBar";
import ProductCard, { type Product } from "./ProductCard";

// Representative catalogue. Structured to be swapped for the live products API
// (GET /api/products) without touching the presentational components.
const DEMO_PRODUCTS: Product[] = [
  { slug: "classic-white-tee", title: "Classic White Tee", subtitle: "Premium Heavyweight Cotton", price: 899, badge: "EMBROIDERY", image: "/images/home/cat-tshirt.png", colors: ["#ffffff", "#000000", "#9ca3af"] },
  { slug: "black-oversized-tee", title: "Black Oversized Tee", subtitle: "Urban Fit Tech-Cotton", price: 1099, badge: "SCREEN PRINT", image: "/images/home/explore-tshirts.png", colors: ["#000000", "#1f2937"] },
  { slug: "navy-executive-polo", title: "Navy Executive Polo", subtitle: "Piqué Organic Cotton", price: 1299, badge: "EMBROIDERY", image: "/images/home/cat-polo.png", colors: ["#1e3a8a", "#000000"] },
  { slug: "sustainable-gray-hoodie", title: "Sustainable Gray Hoodie", subtitle: "Recycled Polyester Blend", price: 1799, badge: "DTF TRANSFER", image: "/images/home/cat-hoodie.png", colors: ["#9ca3af", "#000000"] },
  { slug: "essential-tank-top", title: "Essential Tank Top", subtitle: "Lightweight Sport Mesh", price: 699, badge: "SCREEN PRINT", image: "/images/home/explore-sweatshirt.png", colors: ["#ffffff", "#10b981"] },
  { slug: "premium-crewneck", title: "Premium Crewneck", subtitle: "French Terry Finish", price: 1499, badge: "EMBROIDERY", image: "/images/home/cat-sweatshirt.png", colors: ["#f5f1ea", "#111827"] },
  { slug: "vintage-wash-tee", title: "Vintage Wash Tee", subtitle: "Pre-Shrunk Garment Dye", price: 999, badge: "DTF TRANSFER", image: "/images/home/explore-polo.png", colors: ["#0f766e", "#000000"] },
  { slug: "raglan-baseball-tee", title: "Raglan Baseball Tee", subtitle: "Contrast Sleeve Cotton", price: 849, badge: "SCREEN PRINT", image: "/images/home/explore-hoodies.png", colors: ["#ffffff", "#a04100"] },
];

// Duplicate to demonstrate grid scale (mirrors the mock's "16 of 86").
const GRID_PRODUCTS: Product[] = Array.from({ length: 16 }, (_, i) => {
  const base = DEMO_PRODUCTS[i % DEMO_PRODUCTS.length];
  return { ...base, slug: `${base.slug}-${i + 1}` };
});

export default function CollectionPage() {
  const [sort, setSort] = useState("Recommended");
  const [activeFilters, setActiveFilters] = useState<string[]>([
    "T-Shirts",
    "Embroidery",
  ]);

  const products = useMemo(() => {
    const list = [...GRID_PRODUCTS];
    if (sort === "Price: Low to High") list.sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") list.sort((a, b) => b.price - a.price);
    return list;
  }, [sort]);

  const TOTAL = 86; // will come from the API meta once wired

  return (
    <>
      {/* Header */}
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

      <CollectionFilterBar total={TOTAL} sort={sort} onSortChange={setSort} />

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="w-full bg-white px-4 pt-4 sm:px-8 lg:px-[86.5px]">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3">
            {activeFilters.map((f) => (
              <span
                key={f}
                className="flex items-center gap-1.5 rounded-full bg-[#f0edeb] px-3 py-1 text-[13px] text-[#1b1c1b]"
              >
                {f}
                <button
                  aria-label={`Remove ${f}`}
                  onClick={() =>
                    setActiveFilters((prev) => prev.filter((x) => x !== f))
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            <button
              onClick={() => setActiveFilters([])}
              className="text-[13px] font-medium text-brand-orange underline"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Product grid */}
      <section className="w-full bg-white px-4 py-8 sm:px-8 lg:px-[86.5px]">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mx-auto mt-10 flex max-w-[1280px] flex-col items-center gap-4">
          <p className="text-[14px] text-[#6b7280]">
            Showing {products.length} of {TOTAL} products
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`flex h-10 w-10 items-center justify-center rounded-md text-[14px] font-medium ${
                  n === 1
                    ? "bg-[#a04100] text-white"
                    : "bg-[#f5ece4] text-[#1b1c1b] hover:bg-[#ece0d6]"
                }`}
              >
                {n}
              </button>
            ))}
            <button className="flex h-10 items-center justify-center rounded-md bg-[#f5ece4] px-4 text-[14px] font-medium text-[#1b1c1b] hover:bg-[#ece0d6]">
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
