"use client";

import Image from "next/image";

const categories = [
  {
    id: 1,
    image: "/images/home/hero1.png",
    label: "T-shirts - Round Neck",
    title: "T-shirts - Round Neck",
  },
  {
    id: 2,
    image: "/images/home/hero2.png",
    label: "T-shirts - Round Neck",
    title: "T-shirts - Round Neck",
  },
  {
    id: 3,
    image: "/images/home/hero3.png",
    label: "T-shirts - Round Neck",
    title: "T-shirts - Round Neck",
  },
  {
    id: 4,
    image: "/images/home/hero1.png",
    label: "T-shirts - Round Neck",
    title: "T-shirts - Round Neck",
  },
  {
    id: 5,
    image: "/images/home/hero2.png",
    label: "T-shirts - Round Neck",
    title: "T-shirts - Round Neck",
  },
];

export default function ExploreCategories() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      {/* Heading */}
      <h2 className="text-center text-xl font-semibold tracking-widest mb-10">
        EXPLORE OTHER CATEGORIES
      </h2>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {categories.map((item) => (
          <div key={item.id} className="group cursor-pointer">
            {/* Image */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Label */}
              <span className="absolute bottom-3 left-3 bg-white text-xs px-3 py-1 rounded shadow">
                {item.label}
              </span>
            </div>

            {/* Title */}
            {/* <p className="mt-3 text-sm text-gray-800 text-center">
              {item.title}
            </p> */}
          </div>
        ))}
      </div>
    </section>
  );
}
