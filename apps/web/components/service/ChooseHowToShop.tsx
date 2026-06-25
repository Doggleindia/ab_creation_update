"use client";

import Image from "next/image";
import Link from "next/link";

export default function ChooseHowToShop() {
  return (
    <section className="w-full py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Beige Box */}
        <div className="bg-[#F5F1EA] rounded-xl px-8 py-10 lg:px-14 lg:py-14 flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* LEFT CONTENT */}
          <div className="max-w-xl">
            <h2 className="text-lg lg:text-2xl font-bold text-gray-900 mb-1">
              Choose How You Want to Shop
            </h2>

            <p className="text-sm text-[#555555] leading-relaxed mb-4">
              Whether you want something ready to ship or fully customized,
              we’ve got you covered.
            </p>

            <div className="flex flex-wrap gap-4">
              {/* Primary Button */}
            <Link
  href="/design-your-own"
  className="inline-flex items-center justify-center px-5 py-3 text-xs font-semibold uppercase tracking-wide rounded-md 
    bg-[linear-gradient(98.51deg,#C79280_1.39%,#B87D4C_100%)]
    hover:bg-[linear-gradient(98.51deg,#C79280_1.39%,#B87D4C_100%)]
    text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 
    transition-all duration-300"
>
  Design Your Own
</Link>


              {/* Secondary Button */}
           <Link
  href="/products"
  className="inline-flex items-center justify-center px-5 py-3 text-xs font-semibold uppercase tracking-wide rounded-md 
    bg-[#CBAA75] border 
    hover:bg-[#B87D4C] hover:text-white hover:shadow-xl 
    shadow-lg transform hover:-translate-y-0.5 
    transition-all duration-300"
>
  Explore All Products
</Link>

            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative w-full max-w-sm h-[220px] rounded-lg overflow-hidden">
            <Image
              src="/images/service/choose-shop.png"
              alt="Choose how you want to shop"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
