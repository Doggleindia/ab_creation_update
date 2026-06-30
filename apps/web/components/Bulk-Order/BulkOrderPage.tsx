"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Filters from "@/components/Product-Collection/Filters";
import FilterHeader from "@/components/Product-Collection/FilterHeader";
import BulkProductGrid from "./BulkProductGrid";
import Pagination from "@/components/Product-Collection/Pagination";
import { getBulkProductsPublic } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";

function BulkOrderPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  type BulkProduct = {
    _id: string;
    id?: string;
    title?: string;
    slug?: string;
    categoryId?: string;
    description?: string;
    basePrice?: number;
    customizationTypes?: Array<{
      type: string;
      addPercentage: number;
      _id: string;
    }>;
    variants?: Array<{
      _id: string;
      price?: number;
      media?: Array<{ url: string; type?: string }>;
      size?: string;
      color?: string;
    }>;
    images?: string[];
    image?: string;
  };

  type BulkProductsResponse = {
    success: boolean;
    results?: number;
    data?: BulkProduct[];
  };

  const [products, setProducts] = useState<BulkProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const page = parseInt(searchParams?.get("page") || "1");
        const limit = parseInt(searchParams?.get("limit") || "12");

        const json = (await getBulkProductsPublic({ page, limit })) as BulkProductsResponse;
        const data = json?.data || [];

        setProducts(data);

        const total = typeof json?.results === "number" ? json.results : data.length;
        setMeta({
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        });
      } catch (e: unknown) {
        setProducts([]);
        setMeta({ page: 1, limit: 12, total: 0, totalPages: 1 });
        const err = e as { message?: string };
        toast("error", err?.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()]);

  const updateQuery = (next: Record<string, unknown>) => {
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
    <section className="bg-white">

      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Buy In Bulk</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters + count/sort on one row */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <Filters onFilterChange={handleFilterChange} activeFilters={filters} />
          </div>

          <FilterHeader meta={meta} onLimitChange={handleLimitChange} onSortChange={handleSortChange} />
        </div>

        {/* Product Grid */}
        <BulkProductGrid products={products} loading={loading} />

        {/* Pagination */}
        <Pagination meta={{ ...meta, page: meta.page, totalPages: meta.totalPages }} onPageChange={handlePageChange} />
      </div>
    </section>
  );
}

export default function BulkOrderPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-gray-500">Loading products...</div>}>
      <BulkOrderPageInner />
    </Suspense>
  );
}
