import Image from "next/image";
import Link from "next/link";

const SERVICES = [
  {
    title: "Embroidery service",
    img: "/images/home/service-embroidery.png",
    body: "Embroidery is a method of decorating fabric by stitching a design onto it using a needle and thread. It is a durable and high-quality...",
    href: "/service/embroidery",
  },
  {
    title: "Screen printing",
    img: "/images/home/service-screen.png",
    body: "Screen printing is a printing technique in which a mesh screen is used to transfer ink onto fabric. The screen is created by blocking...",
    href: "/service/screen-printing",
  },
  {
    title: "DTG printing",
    img: "/images/home/service-dtg.png",
    body: "DTG or Direct-to-garment printing is a printing method that involves printing ink directly onto the fabric of a garment using inkjet...",
    href: "/service/dtg-printing",
  },
];

export default function PrintingServicesSection() {
  return (
    <section className="w-full bg-[#f9fafb] px-4 py-20 sm:px-8 lg:px-[86.5px]">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-poppins text-3xl font-bold text-[#111827] sm:text-[40px]">
            Our Printing Services
          </h2>
          <p className="text-[18px] text-[#6b7280] sm:text-[24px]">
            Our best selling apparel great for any occasion.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-8 pt-6 md:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="flex flex-col overflow-hidden rounded-[26px] border border-[#dddddd] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
            >
              <div className="relative h-[290px] w-full">
                <Image
                  src={s.img}
                  alt={s.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 422px"
                />
              </div>
              <div className="flex flex-col gap-3 p-6">
                <h3 className="font-poppins text-[21px] font-bold text-[#111827]">
                  {s.title}
                </h3>
                <p className="text-[15px] leading-[21px] text-[#4b5563]">
                  {s.body}
                </p>
                <Link
                  href={s.href}
                  className="inline-flex items-center gap-2 pt-1 text-[17px] font-semibold text-brand-orange hover:underline"
                >
                  Read more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
