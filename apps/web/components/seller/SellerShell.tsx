"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  HelpCircle,
  LayoutGrid,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { type AuthUser, apiFetch, getToken, getUser } from "@/lib/auth";

const NAV = [
  { icon: LayoutGrid, label: "Overview", href: "/seller" },
  { icon: Package, label: "My Products", href: "/seller/products", badge: true },
  { icon: ShoppingCart, label: "Orders", href: "/seller/orders" },
  { icon: Wallet, label: "Earnings", href: "/seller/earnings" },
  { icon: BarChart3, label: "Analytics", href: "/seller/analytics" },
];

export default function SellerShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<"checking" | "ok" | "not-seller">(
    "checking",
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    const u = getUser();
    setUser(u);
    setState(u?.accountType === "seller" ? "ok" : "not-seller");
  }, [router, pathname]);

  useEffect(() => {
    if (state !== "ok") return;
    apiFetch<{ data: { sellerProducts: unknown[] } }>("/api/seller-products/mine")
      .then((j) => setProductCount((j.data?.sellerProducts ?? []).length))
      .catch(() => {});
  }, [state]);

  if (state === "checking") return <div className="min-h-[70vh] bg-white" />;

  if (state === "not-seller") {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-4 text-center">
        <h1 className="text-[24px] font-bold text-black">
          Seller access required
        </h1>
        <p className="max-w-[420px] pt-3 text-[14px] leading-6 text-[#444748]">
          This area is for approved seller partners. Apply to join the program
          and you&apos;ll get access to your Seller Studio once approved.
        </p>
        <Link
          href="/become-a-seller"
          className="mt-6 rounded-full bg-brand-orange px-8 py-3 text-[15px] font-bold text-white hover:opacity-90"
        >
          Become a Seller
        </Link>
      </main>
    );
  }

  const firstName = (user?.name ?? "Seller").split(" ")[0];

  return (
    <main className="w-full bg-[#f8f9fb]">
      <div className="flex min-h-[80vh] w-full">
        {/* Sidebar */}
        <aside className="hidden w-[230px] shrink-0 flex-col border-r border-[#e5e7eb] bg-white lg:flex">
          <div className="px-5 pt-7">
            <p className="text-[17px] font-extrabold tracking-tight text-black">
              Seller Studio
            </p>
            <p className="pt-0.5 text-[10.5px] font-bold uppercase tracking-[1.2px] text-[#b07d1a]">
              {firstName}&apos;s Store
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-3 pt-6">
            {NAV.map(({ icon: Icon, label, href, badge }) => {
              const active =
                href === "/seller"
                  ? pathname === "/seller"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold ${
                    active
                      ? "bg-black text-white"
                      : "text-[#374151] hover:bg-[#f3f4f6]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {badge && productCount !== null && productCount > 0 && (
                    <span
                      className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                        active ? "bg-white text-black" : "bg-black text-white"
                      }`}
                    >
                      {productCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="flex flex-col gap-1 border-t border-[#f3f4f6] px-3 py-4">
            <Link
              href="/seller/settings"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold ${
                pathname.startsWith("/seller/settings")
                  ? "bg-black text-white"
                  : "text-[#374151] hover:bg-[#f3f4f6]"
              }`}
            >
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <Link
              href="/contact-us"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold text-[#374151] hover:bg-[#f3f4f6]"
            >
              <HelpCircle className="h-4 w-4" /> Support
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] bg-white px-5 py-4 sm:px-8">
            <div className="min-w-0">
              <h1 className="truncate text-[21px] font-bold tracking-[-0.4px] text-black">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[12.5px] text-[#6b7280]">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {actions}
              <form
                className="relative hidden xl:block"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (query.trim())
                    router.push(`/seller/orders?q=${encodeURIComponent(query.trim())}`);
                }}
              >
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search orders, products..."
                  className="h-10 w-[220px] rounded-full border border-[#e5e7eb] bg-[#f8f9fb] pl-9 pr-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
                />
              </form>
              <Link
                href="/seller/new"
                className="flex items-center gap-1.5 rounded-full bg-brand-orange px-4 py-2.5 text-[13px] font-bold text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Create New Product
              </Link>
            </div>
          </div>

          {/* Mobile nav */}
          <nav className="flex gap-2 overflow-x-auto border-b border-[#e5e7eb] bg-white px-4 py-2.5 lg:hidden">
            {[...NAV, { label: "Settings", href: "/seller/settings" }, { label: "Support", href: "/contact-us" }].map(
              ({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${
                    (href === "/seller" ? pathname === "/seller" : pathname.startsWith(href))
                      ? "bg-black text-white"
                      : "text-[#374151] hover:bg-[#f3f4f6]"
                  }`}
                >
                  {label}
                </Link>
              ),
            )}
          </nav>

          <div className="p-5 sm:p-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
