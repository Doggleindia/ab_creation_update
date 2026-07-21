"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Package,
  Palette,
  Heart,
  Wallet,
  MapPin,
  Settings,
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

export default function AccountShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

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

  return (
    <main className="w-full bg-white">
      <div className="mx-auto flex max-w-[1280px] flex-col px-4 py-10 sm:px-8 lg:flex-row lg:gap-10 lg:px-10">
        {/* Sidebar */}
        <aside className="flex w-full shrink-0 flex-col border-b border-[#e5e7eb] pb-8 lg:min-h-[70vh] lg:w-[220px] lg:border-b-0 lg:border-r lg:pb-0 lg:pr-2">
          <div className="flex items-center gap-3 pb-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-ink text-[18px] font-bold text-white">
              {initial}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-bold text-black">
                {user?.name}
              </span>
              <span className="block truncate text-[12px] text-[#6b7280]">
                {user?.email}
              </span>
            </span>
          </div>

          <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
            {NAV.map(({ icon: Icon, label, href }) => {
              const active = href === pathname;
              return href ? (
                <Link
                  key={label}
                  href={href}
                  className={`relative flex items-center gap-3 rounded-[6px] px-4 py-3 text-[13px] font-bold ${
                    active
                      ? "bg-[#f3f4f6] text-black before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-full before:bg-black"
                      : "text-[#444748] hover:bg-[#f9fafb] hover:text-black"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ) : (
                <span
                  key={label}
                  title="Coming soon"
                  className="flex cursor-not-allowed items-center gap-3 rounded-[6px] px-4 py-3 text-[13px] font-bold text-[#c4c7c7]"
                >
                  <Icon className="h-4 w-4" /> {label}
                </span>
              );
            })}
          </nav>

          <Link
            href="/design-studio"
            className="mt-8 hidden rounded-full bg-black py-3 text-center text-[13px] font-bold text-white transition-opacity hover:opacity-85 lg:mt-auto lg:block"
          >
            Start New Design
          </Link>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1 pt-8 lg:pt-0">{children}</div>
      </div>
    </main>
  );
}

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    delivered: { label: "Delivered", cls: "bg-[#dcfce7] text-[#16a34a]" },
    confirmed: { label: "Confirmed", cls: "bg-[#cffafe] text-[#0e7490]" },
    in_production: { label: "In Production", cls: "bg-[#fdecc8] text-[#b45309]" },
    quality_check: { label: "Quality Check", cls: "bg-[#fef3c7] text-[#b45309]" },
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
