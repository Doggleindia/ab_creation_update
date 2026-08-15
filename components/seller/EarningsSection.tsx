import Image from "next/image";

export default function EarningsSection() {
  return (
    <section className="w-full bg-[#eef1f4] py-16">
      <div className="mx-auto max-w-[1152px] px-6 lg:px-10">
        <h2 className="mb-10 text-center font-poppins text-[28px] font-semibold text-[#242424] sm:text-[32px]">
          Transparency in Earnings
        </h2>

        <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-3">
          {/* Retail price */}
          <div className="flex flex-col overflow-hidden rounded-[12px] bg-white shadow-sm">
            <div className="relative h-[180px] w-full bg-[#f3f3f4]">
              <Image
                src="/images/home/service-embroidery.png"
                alt="Embroidered apparel"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
            <div className="flex flex-col items-center gap-1 px-6 py-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#9ca3af]">
                Retail Price
              </p>
              <p className="text-[20px] font-bold text-[#242424]">₹450.00</p>
              <p className="text-[14px] font-semibold text-[#374151]">
                You set the final price
              </p>
            </div>
          </div>

          {/* Base cost */}
          <div className="flex flex-col overflow-hidden rounded-[12px] bg-white shadow-sm sm:-my-4">
            <div className="relative h-[220px] w-full bg-[#f3f3f4]">
              <Image
                src="/images/home/service-screen.png"
                alt="Screen printing base cost"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
            <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
              <span className="flex items-end gap-1">
                <span className="h-5 w-1.5 rounded-full bg-brand-orange/40" />
                <span className="h-8 w-1.5 rounded-full bg-brand-orange" />
                <span className="h-6 w-1.5 rounded-full bg-brand-orange/70" />
              </span>
              <p className="text-[14px] font-semibold text-[#374151]">
                Base cost is deducted
              </p>
            </div>
          </div>

          {/* Profit */}
          <div className="flex flex-col overflow-hidden rounded-[12px] bg-white shadow-sm">
            <div className="relative h-[180px] w-full bg-[#f3f3f4]">
              <Image
                src="/images/home/service-dtg.png"
                alt="DTG printed apparel"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
            <div className="flex flex-col items-center gap-1 px-6 py-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#9ca3af]">
                Your Profit
              </p>
              <p className="text-[20px] font-bold text-[#16a34a]">₹200.00</p>
              <p className="text-[14px] font-semibold text-[#374151]">
                You keep the difference
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
