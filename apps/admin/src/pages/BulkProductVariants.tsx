import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiSearch, FiLoader, FiArrowLeft } from 'react-icons/fi';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import BulkProductVariantTable from '../components/Tables/BulkProductVariantTable';
import { renderIcon } from '../utils/iconRenderer';
import type { BulkProduct as BulkProductType, BulkProductVariant } from '../types/models';
import { apiService } from '../utils/api';

const BulkProductVariants: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState<BulkProductType | null>(null);
  const [variants, setVariants] = useState<BulkProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, variantId: null as string | null, variantName: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  const fetchData = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const [productResponse, variantsResponse] = await Promise.all([
        apiService.getSingleBulkProductAdmin(productId),
        apiService.getBulkProductVariantsByProductAdmin(productId),
      ]);
      setProduct(productResponse.data);
      setVariants(variantsResponse.data || []);
    } catch (err) {
      console.error('Failed to fetch bulk product variants:', err);
      setErrorModal({ isOpen: true, message: 'Failed to load variants. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (variant: BulkProductVariant) => {
    navigate(`/bulk-product/${productId}/variants/edit/${variant._id}`, { state: { variant } });
  };

  const handleDelete = (variantId: string, variantName: string) => {
    setDeleteModal({ isOpen: true, variantId, variantName });
  };

  const confirmDelete = async () => {
    if (!deleteModal.variantId) return;
    try {
      await apiService.deleteBulkProductVariantAdmin(deleteModal.variantId);
      await fetchData();
      setDeleteModal({ isOpen: false, variantId: null, variantName: '' });
      setSuccessModal({ isOpen: true, message: 'Bulk product variant deleted successfully!' });
    } catch (err) {
      console.error('Failed to delete bulk product variant:', err);
      setDeleteModal({ isOpen: false, variantId: null, variantName: '' });
    }
  };

  const handleView = (variant: BulkProductVariant) => {
    navigate(`/bulk-product/${productId}/variants/edit/${variant._id}`, { state: { variant } });
  };

  if (!productId) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <p className="text-red-600">Bulk product ID is required to view variants.</p>
        </div>
      </Layout>
    );
  }

  const filteredVariants = variants.filter((variant) =>
    (variant.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    variant.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/bulk-product')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {renderIcon(FiArrowLeft, { size: 24 })}
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bulk Product Variants</h1>
              <p className="text-gray-600 mt-1">
                Manage variants for {product?.title ?? `product ${productId}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/bulk-product/${productId}/variants/add`)}
            className="flex items-center gap-2 px-6 py-3 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors font-medium"
          >
            {renderIcon(FiPlus, { size: 20 })}
            <span>Add Variant</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              {renderIcon(FiLoader, { size: 32, className: 'animate-spin text-[#B87D4C] mx-auto mb-4' })}
              <p className="text-gray-600">Loading bulk product variants...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">{renderIcon(FiSearch, { size: 20 })}</span>
                <input
                  type="text"
                  placeholder="Search variants by title, color or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>
            </div>

            <BulkProductVariantTable
              variants={filteredVariants}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </>
        )}

        <Modal
          isOpen={deleteModal.isOpen}
          title="Delete Variant"
          message={`Are you sure you want to delete variant "${deleteModal.variantName}"?`}
          onClose={() => setDeleteModal({ isOpen: false, variantId: null, variantName: '' })}
          footer={
            <>
              <button
                onClick={() => setDeleteModal({ isOpen: false, variantId: null, variantName: '' })}
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

        <Modal
          isOpen={successModal.isOpen}
          type="success"
          title="Success"
          message={successModal.message}
          onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        />

        <Modal
          isOpen={errorModal.isOpen}
          type="error"
          title="Error"
          message={errorModal.message}
          onClose={() => setErrorModal({ isOpen: false, message: '' })}
        />
      </div>
    </Layout>
  );
};

export default BulkProductVariants;
