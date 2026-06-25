import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { renderIcon } from '../utils/iconRenderer';
import { FiArrowLeft, FiLoader } from 'react-icons/fi';
import { UpdateProductRequest, CategoryWithParent, Product } from '../types/models';
import { apiService } from '../utils/api';

const EditProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<CategoryWithParent[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<UpdateProductRequest>({
    title: '',
    categoryId: '',
    slug: '',
    basePrice: 0,
    customizationTypes: [],
    colors: [],
    sizes: [],
    productDetails: [],
    materialAndCare: {
      material: '',
      careInstructions: [],
    },
    specifications: {
      fabric: '',
      fashionType: '',
      fit: '',
      type: '',
      neck: '',
      sleeveLength: '',
      pattern: '',
      occasion: '',
      closure: '',
    },
    discountPercentage: 0,
    description: '',
    seo: {
      metaKeywords: [],
      metaTitle: '',
      metaDescription: '',
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogType: '',
      ogUrl: '',
      schemaMarkup: ''
    },
    status: 'draft'
  } as UpdateProductRequest);

  const [newCustomizationType, setNewCustomizationType] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newProductDetail, setNewProductDetail] = useState('');
  const [newCareInstruction, setNewCareInstruction] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({ isOpen: false, type: 'success', message: '' });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.getAllCategoriesAdmin();
        setCategories(response.data.categories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    const fetchProduct = async () => {
      if (!id) return;
      try {
        const response = await apiService.getSingleProductAdmin(id);
        const productData = response.data;
        setProduct(productData);
        setFormData({
          title: productData.title,
          categoryId: typeof productData.categoryId === 'string' ? productData.categoryId : productData.categoryId?._id || '',
          slug: productData.slug || '',
          basePrice: productData.basePrice,
          customizationTypes: productData.customizationTypes || [],
          colors: productData.colors || [],
          sizes: productData.sizes || [],
          productDetails: productData.productDetails || [],
          materialAndCare: productData.materialAndCare || {
            material: '',
            careInstructions: [],
          },
          specifications: productData.specifications || {
            fabric: '',
            fashionType: '',
            fit: '',
            type: '',
            neck: '',
            sleeveLength: '',
            pattern: '',
            occasion: '',
            closure: '',
          },
          discountPercentage: productData.discountPercentage || 0,
          description: productData.description || '',
          seo: productData.seo || {
            metaKeywords: [],
            metaTitle: '',
            metaDescription: '',
            canonicalUrl: '',
            ogTitle: '',
            ogDescription: '',
            ogImage: '',
            ogType: '',
            ogUrl: '',
            schemaMarkup: ''
          },
          status: productData.status
        });
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setModal({ isOpen: true, type: 'error', message: 'Failed to load product data.' });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchCategories();
    fetchProduct();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: value
        }
      }));
    } else if (name.startsWith('materialAndCare.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        materialAndCare: {
          ...prev.materialAndCare,
          [field]: value
        }
      }));
    } else if (name.startsWith('specifications.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'discountPercentage' || name === 'basePrice' ? Number(value) : value
      }));
    }
  };

  const addCustomizationType = () => {
    if (newCustomizationType.trim()) {
      setFormData(prev => ({
        ...prev,
        customizationTypes: [...(prev.customizationTypes || []), newCustomizationType.trim()]
      }));
      setNewCustomizationType('');
    }
  };

  const removeCustomizationType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customizationTypes: (prev.customizationTypes || []).filter((_, i) => i !== index)
    }));
  };

  const addSize = () => {
    if (newSize.trim()) {
      setFormData(prev => ({
        ...prev,
        sizes: [...(prev.sizes || []), newSize.trim().toUpperCase()]
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
          ...prev.materialAndCare,
          careInstructions: [...(prev.materialAndCare?.careInstructions || []), newCareInstruction.trim()]
        }
      }));
      setNewCareInstruction('');
    }
  };

  const removeCareInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materialAndCare: {
        ...prev.materialAndCare,
        careInstructions: (prev.materialAndCare?.careInstructions || []).filter((_, i) => i !== index)
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim() || !formData.categoryId) {
      setModal({ isOpen: true, type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    try {
      setLoading(true);
      await apiService.updateProductAdmin(id!, formData);
      setModal({ isOpen: true, type: 'success', message: 'Product updated successfully!' });
    } catch (err) {
      console.error('Failed to update product:', err);
      setModal({ isOpen: true, type: 'error', message: 'Failed to update product. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            {renderIcon(FiLoader, { size: 32, className: 'animate-spin text-[#B87D4C] mx-auto mb-4' })}
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/product')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {renderIcon(FiArrowLeft, { size: 20 })}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600">Update product information</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Product ID
                  </label>
                  <input
                    type="text"
                    value={product?.id || ''}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-gray-50"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                    placeholder="Premium Cotton T-Shirt"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                    placeholder="premium-cotton-tshirt"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Base Price
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                    placeholder="499"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              {/* Customization Types */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Customization Types
                </label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCustomizationType}
                      onChange={(e) => setNewCustomizationType(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomizationType())}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                      placeholder="Add customization type"
                    />
                    <button
                      type="button"
                      onClick={addCustomizationType}
                      className="px-4 py-2 bg-[#171717] text-white hover:bg-[#B87D4C] rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.customizationTypes?.map((type, index) => (
                      <span key={index} className="px-3 py-1 bg-[#E8E6E3] text-[#B87D4C] rounded-full text-sm flex items-center gap-2">
                        {type}
                        <button
                          type="button"
                          onClick={() => removeCustomizationType(index)}
                          className="text-[#B87D4C] hover:text-[#B87D4C]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Available Colors (Optional)
                </label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                      placeholder="Red, Black, Blue"
                    />
                    <button
                      type="button"
                      onClick={addColor}
                      className="px-4 py-2 bg-[#171717] text-white hover:bg-[#B87D4C] rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.colors || []).map((color: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                        {color}
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="text-green-900 hover:text-green-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Available Sizes (Optional)
                </label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                      placeholder="XS, S, M, L, XL, XXL"
                    />
                    <button
                      type="button"
                      onClick={addSize}
                      className="px-4 py-2 bg-[#171717] text-white hover:bg-[#B87D4C] rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.sizes || []).map((size: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm flex items-center gap-2">
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(index)}
                          className="text-slate-900 hover:text-slate-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Product Details (Optional)
                </label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newProductDetail}
                      onChange={(e) => setNewProductDetail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProductDetail())}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                      placeholder="Add product detail"
                    />
                    <button
                      type="button"
                      onClick={addProductDetail}
                      className="px-4 py-2 bg-[#171717] text-white hover:bg-[#B87D4C] rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.productDetails || []).map((detail: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm flex items-center gap-2">
                        {detail}
                        <button
                          type="button"
                          onClick={() => removeProductDetail(index)}
                          className="text-slate-900 hover:text-slate-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Material & Care */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Material & Care</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Material
                    </label>
                    <input
                      type="text"
                      name="materialAndCare.material"
                      value={formData.materialAndCare?.material || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                      placeholder="Cotton, Polyester, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Care Instructions
                    </label>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCareInstruction}
                          onChange={(e) => setNewCareInstruction(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCareInstruction())}
                          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                          placeholder="Add care instruction"
                        />
                        <button
                          type="button"
                          onClick={addCareInstruction}
                          className="px-4 py-2 bg-[#171717] text-white hover:bg-[#B87D4C] rounded-lg"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(formData.materialAndCare?.careInstructions || []).map((instruction: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm flex items-center gap-2">
                            {instruction}
                            <button
                              type="button"
                              onClick={() => removeCareInstruction(index)}
                              className="text-slate-900 hover:text-slate-700"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Fabric', name: 'fabric' },
                    { label: 'Fashion Type', name: 'fashionType' },
                    { label: 'Fit', name: 'fit' },
                    { label: 'Type', name: 'type' },
                    { label: 'Neck', name: 'neck' },
                    { label: 'Sleeve Length', name: 'sleeveLength' },
                    { label: 'Pattern', name: 'pattern' },
                    { label: 'Occasion', name: 'occasion' },
                    { label: 'Closure', name: 'closure' },
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        name={`specifications.${field.name}`}
                        value={formData.specifications?.[field.name] || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                        placeholder={field.label}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage || 0}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  placeholder="10"
                  min="0"
                  max="100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                  placeholder="Product description..."
                />
              </div>

              {/* SEO Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">SEO Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="seo.metaTitle"
                      value={formData.seo?.metaTitle || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                      placeholder="SEO Meta Title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Meta Description
                    </label>
                    <input
                      type="text"
                      name="seo.metaDescription"
                      value={formData.seo?.metaDescription || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                      placeholder="SEO Meta Description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      name="seo.canonicalUrl"
                      value={formData.seo?.canonicalUrl || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                      placeholder="https://example.com/product"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      OG Title
                    </label>
                    <input
                      type="text"
                      name="seo.ogTitle"
                      value={formData.seo?.ogTitle || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                      placeholder="Open Graph Title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      OG Description
                    </label>
                    <input
                      type="text"
                      name="seo.ogDescription"
                      value={formData.seo?.ogDescription || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                      placeholder="Open Graph Description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      OG Image URL
                    </label>
                    <input
                      type="url"
                      name="seo.ogImage"
                      value={formData.seo?.ogImage || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87D4C]"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/product')}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#171717] text-white hover:bg-[#B87D4C] rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Product'}
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
            if (modal.type === 'success') {
              navigate('/product');
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

export default EditProduct;
