import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiUpload, FiX, FiLoader } from 'react-icons/fi';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { renderIcon } from '../utils/iconRenderer';
import { UpdateBulkProductVariantRequest, BulkProductVariant } from '../types/models';
import { apiService } from '../utils/api';

type EditBulkProductVariantFormState = Omit<UpdateBulkProductVariantRequest, 'gsmPricingTiers'> & {
  gsmPricingTiers?: Array<{
    gsmQuantity: number | string;
    addPercentage: number | string;
  }>;
};

const EditBulkProductVariant: React.FC = () => {
  const navigate = useNavigate();
  const { productId, variantId } = useParams();
  const [variant, setVariant] = useState<BulkProductVariant | null>(null);
  const [formData, setFormData] = useState<EditBulkProductVariantFormState>({});
  const [newGSMQuantity, setNewGSMQuantity] = useState('');
  const [newAddPercentage, setNewAddPercentage] = useState('0');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({ isOpen: false, type: 'success', message: '' });

  const loadVariant = useCallback(async () => {
    if (!variantId || !productId) return;
    try {
      setDataLoading(true);
      console.log('Loading variant with ID:', variantId, 'for product:', productId);
      const response = await apiService.getSingleBulkProductVariantAdmin(variantId, productId);
      console.log('Loaded variant data:', response.data);
      setVariant(response.data);
      setFormData({
        sku: response.data.sku || '',
        color: response.data.color || '',
        gsmPricingTiers:
          response.data.gsmPricingTiers?.map((tier) => ({
            gsmQuantity: tier.gsmQuantity,
            addPercentage: tier.addPercentage ?? '',
          })) || [],
      });
      setExistingImages(response.data.images || []);
    } catch (err: any) {
      console.error('Failed to load bulk variant:', err);
      setModal({ isOpen: true, type: 'error', message: 'Failed to load variant data. Please try again.' });
    } finally {
      setDataLoading(false);
    }
  }, [variantId, productId]);

  useEffect(() => {
    loadVariant();
  }, [loadVariant]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    } as EditBulkProductVariantFormState));
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

  const removeNewImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
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
          ...(prev.gsmPricingTiers || []),
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
      gsmPricingTiers: (prev.gsmPricingTiers || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantId) {
      setModal({ isOpen: true, type: 'error', message: 'Variant ID is missing.' });
      return;
    }

    // Validate optional fields if provided
    if (formData.color && !formData.color.trim()) {
      setModal({ isOpen: true, type: 'error', message: 'Color cannot be empty.' });
      return;
    }

    try {
      setLoading(true);
      const updateData: UpdateBulkProductVariantRequest = {
        ...(formData.color && { color: formData.color.trim() }),
        ...(formData.gsmPricingTiers && formData.gsmPricingTiers.length > 0 && {
          gsmPricingTiers: formData.gsmPricingTiers.map(tier => ({
            gsmQuantity: Number(tier.gsmQuantity),
            addPercentage: Number(tier.addPercentage)
          }))
        }),
        ...(((formData as any).sku?.trim()) && { sku: (formData as any).sku.trim() }),
      };
      await apiService.updateBulkProductVariantAdmin(variantId, updateData, imageFiles.length > 0 ? imageFiles : undefined);
      setModal({ isOpen: true, type: 'success', message: 'Bulk product variant updated successfully!' });
      setTimeout(() => navigate(`/bulk-product/${productId}/variants`), 1500);
    } catch (err: any) {
      console.error('Failed to update bulk product variant:', err);
      setModal({ isOpen: true, type: 'error', message: err.message || 'Failed to update variant. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!productId || !variantId) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <p className="text-red-600">Bulk product ID and variant ID are required.</p>
        </div>
      </Layout>
    );
  }

  if (dataLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                {renderIcon(FiLoader, { size: 40, className: 'animate-spin text-[#B87D4C] mx-auto mb-4' })}
                <p className="text-gray-600">Loading variant data...</p>
              </div>
            </div>
          </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Edit Bulk Product Variant</h1>
              <p className="text-gray-600 mt-1">Update variant {variant?.sku || variantId}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={(formData as any).sku || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                    placeholder="BVAR001"
                  />
                  <p className="text-xs text-gray-500 mt-1">If empty, backend will auto-generate SKU.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                    placeholder="red"
                    required
                  />
                </div>
              </div>

              {/* GSM Pricing Tiers */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">GSM Pricing Tiers</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 items-end">
                  <div>
                    <label htmlFor="edit-gsm-qty" className="block text-xs font-medium text-gray-600 mb-1">GSM Quantity</label>
                    <input
                      id="edit-gsm-qty"
                      type="number"
                      value={newGSMQuantity}
                      onChange={(e) => setNewGSMQuantity(e.target.value)}
                      placeholder="e.g., 100"
                      min="1"
                      step="1"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGSMPricingTier())}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-add-pct" className="block text-xs font-medium text-gray-600 mb-1">Add Percentage (%)</label>
                    <input
                      id="edit-add-pct"
                      type="number"
                      value={newAddPercentage}
                      onChange={(e) => setNewAddPercentage(e.target.value)}
                      placeholder="0-100"
                      min="0"
                      max="100"
                      step="1"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGSMPricingTier())}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addGSMPricingTier}
                    className="px-4 py-2 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors"
                  >
                    Add Tier
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.gsmPricingTiers || []).map((tier, idx) => (
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Upload Additional Images</label>
                <label className="flex items-center justify-center w-full px-6 py-10 border-2 border-dashed border-slate-300 rounded-lg hover:border-[#B87D4C] hover:bg-[#F5F1EA] transition-colors cursor-pointer">
                  <div className="text-center">
                    {renderIcon(FiUpload, { size: 28, className: 'text-gray-400 mx-auto mb-2' })}
                    <p className="text-sm font-medium text-gray-900">Upload new images</p>
                    <p className="text-xs text-gray-500 mt-1">Existing images will be preserved unless replaced by backend logic</p>
                  </div>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                </label>

                {(existingImages.length > 0 || imagePreviews.length > 0) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {existingImages.map((image, index) => (
                      <div key={`existing-${index}`} className="relative rounded-lg overflow-hidden border border-slate-200">
                        <img src={image} alt={`existing-${index}`} className="w-full h-28 object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 text-red-600 hover:text-red-700"
                        >
                          {renderIcon(FiX, { size: 16 })}
                        </button>
                      </div>
                    ))}
                    {imagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative rounded-lg overflow-hidden border border-slate-200">
                        <img src={preview} alt={`preview-${index}`} className="w-full h-28 object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
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
                  className="px-6 py-3 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
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

export default EditBulkProductVariant;
