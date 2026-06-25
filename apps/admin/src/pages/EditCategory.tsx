import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { renderIcon } from '../utils/iconRenderer';
import { FiArrowLeft } from 'react-icons/fi';
import { CategoryWithParent, UpdateCategoryRequest, Collection } from '../types/models';
import { apiService } from '../utils/api';

const EditCategory: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category as CategoryWithParent;

  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    images?: string[];
    collectionId?: string;
  }>({
    name: category?.name || '',
    slug: category?.slug || '',
    images: (category as any)?.images || [],
    collectionId: typeof category?.collectionId === 'string' ? category.collectionId : category?.collectionId?._id || ''
  });

  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({ isOpen: false, type: 'success', message: '' });
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    if (!category) {
      navigate('/category');
    }
  }, [category, navigate]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await apiService.getAllCollectionsAdmin();
        setCollections(response.data.collections);
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      }
    };
    fetchCollections();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) return;

    try {
      setLoading(true);

      // Create FormData if there's a new image, otherwise send JSON
      if (uploadedImages.length > 0) {
        const requestData = new FormData();
        requestData.append('name', formData.name);
        requestData.append('slug', formData.slug);
        requestData.append('image', uploadedImages[0]);
        
        if (formData.collectionId) {
          requestData.append('collectionId', formData.collectionId);
        }

        await apiService.updateCategoryAdmin(category.id, requestData);
      } else {
        // Send as JSON if no new image
        const updateData: UpdateCategoryRequest = {
          name: formData.name,
          slug: formData.slug,
          ...(formData.images && formData.images.length > 0 && { images: formData.images }),
          collectionId: formData.collectionId || undefined
        };

        await apiService.updateCategoryAdmin(category.id, updateData);
      }

      setModal({ isOpen: true, type: 'success', message: 'Category updated successfully' });
      setTimeout(() => navigate('/category'), 2000);
    } catch (err) {
      setModal({ isOpen: true, type: 'error', message: err instanceof Error ? err.message : 'Failed to update category' });
    } finally {
      setLoading(false);
    }
  };

  if (!category) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/category')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {renderIcon(FiArrowLeft, { size: 24 })}
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Edit Category</h2>
            <p className="text-gray-600 mt-1">Update category information</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category ID (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category ID
              </label>
              <input
                type="text"
                value={category.id}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                readOnly
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter category name"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Category Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="Enter slug"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Collection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Collection
              </label>
              <select
                name="collectionId"
                value={formData.collectionId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a collection</option>
                {collections.map((collection) => (
                  <option key={collection._id} value={collection._id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category Images (Optional)
              </label>
              <div className="space-y-3">
                {/* Existing Images */}
                {formData.images && formData.images.map((image, index) => (
                  <div key={`existing-${index}`} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="flex-1 text-sm text-gray-600 truncate">{image}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          images: prev.images?.filter((_, i) => i !== index) || []
                        }));
                      }}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {/* New Uploaded Images */}
                {uploadedImages.map((file, index) => (
                  <div key={`new-${index}`} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="flex-1 text-sm text-gray-600 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImages(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        setUploadedImages(prev => [...prev, ...Array.from(e.target.files!)]);
                      }
                    }}
                    className="hidden"
                    id="category-images"
                  />
                  <label htmlFor="category-images" className="cursor-pointer">
                    <p className="text-sm text-gray-600 font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {loading ? 'Updating...' : 'Update Category'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/category')}
                className="px-6 py-2 border border-slate-200 text-gray-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Modal */}
        {modal.isOpen && (
          <Modal
            isOpen={modal.isOpen}
            onClose={() => setModal({ isOpen: false, type: 'success', message: '' })}
            title={modal.type === 'success' ? 'Success' : 'Error'}
          >
            <p className={`text-sm ${modal.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {modal.message}
            </p>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default EditCategory;
