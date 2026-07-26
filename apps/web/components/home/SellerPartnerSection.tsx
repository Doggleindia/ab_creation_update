import Image from "next/image";
import Link from "next/link";

export default function SellerPartnerSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#faf3ea]">
      <div className="mx-auto flex min-h-[300px] max-w-[1463px] flex-col items-start justify-center gap-4 px-6 py-12 sm:px-16 lg:min-h-[400px] lg:py-0">
        <div className="relative z-10 max-w-[520px]">
          <h2 className="font-poppins text-3xl font-semibold text-[#111827] sm:text-[40px]">
            Become a Seller Partner
          </h2>
          <p className="mt-3 text-[18px] font-medium text-black sm:text-[20px]">
            Partner with us and grow your business
          </p>
          <div className="mt-5 flex items-center gap-2">
            <Link
              href="/become-a-seller"
              className="rounded-full bg-brand-orange px-6 py-2.5 text-[13px] font-bold text-white shadow-[0px_7px_10px_-2px_#fed7aa] transition-opacity hover:opacity-90"
            >
              Join Now
            </Link>
            <Link
              href="/contact-us"
              className="rounded-full border border-black px-6 py-2.5 text-[13px] font-bold text-black transition-colors hover:bg-black hover:text-white"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative image (hidden on small screens where it would crowd the copy) */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] lg:block">
        <Image
          src="/images/home/seller-cta.png"
          alt="Bulk apparel order ready for delivery"
          fill
          className="object-contain object-right"
          sizes="55vw"
        />
      </div>
    </section>
  );
}
