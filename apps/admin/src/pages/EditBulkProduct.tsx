import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { renderIcon } from '../utils/iconRenderer';
import { FiArrowLeft } from 'react-icons/fi';
import { UpdateBulkProductRequest, Specifications } from '../types/models';
import { apiService } from '../utils/api';

type EditBulkProductFormState = Omit<UpdateBulkProductRequest, 'basePrice'> & {
  basePrice?: number | string;
};

const EditBulkProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<EditBulkProductFormState>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({ isOpen: false, type: 'success', message: '' });

  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newGSMQuantity, setNewGSMQuantity] = useState('');
  const [newCustomizationType, setNewCustomizationType] = useState<'DTF' | 'Screen' | 'Embroidery' | 'Heat Transfer'>('DTF');
  const [newAddPercentage, setNewAddPercentage] = useState('0');
  const [newProductDetail, setNewProductDetail] = useState('');
  const [newCareInstruction, setNewCareInstruction] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const product = location.state?.product;
      if (product) {
        setFormData({
          title: product.title,
          slug: product.slug,
          categoryId: typeof product.categoryId === 'string' ? product.categoryId : product.categoryId._id,
          description: product.description,
          uploadYourDesign: product.uploadYourDesign,
          anyText: product.anyText,
          sizes: product.sizes || [],
          colors: product.colors || [],
          quantities: product.quantities || [],
          gsmQuantity: product.gsmQuantity || [],
          customizationTypes: product.customizationTypes || [],
          basePrice: product.basePrice,
          status: product.status,
          productDetails: product.productDetails || [],
          materialAndCare: product.materialAndCare || { material: '', careInstructions: [] },
          specifications: product.specifications || {
            fabric: '',
            fashionType: '',
            fit: '',
            type: '',
            neck: '',
            sleeveLength: '',
            pattern: '',
            occasion: '',
            closure: ''
          },
        });
      }
      
      const categoriesResponse = await apiService.getAllCategoriesAdmin();
      setCategories(categoriesResponse.data.categories);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setModal({ isOpen: true, type: 'error', message: 'Failed to load product' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'basePrice'
          ? value === ''
            ? ''
            : Number(value)
          : value,
    } as EditBulkProductFormState));
  };

  const addSize = () => {
    if (newSize.trim()) {
      setFormData(prev => ({
        ...prev,
        sizes: [...(prev.sizes || []), newSize.trim()]
      }));
      setNewSize('');
    }
  };

  const removeSize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: (prev.sizes || []).filter((_, i) => i !== index)
    }));
  };

  const addColor = () => {
    if (newColor.trim()) {
      setFormData(prev => ({
        ...prev,
        colors: [...(prev.colors || []), newColor.trim()]
      }));
      setNewColor('');
    }
  };

  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: (prev.colors || []).filter((_, i) => i !== index)
    }));
  };

  const addQuantity = () => {
    if (newQuantity.trim() && !isNaN(Number(newQuantity))) {
      setFormData(prev => ({
        ...prev,
        quantities: [...(prev.quantities || []), Number(newQuantity.trim())]
      }));
      setNewQuantity('');
    }
  };

  const removeQuantity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      quantities: (prev.quantities || []).filter((_, i) => i !== index)
    }));
  };

  const addGSMQuantity = () => {
    if (newGSMQuantity.trim() && !isNaN(Number(newGSMQuantity))) {
      setFormData(prev => ({
        ...prev,
        gsmQuantity: [...(prev.gsmQuantity || []), Number(newGSMQuantity.trim())]
      }));
      setNewGSMQuantity('');
    }
  };

  const removeGSMQuantity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gsmQuantity: (prev.gsmQuantity || []).filter((_, i) => i !== index)
    }));
  };

  const addCustomizationType = () => {
    const percentage = Number(newAddPercentage);
    if (!newCustomizationType || isNaN(percentage) || percentage < 0) return;
    setFormData(prev => ({
      ...prev,
      customizationTypes: [
        ...(prev.customizationTypes || []),
        { type: newCustomizationType, addPercentage: percentage }
      ]
    }));
    setNewCustomizationType('DTF');
    setNewAddPercentage('0');
  };

  const removeCustomizationType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customizationTypes: (prev.customizationTypes || []).filter((_, i) => i !== index)
    }));
  };

  const addProductDetail = () => {
    if (newProductDetail.trim()) {
      setFormData(prev => ({
        ...prev,
        productDetails: [...(prev.productDetails || []), newProductDetail.trim()]
      }));
      setNewProductDetail('');
    }
  };

  const removeProductDetail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productDetails: (prev.productDetails || []).filter((_, i) => i !== index)
    }));
  };

  const addCareInstruction = () => {
    if (newCareInstruction.trim()) {
      setFormData(prev => ({
        ...prev,
        materialAndCare: {
          ...(prev.materialAndCare || {}),
          careInstructions: [...((prev.materialAndCare?.careInstructions) || []), newCareInstruction.trim()]
        }
      }));
      setNewCareInstruction('');
    }
  };

  const removeCareInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materialAndCare: {
        ...(prev.materialAndCare || {}),
        careInstructions: ((prev.materialAndCare?.careInstructions) || []).filter((_, i) => i !== index)
      }
    }));
  };

  const handleSpecificationChange = (field: keyof Specifications, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...(prev.specifications || {}),
        [field]: value
      }
    }));
  };

  const handleMaterialChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      materialAndCare: {
        ...(prev.materialAndCare || {}),
        material: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (!id) return;
      if (formData.basePrice !== undefined && formData.basePrice !== '' && Number(formData.basePrice) <= 0) {
        setModal({ isOpen: true, type: 'error', message: 'Base Price must be greater than 0.' });
        return;
      }
      const payload = {
        ...formData,
        basePrice: formData.basePrice === '' || formData.basePrice === undefined ? undefined : Number(formData.basePrice),
      } as UpdateBulkProductRequest;
      await apiService.updateBulkProductAdmin(id, payload);
      setModal({ isOpen: true, type: 'success', message: 'Bulk product updated successfully!' });
    } catch (err: any) {
      setModal({ isOpen: true, type: 'error', message: err.message || 'Failed to update bulk product' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/bulk-product')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {renderIcon(FiArrowLeft, { size: 24 })}
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Bulk Product</h1>
            <p className="text-gray-600 mt-1">Update bulk product information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Custom Adhesive Pack"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., custom-adhesive-pack"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Price *</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice ?? ''}
                    onChange={handleInputChange}
                    placeholder="Enter price like 100, 200, 250"
                    step="1"
                    min="0"
                    onKeyDown={(e) => {
                      if (e.key === '.' || e.key === 'e' || e.key === '+' || e.key === '-') {
                        e.preventDefault();
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  placeholder="Bulk pack for resellers..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status || 'draft'}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Customization Options */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Customization Options</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Your Design</label>
                  <select
                    name="uploadYourDesign"
                    value={formData.uploadYourDesign || 'optional'}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  >
                    <option value="optional">Optional</option>
                    <option value="required">Required</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Any Text</label>
                  <select
                    name="anyText"
                    value={formData.anyText || 'optional'}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  >
                    <option value="optional">Optional</option>
                    <option value="required">Required</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Customization Types */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Customization Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="customization-type" className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  id="customization-type"
                  value={newCustomizationType}
                  onChange={(e) => setNewCustomizationType(e.target.value as 'DTF' | 'Screen' | 'Embroidery' | 'Heat Transfer')}
                  title="Customization type"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                >
                  <option value="DTF">DTF</option>
                  <option value="Screen">Screen</option>
                  <option value="Embroidery">Embroidery</option>
                  <option value="Heat Transfer">Heat Transfer</option>
                </select>
              </div>
              <div>
                <label htmlFor="customization-add-percentage" className="block text-sm font-medium text-gray-700 mb-2">Add Percentage</label>
                <input
                  id="customization-add-percentage"
                  type="number"
                  value={newAddPercentage}
                  onChange={(e) => setNewAddPercentage(e.target.value)}
                  min="0"
                  step="1"
                  title="Add percentage"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={addCustomizationType}
                  className="w-full px-4 py-2 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors"
                >
                  Add Type
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {(formData.customizationTypes || []).map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-start md:items-center gap-3 border border-gray-200 rounded-lg p-3">
                  <div className="flex-1 text-sm text-gray-700">
                    <div><strong>Type:</strong> {item.type}</div>
                    <div><strong>Add %:</strong> {item.addPercentage}%</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomizationType(idx)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Sizes</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  placeholder="Enter size (e.g., S, M, L)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="px-4 py-2 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.sizes || []).map((size, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[#E8E6E3] text-[#B87D4C] rounded-full text-sm flex items-center gap-2"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(idx)}
                      className="hover:text-[#B87D4C]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Colors</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                  placeholder="Enter color (e.g., red, blue)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-4 py-2 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.colors || []).map((color, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => removeColor(idx)}
                      className="hover:text-green-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quantities */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Quantities</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQuantity())}
                  placeholder="Enter quantity (e.g., 10, 50)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
                <button
                  type="button"
                  onClick={addQuantity}
                  className="px-4 py-2 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.quantities || []).map((qty, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[#E8E6E3] text-[#B87D4C] rounded-full text-sm flex items-center gap-2"
                  >
                    {qty}
                    <button
                      type="button"
                      onClick={() => removeQuantity(idx)}
                      className="hover:text-[#B87D4C]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* GSM Quantities */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">GSM Quantities</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newGSMQuantity}
                  onChange={(e) => setNewGSMQuantity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGSMQuantity())}
                  placeholder="Enter GSM quantity (e.g., 100, 200)"
                  min="1"
                  step="1"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
                <button
                  type="button"
                  onClick={addGSMQuantity}
                  className="px-4 py-2 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.gsmQuantity || []).map((gsm, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[#E8E6E3] text-[#B87D4C] rounded-full text-sm flex items-center gap-2"
                  >
                    {gsm}
                    <button
                      type="button"
                      onClick={() => removeGSMQuantity(idx)}
                      className="hover:text-[#B87D4C]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Details</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProductDetail}
                  onChange={(e) => setNewProductDetail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProductDetail())}
                  placeholder="Enter product detail (e.g., High quality, Durable)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
                <button
                  type="button"
                  onClick={addProductDetail}
                  className="px-4 py-2 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {(formData.productDetails || []).map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="flex-1 text-sm text-gray-700">{detail}</span>
                    <button
                      type="button"
                      onClick={() => removeProductDetail(idx)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Material & Care */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Material & Care</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                <input
                  type="text"
                  value={formData.materialAndCare?.material || ''}
                  onChange={handleMaterialChange}
                  placeholder="e.g., 100% Cotton, Polyester Blend"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Care Instructions</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCareInstruction}
                    onChange={(e) => setNewCareInstruction(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCareInstruction())}
                    placeholder="e.g., Wash with cold water"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  />
                  <button
                    type="button"
                    onClick={addCareInstruction}
                    className="px-4 py-2 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {((formData.materialAndCare?.careInstructions) || []).map((instruction, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="flex-1 text-sm text-gray-700">{instruction}</span>
                      <button
                        type="button"
                        onClick={() => removeCareInstruction(idx)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fabric</label>
                <input
                  type="text"
                  value={formData.specifications?.fabric || ''}
                  onChange={(e) => handleSpecificationChange('fabric', e.target.value)}
                  placeholder="e.g., Cotton, Denim"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fashion Type</label>
                <input
                  type="text"
                  value={formData.specifications?.fashionType || ''}
                  onChange={(e) => handleSpecificationChange('fashionType', e.target.value)}
                  placeholder="e.g., Casual, Formal"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fit</label>
                <input
                  type="text"
                  value={formData.specifications?.fit || ''}
                  onChange={(e) => handleSpecificationChange('fit', e.target.value)}
                  placeholder="e.g., Slim Fit, Regular Fit"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <input
                  type="text"
                  value={formData.specifications?.type || ''}
                  onChange={(e) => handleSpecificationChange('type', e.target.value)}
                  placeholder="e.g., T-Shirt, Hoodie"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Neck</label>
                <input
                  type="text"
                  value={formData.specifications?.neck || ''}
                  onChange={(e) => handleSpecificationChange('neck', e.target.value)}
                  placeholder="e.g., Round Neck, V-Neck"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sleeve Length</label>
                <input
                  type="text"
                  value={formData.specifications?.sleeveLength || ''}
                  onChange={(e) => handleSpecificationChange('sleeveLength', e.target.value)}
                  placeholder="e.g., Short Sleeve, Long Sleeve"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pattern</label>
                <input
                  type="text"
                  value={formData.specifications?.pattern || ''}
                  onChange={(e) => handleSpecificationChange('pattern', e.target.value)}
                  placeholder="e.g., Solid, Striped"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
                <input
                  type="text"
                  value={formData.specifications?.occasion || ''}
                  onChange={(e) => handleSpecificationChange('occasion', e.target.value)}
                  placeholder="e.g., Casual, Party Wear"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Closure</label>
                <input
                  type="text"
                  value={formData.specifications?.closure || ''}
                  onChange={(e) => handleSpecificationChange('closure', e.target.value)}
                  placeholder="e.g., Button, Zip"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/bulk-product')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-[#171717] text-white rounded-lg hover:bg-[#B87D4C] transition-colors font-medium disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>

        {/* Modal */}
        <Modal
          isOpen={modal.isOpen}
          type={modal.type}
          title={modal.type === 'success' ? 'Success' : 'Error'}
          message={modal.message}
          onClose={() => {
            setModal({ isOpen: false, type: 'success', message: '' });
            if (modal.type === 'success') navigate('/bulk-product');
          }}
        />
      </div>
    </Layout>
  );
};

export default EditBulkProduct;
