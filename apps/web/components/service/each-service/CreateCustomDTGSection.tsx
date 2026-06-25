"use client"

import Image from "next/image"
import { Check } from "lucide-react"

const features = [
  {
    title: "Choose from 140+ products",
    description:
      "From classic quality tees to trendy streetwear items, explore 140+ products, ready to be customized with your DTG prints.",
  },
  {
    title: "Discover multiple eco-friendly options",
    description:
      "Check out eco-friendly items made from recycled and organic materials and start your own sustainable fashion brand.",
  },
  {
    title: "Add prints on the sleeves, pockets, legs, and more",
    description:
      "Don’t be limited by front or back designs only—discover other placements for DTG-printed products.",
  },
  {
    title: "Easy checkout and wallet available",
    description:
      "Customize several products with a DTG-printed logo on custom clothing and raise your brand awareness.",
  },
]

export default function CreateCustomDTGSection() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold">
            CREATE CUSTOM DTG-PRINTED PRODUCTS WITH US
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Customize apparel and accessories with your designs
          </p>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* LEFT FEATURES */}
          <div className="space-y-8">
            {features.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1 text-[#f4b860]">
                  <Check size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative aspect-[3/4] max-w-sm mx-auto rounded-lg overflow-hidden bg-gray-100">
            <Image
              src="/images/service/choose-shop.png"
              alt="DTG printed t-shirt"
              fill
              className="object-cover relative service-image"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
