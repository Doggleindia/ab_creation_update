import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORY_CARDS = [
  { label: "Hoodie", img: "/images/home/cat-hoodie.png", slug: "hoodies" },
  { label: "Polo Shirts", img: "/images/home/cat-polo.png", slug: "polo-shirts" },
  { label: "T-shirt", img: "/images/home/cat-tshirt.png", slug: "t-shirts" },
  { label: "Caps", img: "/images/home/cat-cap.png", slug: "caps" },
  { label: "Sweatshirts", img: "/images/home/cat-sweatshirt.png", slug: "sweatshirts" },
];

export default function ShopTopCategories() {
  return (
    <section className="w-full bg-[#f9fafb] px-4 py-16 sm:px-8 lg:px-[86.5px]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-poppins text-3xl font-extrabold text-[#111827] sm:text-[42px]">
            Shop Our Top Categories
          </h2>
          <p className="font-poppins text-[16px] text-[#6b7280] sm:text-[20px]">
            Select a Product to Start Ordering
          </p>
        </div>

        {/* Two main banner cards */}
        <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
          {/* Men */}
          <div className="relative flex items-center overflow-hidden rounded-3xl bg-[#059669] text-white p-8 sm:p-10">
            <div className="flex flex-1 flex-col items-start gap-3 z-10">
              <h3 className="font-poppins text-[26px] font-extrabold leading-tight sm:text-[32px]">
                Unisex / Men collection
              </h3>
              <p className="max-w-[300px] text-[15px] font-medium leading-relaxed text-white/90">
                You can choose to design products for men of all ages
              </p>
              <Link
                href="/collection?category=t-shirt-mens"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-[15px] font-bold text-[#059669] shadow-sm transition-all hover:bg-gray-100"
              >
                Explore products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative h-[240px] w-[140px] shrink-0 self-end sm:w-[180px]">
              <Image
                src="/images/home/cat-men.png"
                alt="Men collection"
                fill
                className="object-contain object-bottom"
                sizes="180px"
              />
            </div>
          </div>

          {/* Woman */}
          <div className="relative flex items-center overflow-hidden rounded-3xl bg-[#ffedd5] text-[#1f2937] p-8 sm:p-10">
            <div className="flex flex-1 flex-col items-start gap-3 z-10">
              <h3 className="font-poppins text-[26px] font-extrabold leading-tight sm:text-[32px]">
                Woman collection
              </h3>
              <p className="max-w-[300px] text-[15px] font-medium leading-relaxed text-[#1f2937]/80">
                You can choose to design products for women of all ages
              </p>
              <Link
                href="/collection?category=t-shirt-womens"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-[15px] font-bold text-[#ea580c] shadow-sm transition-all hover:bg-gray-50"
              >
                Explore products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative h-[240px] w-[140px] shrink-0 self-end sm:w-[170px]">
              <Image
                src="/images/home/cat-woman.png"
                alt="Woman collection"
                fill
                className="object-contain object-bottom"
                sizes="170px"
              />
            </div>
          </div>
        </div>

        {/* 5 Product category cards */}
        <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORY_CARDS.map((c) => (
            <Link
              key={c.label}
              href={`/collection?category=${c.slug}`}
              className="group relative block h-[260px] overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <Image
                src={c.img}
                alt={c.label}
                fill
                className="object-cover p-4 transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 234px"
              />
              <span className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border border-[#d1d5db] bg-white px-6 py-1.5 font-poppins text-[14px] font-semibold text-[#1f2937] shadow-sm">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
