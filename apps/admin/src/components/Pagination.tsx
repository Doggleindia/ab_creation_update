import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { renderIcon } from '../utils/iconRenderer';

export interface PaginationProps {
  total: number;
  currentPage: number;
  pageSize: number; // use Number.MAX_SAFE_INTEGER for All
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[]; // e.g., [10, 50, 100]
  showLabel?: boolean; // show "Showing X to Y of Z"
  itemLabel?: string; // optional label, e.g., 'orders', 'customers'
}

const Pagination: React.FC<PaginationProps> = ({
  total,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 50, 100],
  showLabel = true,
  itemLabel,
}) => {
  const isAll = pageSize === Number.MAX_SAFE_INTEGER;
  const effectivePageSize = isAll ? total || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(total / effectivePageSize));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = total === 0 ? 0 : (safeCurrentPage - 1) * effectivePageSize + 1;
  const endIndex = isAll ? total : Math.min(safeCurrentPage * effectivePageSize, total);

  const pagesToShow = () => {
    const pages: number[] = [];
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, safeCurrentPage - half);
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      {showLabel && (
        <p className="text-sm text-gray-600">
          Showing {startIndex} to {endIndex} of {total}{itemLabel ? ` ${itemLabel}` : ''}
        </p>
      )}
      <div className="flex items-center gap-3">
        <select
          value={isAll ? 'ALL' : String(pageSize)}
          onChange={(e) => {
            const val = e.target.value;
            const size = val === 'ALL' ? Number.MAX_SAFE_INTEGER : parseInt(val, 10);
            onPageSizeChange(size);
            onPageChange(1);
          }}
          className="border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-700"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>{`1-${opt}`}</option>
          ))}
          <option value="ALL">All</option>
        </select>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
            disabled={safeCurrentPage === 1}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {renderIcon(FiChevronLeft, { size: 18 })}
          </button>
          <div className="flex items-center gap-1">
            {pagesToShow().map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  safeCurrentPage === page
                    ? 'bg-[#171717] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => onPageChange(Math.min(totalPages, safeCurrentPage + 1))}
            disabled={safeCurrentPage === totalPages}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {renderIcon(FiChevronRight, { size: 18 })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
