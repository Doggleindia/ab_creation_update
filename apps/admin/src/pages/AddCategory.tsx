import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { renderIcon } from '../utils/iconRenderer';
import { FiArrowLeft } from 'react-icons/fi';
import { CreateCategoryRequest, Collection } from '../types/models';
import { apiService } from '../utils/api';

const AddCategory: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    slug: string;
    images?: string[];
    collectionId?: string;
  }>({
    id: '',
    name: '',
    slug: '',
    images: [],
    collectionId: ''
  });

  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({ isOpen: false, type: 'success', message: '' });
  const [collections, setCollections] = useState<Collection[]>([]);

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

    if (!formData.id.trim() || !formData.name.trim() || !formData.slug.trim()) {
      setModal({ isOpen: true, type: 'error', message: 'Category ID, name, and slug are required!' });
      return;
    }

    // Validate ID format (CATXXX)
    if (!/^CAT\d{3}$/.test(formData.id)) {
      setModal({ isOpen: true, type: 'error', message: 'Category ID must be in format CATXXX (e.g., CAT001)!' });
      return;
    }

    // Validate slug format (lowercase letters, numbers, hyphens)
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setModal({ isOpen: true, type: 'error', message: 'Slug must contain only lowercase letters, numbers, and hyphens!' });
      return;
    }

    setLoading(true);

    try {
      // Create FormData for multipart upload
      const requestData = new FormData();
      requestData.append('id', formData.id);
      requestData.append('name', formData.name);
      requestData.append('slug', formData.slug);

      // Add image if exists
      if (uploadedImages.length > 0) {
        requestData.append('image', uploadedImages[0]);
      }

      // Add collection ID if exists
      if (formData.collectionId) {
        requestData.append('collectionId', formData.collectionId);
      }

      await apiService.createCategoryAdmin(requestData);
      setModal({ isOpen: true, type: 'success', message: 'Category created successfully!' });
      setTimeout(() => {
        navigate('/category');
      }, 1500);
    } catch (err) {
      setModal({ isOpen: true, type: 'error', message: err instanceof Error ? err.message : 'Failed to create category' });
    } finally {
      setLoading(false);
    }
  };

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
            <h2 className="text-3xl font-bold text-gray-900">Add Category</h2>
            <p className="text-gray-600 mt-1">Create a new product category</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                placeholder="Enter category ID (e.g., CAT001)"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Format: CAT followed by 3 digits (e.g., CAT001)</p>
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
                  placeholder="Enter category name (e.g., Shirts)"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="Enter category slug (e.g., shirts)"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Lowercase letters, numbers, and hyphens only</p>
              </div>
            </div>

            {/* Collection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Collection (Optional)
              </label>
              <select
                name="collectionId"
                value={formData.collectionId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
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
                {uploadedImages.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
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
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-[#B87D4C] transition-colors">
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

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/category')}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
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
        }}
        type={modal.type}
        title={modal.type === 'success' ? 'Success' : 'Error'}
        message={modal.message}
      />
    </Layout>
  );
};

export default AddCategory;
