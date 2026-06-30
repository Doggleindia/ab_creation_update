// ProductInformation.tsx
"use client";

import { motion } from "framer-motion";
import {
  Shirt,
  Globe,
  Scissors,
  Layers,
  Droplets,
  Maximize2,
} from "lucide-react";

const KEY_FEATURES = [
  {
    icon: Shirt,
    title: "100% Cotton",
    desc: "100% ring-spun US cotton for long-lasting comfort.",
  },
  {
    icon: Globe,
    title: "Country of origin",
    desc: "Made in India",
  },
  {
    icon: Scissors,
    title: "Double-needle stitching on all seams",
    desc: "The garment is sewn around the finished edges with double stitching, making it long-lasting.",
  },
  {
    icon: Shirt,
    title: "Without side seams",
    desc: "The garment is knit in one piece using tubular knit, it reduces fabric waste and makes the garment more attractive.",
  },
  {
    icon: Droplets,
    title: "Garment-dyed fabric",
    desc: "The garment is dyed after it's been constructed, giving it a soft color and texture.",
  },
  {
    icon: Maximize2,
    title: "S to 4XL",
    desc: "Available in multiple sizes from S to 4XL (select partners) so your customers can find the perfect fit. Consult our size chart for all available sizes.",
  },
];

const DEFAULT_ABOUT =
  "Comfort Colors introduces the garment-dyed t-shirt; a fully customizable tee made with 100% ring-spun cotton. The soft-washed, garment-dyed fabric brings extra coziness to your wardrobe while the relaxed fit makes it an excellent daily choice. The double-needle stitching throughout the tee makes it highly durable, while the lack of side seams helps the shirt retain its tubular shape.";

const CARE_TEXT =
  "Machine wash: cold (max 30C or 90F); Do not bleach; Tumble dry: low heat; Iron, steam or dry: low heat; Do not dryclean.";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-10 py-10 border-b border-[#ECECEC]">
      <h3 className="text-[18px] font-bold text-[#171717]">{label}</h3>
      <div>{children}</div>
    </div>
  );
}

export default function ProductInformation({
  product,
}: {
  product?: any;
}) {
  const about = product?.description || DEFAULT_ABOUT;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white"
    >
      <div className="max-w-[1000px] mx-auto px-4 py-16">
        {/* HEADING */}
        <h2 className="text-center text-[20px] font-bold tracking-wide text-[#171717]">
          INFORMATION
        </h2>
        <div className="mt-5 border-t border-[#ECECEC]" />

        {/* ABOUT */}
        <Row label="About">
          <p className="text-[13px] text-[#666] leading-[24px] max-w-[640px]">
            {about}
          </p>
        </Row>

        {/* KEY FEATURES */}
        <Row label="Key features">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-9">
            {KEY_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title}>
                  <Icon
                    className="h-6 w-6 text-[#171717]"
                    strokeWidth={1.5}
                  />
                  <h4 className="mt-3 text-[13px] font-bold text-[#171717]">
                    {f.title}
                  </h4>
                  <p className="mt-1 text-[12px] text-[#777] leading-[20px]">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </Row>

        {/* CARE INSTRUCTIONS */}
        <Row label="Care instructions">
          <div className="flex flex-wrap items-center gap-5">
            {[Droplets, Scissors, Layers, Globe, Maximize2].map(
              (Icon, i) => (
                <Icon
                  key={i}
                  className="h-6 w-6 text-[#171717]"
                  strokeWidth={1.5}
                />
              )
            )}
          </div>
          <p className="mt-5 text-[12px] text-[#777] leading-[20px] max-w-[560px]">
            {CARE_TEXT}
          </p>
        </Row>
      </div>
    </motion.section>
  );
}
