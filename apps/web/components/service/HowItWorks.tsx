"use client";

import Image from "next/image";

export default function HowItWorks() {
  return (
    <section className="w-full py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-xl lg:text-2xl font-semibold tracking-wide text-gray-900 mb-3">
            HOW TO CUSTOM DESIGN & ORDER ONLINE IN 3 EASY STEPS
          </h2>
          <p className="text-sm text-gray-600">
            Understand the process, so you can style your creative
          </p>
        </div>

        {/* STEP 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center mb-24">
          {/* Image */}
          <div className="flex justify-center">
            <Image
              src="/images/service/how4.png"
              alt="Pick your garment"
              width={420}
              height={420}
              className="object-contain"
            />
          </div>

          {/* Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              1. Pick Your Garment
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Browse our catalog of 463+ high-quality products, including:
            </p>

            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5 mb-4">
              <li>T-shirts, polo shirts, hoodies & sweatshirts</li>
              <li>Jackets, uniforms & workwear</li>
              <li>Kids, men’s & women’s styles</li>
            </ul>

            <p className="text-sm text-gray-600">
              Choose from different fabric options, colors, and thickness
              levels (lightweight, regular, premium) to suit your comfort
              and purpose.
            </p>
          </div>
        </div>

        {/* STEP 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center mb-24">
          {/* Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              2. Add Your Design or Logo
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload your existing design or create new artwork using our
              free online Design Maker.
            </p>

            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
              <li>Add logos, text, or graphics</li>
              <li>Adjust size, placement, and colors</li>
              <li>Perfect for single pieces or bulk orders</li>
              <li>Select other details</li>
            </ul>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="/images/service/how2.png"
              alt=""
              width={420}
              height={420}
              className="rounded-md object-cover"
            />
            
          </div>
        </div>

        {/* STEP 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Image */}
          <div className="flex justify-center">
            <Image
              src="/images/service/how3.png"
              alt="We handle the rest"
              width={420}
              height={420}
              className="object-contain"
            />
          </div>

          {/* Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Relax — We’ll Handle the Rest
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Place your order and sit back while we take care of:
              <br />
              High-quality printing
              <br />
              Careful packing
              <br />
              Reliable shipping
              <br />
              <br />
              Enjoy easy and secure payments, including wallet options,
              ensuring a smooth and stress-free checkout experience.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
