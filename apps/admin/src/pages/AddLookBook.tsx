import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { renderIcon } from '../utils/iconRenderer';
import { FiArrowLeft, FiUpload, FiX } from 'react-icons/fi';
import { apiService } from '../utils/api';

const AddLookBook: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    mediaType: 'image' | 'video';
    file: File | null;
  }>({
    title: '',
    description: '',
    mediaType: 'image',
    file: null
  });
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({ isOpen: false, type: 'success', message: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size
      const maxSize = formData.mediaType === 'image' ? 10 * 1024 * 1024 : 15 * 1024 * 1024; // 10MB for images, 15MB for videos
      if (file.size > maxSize) {
        setModal({
          isOpen: true,
          type: 'error',
          message: `File size exceeds the limit. Maximum size for ${formData.mediaType}s is ${formData.mediaType === 'image' ? '10MB' : '15MB'}.`
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({
      ...prev,
      url
    }));
    setPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file) {
      setModal({ isOpen: true, type: 'error', message: 'Please select a file to upload!' });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('media', formData.file);
      formDataToSend.append('title', formData.title);

      await apiService.uploadLookBookMedia(formDataToSend);

      setModal({ isOpen: true, type: 'success', message: 'Media successfully uploaded!' });
    } catch (err) {
      console.error('Error uploading media:', err);
      setModal({ isOpen: true, type: 'error', message: 'Error uploading media. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const clearPreview = () => {
    setPreview('');
    setFormData(prev => ({
      ...prev,
      file: null
    }));
  };

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
            <h2 className="text-3xl font-bold text-gray-900">Add Photos/Videos</h2>
            <p className="text-gray-600 mt-1">Add a new photo or video</p>
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
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>



              {/* Media Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Media Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="mediaType"
                  value={formData.mediaType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Add Media'}
              </button>
            </form>
          </div>

          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Method Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Upload Method</h3>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  File Upload
                </label>
                <label className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-[#B87D4C] hover:bg-[#F5F1EA] transition-colors cursor-pointer">
                  <div className="text-center">
                    {renderIcon(FiUpload, { size: 32, className: 'text-gray-400 mx-auto mb-2' })}
                    <p className="text-sm font-medium text-gray-900">Click to select a photo or video</p>
                    <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                  </div>
                  <input
                    type="file"
                    accept={formData.mediaType === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Or add via URL
                </label>
                <input
                  type="text"
                  onChange={handleUrlInput}
                  placeholder={formData.mediaType === 'image' ? 'Image URL' : 'Video URL'}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>
            </div>

            {/* Preview */}
            {preview && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                  <button
                    onClick={clearPreview}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {renderIcon(FiX, { size: 20 })}
                  </button>
                </div>

                <div className="w-full h-64 bg-slate-100 rounded-lg overflow-hidden">
                  {formData.mediaType === 'image' ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                      <div className="text-center">
                        <p className="text-gray-600">Video Preview</p>
                          <p className="text-xs text-gray-500 mt-2">Video file selected</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✅ <strong>Tip:</strong> Use high-quality photos and videos for best results
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

export default AddLookBook;
