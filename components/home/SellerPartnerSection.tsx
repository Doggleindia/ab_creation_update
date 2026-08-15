import Image from "next/image";
import Link from "next/link";

export default function SellerPartnerSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#faf3ea]">
      <div className="mx-auto flex min-h-[300px] max-w-[1280px] flex-col items-start justify-center gap-4 px-6 py-12 sm:px-12 lg:min-h-[380px] lg:py-0">
        <div className="relative z-10 max-w-[520px]">
          <h2 className="font-poppins text-3xl font-extrabold text-[#111827] sm:text-[40px]">
            Become a Seller Partner
          </h2>
          <p className="mt-3 font-poppins text-[18px] font-medium text-[#374151] sm:text-[20px]">
            Earn with custom merchandise. Open your store today.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/become-a-seller"
              className="rounded-full bg-brand-orange px-8 py-3 font-poppins text-[15px] font-bold text-white shadow-md transition-all hover:bg-brand-orange/90"
            >
              Join Now
            </Link>
            <Link
              href="/contact-us"
              className="rounded-full border-2 border-[#111827] px-8 py-3 font-poppins text-[15px] font-bold text-[#111827] transition-colors hover:bg-[#111827] hover:text-white"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative apparel basket image */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] lg:block">
        <Image
          src="/images/home/seller-cta.png"
          alt="Become a seller partner with custom merch"
          fill
          className="object-contain object-right"
          sizes="52vw"
        />
      </div>
    </section>
  );
}
