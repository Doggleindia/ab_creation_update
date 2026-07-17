"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Search, User, Menu, X, LogOut } from "lucide-react";
import { type AuthUser, getUser, logout, subscribeAuth } from "@/lib/auth";

const NAV_LINKS = [
  { label: "Customize Design", href: "/design-studio" },
  { label: "Collection", href: "/collection", hasDropdown: true },
  { label: "Bulk Order", href: "/bulk-order" },
  { label: "Join as Seller", href: "/become-a-seller" },
  { label: "Contact Us", href: "/contact-us" },
];

function AccountMenu({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false);
  const initial = (user.name || user.email || "?").charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-ink text-[14px] font-bold text-white"
      >
        {initial}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-56 rounded-[12px] border border-[#c4c7c7] bg-white p-2 shadow-[0px_4px_12px_rgba(0,0,0,0.1)]">
            <div className="border-b border-[#f3f3f4] px-3 py-2">
              <p className="truncate text-[14px] font-semibold text-black">
                {user.name}
              </p>
              <p className="truncate text-[12px] text-[#444748]">{user.email}</p>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                void logout();
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[14px] text-[#ba1a1a] hover:bg-[#fef2f2]"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    return subscribeAuth(sync);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#f3f4f6] bg-white">
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-8">
        {/* Left: logo + desktop links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/ab-creation-logo.png"
              alt="AB Creation logo"
              width={44}
              height={44}
              priority
              className="h-11 w-11 object-contain"
            />
            <span className="text-[24px] font-bold tracking-[-1.2px] text-brand-ink">
              AB CREATION
            </span>
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
          {user ? (
            <AccountMenu user={user} />
          ) : (
            <Link
              href="/login"
              aria-label="Account"
              className="p-2 text-brand-ink transition-colors hover:text-brand-orange"
            >
              <User className="h-5 w-5" />
            </Link>
          )}
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
