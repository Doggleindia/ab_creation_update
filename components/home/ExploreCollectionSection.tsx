import Image from "next/image";
import Link from "next/link";

const TILES = [
  {
    title: "T-Shirts",
    sub: "Premium Blanks & Vintage Washes",
    img: "/images/home/explore-tshirts.png",
    slug: "t-shirts",
    span: "lg:col-span-2",
  },
  {
    title: "DTF Transfers",
    sub: "Vibrant, Durable Prints",
    img: "/images/home/explore-dtf.png",
    slug: "dtf-transfers",
    span: "lg:row-span-2",
  },
  {
    title: "Hoodies",
    sub: "Heavyweight Fleece",
    img: "/images/home/explore-hoodies.png",
    slug: "hoodies",
    span: "",
  },
  {
    title: "Embroidery",
    sub: "High-Thread Count Precision",
    img: "/images/home/explore-embroidery.png",
    slug: "embroidery",
    span: "lg:col-span-2",
  },
  {
    title: "Sweatshirt",
    sub: "Caps & Beanies",
    img: "/images/home/explore-sweatshirt.png",
    slug: "sweatshirts",
    span: "",
  },
  {
    title: "Screen Print",
    sub: "Bulk Orders",
    img: "/images/home/explore-screenprint.png",
    slug: "screen-print",
    span: "",
  },
  {
    title: "Tote Bags",
    sub: "Canvas & Cotton",
    img: "/images/home/explore-tote.png",
    slug: "tote-bags",
    span: "",
  },
  {
    title: "Polo Tshirt",
    sub: "Weatherproof Vinyl",
    img: "/images/home/explore-polo.png",
    slug: "polo-shirts",
    span: "lg:col-span-2",
  },
];

export default function ExploreCollectionSection() {
  return (
    <section className="w-full bg-white px-4 py-20 sm:px-8 lg:px-[86.5px]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-poppins text-3xl font-extrabold text-[#111827] sm:text-[42px]">
            Explore our Collection
          </h2>
          <p className="font-poppins text-[16px] text-[#6b7280] sm:text-[18px]">
            Get inspired from some of our happy customers showing off their custom apparel.
          </p>
        </div>

        <div className="grid auto-rows-[220px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map((t) => (
            <Link
              key={t.title}
              href={`/collection?category=${t.slug}`}
              className={`group relative overflow-hidden rounded-2xl bg-[#1f2937] ${t.span}`}
            >
              <Image
                src={t.img}
                alt={t.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 flex flex-col gap-1">
                <h3 className="font-poppins text-[22px] font-bold text-white">{t.title}</h3>
                <p className="font-poppins text-[14px] text-[#e5e7eb]">{t.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
