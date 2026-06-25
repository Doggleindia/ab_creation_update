import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiLoader } from 'react-icons/fi';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import BulkProductTable from '../components/Tables/BulkProductTable';
import { renderIcon } from '../utils/iconRenderer';
import type { BulkProduct as BulkProductType } from '../types/models';
import { apiService } from '../utils/api';

const BulkProduct: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<BulkProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const page = 1;
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null as string | null, productName: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (searchTerm) params.append('search', searchTerm);
      const response = await apiService.getBulkProductsAdmin(params.toString());
      setProducts(response.data);
      setTotal(response.results);
    } catch (err) {
      console.error('Failed to fetch bulk products:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (product: BulkProductType) => {
    navigate(`/bulk-product/edit/${product._id}`, { state: { product } });
  };

  const handleDelete = (productId: string, productName: string) => {
    setDeleteModal({ isOpen: true, productId, productName });
  };

  const confirmDelete = async () => {
    if (deleteModal.productId) {
      try {
        await apiService.deleteBulkProductAdmin(deleteModal.productId);
        fetchProducts();
        setDeleteModal({ isOpen: false, productId: null, productName: '' });
        setSuccessModal({ isOpen: true, message: 'Bulk product deleted successfully!' });
      } catch (err) {
        console.error('Failed to delete bulk product:', err);
        setDeleteModal({ isOpen: false, productId: null, productName: '' });
      }
    }
  };

  const handleView = (product: BulkProductType) => {
    navigate(`/bulk-product/${product._id}/variants`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Products</h1>
            <p className="text-gray-600 mt-1">Manage your bulk product catalog and variants</p>
          </div>
          <button
            onClick={() => navigate('/bulk-product/add')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {renderIcon(FiPlus, { size: 20 })}
            <span>Add Bulk Product</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              {renderIcon(FiLoader, { size: 32, className: 'animate-spin text-blue-600 mx-auto mb-4' })}
              <p className="text-gray-600">Loading bulk products...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">{renderIcon(FiSearch, { size: 20 })}</span>
                <input
                  type="text"
                  placeholder="Search bulk products by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Products Table */}
            <BulkProductTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />

            {/* Delete Confirmation Modal */}
            <Modal
              isOpen={deleteModal.isOpen}
              title="Delete Bulk Product"
              message={`Are you sure you want to delete "${deleteModal.productName}"?`}
              onClose={() => setDeleteModal({ isOpen: false, productId: null, productName: '' })}
              footer={
                <>
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, productId: null, productName: '' })}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
                  >
                    Delete
                  </button>
                </>
              }
            />

            {/* Success Modal */}
            <Modal
              isOpen={successModal.isOpen}
              type="success"
              title="Success"
              message={successModal.message}
              onClose={() => setSuccessModal({ isOpen: false, message: '' })}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default BulkProduct;
