"use client";

import ProductCard from "./ProductCard";

type Product = {
  _id: string;
  title?: string;
  basePrice?: number;
  images?: string[];
  image?: string;
  slug?: string;
  description?: string;
  customizationTypes?: string[];
  colors?: string[];
};

export default function ProductGrid({ products, loading }: { products?: Product[]; loading?: boolean }) {
  if (loading) return <div className="py-8 text-center">Loading products...</div>;
  if (!products || products.length === 0)
    return <div className="py-8 text-center">No products found.</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
      {products.map((p) => (
        <ProductCard
          key={(p as any)?._id}
          image={(p as any)?.variants?.[0]?.media?.images?.[0] || (p as any)?.images?.[0] || (p as any)?.image}
          title={p?.title || "Untitled"}
          description={p?.description || ""}
          price={p?.basePrice ? `₹${p.basePrice}` : "Contact for price"}
          slug={p?.slug || ""}
          colors={p?.colors || []}
          badge={
            (p?.customizationTypes && p.customizationTypes.length > 0)
              ? p.customizationTypes[0]
              : "CUSTOMISER"
          }
        />
      ))}
    </div>
  );
}
