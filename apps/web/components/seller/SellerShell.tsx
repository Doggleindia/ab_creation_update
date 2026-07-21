"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, PlusCircle, Package } from "lucide-react";
import { getToken, getUser } from "@/lib/auth";

const NAV = [
  { icon: Package, label: "My Products", href: "/seller/products" },
  { icon: PlusCircle, label: "New Submission", href: "/seller/new" },
  { icon: LayoutGrid, label: "Buyer Dashboard", href: "/dashboard" },
];

export default function SellerShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<"checking" | "ok" | "not-seller">(
    "checking",
  );

  useEffect(() => {
    if (!getToken()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setState(getUser()?.accountType === "seller" ? "ok" : "not-seller");
  }, [router, pathname]);

  if (state === "checking") return <div className="min-h-[70vh] bg-white" />;

  if (state === "not-seller") {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-4 text-center">
        <h1 className="text-[24px] font-bold text-black">
          Seller access required
        </h1>
        <p className="max-w-[420px] pt-3 text-[14px] leading-6 text-[#444748]">
          This area is for approved seller partners. Apply to join the program
          and you&apos;ll receive seller credentials once approved.
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

  return (
    <main className="w-full bg-white px-4 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1152px]">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e5e7eb] pb-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#b07d1a]">
              Seller Studio
            </p>
            <h1 className="pt-1 text-[28px] font-bold tracking-[-0.5px] text-black">
              {title}
            </h1>
            {subtitle && (
              <p className="pt-1 text-[14px] text-[#6b7280]">{subtitle}</p>
            )}
          </div>
          <nav className="flex gap-2">
            {NAV.map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold ${
                  pathname === href
                    ? "bg-black text-white"
                    : "border border-[#e5e7eb] text-[#374151] hover:border-black"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="pt-8">{children}</div>
      </div>
    </main>
  );
}
