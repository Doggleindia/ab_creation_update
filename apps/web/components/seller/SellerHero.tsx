import Image from "next/image";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function SellerHero() {
  return (
    <section className="w-full bg-white pb-[60px] pt-10">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-12 px-6 lg:flex-row lg:px-10">
        {/* Left copy */}
        <div className="flex w-full max-w-[624px] flex-col gap-4">
          <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#ffb691]">
            Sell with AB Creation
          </p>
          <h1 className="font-poppins text-[40px] font-semibold leading-[1.05] tracking-[-0.96px] text-[#242424] sm:text-[52px] lg:text-[60px]">
            Build Your Brand. We&nbsp;Handle the Rest.
          </h1>
          <p className="max-w-[512px] pt-2 text-[18px] leading-[28.8px] text-[#374151]">
            No inventory, no upfront costs. Just design and sell premium custom
            apparel to your audience while we take care of production and
            shipping.
          </p>
          <div className="flex flex-wrap gap-4 pt-6">
            <Link
              href="/become-a-seller/register"
              className="rounded-full bg-brand-orange px-8 py-[17px] text-[16px] font-bold text-white transition-opacity hover:opacity-90"
            >
              Start Selling
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border-2 border-[#c8c6c5] px-[34px] py-[16px] text-[16px] font-bold text-[#1b1c1b] transition-colors hover:border-black"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Right collage */}
        <div className="relative hidden h-[600px] min-w-0 flex-1 md:block">
          {/* green-framed photo */}
          <div className="absolute right-0 top-[74px] rotate-3">
            <div className="h-[320px] w-[256px] overflow-hidden rounded-[16px] border-8 border-[#10b981] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
              <Image
                src="/images/seller/hero-photo-1.jpg"
                alt="Creator preparing apparel orders"
                width={512}
                height={279}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          {/* orange-framed photo */}
          <div className="absolute bottom-[-14px] left-[66px] -rotate-6">
            <div className="h-[288px] w-[288px] overflow-hidden rounded-[16px] border-8 border-brand-orange p-2 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
              <Image
                src="/images/seller/hero-photo-2.jpg"
                alt="Seller working in her studio"
                width={512}
                height={279}
                className="h-full w-full rounded-[8px] object-cover"
              />
            </div>
          </div>
          {/* Seller insights card */}
          <div className="absolute left-0 top-10 flex w-[320px] flex-col gap-6 rounded-[12px] bg-white/90 p-[25px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-bold text-[#3d3d3d]">
                Seller Insights
              </span>
              <TrendingUp className="h-4 w-5 text-[#10b981]" />
            </div>
            <div className="flex flex-col gap-4">
              <span className="h-2 w-full rounded-full bg-[#fb626b]" />
              <span className="h-2 w-[75%] rounded-full bg-[#fb626b]" />
              <div className="flex items-end justify-between pt-4">
                <span className="text-[24px] font-bold text-[#3d3d3d]">
                  ₹12,400
                </span>
                <span className="text-[14px] text-[#10b981]">
                  Monthly Profit
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
