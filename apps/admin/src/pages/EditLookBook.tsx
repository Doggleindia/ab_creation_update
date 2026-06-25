import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { renderIcon } from '../utils/iconRenderer';
import { FiArrowLeft, FiVideo, FiLoader } from 'react-icons/fi';
import { LookBookMedia } from '../types/models';
import { apiService } from '../utils/api';

const EditLookBook: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<LookBookMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: ''
  });
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({ isOpen: false, type: 'success', message: '' });

  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllLookBookMedia();
      const foundMedia = response.data.lookbookItems.find((item: LookBookMedia) => item._id === id);
      if (foundMedia) {
        setMedia(foundMedia);
        setFormData({
          title: foundMedia.title
        });
      } else {
        alert('Media not found');
        navigate('/lookbook');
      }
    } catch (err) {
      console.error('Error loading media:', err);
      alert('Error loading media');
      navigate('/lookbook');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      loadMedia();
    }
  }, [id, loadMedia]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    setSaving(true);

    try {
      await apiService.updateLookBookDetails(id!, {
        title: formData.title
      });

      setModal({ isOpen: true, type: 'success', message: 'Media details updated successfully!' });
    } catch (err) {
      console.error('Error updating media:', err);
      setModal({ isOpen: true, type: 'error', message: 'Error updating media. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            {renderIcon(FiLoader, { size: 32, className: 'animate-spin text-blue-600 mx-auto mb-4' })}
            <p className="text-gray-600">Loading media...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!media) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Media not found</p>
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
            onClick={() => navigate('/lookbook')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {renderIcon(FiArrowLeft, { size: 24 })}
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Edit Media</h2>
            <p className="text-gray-600 mt-1">Edit the details of your photo or video</p>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Photo/Video ka title"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>



              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Updating...' : 'Update Details'}
              </button>
            </form>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Current Media</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                  media.mediaType === 'image' ? 'bg-blue-500' : 'bg-purple-500'
                }`}>
                  {media.mediaType === 'image' ? 'Image' : 'Video'}
                </span>
              </div>

              <div className="w-full h-64 bg-slate-100 rounded-lg overflow-hidden">
                {media.mediaType === 'image' ? (
                  <img
                    src={media.mediaUrl}
                    alt={media.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200">
                    <div className="text-center">
                      {renderIcon(FiVideo, { size: 48, className: 'text-gray-400 mx-auto mb-2' })}
                      <p className="text-gray-600">Video Preview</p>
                      <p className="text-xs text-gray-500 mt-2">Video file</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>Created: {new Date(media.createdAt).toLocaleDateString('hi-IN')}</p>
                <p>Last updated: {new Date(media.updatedAt).toLocaleDateString('hi-IN')}</p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ℹ️ <strong>Note:</strong> You can only edit the title. To change the media file, delete this item and upload a new one.
              </p>
            </div>
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={modal.isOpen}
          onClose={() => {
            setModal({ ...modal, isOpen: false });
            if (modal.type === 'success') {
              navigate('/lookbook');
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

export default EditLookBook;
