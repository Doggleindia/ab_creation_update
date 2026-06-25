"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    title: "Printful has been there since day one",
    text: `My partner and I started Gay Pride Apparel in 2019 as a side business. After a year and a half, we quit our day jobs and decided to focus on our store full time. Printful has been there since day one. They have been our best partner by far.`,
    name: "Sergio",
    company: "Gay Pride Apparel",
    avatar: "/images/home/client1.png",
  },
  {
    title: "Cut down the time spent working on my store",
    text: `I really love Printful, it's been useful to cut down the time spent working on my store as I have a full-time job alongside this.`,
    name: "Naomi",
    company: "Nemki",
    avatar: "/images/home/client2.png",
  },
  {
    title: "Cut down the time spent working on my store",
    text: `I really love Printful, it's been useful to cut down the time spent working on my store as I have a full-time job alongside this.`,
    name: "Naomi",
    company: "Nemki",
    avatar: "/images/home/client2.png",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-[#F5F1EA] py-24 lg:py-32">
      <div className="max-w-[1240px] mx-auto px-4">
        {/* HEADING */}
        <div className="text-center">
          <h2 className="text-[#171717] text-[38px] md:text-[58px] font-bold leading-[110%] tracking-[-2px]">
            What Our Clients think
          </h2>

          <p className="mt-6 text-[#667085] text-[18px] leading-[30px] font-normal">
            Get inspired from some of our happy customers showing off their
            custom apparel
          </p>
        </div>

        {/* TESTIMONIAL CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 mt-16">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="
                bg-[#FAFAFA]
                border
                border-[#E5E7EB]
                rounded-[16px]
                px-8
                pt-7
                pb-8
                min-h-[304px]
                flex
                flex-col
              "
            >
              {/* QUOTE */}
              <div className="mb-5">
                <Image
                  src="/images/home/quote.png"
                  alt="quote"
                  width={34}
                  height={34}
                  className="object-contain"
                />
              </div>

              {/* TITLE */}
              <h3 className="text-[#171717] text-[20px] leading-[34px] font-bold max-w-[320px]">
                {item.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="mt-4 text-[#555555] text-[16px] leading-[32px] font-normal">
                {item.text}
              </p>

              {/* USER */}
              <div className="flex items-center gap-4 mt-auto pt-8">
                <div className="relative w-[56px] h-[56px] rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <h4 className="text-[#171717] text-[18px] leading-none font-bold">
                    {item.name}
                  </h4>

                  <p className="mt-2 text-[#0A66C2] text-[16px] leading-none font-normal">
                    {item.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BUTTON */}
        <div className="flex justify-center mt-20">
          <Button
            variant="outline"
            className="
              h-[58px]
              min-w-[184px]
              rounded-full
              border-2
              border-[#B87D4C]
              bg-transparent
              hover:bg-[#B87D4C]
              hover:text-white
              text-[#B87D4C]
              text-[20px]
              font-semibold
              px-10
              transition-all
              duration-300
            "
          >
            Read More
          </Button>
        </div>
      </div>
    </section>
  );
}