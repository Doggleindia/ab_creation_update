import Image from "next/image";

const PRODUCTS = [
  { label: "Hoodie", img: "/images/home/cat-hoodie.png" },
  { label: "Polo Tshirt", img: "/images/home/cat-polo.png" },
  { label: "Tshirt", img: "/images/home/cat-men.png" },
  { label: "Cap", img: "/images/home/cat-cap.png" },
  { label: "Sweatshirt", img: "/images/home/cat-sweatshirt.png" },
];

export default function ProductsCatalogSection() {
  return (
    <section className="w-full bg-[#faf3ea] py-16">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="mb-10 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-orange">
            Diverse Selection
          </p>
          <h2 className="mt-2 font-poppins text-[28px] font-semibold text-[#242424] sm:text-[32px]">
            Products You Can Sell
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-[#6b7280]">
            Choose from over 30+ premium blank apparel options to build your
            brand identity.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {PRODUCTS.map((p) => (
            <div
              key={p.label}
              className="flex flex-col items-center gap-4 rounded-[12px] bg-white p-5 shadow-sm"
            >
              <div className="relative h-[140px] w-full">
                <Image
                  src={p.img}
                  alt={p.label}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 50vw, 20vw"
                />
              </div>
              <span className="rounded-full border border-[#e5e7eb] px-4 py-1.5 text-[13px] font-semibold text-[#374151]">
                {p.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
