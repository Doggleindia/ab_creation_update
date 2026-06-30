"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Filters from "./Filters";
import FilterHeader from "./FilterHeader";
import ProductGrid from "./ProductGrid";
import Pagination from "./Pagination";
import { getProducts } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";

function CollectionProductsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramss = useParams();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const page = parseInt(searchParams?.get("page") || "1");
        const limit = parseInt(searchParams?.get("limit") || "12");

        const params: Record<string, any> = {
          page,
          limit,
        };

        // Add filter params if they exist
        if (searchParams?.get("categoryId")) params.categoryId = searchParams.get("categoryId");
        if (searchParams?.get("collectionId")) params.collectionId = searchParams.get("collectionId");
        if (searchParams?.get("collectionSlug")) params.collectionSlug = searchParams.get("collectionSlug");
        if (searchParams?.get("search")) params.search = searchParams.get("search");
        if (searchParams?.get("sort")) params.sort = searchParams.get("sort");

        const response = await getProducts(params);

        if (response.success && response.data) {
          let filteredProducts = response.data;

          const collectionSlug = searchParams?.get("collectionSlug");
          const collectionId = searchParams?.get("collectionId");

          if (collectionSlug) {
            filteredProducts = filteredProducts.filter(
              (product: any) => product.collection?.slug === collectionSlug
            );
          }

          if (collectionId) {
            filteredProducts = filteredProducts.filter(
              (product: any) => product.collection?.id === collectionId || product.collection?._id === collectionId
            );
          }

          setProducts(filteredProducts);
          setMeta({
            page,
            limit,
            total: filteredProducts.length,
            totalPages: Math.max(1, Math.ceil(filteredProducts.length / limit)),
          });
        } else {
          toast("error", "Failed to fetch products");
          setProducts([]);
        }
      } catch (error: any) {
        console.error("Error fetching products:", error);
        toast("error", error.message || "Failed to fetch products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams?.toString()]);

  const updateQuery = (next: Record<string, any>) => {
    const qp = new URLSearchParams(Array.from(searchParams || new URLSearchParams()));
    Object.keys(next).forEach((k) => {
      const v = next[k];
      if (v === undefined || v === null || v === "") qp.delete(k);
      else qp.set(k, String(v));
    });
    const url = `${window.location.pathname}?${qp.toString()}`;
    router.push(url);
  };

  const handleFilterChange = (newFilters: Record<string, string | string[]>) => {
    setFilters(newFilters);
    updateQuery({ ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateQuery({ page });
  };

  const handleLimitChange = (limit: number) => {
    updateQuery({ limit, page: 1 });
  };

  const handleSortChange = (sort: string) => {
    updateQuery({ sort });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      {/* Filters + count/sort on one row */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <Filters onFilterChange={handleFilterChange} activeFilters={filters} />
        </div>

        <FilterHeader meta={meta} onLimitChange={handleLimitChange} onSortChange={handleSortChange} />
      </div>

      {/* Product Grid */}
      <ProductGrid products={products} loading={loading} />

      {/* Pagination */}
      <Pagination meta={{ ...meta, page: meta.page, totalPages: meta.totalPages }} onPageChange={handlePageChange} />
    </section>
  );
}

export default function CollectionProductsPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-gray-500">Loading products...</div>}>
      <CollectionProductsPageInner />
    </Suspense>
  );
}
