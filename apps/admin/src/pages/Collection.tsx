import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiLoader } from 'react-icons/fi';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import CollectionTable from '../components/Tables/CollectionTable';
import { renderIcon } from '../utils/iconRenderer';
import { Collection } from '../types/models';
import { apiService } from '../utils/api';

const CollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const page = 1;
  const limit = 10;
  const [total, setTotal] = useState(0);
  const status = '';
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, collectionId: null as string | null, collectionName: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (status) params.append('status', status);
      const response = await apiService.getAllCollectionsAdmin(params.toString());
      setCollections(response.data.collections);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch collections:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleEdit = (collection: Collection) => {
    navigate(`/collection/edit/${collection.id}`, { state: { collection } });
  };

  const handleDelete = (collectionId: string, collectionName: string) => {
    setDeleteModal({ isOpen: true, collectionId, collectionName });
  };

  const confirmDelete = async () => {
    if (deleteModal.collectionId) {
      try {
        await apiService.deleteCollectionAdmin(deleteModal.collectionId);
        fetchCollections(); // Refresh the list
        setDeleteModal({ isOpen: false, collectionId: null, collectionName: '' });
        setSuccessModal({ isOpen: true, message: 'Collection deleted successfully!' });
      } catch (err) {
        console.error('Failed to delete collection:', err);
        setDeleteModal({ isOpen: false, collectionId: null, collectionName: '' });
      }
    }
  };

  const handleToggleStatus = async (collectionId: string) => {
    try {
      await apiService.toggleCollectionStatusAdmin(collectionId);
      fetchCollections(); // Refresh the list
      setSuccessModal({ isOpen: true, message: 'Collection status updated successfully!' });
    } catch (err) {
      console.error('Failed to toggle collection status:', err);
    }
  };

  const handleView = (collection: Collection) => {
    navigate(`/collection/edit/${collection.id}`, { state: { collection } });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
            <p className="mt-2 text-gray-600">Manage your product collections</p>
          </div>
          <button
            onClick={() => navigate('/collection/add')}
            className="flex items-center gap-2 px-4 py-2 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors"
          >
            {renderIcon(FiPlus)}
            Add Collection
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
            {renderIcon(FiSearch)}
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-slate-50 outline-none text-sm"
            />
          </div>
        </div>

        {/* Collections Table */}
        {loading ? (
          <div className="flex items-center justify-center h-96 bg-white rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl text-[#B87D4C] animate-spin">{renderIcon(FiLoader)}</div>
              <p className="text-gray-600">Loading collections...</p>
            </div>
          </div>
        ) : collections.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
            <p className="text-gray-600">No collections found. Create your first collection!</p>
          </div>
        ) : (
          <CollectionTable
            collections={collections}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onView={handleView}
          />
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, collectionId: null, collectionName: '' })}
          title="Delete Collection"
          footer={
            <>
              <button
                onClick={() => setDeleteModal({ isOpen: false, collectionId: null, collectionName: '' })}
                className="px-4 py-2 border border-slate-300 rounded-lg text-gray-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </>
          }
        >
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deleteModal.collectionName}</strong>? This action cannot be undone.
          </p>
        </Modal>

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

export default CollectionPage;
