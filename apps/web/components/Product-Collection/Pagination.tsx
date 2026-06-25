export default function Pagination({
  meta,
  onPageChange,
}: {
    meta?: { page?: number; totalPages?: number; limit?: number; total?: number };
  onPageChange?: (page: number) => void;
}) {
  const page = meta?.page || 1;
  const total = meta?.totalPages || 1;
  const limit = meta?.limit || 12;
  const totalItems = meta?.total || 0;

  const pages = Array.from({ length: Math.min(total, 5) }, (_, i) => i + 1);
  const showEllipsis = total > 5 && page < total - 2;

  return (
    <div className="flex flex-col items-center gap-4 mt-12">
      {/* Product Count Text */}
      <p className="text-sm text-gray-600">
        Showing {Math.min((page - 1) * limit + 1, totalItems)} of {totalItems} products
      </p>

      {/* Pagination Buttons */}
      <div className="flex justify-center gap-2 flex-wrap">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange && onPageChange(p)}
            className={`h-10 w-10 flex items-center justify-center border rounded text-sm font-medium transition-colors ${p === page
                ? "bg-[#B87D4C] text-white border-[#B87D4C]"
                : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
          >
            {p}
          </button>
        ))}

        {showEllipsis && <span className="text-gray-400 px-2">...</span>}

        {total > 5 && (
          <button
            onClick={() => onPageChange && onPageChange(total)}
            className="h-10 w-10 flex items-center justify-center border border-gray-300 text-gray-700 rounded text-sm font-medium hover:border-gray-400 transition-colors"
          >
            {total}
          </button>
        )}

        <button
          onClick={() => onPageChange && onPageChange(Math.min(total, page + 1))}
          className="px-3 h-10 flex items-center justify-center border border-gray-300 text-gray-700 rounded text-sm font-medium hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={page >= total}
        >
          Next
        </button>
      </div>
    </div>
  );
}
