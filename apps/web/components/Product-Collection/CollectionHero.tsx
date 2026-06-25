"use client";

import Image from "next/image";

interface CollectionHeroProps {
  title: string;
  bannerImage: string;
}

export default function CollectionHero({
  title,
  bannerImage,
}: CollectionHeroProps) {
  return (
    <section className="relative w-full h-[260px] md:h-[320px] overflow-hidden">
      {/* Background Image */}
      <Image
    src={bannerImage || "/images/home/lookbook-bg.png"}
        alt={title}
        fill
        priority
        className="object-cover opacity-70"

      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex h-full text-[#000000] flex-col items-center justify-center text-white">
        <h1 className="text-3xl text-[#000000] md:text-3xl font-semibold tracking-wide">
          {title}
        </h1>

        <p className="mt-2 text-lg text-[#000000] ">
          Home <span className="mx-1">/</span> {title}
        </p>
      </div>
    </section>
  );
}
