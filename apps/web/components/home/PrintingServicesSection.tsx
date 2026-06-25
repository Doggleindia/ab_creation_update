"use client";

import Link from "next/link";

const services = [
  {
    id: 1,
    title: "Embroidery service",
    description:
      "Embroidery is a method of decorating fabric by stitching a design onto it using a needle and thread. It is a durable and high-quality...",
    image: "/images/home/embroidery-service.png",
  },
  {
    id: 2,
    title: "Screen printing",
    description:
      "Screen printing is a printing technique in which a mesh screen is used to transfer ink onto fabric. The screen is created by blocking...",
    image: "/images/home/screen-printing.png",
  },
  {
    id: 3,
    title: "DTG printing",
    description:
      "DTG or Direct-to-garment printing is a printing method that involves printing ink directly onto the fabric of a garment using inkjet...",
    image: "/images/home/dtg-printing.png",
  },
];

export default function PrintingServicesSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      {/* HEADING */}
      <h2 className="text-3xl md:text-[40px] font-bold text-center mb-4 text-[#171717]">
        Our Printing Services
      </h2>
      <p className="text-center text-gray-500 mb-12 text-lg max-w-2xl mx-auto">
        Our best selling apparel great for any occasion.
      </p>

      {/* SERVICES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {services.map((service) => (
          <div
            key={service.id}
            className="group flex flex-col bg-white border border-gray-200 rounded-[24px] overflow-hidden"
          >
            {/* IMAGE */}
            <div className="relative w-full h-[260px] bg-gray-100 overflow-hidden">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* CONTENT */}
            <div className="p-6 md:p-8 flex flex-col flex-grow">
              <h3 className="text-xl font-bold mb-3 text-[#171717]">
                {service.title}
              </h3>
              <p className="text-gray-500 mb-6 leading-relaxed text-[15px] flex-grow">
                {service.description}
              </p>

              <Link 
                href={`/service/${service.id}`}
                className="inline-flex items-center text-[#f97316] font-bold hover:text-[#B87D4C] transition-colors"
              >
                Read more
                <svg
                  className="ml-2 w-[14px] h-[14px] mt-[2px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="7"></circle>
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}