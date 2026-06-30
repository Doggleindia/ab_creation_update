"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Badge = { label: string; color: string } | null;

const products: {
  image: string;
  title: string;
  subtitle: string;
  badge: Badge;
}[] = [
  {
    image: "/images/home/hero1.png",
    title: "Flower design",
    subtitle: "Stylish color print",
    badge: { label: "Best seller", color: "#E8A02C" },
  },
  {
    image: "/images/home/hero2.png",
    title: "Flower design",
    subtitle: "Stylish color print",
    badge: null,
  },
  {
    image: "/images/home/hero3.png",
    title: "Flower design",
    subtitle: "Stylish color print",
    badge: { label: "Best seller", color: "#E8A02C" },
  },
  {
    image: "/images/home/hero1.png",
    title: "Flower design",
    subtitle: "Stylish color print",
    badge: { label: "New", color: "#2BB673" },
  },
];

export default function NewestArrivals() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="flex items-end justify-between mb-10">
          <div className="max-w-xl">
            <h2 className="text-lg font-semibold">Explore the newest arrivals</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Coming in hot—the latest additions to our product catalog you don&apos;t
              want to miss
            </p>
          </div>

          {/* CAROUSEL ARROWS */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              aria-label="Previous"
              className="w-9 h-9 rounded-md border border-[#E8E6E3] flex items-center justify-center text-[#555] hover:bg-[#F5F1EA] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              aria-label="Next"
              className="w-9 h-9 rounded-md border border-[#E8E6E3] flex items-center justify-center text-[#555] hover:bg-[#F5F1EA] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <div key={i} className="group cursor-pointer">
              {/* IMAGE */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-[#EFEFEF]">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {p.badge && (
                  <span
                    className="absolute top-3 right-3 w-[54px] h-[54px] rounded-full flex items-center justify-center text-center text-white text-[10px] font-semibold leading-tight px-1"
                    style={{ backgroundColor: p.badge.color }}
                  >
                    {p.badge.label}
                  </span>
                )}
              </div>

              {/* CONTENT */}
              <div className="bg-[#F4F4F4] px-4 py-4 rounded-b-lg">
                <p className="text-[15px] font-semibold text-[#171717] leading-tight">
                  {p.title}
                </p>
                <p className="text-[13px] text-[#777] mt-1">{p.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
