import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiLoader, FiUpload } from 'react-icons/fi';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import InventoryTable from '../components/Tables/InventoryTable';
import { renderIcon } from '../utils/iconRenderer';
import { Inventory } from '../types/models';
import { apiService } from '../utils/api';

const InventoryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkModal, setBulkModal] = useState({ isOpen: false });
  const [bulkData, setBulkData] = useState('');
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  const [selectedProductId, setSelectedProductId] = useState<string>(searchParams.get('productId') || '');

  const fetchInventories = useCallback(async () => {
    if (!selectedProductId) return;
    try {
      setLoading(true);
      const response = await apiService.getProductInventoriesAdmin(selectedProductId);
      // Transform ProductInventory[] to Inventory[] for compatibility
      const transformedInventories: Inventory[] = response.data.inventories.map(inv => ({
        _id: inv.variantId, // Using variantId as _id for now
        variantId: {
          _id: inv.variantId,
          id: inv.variantId,
          size: inv.size,
          color: inv.color,
          sku: inv.sku,
          productId: {
            _id: selectedProductId,
            id: '', // Need to fetch product details
            title: '',
            audience: ''
          }
        },
        stock: inv.stock,
        reservedStock: inv.reservedStock,
        availableStock: inv.availableStock,
        createdAt: '',
        updatedAt: ''
      }));
      setInventories(transformedInventories);
    } catch (err) {
      console.error('Failed to fetch inventories:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedProductId]);

  useEffect(() => {
    fetchInventories();
  }, [fetchInventories]);

  const handleUpdateInventory = async (productId: string, variantId: string, stock: number, reservedStock: number) => {
    try {
      setUpdating(true);
      await apiService.updateInventoryAdmin(productId, variantId, { stock, reservedStock });

      // Update local state
      setInventories(prev =>
        prev.map(inv =>
          inv.variantId._id === variantId
            ? { ...inv, stock, reservedStock, availableStock: Math.max(0, stock - reservedStock) }
            : inv
        )
      );

      setSuccessModal({ isOpen: true, message: 'Inventory updated successfully!' });
    } catch (err) {
      console.error('Failed to update inventory:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkUpdate = async () => {
    try {
      setUpdating(true);
      const parsedData = JSON.parse(bulkData);
      // Transform the data for bulk update
      const updates = parsedData.map((item: any) => ({
        variantId: item.variantId,
        stock: item.stock,
        reservedStock: item.reservedStock
      }));
      await apiService.bulkUpdateInventoryAdmin({ updates });

      // Refresh data
      fetchInventories();
      setBulkModal({ isOpen: false });
      setBulkData('');
      setSuccessModal({ isOpen: true, message: 'Bulk inventory updated successfully!' });
    } catch (err) {
      console.error('Failed to bulk update inventory:', err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredInventories = inventories.filter(inv =>
    inv.variantId.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = inventories.filter(inv => inv.availableStock <= 10 && inv.availableStock > 0).length;
  const outOfStockCount = inventories.filter(inv => inv.availableStock === 0).length;
  const totalValue = inventories.reduce((sum, inv) => sum + inv.stock, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Track and manage product stock levels</p>
          </div>
          <button
            onClick={() => setBulkModal({ isOpen: true })}
            className="flex items-center gap-2 px-6 py-3 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors font-medium"
          >
            {renderIcon(FiUpload, { size: 20 })}
            <span>Bulk Update</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              {renderIcon(FiLoader, { size: 32, className: 'animate-spin text-[#B87D4C] mx-auto mb-4' })}
              <p className="text-gray-600">Loading inventory...</p>
            </div>
          </div>
        ) : (
          <>
              {/* Product Selector and Search Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
                  <input
                    type="text"
                    placeholder="Enter Product ID..."
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  />
                </div>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">{renderIcon(FiSearch, { size: 20 })}</span>
                <input
                  type="text"
                  placeholder="Search by variant ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-gray-600 text-sm font-medium">Total Variants</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{inventories.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-gray-600 text-sm font-medium">Total Stock</p>
                <p className="text-2xl font-bold text-[#B87D4C] mt-1">{totalValue}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-gray-600 text-sm font-medium">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{lowStockCount}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-gray-600 text-sm font-medium">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{outOfStockCount}</p>
              </div>
            </div>

            {/* Inventory Table */}
            <InventoryTable
              inventories={filteredInventories}
              onUpdate={handleUpdateInventory}
              loading={updating}
            />
          </>
        )}

        {/* Bulk Update Modal */}
        <Modal
          isOpen={bulkModal.isOpen}
          onClose={() => setBulkModal({ isOpen: false })}
          title="Bulk Inventory Update"
          footer={
            <>
              <button
                onClick={() => setBulkModal({ isOpen: false })}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={updating}
                className="px-4 py-2 bg-[#171717] text-white hover:bg-[#B87D4C] rounded disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Enter inventory data in JSON format. Example:
            </p>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`[
  {
    "productId": "698338bd5abe416d70b5e12a",
    "variantId": "VAR001",
    "stock": 100,
    "reservedStock": 10
  },
  {
    "productId": "698338bd5abe416d70b5e12a",
    "variantId": "VAR002",
    "stock": 50,
    "reservedStock": 5
  }
]`}
            </pre>
            <textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder="Paste your JSON data here..."
              className="w-full h-48 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
            />
          </div>
        </Modal>

        {/* Success Modal */}
        <Modal
          isOpen={successModal.isOpen}
          onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        >
          <p className="text-center text-green-600">{successModal.message}</p>
        </Modal>
      </div>
    </Layout>
  );
};

export default InventoryPage;
