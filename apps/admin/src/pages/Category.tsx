import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiLoader } from 'react-icons/fi';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import CategoryTable from '../components/Tables/CategoryTable';
import { renderIcon } from '../utils/iconRenderer';
import { CategoryWithParent } from '../types/models';
import { apiService } from '../utils/api';

const CategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryWithParent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const page = 1;
  const limit = 10;
  const [total, setTotal] = useState(0);
  const status = '';
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, categoryId: null as string | null, categoryName: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (status) params.append('status', status);
      const response = await apiService.getAllCategoriesAdmin(params.toString());
      setCategories(response.data.categories);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEdit = (category: CategoryWithParent) => {
    navigate(`/category/edit/${category.id}`, { state: { category } });
  };

  const handleDelete = (categoryId: string, categoryName: string) => {
    setDeleteModal({ isOpen: true, categoryId, categoryName });
  };

  const confirmDelete = async () => {
    if (deleteModal.categoryId) {
      try {
        await apiService.deleteCategoryAdmin(deleteModal.categoryId);
        fetchCategories(); // Refresh the list
        setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' });
        setSuccessModal({ isOpen: true, message: 'Category deleted successfully!' });
      } catch (err) {
        console.error('Failed to delete category:', err);
        setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' });
      }
    }
  };

  const handleView = (category: CategoryWithParent) => {
    console.log('View category:', category);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-1">Manage product categories and collections</p>
          </div>
          <button
            onClick={() => navigate('/category/add')}
            className="flex items-center gap-2 px-6 py-3 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors font-medium"
          >
            {renderIcon(FiPlus, { size: 20 })}
            <span>Add Category</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              {renderIcon(FiLoader, { size: 32, className: 'animate-spin text-[#B87D4C] mx-auto mb-4' })}
              <p className="text-gray-600">Loading categories...</p>
            </div>
          </div>
        ) : (
          <>
              {/* Search Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">{renderIcon(FiSearch, { size: 20 })}</span>
                  <input
                    type="text"
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                  <p className="text-gray-600 text-sm font-medium">Total Categories</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                  <p className="text-gray-600 text-sm font-medium">Total Categories</p>
                  <p className="text-2xl font-bold text-[#B87D4C] mt-1">
                    {categories.length}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                  <p className="text-gray-600 text-sm font-medium">Categories with Collection</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {categories.filter(c => c.collectionId).length}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                  <p className="text-gray-600 text-sm font-medium">Standalone Categories</p>
                  <p className="text-2xl font-bold text-[#B87D4C] mt-1">
                    {categories.filter(c => !c.collectionId).length}
                  </p>
                </div>
              </div>

              {/* Categories Table */}
              <CategoryTable
                categories={categories}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
          </>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' })}
          title="Delete Category"
          footer={
            <>
              <button
                onClick={() => setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' })}
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
          <p className="text-gray-700">Are you sure you want to delete the category "{deleteModal.categoryName}"? This action cannot be undone.</p>
        </Modal>

        {/* Success Modal */}
        <Modal
          isOpen={successModal.isOpen}
          onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        >
          <p className="text-center text-green-600">{successModal.message}</p>
        </Modal>
      </div>
    </Layout>
  );
};

export default CategoryPage;
