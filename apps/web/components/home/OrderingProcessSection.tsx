"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

const STEPS = [
  {
    title: "Choose Product",
    body: "The garment such as a Polo Shirt or Hat is placed in a particular hoop that holds the item in place during embroidery. This is an essential step as it ensures that the design is embroidered in the right place and with the right tension.",
  },
  {
    title: "Design your art",
    body: "Upload your own artwork or build one from scratch in our online design studio — add text, images, and effects, then position it exactly where you want it on the garment.",
  },
  {
    title: "Order",
    body: "Pick your sizes and quantities, review your live preview, and place the order. Prices are calculated instantly with no hidden charges.",
  },
  {
    title: "Delivery/pick up",
    body: "We print, pack, and ship your order across India — or arrange a convenient pick-up. Track every step from your dashboard.",
  },
];

export default function OrderingProcessSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="w-full bg-white px-4 py-16 sm:px-8 lg:px-[86.5px]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-20">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="font-poppins text-3xl font-bold text-[#111827] sm:text-[48px]">
              Our Ordering Process
            </h2>
            <p className="max-w-3xl text-[18px] text-[#6b7280] sm:text-[24px]">
              Get inspired from some of our happy customers showing off their
              custom apparel
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 pb-12 lg:grid-cols-2">
          {/* Image */}
          <div className="relative h-[380px] overflow-hidden rounded-3xl shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] sm:h-[500px] lg:h-[600px]">
            <Image
              src="/images/home/process-hero.png"
              alt="Custom printed apparel"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 600px"
            />
          </div>

          {/* Accordion */}
          <div className="flex flex-col gap-4">
            {STEPS.map((step, i) => {
              const isActive = active === i;
              return (
                <div
                  key={step.title}
                  className={`overflow-hidden rounded-2xl border ${
                    isActive ? "border-brand-orange" : "border-[#707070]"
                  }`}
                >
                  <button
                    onClick={() => setActive(i)}
                    aria-expanded={isActive}
                    className={`flex w-full items-center justify-between p-6 text-left transition-colors ${
                      isActive ? "bg-brand-orange text-white" : "bg-white text-[#1f2937]"
                    }`}
                  >
                    <span className="text-[18px] font-bold">{step.title}</span>
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
                        isActive
                          ? "border-white/40 text-white"
                          : "border-[#e5e7eb] text-[#1f2937]"
                      }`}
                    >
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          isActive ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </button>
                  {isActive && (
                    <div className="bg-white p-6">
                      <p className="text-[16px] leading-6 text-[#4b5563]">
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
