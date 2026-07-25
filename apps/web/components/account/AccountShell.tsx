"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  HelpCircle,
  Heart,
  LayoutGrid,
  MapPin,
  Package,
  Palette,
  Search,
  Settings,
  Wallet,
} from "lucide-react";
import { type AuthUser, getToken, getUser, subscribeAuth } from "@/lib/auth";

const NAV = [
  { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
  { icon: Package, label: "My Orders", href: "/dashboard/orders" },
  { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
  { icon: Palette, label: "Saved Designs", href: "/design-studio" },
  { icon: Heart, label: "Wishlist", href: "/dashboard/wishlist" },
  { icon: MapPin, label: "Addresses", href: "/dashboard/addresses" },
  { icon: Settings, label: "Account Settings", href: "/dashboard/settings" },
];

const CRUMBS: Record<string, string> = {
  "/dashboard": "My account",
  "/dashboard/orders": "My Orders",
  "/dashboard/wallet": "Wallet",
  "/dashboard/wishlist": "Wishlist",
  "/dashboard/addresses": "Addresses",
  "/dashboard/settings": "Account Settings",
};

export default function AccountShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    const sync = () => setUser(getUser());
    sync();
    setReady(true);
    return subscribeAuth(sync);
  }, [router, pathname]);

  if (!ready) return <div className="min-h-[70vh] bg-white" />;

  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();
  const crumb = CRUMBS[pathname] ?? "My account";
  const onSubPage = pathname !== "/dashboard";

  return (
    <main className="w-full bg-[#f8f9fb]">
      <div className="flex min-h-[80vh] w-full">
        {/* Sidebar */}
        <aside className="hidden w-[260px] shrink-0 flex-col border-r border-[#e5e7eb] bg-white lg:flex">
          <div className="flex items-center gap-3 px-6 pt-8">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-ink text-[18px] font-bold text-white">
              {initial}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-bold text-black">
                {user?.name}
              </span>
              <span className="block truncate text-[12.5px] text-[#6b7280]">
                {user?.email}
              </span>
            </span>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3 pt-8">
            {NAV.map(({ icon: Icon, label, href }) => {
              const active =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={label}
                  href={href}
                  className={`relative flex items-center gap-3 rounded-[8px] px-4 py-3 text-[13.5px] font-bold ${
                    active
                      ? "bg-[#f3f4f6] text-black before:absolute before:bottom-2.5 before:left-0 before:top-2.5 before:w-[3px] before:rounded-full before:bg-black"
                      : "text-[#444748] hover:bg-[#f9fafb] hover:text-black"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" /> {label}
                </Link>
              );
            })}
          </nav>

          <div className="px-5 pb-8 pt-6">
            <Link
              href="/design-studio"
              className="block rounded-[8px] bg-black py-3.5 text-center text-[13px] font-bold tracking-[0.5px] text-white hover:opacity-85"
            >
              Start New Design
            </Link>
          </div>
        </aside>

        {/* Main column */}
        <div className="min-w-0 flex-1">
          {/* Header: breadcrumb + order search + help */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] bg-white px-5 py-4 sm:px-8">
            <nav className="flex items-center gap-2 text-[13.5px]">
              <Link href="/" className="text-[#6b7280] hover:text-brand-orange">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
              {onSubPage ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-[#6b7280] hover:text-brand-orange"
                  >
                    My Account
                  </Link>
                  <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
                  <span className="font-bold text-black">{crumb}</span>
                </>
              ) : (
                <span className="font-bold text-black">My account</span>
              )}
            </nav>
            <div className="flex items-center gap-2.5">
              <form
                className="relative"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (query.trim())
                    router.push(
                      `/dashboard/orders?q=${encodeURIComponent(query.trim())}`,
                    );
                }}
              >
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by order ID..."
                  className="h-10 w-[180px] rounded-[8px] border border-[#e5e7eb] bg-white pl-9 pr-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none sm:w-[240px]"
                />
              </form>
              <Link
                href="/contact-us"
                aria-label="Help & support"
                className="p-1.5 text-[#6b7280] hover:text-black"
              >
                <HelpCircle className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Mobile nav */}
          <nav className="flex gap-2 overflow-x-auto border-b border-[#e5e7eb] bg-white px-4 py-2.5 lg:hidden">
            {NAV.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${
                  (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href))
                    ? "bg-black text-white"
                    : "text-[#374151] hover:bg-[#f3f4f6]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="p-5 sm:p-8">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    delivered: { label: "Delivered", cls: "bg-[#dcfce7] text-[#16a34a]" },
    confirmed: { label: "Confirmed", cls: "bg-[#cffafe] text-[#0e7490]" },
    in_production: { label: "In Production", cls: "bg-[#fdecc8] text-[#c2410c]" },
    quality_check: { label: "Quality Check", cls: "bg-[#fef3c7] text-[#b45309]" },
    ready_to_pack: { label: "Packing", cls: "bg-[#dcfce7] text-[#16a34a]" },
    shipped: { label: "Shipped", cls: "bg-[#dbeafe] text-[#2563eb]" },
    pending: { label: "Placed", cls: "bg-[#f3f4f6] text-[#6b7280]" },
    cancelled: { label: "Cancelled", cls: "bg-[#fee2e2] text-[#ba1a1a]" },
  };
  const chip = map[status] ?? map.pending;
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.3px] ${chip.cls}`}
    >
      {chip.label}
    </span>
  );
}
