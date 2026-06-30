"use client";

import BulkProductCard from "./BulkProductCard";

type Product = {
  _id: string;
  title?: string;
  basePrice?: number;
  slug?: string;
  description?: string;
  customizationTypes?: Array<{
    type: string;
    addPercentage: number;
    _id: string;
  }>;
  variants?: Array<{
    price?: number;
    images?: string[];
  }>;
};


export default function BulkProductGrid({ products, loading }: { products?: Product[]; loading?: boolean }) {
  if (loading) return <div className="py-8 text-center text-gray-600">Loading products...</div>;
  if (!products || products.length === 0)
    return <div className="py-8 text-center text-gray-600">No products found.</div>;

  const getBadgeText = (customizationTypes?: Array<{ type: string }>) => {
    if (!customizationTypes || customizationTypes.length === 0) {
      return undefined;
    }
    
    if (customizationTypes.length === 1) {
      return customizationTypes[0].type;
    }
    
    return "Customizations";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
      {products.map((p) => {
        const image = p.variants?.[0]?.images?.[0];

        const priceValue =
          typeof p.basePrice === "number" ? p.basePrice : p.variants?.[0]?.price;
        const price =
          typeof priceValue === "number"
            ? `₹${priceValue.toFixed(2)}`
            : "Contact for price";
        const priceSuffix =
          typeof priceValue === "number" ? "/Starting" : undefined;

        // Generate slug from title or use existing slug or fallback to _id
        const slug = p.slug || p.title?.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]/g, "") || p._id;
        
        const badge = getBadgeText(p.customizationTypes);

        return (
          <BulkProductCard
            key={p._id}
            image={image || ""}

            title={p.title || "Untitled"}
            description={p.description || ""}
            price={price}
            priceSuffix={priceSuffix}
            slug={slug}
            badge={badge}
          />
        );
      })}
    </div>
  );
}
