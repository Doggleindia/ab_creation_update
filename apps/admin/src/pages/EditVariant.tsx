import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { renderIcon } from '../utils/iconRenderer';
import { FiArrowLeft, FiUpload, FiX, FiLoader } from 'react-icons/fi';
import { UpdateVariantRequest, Variant } from '../types/models';
import { apiService } from '../utils/api';

const EditVariant: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const productId = (location.state as any)?.productId || searchParams.get('productId') || '';

  const [variant, setVariant] = useState<Variant | null>(null);
  const [formData, setFormData] = useState<UpdateVariantRequest>({
    color: '',
    sku: '',
    addPercentageInBasePrice: 0
  });

  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({ isOpen: false, type: 'success', message: '' });

  // File upload states (same as AddVariant)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchVariant = async () => {
      if (!id || !productId) {
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getSingleVariantAdmin(productId, id);
        const variantData = response.data;
        setVariant(variantData);
        setFormData({
          color: variantData.color,
          sku: variantData.sku || '',
          addPercentageInBasePrice: variantData.addPercentageInBasePrice || 0
        });

        // Populate existing media previews (so old images/videos show on Edit page)
        setImagePreviews(variantData.media?.images ?? []);
        setVideoPreviews(variantData.media?.videos ?? []);
      } catch (err) {
        console.error('Failed to fetch variant:', err);
        setModal({ isOpen: true, type: 'error', message: 'Failed to load variant data.' });
      } finally {
        setLoading(false);
      }
    };

    fetchVariant();
  }, [id, productId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'addPercentageInBasePrice' ? Number(value) : value
    }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          setModal({ isOpen: true, type: 'error', message: `File ${file.name} exceeds 10MB limit.` });
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      setImageFiles(prev => [...prev, ...validFiles]);

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((file) => {
        if (file.size > 15 * 1024 * 1024) {
          setModal({ isOpen: true, type: 'error', message: `File ${file.name} exceeds 15MB limit.` });
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      setVideoFiles(prev => [...prev, ...validFiles]);
      validFiles.forEach(file => {
        setVideoPreviews(prev => [...prev, file.name]);
      });
    }
  };

  const removeImagePreview = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideoFile = (index: number) => {
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.color?.trim()) {
      setModal({ isOpen: true, type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    try {
      setLoading(true);
      await apiService.updateVariantAdmin(
        productId,
        id!,
        formData,
        imageFiles.length > 0 ? imageFiles : undefined,
        videoFiles.length > 0 ? videoFiles : undefined
      );
      setModal({ isOpen: true, type: 'success', message: 'Variant updated successfully!' });
    } catch (err) {
      console.error('Failed to update variant:', err);
      setModal({ isOpen: true, type: 'error', message: 'Failed to update variant. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!productId) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <p className="text-red-600">Product ID is required to edit a variant.</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            {renderIcon(FiLoader, { size: 32, className: 'animate-spin text-[#B87D4C] mx-auto mb-4' })}
            <p className="text-gray-600">Loading variant...</p>
          </div>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {renderIcon(FiArrowLeft, { size: 20 })}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Variant</h1>
              <p className="text-gray-600">Update variant information</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Variant ID
                  </label>
                  <input
                    type="text"
                    value={variant?.id || ''}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-gray-50"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Color *
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                    placeholder="Red"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                    placeholder="MEN-TSHIRT-M-RED"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Price Adjustment %
                  </label>
                  <input
                    type="number"
                    name="addPercentageInBasePrice"
                    value={formData.addPercentageInBasePrice || 0}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                    placeholder="10"
                    min="-100"
                    max="100"
                  />
                </div>
              </div>

              {/* Media Upload (same as AddVariant) */}
              <div className="space-y-6">
                {/* Images Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Images
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-[#B87D4C] hover:bg-[#F5F1EA] transition-colors cursor-pointer">
                      <div className="text-center">
                        {renderIcon(FiUpload, { size: 32, className: 'text-gray-400 mx-auto mb-2' })}
                        <p className="text-sm font-medium text-gray-900">Click to select images</p>
                        <p className="text-xs text-gray-500 mt-1">or drag and drop (max 10MB each)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>

                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImagePreview(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              {renderIcon(FiX, { size: 12 })}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Videos Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Videos
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-[#B87D4C] hover:bg-[#F5F1EA] transition-colors cursor-pointer">
                      <div className="text-center">
                        {renderIcon(FiUpload, { size: 32, className: 'text-gray-400 mx-auto mb-2' })}
                        <p className="text-sm font-medium text-gray-900">Click to select videos</p>
                        <p className="text-xs text-gray-500 mt-1">or drag and drop (max 15MB each)</p>
                      </div>
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleVideoFileChange}
                        className="hidden"
                      />
                    </label>

                    {videoPreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {videoPreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <div className="w-full h-24 bg-slate-100 rounded-lg border flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-xs text-gray-600">Video {index + 1}</p>
                                <p className="text-xs text-gray-500 truncate max-w-full">{preview}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVideoFile(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              {renderIcon(FiX, { size: 12 })}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#171717] text-white hover:bg-[#B87D4C] rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={modal.isOpen}
          onClose={() => {
            setModal({ ...modal, isOpen: false });
            if (modal.type === 'success') {
              navigate(-1);
            }
          }}
        >
          <p className={`text-center ${modal.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {modal.message}
          </p>
        </Modal>
      </div>
    </Layout>
  );
};

export default EditVariant;

