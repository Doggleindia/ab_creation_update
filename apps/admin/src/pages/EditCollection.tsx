import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiAlertCircle, FiLoader } from 'react-icons/fi';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { renderIcon } from '../utils/iconRenderer';
import { Collection, UpdateCollectionRequest } from '../types/models';
import { apiService } from '../utils/api';

const collectionNames = ['MENS-COLLECTIONS', 'WOMENS-COLLECTIONS', 'KIDS-COLLECTIONS'] as const;

const EditCollection: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  
  const [formData, setFormData] = useState<UpdateCollectionRequest>({
    name: 'MENS-COLLECTIONS',
    slug: '',
    status: 'active',
  });
  
  const [collection, setCollection] = useState<Collection | null>(null);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setFetching(true);
        const state = location.state as { collection: Collection } | null;
        if (state?.collection) {
          setCollection(state.collection);
          setFormData({
            name: state.collection.name,
            slug: state.collection.slug,
            status: state.collection.status,
          });
        } else if (id) {
          const response = await apiService.getSingleCollectionAdmin(id);
          setCollection(response.data.collection);
          setFormData({
            name: response.data.collection.name,
            slug: response.data.collection.slug,
            status: response.data.collection.status,
          });
        }
      } catch (err) {
        console.error('Failed to fetch collection:', err);
        setError('Failed to load collection');
      } finally {
        setFetching(false);
      }
    };

    fetchCollection();
  }, [id, location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (formData.name && !collectionNames.includes(formData.name as any)) {
      setError('Invalid collection name');
      return false;
    }
    
    if (formData.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(formData.slug)) {
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
    
    if (!id || !collection) {
      setError('Collection ID not found');
      return;
    }
    
    try {
      setLoading(true);
      const payload: UpdateCollectionRequest = {};
      if (formData.name) payload.name = formData.name;
      if (formData.slug) payload.slug = formData.slug.toLowerCase();
      if (formData.status) payload.status = formData.status as 'active' | 'inactive';
      
      await apiService.updateCollectionAdmin(collection.id, payload);
      setSuccessModal({
        isOpen: true,
        message: 'Collection updated successfully!',
      });
      
      setTimeout(() => {
        navigate('/collection');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update collection';
      setError(errorMessage);
      console.error('Error updating collection:', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="text-4xl text-[#B87D4C] animate-spin">{renderIcon(FiLoader)}</div>
            <p className="text-gray-600">Loading collection...</p>
          </div>
        </div>
      </Layout>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Edit Collection</h1>
            <p className="mt-1 text-gray-600">
              {collection?.id && `Editing: ${collection.id}`}
            </p>
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

            {/* Collection ID (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Collection ID (Read-only)
              </label>
              <input
                type="text"
                value={collection?.id || ''}
                disabled
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-gray-600 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Collection ID cannot be changed</p>
            </div>

            {/* Collection Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Collection Name
              </label>
              <select
                name="name"
                value={formData.name || 'MENS-COLLECTIONS'}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C] focus:border-transparent"
              >
                {collectionNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="mens-collections"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C] focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">URL-friendly slug (lowercase with hyphens)</p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C] focus:border-transparent"
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
                className="flex items-center gap-2 px-6 py-2 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] disabled:opacity-50 transition-colors"
              >
                {renderIcon(FiSave)}
                {loading ? 'Updating...' : 'Update Collection'}
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

export default EditCollection;
