import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORY_CARDS = [
  { label: "Hoodie", img: "/images/home/cat-hoodie.png", slug: "hoodies" },
  { label: "Polo Tshirt", img: "/images/home/cat-polo.png", slug: "polo-shirts" },
  { label: "Tshirt", img: "/images/home/cat-tshirt.png", slug: "t-shirts" },
  { label: "Cap", img: "/images/home/cat-cap.png", slug: "caps" },
  {
    label: "Sweatshirt",
    img: "/images/home/cat-sweatshirt.png",
    slug: "sweatshirts",
  },
];

export default function ShopTopCategories() {
  return (
    <section className="w-full bg-[#f9fafb] px-4 py-20 sm:px-8 lg:px-[86.5px]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-poppins text-3xl font-bold text-[#111827] sm:text-[48px]">
            Shop Our Top Categories
          </h2>
          <p className="text-[18px] text-[#6b7280] sm:text-[24px]">
            Select a Product to Start Ordering
          </p>
        </div>

        {/* Two banner cards */}
        <div className="grid grid-cols-1 gap-8 pt-6 md:grid-cols-2">
          {/* Men */}
          <div className="relative flex items-center overflow-hidden rounded-3xl bg-[#10b981]">
            <div className="flex flex-1 flex-col items-start gap-2 p-8">
              <h3 className="font-poppins text-[28px] font-bold text-white sm:text-[32px]">
                Unisex / Men collection
              </h3>
              <p className="max-w-[323px] text-[16px] leading-5 text-white/90">
                You can choose to design products for men of all ages
              </p>
              <Link
                href="/collection?collectionSlug=mens-collections"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2 text-[16px] font-bold text-[#059669]"
              >
                Explore products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative h-[254px] w-[150px] shrink-0 self-end sm:w-[190px]">
              <Image
                src="/images/home/cat-men.png"
                alt="Men collection"
                fill
                className="object-contain object-bottom"
                sizes="190px"
              />
            </div>
          </div>

          {/* Woman */}
          <div className="relative flex items-center overflow-hidden rounded-3xl bg-[#ffedd5]">
            <div className="flex flex-1 flex-col items-start gap-2 p-8">
              <h3 className="font-poppins text-[28px] font-bold text-[#1f2937] sm:text-[32px]">
                Woman collection
              </h3>
              <p className="max-w-[323px] text-[16px] leading-5 text-[#1f2937]/80">
                You can choose to design products for women of all ages
              </p>
              <Link
                href="/collection?collectionSlug=womens-collections"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2 text-[16px] font-bold text-[#ea580c] shadow-sm"
              >
                Explore products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative h-[256px] w-[140px] shrink-0 self-end sm:w-[167px]">
              <Image
                src="/images/home/cat-woman.png"
                alt="Woman collection"
                fill
                className="object-contain object-bottom"
                sizes="167px"
              />
            </div>
          </div>
        </div>

        {/* Category cards row */}
        <div className="grid grid-cols-2 gap-5 pt-2 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORY_CARDS.map((c) => (
            <Link
              key={c.label}
              href={`/collection?category=${c.slug}`}
              className="group relative block h-[264px] overflow-hidden rounded-3xl border border-[#bfd6e4] bg-white"
            >
              <Image
                src={c.img}
                alt={c.label}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 234px"
              />
              <span className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border border-[#3d3d3d] bg-white px-6 py-2 text-[14px] text-[#3d3d3d]">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
