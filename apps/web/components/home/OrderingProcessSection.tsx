"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

const STEPS = [
  {
    title: "Select a Product",
    body: "Browse our catalog of premium tees, hoodies, polos, caps, and accessories. Pick your base garment, color, and size options.",
  },
  {
    title: "Upload your design",
    body: "Upload your high-resolution artwork or build one from scratch in our online design studio — position text, logos, and graphics with instant visual feedback.",
  },
  {
    title: "Mockup & Preview",
    body: "Review a live preview of your customized garment in the Design Studio before finalizing your order. Verify placement, colors, and design scale.",
  },
  {
    title: "Order & Fast Shipping",
    body: "Place your order with transparent pricing and no setup fees. We print, inspect, and ship your custom gear straight to your doorstep.",
  },
];

export default function OrderingProcessSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="w-full bg-white px-4 py-20 sm:px-8 lg:px-[86.5px]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-poppins text-3xl font-extrabold text-[#111827] sm:text-[42px]">
            Our Ordering Process
          </h2>
          <p className="max-w-2xl font-poppins text-[16px] text-[#6b7280] sm:text-[20px]">
            From idea to delivery: step-by-step custom apparel created in 4 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="relative h-[380px] overflow-hidden rounded-3xl shadow-xl sm:h-[480px] lg:h-[540px]">
            <Image
              src="/images/home/process-hero.png"
              alt="Custom printed apparel order process"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 600px"
            />
          </div>

          {/* Accordion steps */}
          <div className="flex flex-col gap-4">
            {STEPS.map((step, i) => {
              const isActive = active === i;
              return (
                <div
                  key={step.title}
                  className={`overflow-hidden rounded-2xl border transition-all ${
                    isActive ? "border-brand-orange shadow-md" : "border-[#e5e7eb]"
                  }`}
                >
                  <button
                    onClick={() => setActive(i)}
                    aria-expanded={isActive}
                    className={`flex w-full items-center justify-between p-6 text-left font-poppins transition-colors ${
                      isActive
                        ? "bg-brand-orange text-white"
                        : "bg-white text-[#1f2937] hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-[18px] font-bold sm:text-[20px]">
                      {step.title}
                    </span>
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-transform ${
                        isActive
                          ? "border-white/40 bg-white/10 text-white rotate-180"
                          : "border-[#d1d5db] text-[#4b5563]"
                      }`}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </span>
                  </button>
                  {isActive && (
                    <div className="bg-white p-6 pt-4">
                      <p className="font-poppins text-[15px] leading-relaxed text-[#4b5563]">
                        {step.body}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
