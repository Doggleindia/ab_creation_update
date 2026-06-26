"use client";

import Image from "next/image";
import Link from "next/link";

export default function LookbookSection() {
  return (
    <section className="relative w-full h-[320px] md:h-[420px] lg:h-[520px] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/home/lookbook-bg.png"
        alt="Lookbook"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10" />

      {/* CTA */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Link href="/look-book" className="bg-white px-8 py-3 text-sm font-semibold tracking-wide shadow-md hover:bg-gray-100 transition">
          OUR LOOKBOOK
        </Link>
      </div>
    </section>
  );
}
