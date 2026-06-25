// ProductPage.tsx
"use client";

import { useState, useEffect } from "react";
import ProductGallery from "../Product-Collection/ProductGallery";
import ProductFormRight from "../product-page/ProductFormRight";
import ProductInformation from "../product-page/ProductInformation";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function ProductPage({
  images,
  product,
}: {
  images?: string[];
  product?: any;
}) {
  const [galleryImages, setGalleryImages] = useState<string[]>(images || []);
  const [galleryVideos, setGalleryVideos] = useState<string[]>([]);

  // When variant changes, update gallery images
  const handleVariantChange = (newImages: string[], newVideos: string[]) => {
    setGalleryImages(newImages);
    setGalleryVideos(newVideos);
  };

  // Initialize with first variant images if available
  useEffect(() => {
    if (product?.variants && product.variants.length > 0 && (!images || images.length === 0)) {
      const firstVariant = product.variants[0];
      setGalleryImages(firstVariant.media?.images || []);
      setGalleryVideos(firstVariant.media?.videos || []);
    }
  }, [product, images]);

  return (
    <div className="bg-[#F5F1EA] min-h-screen">
      {/* Breadcrumb */}
      <Breadcrumbs 
        customSegments={[
          { label: "Products", href: "/product-collection" },
          ...(product?.category?.name ? [{ label: product.category.name, href: `/product-collection?categoryId=${product.category._id || product.category.id}` }] : []),
          { label: product?.title || "Product Details" }
        ]} 
      />

      <div className="max-w-[1240px] mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[620px_1fr] gap-[40px]">
          {/* LEFT */}
          <div>
            <ProductGallery images={galleryImages} videos={galleryVideos} />
          </div>

          {/* RIGHT */}
          <div className="max-w-[480px]">
            <ProductFormRight 
              product={product} 
              onVariantChange={handleVariantChange}
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