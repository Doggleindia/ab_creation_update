"use client";

import Image from "next/image";
import Link from "next/link";

const collectionItems = [
  {
    id: 1,
    title: "T-Shirts",
    subtitle: "Premium Blanks & Vintage Washes",
    image: "/images/home/collection1.png",
    className: "col-span-2 row-span-1 h-[220px]",
  },
  {
    id: 2,
    title: "DTF Transfers",
    subtitle: "Vibrant, Durable Prints",
    image: "/images/home/collection2.png",
    className: "col-span-1 row-span-2 h-[460px]",
  },
  {
    id: 3,
    title: "Hoodies",
    subtitle: "Heavyweight Fleece",
    image: "/images/home/collection3.png",
    className: "col-span-1 row-span-1 h-[220px]",
  },
  {
    id: 4,
    title: "Embroidery",
    subtitle: "High-End Count Precision",
    image: "/images/home/collection4.png",
    className: "col-span-2 row-span-1 h-[220px]",
  },
  {
    id: 5,
    title: "Sweatshirt",
    subtitle: "Caps & Beanies",
    image: "/images/home/collection5.png",
    className: "col-span-1 row-span-1 h-[220px]",
  },
  {
    id: 6,
    title: "Screen Print",
    subtitle: "Bulk Orders",
    image: "/images/home/collection6.png",
    className: "col-span-1 row-span-1 h-[160px]",
  },
  {
    id: 7,
    title: "Tote Bags",
    subtitle: "Canvas & Organic Cotton",
    image: "/images/home/collection7.png",
    className: "col-span-1 row-span-1 h-[160px]",
  },
  {
    id: 8,
    title: "Polo Tshirt",
    subtitle: "Weatherproof Vinyl",
    image: "/images/home/collection8.png",
    className: "col-span-2 row-span-1 h-[160px]",
  },
];

export default function ExploreCollectionSection() {
  return (
    <section className="bg-[#F5F5F5] py-20 lg:py-28">
      <div className="max-w-[1320px] mx-auto px-4">
        {/* HEADING */}
        <div className="text-center mb-14">
          <h2 className="text-[#111827] text-[34px] sm:text-[48px] font-bold leading-[110%] tracking-[-1px]">
            Explore our Collection
          </h2>

          <p className="mt-4 text-[#6B7280] text-[15px] sm:text-[16px] leading-[26px] max-w-[620px] mx-auto">
            Get inspired from some of our happy customers showing off their
            custom apparel
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-4 gap-4 auto-rows-auto">
          {collectionItems.map((item) => (
            <Link
              key={item.id}
              href={`/product-collection?id=${item.id}`}
              className={`relative overflow-hidden rounded-[18px] group ${item.className}`}
            >
              {/* IMAGE */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* CONTENT */}
              <div className="absolute bottom-0 left-0 p-5 z-10">
                <h3 className="text-white text-[20px] font-bold leading-none mb-2">
                  {item.title}
                </h3>

                <p className="text-white/80 text-[13px] leading-none">
                  {item.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* MOBILE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
          {collectionItems.map((item) => (
            <Link
              key={item.id}
              href={`/product-collection?id=${item.id}`}
              className="relative h-[240px] overflow-hidden rounded-[18px] group"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              <div className="absolute bottom-0 left-0 p-5 z-10">
                <h3 className="text-white text-[20px] font-bold mb-1">
                  {item.title}
                </h3>

                <p className="text-white/80 text-[13px]">
                  {item.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}