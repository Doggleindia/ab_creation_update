// ProductPage.tsx
"use client";

import { useState } from "react";
import ProductGallery from "../Bulk-Order/BulkProductGallery";
import ProductFormRight from "./BulkProductFormRight";
import ProductInformation from "./BulkProductInformation";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function ProductPage({
  images,
  product,
}: {
  images?: string[];
  product?: any;
}) {
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product?.variants && product.variants.length > 0
      ? product.variants[0]
      : null
  );
  return (
    <div className="bg-[#F5F1EA] min-h-screen">
      {/* Breadcrumb */}
      <Breadcrumbs 
        customSegments={[
          { label: "Bulk Products", href: "/bulk-products" },
          { label: product?.title || "Bulk Product Details" }
        ]} 
      />

      <div className="max-w-[1240px] mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[620px_1fr] gap-[40px]">
          {/* LEFT */}
          <div>
            <ProductGallery
              images={images}
              variants={product?.variants}
              selectedVariant={selectedVariant}
            />
          </div>

          {/* RIGHT */}
          <div className="max-w-[480px]">
            <ProductFormRight
              product={product}
              selectedVariant={selectedVariant}
              setSelectedVariant={setSelectedVariant}
            />
          </div>
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="mt-8 pt-4 border-t border-[#E8E6E3] grid grid-cols-1 lg:grid-cols-[620px_1fr] gap-[40px]">
          <div></div>
          <div className="max-w-[480px]">
            <ProductInformation product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}