import React, { useState, useMemo } from 'react';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { renderIcon } from '../../utils/iconRenderer';
import { Inventory } from '../../types/models';
import Pagination from '../Pagination';

interface InventoryTableProps {
  inventories: Inventory[];
  onUpdate: (productId: string, variantId: string, stock: number, reservedStock: number) => Promise<void>;
  loading: boolean;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ inventories, onUpdate, loading }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ stock: number; reservedStock: number }>({ stock: 0, reservedStock: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const isAll = pageSize === Number.MAX_SAFE_INTEGER;
  const effectivePageSize = isAll ? inventories.length || 1 : pageSize;

  const startIndex = (currentPage - 1) * effectivePageSize;
  const endIndex = startIndex + effectivePageSize;
  const paginatedInventories = useMemo(() => inventories.slice(startIndex, endIndex), [inventories, startIndex, endIndex]);

  const handleEdit = (inventory: Inventory) => {
    setEditingId(inventory.variantId.id);
    setEditData({ stock: inventory.stock, reservedStock: inventory.reservedStock });
  };

  const handleSave = async () => {
    if (editingId) {
      const inventory = inventories.find(inv => inv.variantId.id === editingId);
      if (inventory) {
        await onUpdate(inventory.variantId.productId._id, inventory.variantId.id, editData.stock, editData.reservedStock);
        setEditingId(null);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleInputChange = (field: 'stock' | 'reservedStock', value: number) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const getStockStatus = (availableStock: number) => {
    if (availableStock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (availableStock <= 10) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Variant ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reserved Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Available Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedInventories.map((inventory) => {
              const isEditing = editingId === inventory.variantId.id;
              const status = getStockStatus(inventory.availableStock);

              return (
                <tr key={inventory._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{inventory.variantId.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.stock}
                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    ) : (
                      inventory.stock
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.reservedStock}
                        onChange={(e) => handleInputChange('reservedStock', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    ) : (
                      inventory.reservedStock
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {isEditing ? (
                      Math.max(0, editData.stock - editData.reservedStock)
                    ) : (
                      inventory.availableStock
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSave}
                            disabled={loading}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            {renderIcon(FiSave, { size: 16 })}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            {renderIcon(FiX, { size: 16 })}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(inventory)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          {renderIcon(FiEdit2, { size: 16 })}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {inventories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No inventory data found</p>
        </div>
      )}

      {inventories.length > 0 && (
        <Pagination
          total={inventories.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="inventories"
        />
      )}
    </div>
  );
};

export default InventoryTable;
