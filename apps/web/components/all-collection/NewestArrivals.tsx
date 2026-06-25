"use client"

import Image from "next/image"

const products = [
  {
    image: "/images/home/Menclothing.png",
    title: "Flower design",
    subtitle: "Stylish color print",
    badge: "Best Seller",
    badgeColor: "bg-yellow-400",
  },
  {
    image: "/images/home/Menclothing.png",
    title: "Flower design",
    subtitle: "Stylish color print",
  },
  {
    image: "/images/home/Menclothing.png",
    title: "Flower design",
    subtitle: "Stylish color print",
    badge: "Best Seller",
    badgeColor: "bg-yellow-400",
  },
  {
    image: "/images/home/Menclothing.png",
    title: "Flower design",
    subtitle: "Stylish color print",
    badge: "New",
    badgeColor: "bg-emerald-400",
  },
  {
    image: "/images/home/Menclothing.png",
    title: "Flower design",
    subtitle: "Stylish color print",
    badge: "Best Seller",
    badgeColor: "bg-yellow-400",
  },
]

export default function NewestArrivals() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-10 max-w-xl">
          <h2 className="text-lg font-semibold">
            Explore the newest arrivals
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Coming in hot—the latest additions to our product catalog you don’t
            want to miss
          </p>
        </div>

        {/* GRID – EXACTLY LIKE FIGMA */}
        <div
          className="
            grid gap-6
            grid-cols-2
            sm:grid-cols-3
            lg:grid-cols-5
          "
        >
          {products.map((p, i) => (
            <div key={i} className="bg-white">
              {/* IMAGE */}
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  className="object-cover"
                />

                {p.badge && (
                  <span
                    className={`absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full font-medium ${p.badgeColor}`}
                  >
                    {p.badge}
                  </span>
                )}
              </div>

              {/* CONTENT */}
              <div className="mt-3">
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
