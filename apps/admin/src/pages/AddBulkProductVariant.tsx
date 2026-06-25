import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiUpload, FiX } from 'react-icons/fi';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { renderIcon } from '../utils/iconRenderer';
import { CreateBulkProductVariantRequest, BulkProduct } from '../types/models';
import { apiService } from '../utils/api';

type AddBulkProductVariantFormState = Omit<CreateBulkProductVariantRequest, 'gsmPricingTiers'> & {
  gsmPricingTiers: Array<{
    gsmQuantity: number | string;
    addPercentage: number | string;
  }>;
};

const AddBulkProductVariant: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState<BulkProduct | null>(null);
  const [formData, setFormData] = useState<AddBulkProductVariantFormState>({
    id: '',
    bulkProductId: '',
    sku: '',
    color: '',
    gsmPricingTiers: [],
    images: [],
  });
  const [newGSMQuantity, setNewGSMQuantity] = useState('');
  const [newAddPercentage, setNewAddPercentage] = useState('0');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({ isOpen: false, type: 'success', message: '' });

  useEffect(() => {
    if (productId) {
      // Ensure bulkProductId is always set from URL parameter
      setFormData((prev) => ({ ...prev, bulkProductId: productId }));
      apiService.getSingleBulkProductAdmin(productId)
        .then((response) => setProduct(response.data))
        .catch((err) => console.error('Failed to load bulk product:', err));
    }
  }, [productId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }) as any);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...files]);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addGSMPricingTier = () => {
    if (newGSMQuantity.trim() && !isNaN(Number(newGSMQuantity))) {
      const addPercentage = Number(newAddPercentage);
      if (addPercentage < 0 || addPercentage > 100) {
        setModal({ isOpen: true, type: 'error', message: 'Add percentage must be between 0 and 100.' });
        return;
      }
      setFormData(prev => ({
        ...prev,
        gsmPricingTiers: [
          ...prev.gsmPricingTiers,
          {
            gsmQuantity: Number(newGSMQuantity.trim()),
            addPercentage: addPercentage
          }
        ]
      }));
      setNewGSMQuantity('');
      setNewAddPercentage('0');
    }
  };

  const removeGSMPricingTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gsmPricingTiers: prev.gsmPricingTiers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields for backend schema
    if (!productId) {
      setModal({ isOpen: true, type: 'error', message: 'Product ID is missing.' });
      return;
    }

    if (!formData.id || !formData.id.trim()) {
      setModal({ isOpen: true, type: 'error', message: 'Variant ID (BVAR001 format) is required.' });
      return;
    }

    // Validate BVAR format
    const bvarFormat = /^BVAR\d{3}$/;
    if (!bvarFormat.test(formData.id.trim().toUpperCase())) {
      setModal({ isOpen: true, type: 'error', message: 'Variant ID must follow BVAR001 format (e.g., BVAR001, BVAR002).' });
      return;
    }

    if (!formData.bulkProductId || !formData.bulkProductId.trim()) {
      setModal({ isOpen: true, type: 'error', message: 'Bulk Product ID is missing.' });
      return;
    }

    if (!formData.color || !formData.color.trim()) {
      setModal({ isOpen: true, type: 'error', message: 'Color is required.' });
      return;
    }

    if (formData.gsmPricingTiers.length === 0) {
      setModal({ isOpen: true, type: 'error', message: 'Please add at least one GSM pricing tier.' });
      return;
    }

    try {
      setLoading(true);
      const variantData: CreateBulkProductVariantRequest = {
        id: formData.id.trim().toUpperCase(),
        bulkProductId: productId,
        color: formData.color.trim(),
        gsmPricingTiers: formData.gsmPricingTiers.map(tier => ({
          gsmQuantity: Number(tier.gsmQuantity),
          addPercentage: Number(tier.addPercentage)
        })),
        sku: (formData as any).sku?.trim() || undefined,
      };
      await apiService.createBulkProductVariantAdmin(variantData, imageFiles.length > 0 ? imageFiles : undefined);
      setModal({ isOpen: true, type: 'success', message: 'Bulk product variant created successfully!' });
      setTimeout(() => navigate(`/bulk-product/${productId}/variants`), 1500);
    } catch (err: any) {
      console.error('Failed to create bulk product variant:', err);
      const rawMessage = err?.message || '';
      const duplicateMatch = /E11000 duplicate key error.*index:.*dup key:.*\{\s*id:\s*"([^"]+)"\s*\}/i.exec(rawMessage);
      const message = duplicateMatch
        ? `An issue occurred: Variant ID ${duplicateMatch[1]} already exists. Please use a different Variant ID.`
        : 'An issue occurred while creating the variant. Please check your input and try again.';
      setModal({ isOpen: true, type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  if (!productId) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <p className="text-red-600">Bulk product ID is required.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(`/bulk-product/${productId}/variants`)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {renderIcon(FiArrowLeft, { size: 20 })}
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add Bulk Product Variant</h1>
              <p className="text-gray-600 mt-1">Create a new variant for {product?.title ?? `bulk product ${productId}`}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Variant ID *</label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="BVAR001"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: BVAR followed by 3 digits (e.g., BVAR001, BVAR002)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={(formData as any).sku ?? ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="BVAR001"
                  />
                  <p className="text-xs text-gray-500 mt-1">If empty, backend will auto-generate SKU.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Color *</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="red"
                    required
                  />
                </div>
              </div>

              {/* GSM Pricing Tiers */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">GSM Pricing Tiers *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 items-end">
                  <div>
                    <label htmlFor="gsm-qty" className="block text-xs font-medium text-gray-600 mb-1">GSM Quantity</label>
                    <input
                      id="gsm-qty"
                      type="number"
                      value={newGSMQuantity}
                      onChange={(e) => setNewGSMQuantity(e.target.value)}
                      placeholder="e.g., 100"
                      min="1"
                      step="1"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGSMPricingTier())}
                    />
                  </div>
                  <div>
                    <label htmlFor="add-pct" className="block text-xs font-medium text-gray-600 mb-1">Add Percentage (%)</label>
                    <input
                      id="add-pct"
                      type="number"
                      value={newAddPercentage}
                      onChange={(e) => setNewAddPercentage(e.target.value)}
                      placeholder="0-100"
                      min="0"
                      max="100"
                      step="1"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGSMPricingTier())}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addGSMPricingTier}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Tier
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.gsmPricingTiers.map((tier, idx) => (
                    <div key={idx} className="flex items-center gap-3 border border-slate-200 rounded-lg p-3 bg-slate-50">
                      <div className="flex-1 text-sm text-gray-700">
                        <div><strong>GSM Qty:</strong> {tier.gsmQuantity}</div>
                        <div><strong>Add %:</strong> {tier.addPercentage}%</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGSMPricingTier(idx)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">At least one GSM pricing tier is required.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Images</label>
                <label className="flex items-center justify-center w-full px-6 py-10 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer">
                  <div className="text-center">
                    {renderIcon(FiUpload, { size: 28, className: 'text-gray-400 mx-auto mb-2' })}
                    <p className="text-sm font-medium text-gray-900">Click to upload images</p>
                    <p className="text-xs text-gray-500 mt-1">You may upload multiple images</p>
                  </div>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                </label>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden border border-slate-200">
                        <img src={preview} alt={`preview-${index}`} className="w-full h-28 object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 text-red-600 hover:text-red-700"
                        >
                          {renderIcon(FiX, { size: 16 })}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/bulk-product/${productId}/variants`)}
                  className="px-6 py-3 border border-slate-300 rounded-lg text-gray-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.type === 'success' ? 'Success' : 'Error'}
        message={modal.message}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
    </Layout>
  );
};

export default AddBulkProductVariant;
