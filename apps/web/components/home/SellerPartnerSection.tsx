"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SellerPartnerSection() {
  return (
    <section className="w-full bg-[#F5F1EA] overflow-hidden">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[420px]">
          
          {/* LEFT CONTENT */}
          <div className="px-6 sm:px-10 lg:px-24 py-16 lg:py-0">
            <h2 className="text-[#171717] text-[42px] sm:text-[52px] leading-[110%] font-bold tracking-[-1.5px]">
              Become a Seller Partner
            </h2>

            <p className="mt-5 text-[#1F2937] text-[18px] sm:text-[20px] leading-[32px] font-normal max-w-[520px]">
              Partner with us and grow your business
            </p>

            {/* BUTTONS */}
            <div className="flex flex-wrap items-center gap-4 mt-10">
              <Button
                asChild
                className="
                  h-[52px]
                  min-w-[146px]
                  rounded-full
                  bg-[#B87D4C]
                  hover:bg-[#B87D4C]
                  text-white
                  text-[15px]
                  font-semibold
                  shadow-none
                  px-8
                "
              >
                <Link href="/become-a-seller">Join Now</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="
                  h-[52px]
                  min-w-[146px]
                  rounded-full
                  border-[#2B2B2B]
                  bg-transparent
                  hover:bg-transparent
                  text-[#171717]
                  text-[15px]
                  font-semibold
                  px-8
                "
              >
                <Link href="/contact-us">Contact us</Link>
              </Button>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative h-full w-full flex items-end justify-end">
            <div className="relative w-full h-[420px]">
              <Image
                src="/images/home/seller-partner.png"
                alt="Seller Partner"
                fill
                priority
                className="
                  object-contain
                  object-right-bottom
                  scale-[1.02]
                "
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}