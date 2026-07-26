import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SERVICES = [
  {
    title: "Direct-to-Garment (DTG)",
    img: "/images/home/service-dtg.png",
    body: "High-detail, vibrant full-color printing ideal for complex artwork and small runs.",
    href: "/service/dtg-printing",
  },
  {
    title: "Embroidery Studio",
    img: "/images/home/service-embroidery.png",
    body: "Premium stitched logos giving a professional, textured feel for polos, jackets, and caps.",
    href: "/service/embroidery",
  },
  {
    title: "Screen Printing",
    img: "/images/home/service-screen.png",
    body: "Best for large volume orders. Crisp lines, durable inks, and unbeatable bulk value.",
    href: "/service/screen-printing",
  },
];

export default function PrintingServicesSection() {
  return (
    <section className="w-full bg-[#f9fafb] px-4 py-20 sm:px-8 lg:px-[86.5px]">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-poppins text-3xl font-extrabold text-[#111827] sm:text-[42px]">
            Our Printing Services
          </h2>
          <p className="font-poppins text-[16px] text-[#6b7280] sm:text-[20px]">
            Advanced print technologies tailored to your product and brand vision.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="group flex flex-col overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative h-[260px] w-full overflow-hidden bg-gray-100">
                <Image
                  src={s.img}
                  alt={s.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 422px"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between gap-4 p-6">
                <div className="flex flex-col gap-2">
                  <h3 className="font-poppins text-[22px] font-bold text-[#111827]">
                    {s.title}
                  </h3>
                  <p className="font-poppins text-[14px] leading-relaxed text-[#4b5563]">
                    {s.body}
                  </p>
                </div>
                <Link
                  href={s.href}
                  className="inline-flex items-center gap-2 font-poppins text-[15px] font-bold text-brand-orange hover:underline"
                >
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
