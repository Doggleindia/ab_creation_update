"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, User, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Customize Design", href: "/design-studio" },
  { label: "Collection", href: "/collection", hasDropdown: true },
  { label: "Bulk Order", href: "/bulk-order" },
  { label: "Join as Seller", href: "/become-a-seller" },
  { label: "Contact Us", href: "/contact-us" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#f3f4f6] bg-white">
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-8">
        {/* Left: logo + desktop links */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-[24px] font-bold tracking-[-1.2px] text-brand-ink"
          >
            AB CREATION
          </Link>

          <ul className="hidden items-center gap-5 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="flex items-center gap-1 text-[14px] font-medium text-brand-text transition-colors hover:text-brand-orange"
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown className="h-3 w-3" />}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            aria-label="Search"
            className="p-2 text-brand-ink transition-colors hover:text-brand-orange"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/login"
            aria-label="Account"
            className="p-2 text-brand-ink transition-colors hover:text-brand-orange"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href="/design-studio"
            className="hidden rounded-full bg-brand-orange px-6 py-2 text-[16px] font-semibold text-white transition-opacity hover:opacity-90 sm:block"
          >
            Design Now
          </Link>
          <button
            aria-label="Menu"
            className="p-2 text-brand-ink lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#f3f4f6] bg-white lg:hidden">
          <ul className="mx-auto flex max-w-[1280px] flex-col px-4 py-2 sm:px-8">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="block py-3 text-[15px] font-medium text-brand-text"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/design-studio"
                className="mt-2 block rounded-full bg-brand-orange px-6 py-2.5 text-center text-[15px] font-semibold text-white"
                onClick={() => setMobileOpen(false)}
              >
                Design Now
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
