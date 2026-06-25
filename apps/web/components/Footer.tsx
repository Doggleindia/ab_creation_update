"use client";

import Link from "next/link";
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
    <footer className="bg-[#3a3a3a] text-white">
      {/* MAIN FOOTER */}
      <div className="container mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* LEFT SECTION - BRAND INFO */}
          <div>
            <h3 className="text-2xl font-bold mb-4">PrintStudio</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Precision crafted custom apparel for creative teams and modern brands.
            </p>
          </div>

          {/* SHOP COLUMN */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Shop</h4>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li>
                <Link href="/product-collection?category=t-shirts" className="hover:text-orange-500 transition-colors">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link href="/product-collection?category=hoodies" className="hover:text-orange-500 transition-colors">
                  Hoodies
                </Link>
              </li>
              <li>
                <Link href="/product-collection?category=business-wear" className="hover:text-orange-500 transition-colors">
                  Business Wear
                </Link>
              </li>
              <li>
                <Link href="/product-collection?category=accessories" className="hover:text-orange-500 transition-colors">
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
                <Link href="/dashboard/orders" className="hover:text-orange-500 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-orange-500 transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-orange-500 transition-colors">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-orange-500 transition-colors">
                  Affiliates
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
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 transition-colors text-white font-semibold px-6 py-2 rounded"
              >
                Join
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-600"></div>

      {/* BOTTOM BAR */}
      <div className="container mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between">
        <p className="text-gray-400 text-sm">
          © 2024 PrintStudio. Precision Crafted Goods.
        </p>
        <div className="flex gap-6 text-sm text-gray-400 mt-4 md:mt-0">
          <Link href="/privacy-policy" className="hover:text-orange-500 transition-colors">
            Privacy
          </Link>
          <Link href="/terms-and-conditions" className="hover:text-orange-500 transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
