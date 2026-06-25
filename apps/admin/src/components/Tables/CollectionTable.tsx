import React, { useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiEye, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { renderIcon } from '../../utils/iconRenderer';
import { Collection } from '../../types/models';
import Pagination from '../Pagination';

interface CollectionTableProps {
  collections: Collection[];
  onEdit: (collection: Collection) => void;
  onDelete: (collectionId: string, collectionName: string) => void;
  onToggleStatus: (collectionId: string) => void;
  onView: (collection: Collection) => void;
}

const CollectionTable: React.FC<CollectionTableProps> = ({ collections, onEdit, onDelete, onToggleStatus, onView }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const isAll = pageSize === Number.MAX_SAFE_INTEGER;
  const effectivePageSize = isAll ? collections.length || 1 : pageSize;

  const startIndex = (currentPage - 1) * effectivePageSize;
  const endIndex = startIndex + effectivePageSize;
  const paginatedCollections = useMemo(() => collections.slice(startIndex, endIndex), [collections, startIndex, endIndex]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Categories</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedCollections.map((collection) => (
              <tr key={collection._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{collection.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{collection.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{collection.slug}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    collection.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {collection.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {collection.categoriesCount || 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(collection.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(collection)}
                      className="p-2 hover:bg-[#E8E6E3] rounded-lg text-[#B87D4C] transition-colors"
                      title="View"
                    >
                      {renderIcon(FiEye)}
                    </button>
                    <button
                      onClick={() => onEdit(collection)}
                      className="p-2 hover:bg-yellow-100 rounded-lg text-yellow-600 transition-colors"
                      title="Edit"
                    >
                      {renderIcon(FiEdit2)}
                    </button>
                    <button
                      onClick={() => onToggleStatus(collection.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        collection.status === 'active'
                          ? 'hover:bg-red-100 text-red-600'
                          : 'hover:bg-green-100 text-green-600'
                      }`}
                      title={collection.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {collection.status === 'active' ? renderIcon(FiToggleRight) : renderIcon(FiToggleLeft)}
                    </button>
                    <button
                      onClick={() => onDelete(collection.id, collection.name)}
                      className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                      title="Delete"
                    >
                      {renderIcon(FiTrash2)}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        total={collections.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};

export default CollectionTable;
