"use client";

import Image from "next/image";
import Link from "next/link";

export default function ChooseYourStyle() {
  return (
    <section className="w-full py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT IMAGE GRID */}
          <div className="grid grid-cols-[160px_1fr] gap-6">
            {/* Left small images */}
            <div className="flex flex-col gap-6">
              <div className="relative h-[160px] w-full overflow-hidden rounded-md">
                <Image
                  src="/images/service/choose-your-style.png"
                  alt="DTF Printing Process"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="relative h-[160px] w-full overflow-hidden rounded-md">
                <Image
                  src="/images/home/choose-your-style.png"
                  alt="DTF Heat Press"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right large image */}
            <div className="relative h-[360px] w-full overflow-hidden rounded-md">
              <Image
                src="/images/home/choose-your-style.png"
                alt="DTF Printed T-Shirt"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              1. DTF (Direct-to-Film) Digital Printing
            </h3>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              DTF is a modern printing method known for producing high-detail,
              vibrant, and long-lasting designs. Your artwork is printed on a
              special film and then heat-transferred directly onto the garment,
              delivering excellent results on almost any fabric.
            </p>

            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-800 mb-3">
                Best For
              </p>

              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Small Batches</li>
                <li>Ideal for orders from 1 to 20 pieces</li>
                <li>Complex Artwork</li>
                <li>
                  Perfect for high-resolution images, gradients, and multi-color
                  logos
                </li>
               
              </ul>
            </div>

            <Link
              href="/service/:all-products"
              className="inline-flex float-end items-center justify-center px-6 py-3 text-xs font-semibold tracking-wide uppercase rounded-md bg-[#CBAA75] text-black hover:bg-[#CBAA75] transition"
            >
              Explore All Products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
