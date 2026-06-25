"use client"

import Image from "next/image"

export default function ServiceSection() {
  return (
    <section className="bg-[#F5F1EA] py-20">
      <div className="max-w-6xl mx-auto px-4 space-y-20">
        {/* HEADER */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Direct-to-Garment Printing — Your designs, printed on clothing
          </p>
        </div>

        {/* BLOCK 1 */}
        <div className="grid grid-cols-1 text-left md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
            <Image
              src="/images/service/each.png"
              alt="DTG printing process"
              fill
              className="object-cover"
            />
          </div>

          {/* Text */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              Direct-to-garment printing technique
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Direct-to-garment (DTG) printing is a full-color technique where
              ink is sprayed directly onto the garment, much like printing on
              paper. DTG printing works best on cotton or cotton-blend fabrics
              and is ideal for complex, multicolor designs with smooth gradients.
            </p>
          </div>
        </div>

        {/* BLOCK 2 */}
        <div className="grid grid-cols-1 text-left md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              Vibrant colors, comfortable wear
            </h3>

            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Printed designs feel soft to the touch</li>
              <li>Ink absorbs into the fabric fibers</li>
              <li>Great for detailed artwork and photos</li>
              <li>Best suited for cotton garments</li>
            </ul>
          </div>

          {/* Image */}
          <div className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
            <Image
              src="/images/service/each.png"
              alt="Printed t-shirt"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* BLOCK 3 */}
        <div className="grid grid-cols-1 text-left md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
            <Image
              src="/images/service/each.png"
              alt="DTG t-shirt model"
              fill
              className="object-cover"
            />
          </div>

          {/* Text */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Key advantages</h3>

            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>No setup costs for small orders</li>
              <li>Perfect for one-off or custom prints</li>
              <li>Handles intricate designs easily</li>
              <li>Eco-friendly water-based inks</li>
              <li>Excellent print accuracy</li>
            </ul>
          </div>
        </div>

        {/* FULL WIDTH IMAGE */}
        <div className="relative aspect-[16/6] bg-gray-200 rounded-xl overflow-hidden">
          <Image
            src="/images/service/service-bg.png"
            alt="DTG production"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}
