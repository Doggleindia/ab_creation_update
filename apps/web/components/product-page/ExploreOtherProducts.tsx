"use client";

import Image from "next/image";

type Badge = { label: string; color: string } | null;

const products: {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  badge: Badge;
}[] = [
  {
    id: 1,
    image: "/images/home/hero1.png",
    title: "Flower design",
    subtitle: "Stylish color print",
    badge: { label: "Best seller", color: "#E8A02C" },
  },
  {
    id: 2,
    image: "/images/home/hero2.png",
    title: "Flower design",
    subtitle: "Stylish color print",
    badge: null,
  },
  {
    id: 3,
    image: "/images/home/hero3.png",
    title: "Flower design",
    subtitle: "Stylish color print",
    badge: { label: "Best seller", color: "#E8A02C" },
  },
  {
    id: 4,
    image: "/images/home/hero1.png",
    title: "Flower design",
    subtitle: "Stylish color print",
    badge: { label: "New", color: "#2BB673" },
  },
];

export default function ExploreOtherProducts() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-[1240px] mx-auto px-4 py-16 lg:py-20">
        <h2 className="text-center text-[#171717] text-[22px] md:text-[26px] font-bold tracking-wide uppercase mb-12">
          Explore Other Products
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <div key={item.id} className="group cursor-pointer">
              {/* IMAGE */}
              <div className="relative aspect-square overflow-hidden rounded-lg bg-[#EFEFEF]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {item.badge && (
                  <span
                    className="absolute top-3 right-3 w-[54px] h-[54px] rounded-full flex items-center justify-center text-center text-white text-[10px] font-semibold leading-tight px-1"
                    style={{ backgroundColor: item.badge.color }}
                  >
                    {item.badge.label}
                  </span>
                )}
              </div>

              {/* INFO */}
              <div className="bg-[#F4F4F4] px-4 py-4 rounded-b-lg">
                <h3 className="text-[#171717] text-[15px] font-semibold leading-tight">
                  {item.title}
                </h3>
                <p className="text-[#777] text-[13px] mt-1">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
