"use client"

import Image from "next/image"

const logos = [
  "/images/home/client1.png",
  "/images/home/client2.png",
  "/images/home/client1.png",
  "/images/home/client2.png",
  "/images/home/client1.png",
  "/images/home/client2.png",
];

export default function TrustedBrands() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* HEADER */}
        <div className="text-center mb-14">
          <h2 className="text-2xl font-bold uppercase tracking-wide">
            Discover trusted brands behind our custom clothing
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            Design clothes from leading brands known for their quality.
          </p>
        </div>

        {/* LOGO GRID */}
        <div className=" pb-6 overflow-hidden">
              <div className="flex w-max animate-marquee gap-16 px-8">
                {[...logos, ...logos].map((logo, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center min-w-[140px] opacity-70 hover:opacity-100 transition"
                  >
                    <Image
                      src={logo}
                      alt="Brand logo"
                      width={120}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
      </div>
    </section>
  )
}
