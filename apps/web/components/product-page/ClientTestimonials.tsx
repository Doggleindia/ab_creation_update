"use client";

import Image from "next/image";

const testimonials = [
  {
    title: "Printful has been there since day one",
    text: "My partner and I started Gay Pride Apparel in 2019 as a side business. After a year and a half, we quit our day jobs and decided to focus on our store full time. Printful has been there since day one.",
    name: "Sergio",
    company: "Gay Pride Apparel",
    avatar: "/images/home/client1.png",
  },
  {
    title: "Cut down the time spent working on my store",
    text: "I really love Printful, it's been useful to cut down the time spent working on my store as I have a full-time job alongside this.",
    name: "Naomi",
    company: "Nemki",
    avatar: "/images/home/client2.png",
  },
  {
    title: "Printful has fulfilled over $100,000 in orders for me",
    text: "I've been using Printful since 2017 and sold over $100,000 worth of print-on-demand products that they've fulfilled. I'm a big fan of them as a company and their support team is very helpful.",
    name: "Ryan",
    company: "Ryan Hogue Passive Income",
    avatar: "/images/home/client1.png",
  },
];

export default function ClientTestimonials() {
  return (
    <section className="w-full bg-[#F5F1EA]">
      <div className="max-w-[1240px] mx-auto px-4 py-16 lg:py-20">
        <h2 className="text-center text-[#171717] text-[22px] md:text-[26px] font-bold tracking-wide uppercase">
          Hear What Our Client Say
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-[#E5E7EB] rounded-[12px] px-7 pt-6 pb-7 flex flex-col"
            >
              {/* QUOTE MARK */}
              <span className="text-[#B87D4C] text-[44px] leading-none font-serif">
                &ldquo;
              </span>

              {/* TITLE */}
              <h3 className="text-[#171717] text-[16px] leading-[24px] font-bold mt-1">
                {item.title}
              </h3>

              {/* TEXT */}
              <p className="mt-3 text-[#666666] text-[13px] leading-[22px]">
                {item.text}
              </p>

              {/* USER */}
              <div className="flex items-center gap-3 mt-auto pt-6">
                <div className="relative w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <h4 className="text-[#171717] text-[14px] leading-none font-bold">
                    {item.name}
                  </h4>
                  <p className="mt-1 text-[#0A66C2] text-[13px] leading-none">
                    {item.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
