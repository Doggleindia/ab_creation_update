import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { renderIcon } from '../utils/iconRenderer';
import { CreateCollectionRequest } from '../types/models';
import { apiService } from '../utils/api';

const collectionNames = ['MENS-COLLECTIONS', 'WOMENS-COLLECTIONS', 'KIDS-COLLECTIONS'] as const;

const AddCollection: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  
  const [formData, setFormData] = useState<CreateCollectionRequest>({
    id: '',
    name: 'MENS-COLLECTIONS',
    slug: '',
    status: 'active',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.id.trim()) {
      setError('Collection ID is required');
      return false;
    }
    
    if (!/^COL\d{3}$/.test(formData.id)) {
      setError('Collection ID must be in format COL### (e.g., COL001)');
      return false;
    }
    
    if (!formData.name) {
      setError('Collection name is required');
      return false;
    }
    
    if (!formData.slug.trim()) {
      setError('Slug is required');
      return false;
    }
    
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(formData.slug)) {
      setError('Slug must be lowercase with hyphens (e.g., mens-collections)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const payload = {
        id: formData.id.toUpperCase(),
        name: formData.name,
        slug: formData.slug.toLowerCase(),
        status: formData.status as 'active' | 'inactive',
      };
      
      await apiService.createCollectionAdmin(payload);
      setSuccessModal({
        isOpen: true,
        message: 'Collection created successfully!',
      });
      
      setTimeout(() => {
        navigate('/collection');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create collection';
      setError(errorMessage);
      console.error('Error creating collection:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/collection')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {renderIcon(FiArrowLeft)}
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Collection</h1>
            <p className="mt-1 text-gray-600">Create a new product collection</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="flex items-gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex-shrink-0">
                  {renderIcon(FiAlertCircle)}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Collection ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Collection ID *
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                placeholder="COL001"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Format: COL### (e.g., COL001)</p>
            </div>

            {/* Collection Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Collection Name *
              </label>
              <select
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {collectionNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Select from predefined collection names</p>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="mens-collections"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">URL-friendly slug (lowercase with hyphens)</p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/collection')}
                className="px-6 py-2 border border-slate-300 rounded-lg text-gray-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {renderIcon(FiSave)}
                {loading ? 'Creating...' : 'Create Collection'}
              </button>
            </div>
          </form>
        </div>

        {/* Success Modal */}
        <Modal
          isOpen={successModal.isOpen}
          onClose={() => setSuccessModal({ isOpen: false, message: '' })}
          title="Success"
        >
          <p className="text-gray-600">{successModal.message}</p>
        </Modal>
      </div>
    </Layout>
  );
};

export default AddCollection;
