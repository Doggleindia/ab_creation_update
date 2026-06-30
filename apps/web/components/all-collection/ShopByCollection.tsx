"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import ProductGrid from "./ProductGrid";

const PRIMARY_LINKS = [
  { label: "DTF products", href: "/product-collection?printMethod=DTF Print" },
  { label: "Embroidery products", href: "/product-collection?printMethod=Embroidery", active: true },
  { label: "Custom print", href: "/product-collection?printMethod=Direct Print" },
  { label: "Fast delivery", href: "/product-collection?sort=fast" },
  { label: "New products", href: "/product-collection?sort=newest" },
  { label: "Bestsellers", href: "/product-collection?sort=bestsellers" },
];

const CATEGORY_LINKS = [
  { label: "All products", href: "/product-collection", bold: true },
  { label: "Men's clothing", href: "/product-collection?category=Men", expandable: true },
  { label: "Women's clothing", href: "/product-collection?category=Women", expandable: true },
  { label: "Kids' & youth clothing", href: "/product-collection?category=Kids", expandable: true },
];

export default function ShopByCollection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
          {/* LEFT SIDEBAR */}
          <aside className="text-[13px] text-[#333]">
            <ul className="space-y-3">
              {PRIMARY_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={
                      item.active
                        ? "font-semibold text-[#171717] underline underline-offset-4"
                        : "hover:text-[#B87D4C] transition-colors"
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="my-6 border-t border-[#E8E6E3]" />

            <ul className="space-y-3">
              {CATEGORY_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between hover:text-[#B87D4C] transition-colors ${
                      item.bold ? "font-semibold text-[#171717]" : ""
                    }`}
                  >
                    {item.label}
                    {item.expandable && (
                      <ChevronDown className="h-4 w-4 text-[#999]" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* RIGHT CONTENT */}
          <div>
            <h2 className="text-[18px] font-semibold text-[#171717] mb-6">
              Shop by
            </h2>
            <ProductGrid />
          </div>
        </div>
      </div>
    </section>
  );
}
