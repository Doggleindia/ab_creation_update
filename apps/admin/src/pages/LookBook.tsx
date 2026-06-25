import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import LookBookTable from '../components/Tables/LookBookTable';
import { renderIcon } from '../utils/iconRenderer';
import { FiPlus, FiLoader, FiSearch } from 'react-icons/fi';
import { LookBookMedia } from '../types/models';
import { apiService } from '../utils/api';

const LookBook: React.FC = () => {
  const navigate = useNavigate();
  const [media, setMedia] = useState<LookBookMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; itemId: string | null }>({ isOpen: false, itemId: null });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllLookBookMedia();
      // Filter out invalid items to prevent runtime errors
      const validMedia = response.data.lookbookItems.filter(
        (item: any) => item && item.title && item.mediaType
      );
      setMedia(validMedia);
    } catch (err) {
      console.error('Error loading media:', err);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  // Load media on mount
  useEffect(() => {
    loadMedia();
  }, []);

  // Filter media based on search term
  const filteredMedia = media.filter(
    item =>
      item && item.title && item.mediaType && (
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mediaType.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleDelete = (id: string) => {
    setDeleteModal({ isOpen: true, itemId: id });
  };

  const confirmDelete = async () => {
    if (deleteModal.itemId) {
      try {
        await apiService.deleteLookBookMedia(deleteModal.itemId);
        setMedia(media.filter(m => m._id !== deleteModal.itemId));
        setDeleteModal({ isOpen: false, itemId: null });
      } catch (err) {
        console.error('Error deleting media:', err);
        setErrorModal({ isOpen: true, message: 'Error deleting media. Please try again.' });
        setDeleteModal({ isOpen: false, itemId: null });
      }
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/lookbook/edit/${id}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">LookBook</h2>
            <p className="text-gray-600 mt-1">Manage your photos and videos here</p>
          </div>
          <button
            onClick={() => navigate('/lookbook/add')}
            className="flex items-center gap-2 px-6 py-3 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors font-medium"
          >
            {renderIcon(FiPlus, { size: 20 })}
            <span>Add Media</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              {renderIcon(FiLoader, { size: 32, className: 'animate-spin text-[#B87D4C] mx-auto mb-4' })}
              <p className="text-gray-600">Loading media...</p>
            </div>
          </div>
        ) : (
            <>
              {/* Search Bar */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">{renderIcon(FiSearch, { size: 20 })}</span>
                  <input
                    type="text"
                    placeholder="Search by title, description, or media type..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-600 text-sm font-medium">Total Media</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{media.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-600 text-sm font-medium">Images</p>
                  <p className="text-2xl font-bold text-[#B87D4C] mt-1">
                    {media.filter(m => m.mediaType === 'image').length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-600 text-sm font-medium">Videos</p>
                  <p className="text-2xl font-bold text-[#B87D4C] mt-1">
                    {media.filter(m => m.mediaType === 'video').length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-600 text-sm font-medium">This Month</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {media.filter(m => {
                      const createdAt = new Date(m.createdAt);
                      const now = new Date();
                      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>

            {/* LookBook Table */}
            <LookBookTable
              media={filteredMedia}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReorder={setMedia}
            />
          </>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, itemId: null })}
          title="Delete Media"
          footer={
            <>
              <button
                onClick={() => setDeleteModal({ isOpen: false, itemId: null })}
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
          <p className="text-gray-700">Are you sure you want to delete this media?</p>
        </Modal>

        {/* Error Modal */}
        <Modal
          isOpen={errorModal.isOpen}
          onClose={() => setErrorModal({ isOpen: false, message: '' })}
        >
          <p className="text-center text-red-600">{errorModal.message}</p>
        </Modal>
      </div>
    </Layout>
  );
};

export default LookBook;
