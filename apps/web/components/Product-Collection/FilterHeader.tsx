"use client";

import { ChevronDown } from "lucide-react";

export default function FilterHeader({
  meta,
  onLimitChange,
  onSortChange,
}: {
  meta?: { page?: number; limit?: number; total?: number };
  onLimitChange?: (limit: number) => void;
  onSortChange?: (sort: string) => void;
}) {
  const total = meta?.total || 0;
  const limit = meta?.limit || 12;

  return (
    <div className="flex items-center justify-between py-4 mb-6">
      {/* Left - Product Count */}
      <div className="text-sm text-gray-600">
        <span className="font-semibold text-gray-900">{total} products</span>
      </div>

      {/* Right - Sort & Display Options */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort by</label>
          <div className="relative">
            <select 
              className="appearance-none border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white pr-8 cursor-pointer hover:border-gray-400 transition"
              onChange={(e) => onSortChange && onSortChange(e.target.value)}
              defaultValue=""
            >
              <option value="">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
