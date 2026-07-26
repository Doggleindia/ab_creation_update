"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, User, Menu, X, LogOut, Store } from "lucide-react";
import { type AuthUser, getUser, logout, subscribeAuth } from "@/lib/auth";

const NAV_LINKS = [
  { label: "Customize Design", href: "/design-studio" },
  { label: "Collection", href: "/collection", hasDropdown: true },
  { label: "Bulk Order", href: "/bulk-order" },
  { label: "Join as Seller", href: "/become-a-seller" },
  { label: "Contact Us", href: "/contact-us" },
];

// Approved sellers get a partner-focused nav — no "Join as Seller" pitch,
// direct access to their studio instead.
const SELLER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collection", href: "/collection", hasDropdown: true },
  { label: "Contact", href: "/contact-us" },
  { label: "Dashboard", href: "/seller" },
  { label: "Settings", href: "/seller/settings" },
];

// Logged-in buyers: the acquisition pitches (Join as Seller, Bulk Order)
// give way to their own dashboard.
const BUYER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collection", href: "/collection", hasDropdown: true },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Contact", href: "/contact-us" },
  { label: "Settings", href: "/dashboard/settings" },
];

// Bulk accounts: their pipeline lives in the buyer dashboard, and new
// requests go through the in-dashboard form rather than the public wizard.
const BULK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collection", href: "/collection", hasDropdown: true },
  { label: "Contact", href: "/contact-us" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Bulk Quotes", href: "/dashboard/quotes" },
  { label: "Settings", href: "/dashboard/settings" },
];

function AccountMenu({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const initial = (user.name || user.email || "?").charAt(0).toUpperCase();

  async function confirmLogout() {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    setConfirming(false);
    router.push("/");
  }

  return (
    <div className="relative">
      <button
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand-ink text-[14px] font-bold text-white"
      >
        {user.avatar ? (
          /* eslint-disable-next-line @next/next/no-img-element -- user avatar on S3 */
          <img src={user.avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
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
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-1 flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-[14px] text-black hover:bg-[#f3f3f4]"
            >
              <User className="h-4 w-4" /> My Account
            </Link>
            {user.accountType === "seller" && (
              <Link
                href="/seller/products"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-[14px] text-black hover:bg-[#f3f3f4]"
              >
                <Store className="h-4 w-4" /> Seller Studio
              </Link>
            )}
            <button
              onClick={() => {
                setOpen(false);
                setConfirming(true);
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[14px] text-[#ba1a1a] hover:bg-[#fef2f2]"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </>
      )}

      {/* Logout confirmation (Figma frame: beige backdrop, white banner) */}
      {confirming && (
        <div className="fixed inset-0 z-[100] bg-[#f1efe9]">
          <button
            onClick={() => setConfirming(false)}
            className="absolute right-8 top-8 flex items-center gap-2 text-[15px] font-bold text-black hover:opacity-70 sm:right-16 sm:top-16"
          >
            <X className="h-5 w-5" /> Close
          </button>
          <div className="flex h-full items-center justify-center px-4">
            <div className="grid w-full max-w-[1140px] grid-cols-1 overflow-hidden bg-white md:grid-cols-2">
              <div className="flex flex-col items-center justify-center gap-4 px-8 py-14 text-center">
                <p className="flex items-center gap-2.5 text-[17px] font-bold text-[#b07d1a]">
                  <LogOut className="h-5 w-5" /> Log out
                </p>
                <p className="text-[24px] leading-snug text-black sm:text-[26px]">
                  Are you sure you want to log out?
                </p>
                <button
                  onClick={() => void confirmLogout()}
                  disabled={loggingOut}
                  className="mt-2 rounded-[4px] bg-brand-orange px-14 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loggingOut ? "Logging out…" : "Log out"}
                </button>
              </div>
              <div className="relative hidden h-[305px] md:block">
                <Image
                  src="/images/auth/login-side.png"
                  alt="Custom printed apparel"
                  fill
                  className="object-cover"
                  sizes="570px"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ logoUrl }: { logoUrl?: string }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    router.push(`/collection?search=${encodeURIComponent(query.trim())}`);
    setQuery("");
  }

  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    return subscribeAuth(sync);
  }, []);

  const links =
    user?.accountType === "seller"
      ? SELLER_LINKS
      : user?.accountType === "bulk"
        ? BULK_LINKS
        : user
          ? BUYER_LINKS
          : NAV_LINKS;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#f3f4f6] bg-white">
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-8">
        {/* Left: logo + desktop links */}
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="AB Creation — home" className="flex items-center">
            {logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element -- CMS logo lives on S3, host not in next.config images */
              <img
                src={logoUrl}
                alt="AB Creation logo"
                className="-my-2.5 h-16 w-auto max-w-[220px] object-contain"
              />
            ) : (
              <Image
                src="/ab-creation-logo.png"
                alt="AB Creation logo"
                width={160}
                height={64}
                priority
                className="-my-2.5 h-16 w-auto object-contain"
              />
            )}
          </Link>

          <ul className="hidden items-center gap-5 lg:flex">
            {links.map((link) => (
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
          {searchOpen ? (
            <form onSubmit={submitSearch} className="flex items-center gap-1">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => !query && setSearchOpen(false)}
                placeholder="Search products…"
                className="h-9 w-[180px] rounded-full border border-[#c4c7c7] px-4 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="p-2 text-brand-ink transition-colors hover:text-brand-orange"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          ) : (
            <button
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-brand-ink transition-colors hover:text-brand-orange"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
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
            {links.map((link) => (
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
