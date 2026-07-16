import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: "💰", label: "Lowest Price Guaranteed" },
  { icon: "🚚", label: "Pan India Delivery" },
  { icon: "⚡", label: "Super Rush Delivery" },
];

export default function Hero() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-16 px-4 pb-16 pt-10 sm:px-8">
        {/* Hero row */}
        <div className="flex w-full flex-col items-center gap-12 lg:flex-row lg:justify-between">
          {/* Copy */}
          <div className="flex w-full max-w-[694px] flex-col items-start gap-14">
            <div className="flex flex-col gap-4">
              <h1 className="font-poppins text-4xl font-semibold leading-[1.25] text-[#111827] sm:text-5xl lg:text-[60px]">
                Printed for You.
                <br />
                Built for Your Brand.
              </h1>
              <p className="max-w-[572px] text-[18px] font-medium leading-7 text-black sm:text-[20px]">
                Shop ready-made printed tees or bring your own design. We print
                it exactly the way you want it.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/design-studio"
                className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-8 py-4 text-[18px] font-bold text-white shadow-[0px_10px_15px_-3px_#fed7aa,0px_4px_6px_-4px_#fed7aa] transition-opacity hover:opacity-90"
              >
                Customize Product
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/collection"
                className="inline-flex items-center gap-2 rounded-full border border-black px-8 py-4 text-[18px] font-bold text-black transition-colors hover:bg-black hover:text-white"
              >
                Explore Collection
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Collage */}
          <div className="relative aspect-square w-full max-w-[554px] shrink-0">
            <Image
              src="/images/home/hero-base.png"
              alt="Custom printed apparel"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 90vw, 554px"
            />
            {/* Top-left tee tile */}
            <div className="absolute left-[7%] top-[11%] h-[32.8%] w-[27.1%] rounded-[2.3%] bg-[#add7dc]" />
            <div className="absolute left-[8.3%] top-[6%] h-[37.8%] w-[24.3%] overflow-hidden rounded-[2.3%]">
              <Image
                src="/images/home/hero-tee.png"
                alt="Printed tee"
                fill
                className="object-cover"
                sizes="150px"
              />
            </div>
            {/* Bottom-right jacket tile */}
            <div className="absolute left-[48.1%] top-[62%] h-[32.5%] w-[44.6%] rounded-[4.7%] bg-[#10b981]" />
            <div className="absolute left-[48%] top-[55%] h-[39.6%] w-[44.9%] overflow-hidden rounded-[4.7%]">
              <Image
                src="/images/home/hero-jacket.png"
                alt="Printed jacket"
                fill
                className="object-cover"
                sizes="250px"
              />
            </div>
          </div>
        </div>

        {/* Feature banner */}
        <div className="grid w-full grid-cols-1 gap-4 rounded-md border border-[#bfd6e4] bg-white p-3 shadow-[-1px_1px_3.5px_rgba(0,0,0,0.13)] sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex items-center justify-center gap-4 rounded-2xl bg-[#f9fafb] px-6 py-5"
            >
              <span className="text-3xl leading-9">{f.icon}</span>
              <span className="text-[16px] font-bold text-[#111827]">
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
