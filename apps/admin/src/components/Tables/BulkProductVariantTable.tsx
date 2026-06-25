import React, { useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { renderIcon } from '../../utils/iconRenderer';
import { BulkProductVariant } from '../../types/models';
import Pagination from '../Pagination';

interface BulkProductVariantTableProps {
  variants: BulkProductVariant[];
  onEdit: (variant: BulkProductVariant) => void;
  onDelete: (variantId: string, variantName: string) => void;
  onView: (variant: BulkProductVariant) => void;
}

const BulkProductVariantTable: React.FC<BulkProductVariantTableProps> = ({ variants, onEdit, onDelete, onView }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const isAll = pageSize === Number.MAX_SAFE_INTEGER;
  const effectivePageSize = isAll ? variants.length || 1 : pageSize;

  const startIndex = (currentPage - 1) * effectivePageSize;
  const endIndex = startIndex + effectivePageSize;
  const paginatedVariants = useMemo(
    () => variants.slice(startIndex, endIndex),
    [variants, startIndex, endIndex]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Color</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Images</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedVariants.map((variant) => (
              <tr key={variant._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{variant.sku || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{variant.color}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{variant.images?.length ?? 0}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{variant.createdAt ? new Date(variant.createdAt).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(variant)}
                      className="p-2 text-[#B87D4C] hover:bg-[#F5F1EA] rounded-lg transition-colors"
                      title="View"
                    >
                      {renderIcon(FiEye, { size: 16 })}
                    </button>
                    <button
                      onClick={() => onEdit(variant)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      {renderIcon(FiEdit2, { size: 16 })}
                    </button>
                    <button
                      onClick={() => onDelete(variant._id, variant.sku || variant.color)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      {renderIcon(FiTrash2, { size: 16 })}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {variants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No variants found</p>
        </div>
      )}

      {variants.length > 0 && (
        <Pagination
          total={variants.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
};

export default BulkProductVariantTable;

