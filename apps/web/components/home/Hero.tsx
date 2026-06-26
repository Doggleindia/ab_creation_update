"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="min-h-screen bg-white py-16 md:py-24 font-sans">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8">
        
        {/* TOP SECTION - SPLIT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center mb-16 md:mb-24">
          
          {/* LEFT - TEXT & BUTTONS */}
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 bg-[#171717] text-[#CBAA75] text-xs font-semibold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6">
              ✦ Premium Custom Printing
            </span>
            <h1 className="text-5xl md:text-[64px] font-bold text-[#171717] leading-[1.15] mb-6 tracking-tight">
              Printed for You.<br />
              Built for Your Brand.
            </h1>
            <p className="text-[17px] text-gray-800 mb-10 leading-relaxed font-medium">
              Shop ready-made printed tees or bring your own design<br className="hidden sm:block" />
              We print it exactly the way you want it.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/design-editor" className="bg-[#171717] hover:bg-[#B87D4C] text-white px-7 py-3.5 rounded-full text-[16px] font-bold flex items-center justify-center transition-all shadow-[0_8px_20px_-6px_rgba(184,125,76,0.5)]">
                Customize Product
                <ArrowRight className="ml-2 w-5 h-5" strokeWidth={2.5} />
              </Link>
              <Link href="/product-collection" className="bg-white border border-gray-300 hover:border-gray-900 text-gray-900 px-7 py-3.5 rounded-full text-[16px] font-bold flex items-center justify-center transition-all">
                Explore Collection
                <ArrowRight className="ml-2 w-5 h-5" strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          {/* RIGHT - MASONRY IMAGES GRID */}
          <div className="w-full">
            <img
              src="/images/home/heroImage.png"
              alt="Hero Image"
              className="w-full h-auto"
            />
          </div>
          
        </div>

        {/* BOTTOM SECTION - FEATURE BAR */}
        <div className="w-full border border-gray-200 rounded-2xl p-2 md:p-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Feature 1 */}
            <div className="bg-[#F5F1EA] rounded-xl py-5 px-4 flex items-center justify-center gap-3">
              <span className="text-xl leading-none">💰</span>
              <span className="text-[15px] font-bold text-gray-900 tracking-tight">Lowest Price Guaranteed</span>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-[#F5F1EA] rounded-xl py-5 px-4 flex items-center justify-center gap-3">
              <span className="text-xl leading-none">🚚</span>
              <span className="text-[15px] font-bold text-gray-900 tracking-tight">Pan India Delivery</span>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-[#F5F1EA] rounded-xl py-5 px-4 flex items-center justify-center gap-3">
              <span className="text-xl leading-none">⚡</span>
              <span className="text-[15px] font-bold text-gray-900 tracking-tight">Super Rush Delivery</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}