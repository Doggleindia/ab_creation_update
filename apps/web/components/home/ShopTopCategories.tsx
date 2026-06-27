"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
  images?: string[];
  collectionId?: {
    _id?: string;
    id?: string;
    name?: string;
    slug?: string;
  };
}

export default function ShopTopCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Hit the cached Next.js proxy route (served from the edge cache) rather
        // than the backend directly, so the homepage stays fast.
        const res = await fetch("/api/categories");

        if (!res.ok) {
          throw new Error(`Failed to load categories: ${res.status}`);
        }

        const json = await res.json();
        const items: Category[] = json?.data?.categories || [];

        const uniqueCategories: Category[] = [];
        const seenNames = new Set<string>();

        for (const item of items) {
          const name = item.name?.trim();
          if (!name) continue;
          if (!seenNames.has(name)) {
            seenNames.add(name);
            uniqueCategories.push(item);
          }
          if (uniqueCategories.length >= 5) break;
        }

        setCategories(uniqueCategories);
      } catch (err) {
        console.error("[ShopTopCategories] fetchCategories error", err);
        setError("Unable to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
  return (
    <section className="bg-[#F5F1EA] py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        {/* HEADING */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-[42px] font-bold mb-3 text-[#171717] tracking-tight">
            Shop Our Top Categories
          </h2>
          <p className="text-gray-500 text-[17px]">
            Select a Product to Start Ordering
          </p>
        </div>

        {/* CATEGORY BANNERS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Unisex/Men Collection */}
          <div className="relative bg-[#1dc167] overflow-hidden rounded-[24px] h-[280px] md:h-[320px] flex items-center p-8 md:p-12">
            <div className="relative z-10 max-w-[65%]">
              <h3 className="text-white text-3xl md:text-[34px] font-bold mb-3 leading-tight">
                Unisex / Men collection
              </h3>
              <p className="text-white/90 text-[15px] mb-8 leading-relaxed">
                You can choose to design products for <br className="hidden md:block"/> men of all ages
              </p>
              <Link href="/product-collection?collectionSlug=mens-collections">
                <button className="bg-white text-[#1dc167] px-6 py-2.5 rounded-full font-bold text-[15px] flex items-center gap-2 hover:bg-gray-50 transition-colors">
                  Explore products <span className="text-lg leading-none">&rarr;</span>
                </button>
              </Link>
            </div>
            <img
              src="/images/home/unisex-men-collection.png"
              alt="Unisex/Men collection"
              loading="lazy"
              decoding="async"
              className="absolute right-0 bottom-0 h-[85%] md:h-[85%] object-cover object-bottom"
            />
          </div>

          {/* Woman Collection */}
          <div className="relative bg-[#F5F1EA] overflow-hidden rounded-[24px] h-[280px] md:h-[320px] flex items-center p-8 md:p-12">
            <div className="relative z-10 max-w-[65%]">
              <h3 className="text-[#171717] text-3xl md:text-[34px] font-bold mb-3 leading-tight">
                Woman collection
              </h3>
              <p className="text-gray-600 text-[15px] mb-8 leading-relaxed">
                You can choose to design products for <br className="hidden md:block"/> women of all ages
              </p>
              <Link href="/product-collection?collectionSlug=womens-collections">
                <button className="bg-white text-[#B87D4C] px-6 py-2.5 rounded-full font-bold text-[15px] flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                  Explore products <span className="text-lg leading-none">&rarr;</span>
                </button>
              </Link>
            </div>
            <img
              src="/images/home/woman-collection.png"
              alt="Woman collection"
              loading="lazy"
              decoding="async"
              className="absolute right-0 bottom-0 h-[85%] md:h-[85%] object-cover object-bottom"
            />
          </div>
        </div>

        {/* PRODUCT GRID */}
        {loading ? (
          <div className="text-center text-gray-500">Loading categories...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : categories.length === 0 ? (
          <div className="text-center text-gray-500">No categories available yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category) => (
              <div
                key={category._id}
                className="group relative bg-white border border-gray-200 rounded-[24px] h-[220px] md:h-[260px] flex flex-col items-center justify-center overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {category.images && category.images.length > 0 ? (
                  <img loading="lazy" decoding="async"
                    src={category.images[0]}
                    alt={category.name}
                    className="w-[75%] h-auto object-contain group-hover:scale-105 transition-transform duration-300 pb-8"
                  />
                ) : (
                  <div className="w-[75%] h-[120px] bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-sm text-gray-400">
                    Image not available
                  </div>
                )}
                <div className="absolute bottom-5">
                  <span className="bg-white border border-gray-300 text-gray-700 text-[13px] font-medium px-6 py-1.5 rounded-full shadow-sm">
                    {category.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}