import React, { useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiImage, FiVideo, FiMove } from 'react-icons/fi';
import { renderIcon } from '../../utils/iconRenderer';
import { LookBookMedia } from '../../types/models';
import Pagination from '../Pagination';
import { apiService } from '../../utils/api';

interface LookBookTableProps {
  media: LookBookMedia[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReorder?: (newOrder: LookBookMedia[]) => void;
}

const LookBookTable: React.FC<LookBookTableProps> = ({
  media,
  onEdit,
  onDelete,
  onReorder
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const isAll = pageSize === Number.MAX_SAFE_INTEGER;
  const effectivePageSize = isAll ? media.length || 1 : pageSize;

  const startIndex = (currentPage - 1) * effectivePageSize;
  const endIndex = startIndex + effectivePageSize;
  const paginatedMedia = useMemo(() => media.slice(startIndex, endIndex), [media, startIndex, endIndex]);

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLTableRowElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    setIsUpdating(true);

    const newMedia = [...media];
    const draggedItem = newMedia.splice(startIndex + draggedIndex, 1)[0];
    newMedia.splice(startIndex + dropIndex, 0, draggedItem);

    try {
      // Prepare bulk update data
      const updates = newMedia.map((item, index) => ({
        _id: item._id,
        position: index + 1,
      }));

      // Update positions in backend using bulk update
      await apiService.updateLookBookPositions(updates);

      if (onReorder) {
        onReorder(newMedia);
      }
    } catch (error) {
      console.error('Error updating positions:', error);
      // Revert the change if API fails
      // For now, just log the error
    } finally {
      setIsUpdating(false);
      setDraggedIndex(null);
    }
  };

  if (media.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 text-base">No media found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Updating positions...</p>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                SL No
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Media Type
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedMedia.map((item, index) => (
              <tr
                key={item._id}
                className="hover:bg-gray-50 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {renderIcon(FiMove, { size: 16, className: 'text-gray-400 cursor-move' })}
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-white">
                      {startIndex + index + 1}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-900">{item.title || 'No title'}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {item.mediaType === 'image' ? (
                      <>
                        {renderIcon(FiImage, { size: 16, className: 'text-blue-500' })}
                        <span className="text-sm text-gray-600">Image</span>
                      </>
                    ) : (
                      <>
                        {renderIcon(FiVideo, { size: 16, className: 'text-purple-500' })}
                        <span className="text-sm text-gray-600">Video</span>
                      </>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-600">{new Date(item.createdAt).toLocaleDateString('hi-IN')}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit && onEdit(item._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit media"
                    >
                      {renderIcon(FiEdit2, { size: 18 })}
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(item._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete media"
                    >
                      {renderIcon(FiTrash2, { size: 18 })}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        total={media.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="media items"
      />
    </div>
  );
};

export default LookBookTable;
