"use client";

import { Edit3, Grid, Scissors } from "lucide-react";

export default function ChooseYourCraft() {
  const crafts = [
    {
      icon: Edit3,
      title: "DTF Print",
      description:
        "Perfect for complex, multi-colored designs and small batch orders. High durability and vibrant colors.",
      features: ["No minimum order", "Stretch resistant", "High color detail"],
    },
    {
      icon: Grid,
      title: "Screen Print",
      description:
        "The gold standard for bulk orders. Cost-effective and extremely long-lasting ink application.",
      features: ["Min 25 pieces", "Breathable feel", "Vibrant solid colors"],
    },
    {
      icon: Scissors,
      title: "Embroidery",
      description:
        "Premium textured feel for a professional corporate look. Ideal for logos on chest or sleeves.",
      features: ["Min 10 pieces", "Longest lasting", "3D textured finish"],
    },
  ];

  return (
    <section className="w-full border-t border-[#e9e9e9] bg-white px-4 py-14 sm:px-8 lg:px-[86.5px]">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="pb-8 font-poppins text-[22px] font-bold text-[#1b1c1b]">
          Choose Your Craft
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {crafts.map((craft) => {
            const IconComponent = craft.icon;
            return (
              <div
                key={craft.title}
                className="flex flex-col rounded-2xl border border-[#e5e7eb] bg-white p-7 transition-all hover:shadow-md"
              >
                {/* Icon box */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
                  <IconComponent className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="mt-5 font-poppins text-[20px] font-bold text-[#1b1c1b]">
                  {craft.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-[14px] leading-relaxed text-[#6b7280]">
                  {craft.description}
                </p>

                {/* Bullet List */}
                <div className="mt-6 flex flex-col gap-2 pt-2 text-[13.5px] text-[#4b5563]">
                  {craft.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#9ca3af]" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
