import Image from "next/image";
import Link from "next/link";
import NewsletterForm from "@/components/layout/NewsletterForm";

const SHOP_LINKS = [
  { label: "T-Shirts", href: "/collection?category=t-shirts" },
  { label: "Hoodies", href: "/collection?category=hoodies" },
  { label: "Business Wear", href: "/collection?category=business-wear" },
  { label: "Accessories", href: "/collection?category=accessories" },
];

const SUPPORT_LINKS = [
  { label: "Track Order", href: "/dashboard/orders" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "Affiliates", href: "/become-a-seller" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-brand-footer font-poppins text-[#f3f0ee]">
      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-16 md:py-24">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <span className="flex items-center gap-3">
              <Image
                src="/ab-creation-logo.png"
                alt="AB Creation logo"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <span className="text-[24px] font-bold text-[#f3f0ee]">
                AB Creation
              </span>
            </span>
            <p className="max-w-[240px] text-[16px] leading-[25.6px] text-[#f3f0ee]/80">
              Precision crafted custom apparel for creative teams and modern
              brands.
            </p>
          </div>

          {/* Shop */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[16px] font-semibold text-[#f3f0ee]">Shop</h4>
            {SHOP_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-[16px] text-[#f3f0ee]/80 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[16px] font-semibold text-[#f3f0ee]">Support</h4>
            {SUPPORT_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-[16px] text-[#f3f0ee]/80 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[16px] font-semibold text-[#f3f0ee]">
              Newsletter
            </h4>
            <p className="text-[14px] leading-5 text-[#f3f0ee]/80">
              Join for design tips and bulk discounts.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-[14px] text-[#f3f0ee]/60">
            © 2026 AB Creation. Precision Crafted Goods.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy-policy"
              className="text-[14px] text-[#f3f0ee]/60 transition-colors hover:text-white"
            >
              Privacy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="text-[14px] text-[#f3f0ee]/60 transition-colors hover:text-white"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
