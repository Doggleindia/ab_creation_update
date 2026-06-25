import React, { useEffect, useMemo, useState } from 'react';
import { FiLoader, FiSave, FiX } from 'react-icons/fi';
import Modal from '../Modal';
import { apiService } from '../../utils/api';
import { Inventory } from '../../types/models';
import { renderIcon } from '../../utils/iconRenderer';


interface VariantInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  variantId: string;
  onUpdated?: (inventory: Inventory) => void;
}

const VariantInventoryModal: React.FC<VariantInventoryModalProps> = ({
  isOpen,
  onClose,
  productId,
  variantId,
  onUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string>('');

  const [stock, setStock] = useState<number>(0);
  const [reservedStock, setReservedStock] = useState<number>(0);
  const availableStock = useMemo(() => Math.max(0, stock - reservedStock), [stock, reservedStock]);

  const resetState = () => {
    setLoading(false);
    setUpdating(false);
    setError('');
    setStock(0);
    setReservedStock(0);
  };

  useEffect(() => {
    if (!isOpen) {
      resetState();
      return;
    }

    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await apiService.getVariantInventoryAdmin(productId, variantId);
        const inv = res.data.inventory;
        setStock(inv.stock);
        setReservedStock(inv.reservedStock);
      } catch (e: any) {
        // If inventory not found, we still allow editing with default 0/0.
        setError(e?.message || 'Failed to load inventory');
        setStock(0);
        setReservedStock(0);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, productId, variantId]);

  const validate = () => {
    if (stock < 0 || reservedStock < 0) return 'Stock cannot be negative';
    if (reservedStock > stock) return 'Reserved stock cannot exceed total stock';
    return '';
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUpdating(true);
      setError('');
      const res = await apiService.updateInventoryAdmin(productId, variantId, {
        stock,
        reservedStock,
      });

      const inv = res.data.inventory;
      onUpdated?.(inv);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to update inventory');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!updating) onClose();
      }}
      title="Update Inventory"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
            disabled={updating}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || updating}
            className="px-4 py-2 bg-[#171717] text-white hover:bg-[#B87D4C] rounded disabled:opacity-50 flex items-center gap-2"
          >
            {updating ? renderIconLoader() : renderIcon(FiSave, { size: 16 })}
            <span>{updating ? 'Updating...' : 'Save'}</span>
          </button>
        </>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          {renderIconLoader('animate-spin text-[#B87D4C] mr-2')}
          <span className="text-gray-600">Loading...</span>
        </div>
      ) : (

        <div className="space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reserved Stock</label>
              <input
                type="number"
                min={0}
                value={reservedStock}
                onChange={(e) => setReservedStock(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-sm text-gray-600">Available Stock</div>
            <div className="text-2xl font-bold text-gray-900">{availableStock}</div>
          </div>
        </div>
      )}
    </Modal>
  );
};

function renderIconLoader(className?: string) {
  // react-icons typing can confuse JSX in some TS setups; render via createElement to avoid TS2786.
  return React.createElement(FiLoader as any, {
    className: className ?? 'text-[#B87D4C]',
    size: 16,
  });
}



export default VariantInventoryModal;

