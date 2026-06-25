import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiLoader } from 'react-icons/fi';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import ProductTable from '../components/Tables/ProductTable';
import { renderIcon } from '../utils/iconRenderer';
import { Product } from '../types/models';
import { apiService } from '../utils/api';

const ProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
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
      const response = await apiService.getProductsAdmin(params.toString());
      setProducts(response.data);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (product: Product) => {
    navigate(`/product/edit/${product._id}`, { state: { product } });
  };

  const handleDelete = (productId: string, productName: string) => {
    setDeleteModal({ isOpen: true, productId, productName });
  };

  const confirmDelete = async () => {
    if (deleteModal.productId) {
      try {
        await apiService.deleteProductAdmin(deleteModal.productId);
        fetchProducts(); // Refresh the list
        setDeleteModal({ isOpen: false, productId: null, productName: '' });
        setSuccessModal({ isOpen: true, message: 'Product deleted successfully!' });
      } catch (err) {
        console.error('Failed to delete product:', err);
        setDeleteModal({ isOpen: false, productId: null, productName: '' });
      }
    }
  };

  const handleView = (product: Product) => {
    console.log('View product:', product);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product catalog and inventory</p>
          </div>
          <button
            onClick={() => navigate('/product/add')}
            className="flex items-center gap-2 px-6 py-3 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors font-medium"
          >
            {renderIcon(FiPlus, { size: 20 })}
            <span>Add Product</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              {renderIcon(FiLoader, { size: 32, className: 'animate-spin text-[#B87D4C] mx-auto mb-4' })}
              <p className="text-gray-600">Loading products...</p>
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
                  placeholder="Search by title, ID, or color..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-gray-600 text-sm font-medium">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-gray-600 text-sm font-medium">Published</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {products.filter((p: Product) => p.status === 'published').length}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-gray-600 text-sm font-medium">Draft</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {products.filter(p => p.status === 'draft').length}
                </p>
              </div>
            </div>

            {/* Products Table */}
            <ProductTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, productId: null, productName: '' })}
          title="Delete Product"
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
        >
          <p className="text-gray-700">Are you sure you want to delete the product "{deleteModal.productName}"? This action cannot be undone.</p>
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

export default ProductPage;
