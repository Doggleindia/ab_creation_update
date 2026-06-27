"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <footer className="bg-[#171717] text-white">
      {/* MAIN FOOTER */}
      <div className="container mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* LEFT SECTION - BRAND INFO */}
          <div>
            <Image
              src="/ab-creation-logo.png"
              alt="AB Creation"
              width={160}
              height={160}
              className="h-24 w-auto mb-4"
            />
            <p className="text-gray-300 text-sm leading-relaxed">
              Precision crafted custom apparel for creative teams and modern brands.
            </p>
          </div>

          {/* SHOP COLUMN */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Shop</h4>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li>
                <Link href="/product-collection?category=t-shirts" className="hover:text-[#CBAA75] transition-colors">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link href="/product-collection?category=hoodies" className="hover:text-[#CBAA75] transition-colors">
                  Hoodies
                </Link>
              </li>
              <li>
                <Link href="/product-collection?category=business-wear" className="hover:text-[#CBAA75] transition-colors">
                  Business Wear
                </Link>
              </li>
              <li>
                <Link href="/product-collection?category=accessories" className="hover:text-[#CBAA75] transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* SUPPORT COLUMN */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Support</h4>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li>
                <Link href="/dashboard/orders" className="hover:text-[#CBAA75] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/refund-cancellation-policy" className="hover:text-[#CBAA75] transition-colors">
                  Shipping &amp; Returns
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-[#CBAA75] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/become-a-seller" className="hover:text-[#CBAA75] transition-colors">
                  Become a Seller
                </Link>
              </li>
            </ul>
          </div>

          {/* NEWSLETTER COLUMN */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-300 text-sm mb-4">
              Join for design tips and bulk discounts.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-[#CBAA75]"
              />
              <button
                type="submit"
                className="bg-[#CBAA75] hover:bg-[#B87D4C] transition-colors text-[#171717] font-semibold px-6 py-2 rounded"
              >
                Join
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-[#CBAA75]/20"></div>

      {/* BOTTOM BAR */}
      <div className="container mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between">
        <p className="text-gray-400 text-sm">
          © 2024 AB Creation. Precision Crafted Goods.
        </p>
        <div className="flex gap-6 text-sm text-gray-400 mt-4 md:mt-0">
          <Link href="/privacy-policy" className="hover:text-[#CBAA75] transition-colors">
            Privacy
          </Link>
          <Link href="/terms-and-conditions" className="hover:text-[#CBAA75] transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
