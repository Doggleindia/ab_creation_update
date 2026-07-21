import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiGrid,
  FiUsers,
  FiCheckSquare,
  FiShoppingCart,
  FiPackage,
  FiLayers,
  FiCreditCard,
  FiArchive,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiSearch,
} from "react-icons/fi";
import { api, getSession, setSession, type AdminUser } from "../lib/api";

const NAV: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to?: string;
}[] = [
  { icon: FiGrid, label: "Dashboard", to: "/" },
  { icon: FiUsers, label: "Seller Management", to: "/sellers" },
  { icon: FiCheckSquare, label: "Product Approvals", to: "/product-approvals" },
  { icon: FiShoppingCart, label: "All Orders", to: "/orders" },
  { icon: FiPackage, label: "Bulk Orders", to: "/bulk-orders" },
  { icon: FiLayers, label: "Production Queue", to: "/production" },
  { icon: FiCreditCard, label: "Financials", to: "/financials" },
  { icon: FiArchive, label: "Garment Catalog", to: "/catalog" },
  { icon: FiMail, label: "Messages", to: "/messages" },
  { icon: FiFileText, label: "Content Management", to: "/content" },
];

export default function Shell({
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
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [badges, setBadges] = useState<{ seller: number; bulk: number; products: number }>({ seller: 0, bulk: 0, products: 0 });

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate("/login", { replace: true });
      return;
    }
    setAdmin(s.admin);
    const sync = () => {
      if (!getSession()) navigate("/login", { replace: true });
    };
    window.addEventListener("ab-admin-auth", sync);
    api<{ data: { applications: { type: string }[] } }>(
      "/api/applications?status=pending",
    )
      .then((j) => {
        const apps = j.data?.applications ?? [];
        setBadges((b) => ({
          ...b,
          seller: apps.filter((a) => a.type === "seller").length,
          bulk: apps.filter((a) => a.type === "bulk").length,
        }));
      })
      .catch(() => {});
    api<{ data: { sellerProducts: { status: string }[] } }>(
      "/api/seller-products/admin?status=pending",
    )
      .then((j) =>
        setBadges((b) => ({
          ...b,
          products: (j.data?.sellerProducts ?? []).length,
        })),
      )
      .catch(() => {});
    return () => window.removeEventListener("ab-admin-auth", sync);
  }, [navigate]);

  if (!admin) return <div className="min-h-screen bg-white" />;

  return (
    <div className="flex min-h-screen bg-[#f8f9fb]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-[240px] flex-col border-r border-[#e5e7eb] bg-white">
        <div className="px-5 pt-6">
          <p className="text-[20px] font-extrabold tracking-tight text-black">
            AB Creation
          </p>
          <p className="pt-1 text-[10px] font-bold uppercase tracking-[1.5px] text-[#9ca3af]">
            Admin Panel
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pt-6">
          {NAV.map(({ icon: Icon, label, to }) => {
            const active =
              to === "/"
                ? location.pathname === "/"
                : to
                  ? location.pathname.startsWith(to)
                  : false;
            return to ? (
              <Link
                key={label}
                to={to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold ${
                  active
                    ? "bg-black text-white"
                    : "text-[#374151] hover:bg-[#f3f4f6]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {label === "Seller Management" && badges.seller > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f0c96b] text-[10px] font-bold text-black">
                    {badges.seller}
                  </span>
                )}
                {label === "Product Approvals" && badges.products > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f0c96b] text-[10px] font-bold text-black">
                    {badges.products}
                  </span>
                )}
                {label === "Bulk Orders" && badges.bulk > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f0c96b] text-[10px] font-bold text-black">
                    {badges.bulk}
                  </span>
                )}
              </Link>
            ) : (
              <span
                key={label}
                title="Coming soon"
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold text-[#c4c7c7]"
              >
                <Icon className="h-4 w-4 shrink-0" /> {label}
              </span>
            );
          })}
          <Link
            to="/settings"
            className={`mt-2 flex items-center gap-3 border-t border-[#f3f4f6] px-3 pb-1 pt-4 text-[13.5px] font-semibold ${
              location.pathname.startsWith("/settings")
                ? "text-black"
                : "text-[#374151] hover:text-black"
            }`}
          >
            <FiSettings className="h-4 w-4" /> Settings
          </Link>
        </nav>
        <div className="flex items-center justify-between border-t border-[#e5e7eb] px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] text-[13px] font-bold text-black">
              {(admin.name || "A").charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-bold text-black">
                {admin.name}
              </span>
              <span className="block truncate text-[11px] text-[#6b7280]">
                {admin.email}
              </span>
            </span>
          </div>
          <button
            aria-label="Log out"
            onClick={() => {
              setSession(null);
              navigate("/login", { replace: true });
            }}
            className="text-[#6b7280] hover:text-black"
          >
            <FiLogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-[240px] min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-6 border-b border-[#e5e7eb] bg-white px-8 py-4">
          <div>
            <h1 className="text-[22px] font-bold tracking-[-0.4px] text-black">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[13px] text-[#6b7280]">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {actions}
            <form
              className="relative hidden lg:block"
              onSubmit={(e) => {
                e.preventDefault();
                const q = new FormData(e.currentTarget).get("q");
                if (q) navigate(`/orders?q=${encodeURIComponent(String(q))}`);
              }}
            >
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
              <input
                name="q"
                placeholder="Search orders..."
                className="h-10 w-[260px] rounded-lg border border-[#e5e7eb] bg-[#f8f9fb] pl-9 pr-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
              />
            </form>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "New", cls: "bg-[#eef2ff] text-[#4f46e5]" },
    confirmed: { label: "Confirmed", cls: "bg-[#cffafe] text-[#0e7490]" },
    in_production: { label: "In Production", cls: "bg-[#fdecc8] text-[#b45309]" },
    quality_check: { label: "Quality Check", cls: "bg-[#fef3c7] text-[#b45309]" },
    ready_to_pack: { label: "Ready to Pack", cls: "bg-[#dcfce7] text-[#16a34a]" },
    shipped: { label: "Dispatched", cls: "bg-[#dbeafe] text-[#2563eb]" },
    delivered: { label: "Delivered", cls: "bg-[#dcfce7] text-[#16a34a]" },
    cancelled: { label: "Cancelled", cls: "bg-[#f3f4f6] text-[#6b7280]" },
    approved: { label: "Approved", cls: "bg-[#dcfce7] text-[#16a34a]" },
    rejected: { label: "Rejected", cls: "bg-[#fee2e2] text-[#ba1a1a]" },
  };
  const chip = map[status] ?? { label: status, cls: "bg-[#f3f4f6] text-[#6b7280]" };
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold ${chip.cls}`}
    >
      {chip.label}
    </span>
  );
}

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-[#e5e7eb] bg-white ${className}`}
    >
      {children}
    </div>
  );
}
