import { useEffect, useState } from "react";
import Shell, { Card } from "../components/Shell";
import { api, inr, type AdminProduct } from "../lib/api";

const COLOR_HEX: Record<string, string> = {
  black: "#1f2224",
  white: "#ffffff",
  navy: "#1e3a8a",
  blue: "#2563eb",
  red: "#dc2626",
  green: "#14532d",
  grey: "#9ca3af",
  gray: "#9ca3af",
  beige: "#d6c7a1",
  brown: "#7c4a03",
  pink: "#f9a8d4",
  yellow: "#facc15",
};

export default function Catalog() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api<{ data: AdminProduct[] }>("/api/products/admin")
      .then((j) => setProducts(Array.isArray(j.data) ? j.data : []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <Shell
      title="Garment Catalog"
      subtitle={`${products.length} base products`}
      actions={
        <span
          title="Coming soon"
          className="cursor-not-allowed rounded-lg bg-black px-4 py-2.5 text-[13px] font-bold text-white opacity-60"
        >
          + Add New Garment
        </span>
      }
    >
      {!loaded && (
        <p className="py-10 text-center text-[13px] text-[#9ca3af]">
          Loading catalog…
        </p>
      )}
      {loaded && products.length === 0 && (
        <p className="py-10 text-center text-[13px] text-[#9ca3af]">
          No products yet.
        </p>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((p) => {
          const img = p.variants?.find((v) => v.media?.images?.[0])?.media
            ?.images?.[0];
          const active = p.isActive !== false && p.status !== "draft";
          return (
            <Card key={p._id} className="overflow-hidden">
              <div className="relative flex h-[170px] items-center justify-center bg-[#f8f9fb]">
                <span
                  className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.5px] ${
                    active
                      ? "bg-[#dcfce7] text-[#16a34a]"
                      : "bg-[#f3f4f6] text-[#6b7280]"
                  }`}
                >
                  {active ? "Active" : "Draft"}
                </span>
                {img ? (
                  <img
                    src={img}
                    alt={p.title}
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <span className="text-[12px] text-[#c4c7c7]">No image</span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[14.5px] font-bold leading-snug text-black">
                    {p.title}
                  </p>
                  <p className="text-[14.5px] font-bold text-black">
                    {inr(p.basePrice)}
                  </p>
                </div>
                <p className="pt-1 text-[12px] text-[#6b7280]">
                  {[
                    p.specifications?.fabric,
                    p.sizes?.length ? `${p.sizes.length} sizes` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
                <div className="flex items-center gap-2 border-b border-[#f3f4f6] pb-3 pt-3">
                  <span className="flex -space-x-1.5">
                    {(p.colors ?? []).slice(0, 4).map((c) => (
                      <span
                        key={c}
                        title={c}
                        className="h-4 w-4 rounded-full border border-[#d1d5db]"
                        style={{
                          background: COLOR_HEX[c.toLowerCase()] ?? "#e5e7eb",
                        }}
                      />
                    ))}
                  </span>
                  <span className="text-[12px] text-[#6b7280]">
                    {(p.colors ?? []).length} colors available
                  </span>
                </div>
                <p
                  className={`pt-3 text-[12px] font-bold ${
                    (p.variants?.length ?? 0) > 0
                      ? "text-[#16a34a]"
                      : "text-[#d97706]"
                  }`}
                >
                  {(p.variants?.length ?? 0) > 0
                    ? `✓ ${p.variants!.length} variant${p.variants!.length > 1 ? "s" : ""} defined`
                    : "⚠ No variants defined"}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
