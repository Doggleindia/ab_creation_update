import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiSearch, FiLoader, FiArrowLeft } from 'react-icons/fi';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import VariantTable from '../components/Tables/VariantTable';
import { renderIcon } from '../utils/iconRenderer';
import { Variant } from '../types/models';
import { apiService } from '../utils/api';
import VariantInventoryModal from '../components/Inventory/VariantInventoryModal';

const VariantPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');

  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, variantId: null as string | null, variantName: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  const [inventoryModal, setInventoryModal] = useState<{ isOpen: boolean; variant: Variant | null }>({
    isOpen: false,
    variant: null,
  });


  const fetchVariants = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      const response = await apiService.getProductVariantsAdmin(productId);
      setVariants(response.data);
    } catch (err) {
      console.error('Failed to fetch variants:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchVariants();
    }
  }, [fetchVariants, productId]);

  const handleEdit = (variant: Variant) => {
    navigate(`/variant/edit/${variant._id}?productId=${productId}`, { state: { variant, productId } });
  };

  const handleDelete = (variantId: string, variantName: string) => {
    setDeleteModal({ isOpen: true, variantId, variantName });
  };

  const confirmDelete = async () => {
    if (deleteModal.variantId && productId) {
      try {
        await apiService.deleteVariantAdmin(productId, deleteModal.variantId);
        fetchVariants(); // Refresh the list
        setDeleteModal({ isOpen: false, variantId: null, variantName: '' });
        setSuccessModal({ isOpen: true, message: 'Variant deleted successfully!' });
      } catch (err) {
        console.error('Failed to delete variant:', err);
        setDeleteModal({ isOpen: false, variantId: null, variantName: '' });
      }
    }
  };

  const handleView = (variant: Variant) => {
    console.log('View variant:', variant);
  };

  if (!productId) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Product ID is required</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/product')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {renderIcon(FiArrowLeft, { size: 24 })}
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Variants</h1>
            <p className="text-gray-600 mt-1">Manage variants for product {productId}</p>
          </div>
        </div>

        {/* Add Variant Button */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate(`/variant/add?productId=${productId}`)}
            className="flex items-center gap-2 px-6 py-3 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors font-medium"
          >
            {renderIcon(FiPlus, { size: 20 })}
            <span>Add Variant</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              {renderIcon(FiLoader, { size: 32, className: 'animate-spin text-[#B87D4C] mx-auto mb-4' })}
              <p className="text-gray-600">Loading variants...</p>
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
                  placeholder="Search by size or color..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-gray-600 text-sm font-medium">Total Variants</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{variants.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-gray-600 text-sm font-medium">Total Images</p>
                <p className="text-2xl font-bold text-[#B87D4C] mt-1">
                  {variants.reduce((sum, v) => sum + v.media.images.length, 0)}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-gray-600 text-sm font-medium">Total Videos</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {variants.reduce((sum, v) => sum + v.media.videos.length, 0)}
                </p>
              </div>
            </div>

            {/* Variants Table */}
            <VariantTable
                productId={productId!}
                variants={variants.filter((v: Variant) =>
                  v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  v.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (v.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
                )}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onInventoryClick={(variant) => {
                setInventoryModal({ isOpen: true, variant });
              }}
            />
          </>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, variantId: null, variantName: '' })}
          title="Delete Variant"
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
        >
          <p className="text-gray-700">Are you sure you want to delete the variant "{deleteModal.variantName}"? This action cannot be undone.</p>
        </Modal>

        {/* Success Modal */}
        <Modal
          isOpen={successModal.isOpen}
          onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        >
          <p className="text-center text-green-600">{successModal.message}</p>
        </Modal>

        {inventoryModal.isOpen && inventoryModal.variant && productId && (
          <VariantInventoryModal
            isOpen={inventoryModal.isOpen}
            onClose={() => setInventoryModal({ isOpen: false, variant: null })}
            productId={productId}
            variantId={inventoryModal.variant._id}
          />
        )}
      </div>
    </Layout>
  );
};

export default VariantPage;

