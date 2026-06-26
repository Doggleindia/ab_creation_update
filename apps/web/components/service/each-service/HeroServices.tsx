"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface HeroServicesProps {
  title: string;
  description: string;
  bannerImage: string;
}

export default function HeroServices({
  title,
  bannerImage,
  description
}: HeroServicesProps) {
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
      <div className="relative z-10 flex h-full text-[#171717] flex-col items-center justify-center text-white">
        <h1 className="text-3xl text-[#171717] md:text-3xl font-semibold tracking-wide">
          {title}
        </h1>
        <p className="mt-2 text-lg text-[#171717] w-[61%] text-center">{description}</p>

        <p className="mt-3 text-lg text-[#171717] ">
         <Button asChild className="p-5 mt-2 service-btn bg-[#171717] font-semibold text-white hover:bg-[#333333]">
          <Link href="/design-editor">Start Your DTF Order</Link>
          </Button>
        </p>
      </div>
    </section>
  );
}
