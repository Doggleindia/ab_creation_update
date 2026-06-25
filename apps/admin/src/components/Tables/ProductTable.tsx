import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiEye, FiPackage } from 'react-icons/fi';
import { renderIcon } from '../../utils/iconRenderer';
import { Product } from '../../types/models';
import Pagination from '../Pagination';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string, productName: string) => void;
  onView: (product: Product) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete, onView }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const isAll = pageSize === Number.MAX_SAFE_INTEGER;
  const effectivePageSize = isAll ? products.length || 1 : pageSize;

  const startIndex = (currentPage - 1) * effectivePageSize;
  const endIndex = startIndex + effectivePageSize;
  const paginatedProducts = useMemo(() => products.slice(startIndex, endIndex), [products, startIndex, endIndex]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Base Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customization</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Colors</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Variants</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedProducts.map((product) => (
            <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  <button
                    onClick={() => navigate(`/variant?productId=${product._id}`)}
                    className="text-[#B87D4C] hover:text-[#B87D4C] hover:underline"
                  >
                    {product.title}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {typeof product.categoryId === 'string' ? product.categoryId : product.categoryId?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">₹{product.basePrice}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex flex-wrap gap-1">
                    {product.customizationTypes.slice(0, 2).map((type, idx) => (
                      <span key={idx} className="px-2 py-1 bg-[#E8E6E3] text-[#B87D4C] text-xs rounded">
                        {type}
                      </span>
                    ))}
                    {product.customizationTypes.length > 2 && (
                      <span className="text-xs text-gray-500">+{product.customizationTypes.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex flex-wrap gap-1">
                    {(product.colors || []).slice(0, 3).map((color, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                        {color}
                      </span>
                    ))}
                    {(product.colors || []).length > 3 && (
                      <span className="text-xs text-gray-500">+{(product.colors || []).length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : product.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {product.variantsCount || 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(product)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View"
                    >
                      {renderIcon(FiEye, { size: 16 })}
                    </button>
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 text-[#B87D4C] hover:bg-[#F5F1EA] rounded-lg transition-colors"
                      title="Edit"
                    >
                      {renderIcon(FiEdit2, { size: 16 })}
                    </button>

                    <button
                      onClick={() => onDelete(product._id, product.title)}
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

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found</p>
        </div>
      )}

      {products.length > 0 && (
        <Pagination
          total={products.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="products"
        />
      )}
    </div>
  );
};

export default ProductTable;
