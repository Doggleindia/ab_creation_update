import { LookBookMedia, CategoryResponse, CategoriesResponse, CreateCategoryRequest, UpdateCategoryRequest, CreateProductRequest, UpdateProductRequest, ProductsResponse, ProductResponse, CreateVariantRequest, VariantsResponse, VariantResponse, CreateVariantResponse, UpdateVariantRequest, UpdateVariantResponse, UpdateInventoryRequest, InventoryResponse, BulkUpdateInventoryRequest, BulkInventoryResponse, ProductInventoriesResponse, BulkProduct, CreateBulkProductRequest, UpdateBulkProductRequest, BulkProductResponse, BulkProductsResponse, BulkProductVariant, CreateBulkProductVariantRequest, UpdateBulkProductVariantRequest, BulkProductVariantResponse, BulkProductVariantsResponse, ContactsResponse, ContactResponse, DeleteContactResponse, User, WishlistItem, Wishlist, WishlistAnalytics, CollectionResponse, CollectionsResponse, CreateCollectionRequest, UpdateCollectionRequest } from '../types/models';
import { useAuthStore } from '../store/authStore';

const BASE_URL = process.env.REACT_APP_MAIN_BACKEND;
const API_BASE = `${BASE_URL}/api`;
const CATEGORIES_API_BASE = `${BASE_URL}/api/categories/admin`;
const COLLECTIONS_API_BASE = `${BASE_URL}/api/collections/admin`;
const BULK_PRODUCTS_API_BASE = `${BASE_URL}/api/bulk-products`;
const BULK_PRODUCT_VARIANTS_API_BASE = `${BASE_URL}/api/bulk-product-variants`;

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Auth header without Content-Type — for multipart/FormData requests, where
  // the browser must set its own boundary.
  private getAuthHeaderOnly(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // LookBook API methods
  async getAllLookBookMedia(): Promise<{ data: { lookbookItems: LookBookMedia[] } }> {
    const response = await fetch(`${API_BASE}/lookbook/all`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async uploadLookBookMedia(formData: FormData): Promise<{ status: string; data: { lookbookItem: LookBookMedia } }> {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_BASE}/lookbook/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async updateLookBookPosition(id: string, newPosition: number): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE}/lookbook/${id}/position`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ newPosition }),
    });
    return this.handleResponse(response);
  }

  async updateLookBookPositions(updates: { _id: string; position: number }[]): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE}/lookbook/position`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return this.handleResponse(response);
  }

  async updateLookBookDetails(id: string, data: { title: string; description?: string }): Promise<{ status: string; data: { lookbookItem: LookBookMedia } }> {
    const response = await fetch(`${API_BASE}/lookbook/${id}/details`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteLookBookMedia(id: string): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE}/lookbook/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Category API methods
  async createCategoryAdmin(data: CreateCategoryRequest | FormData): Promise<CategoryResponse> {
    const token = useAuthStore.getState().token;
    const isFormData = data instanceof FormData;
    
    const response = await fetch(CATEGORIES_API_BASE, {
      method: 'POST',
      headers: isFormData ? { 'Authorization': `Bearer ${token}` } : this.getAuthHeaders(),
      body: isFormData ? data : JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updateCategoryAdmin(id: string, data: UpdateCategoryRequest | FormData): Promise<CategoryResponse> {
    const token = useAuthStore.getState().token;
    const isFormData = data instanceof FormData;
    
    const response = await fetch(`${CATEGORIES_API_BASE}/${id}`, {
      method: 'PUT',
      headers: isFormData ? { 'Authorization': `Bearer ${token}` } : this.getAuthHeaders(),
      body: isFormData ? data : JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async toggleCategoryStatusAdmin(id: string): Promise<{ status: string; message: string; data: { category: { id: string; status: string } } }> {
    const response = await fetch(`${CATEGORIES_API_BASE}/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAllCategoriesAdmin(params?: string): Promise<CategoriesResponse> {
    const url = params ? `${CATEGORIES_API_BASE}?${params}` : CATEGORIES_API_BASE;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getSingleCategoryAdmin(id: string): Promise<CategoryResponse> {
    const response = await fetch(`${CATEGORIES_API_BASE}/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async deleteCategoryAdmin(id: string): Promise<{ status: string; message: string }> {
    const response = await fetch(`${CATEGORIES_API_BASE}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Collection API methods
  async createCollectionAdmin(data: CreateCollectionRequest): Promise<CollectionResponse> {
    const response = await fetch(COLLECTIONS_API_BASE, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getAllCollectionsAdmin(params?: string): Promise<CollectionsResponse> {
    const url = params ? `${COLLECTIONS_API_BASE}?${params}` : COLLECTIONS_API_BASE;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getSingleCollectionAdmin(id: string): Promise<CollectionResponse> {
    const response = await fetch(`${COLLECTIONS_API_BASE}/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateCollectionAdmin(id: string, data: UpdateCollectionRequest): Promise<CollectionResponse> {
    const response = await fetch(`${COLLECTIONS_API_BASE}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async toggleCollectionStatusAdmin(id: string): Promise<{ status: string; message: string; data: { collection: { id: string; status: string } } }> {
    const response = await fetch(`${COLLECTIONS_API_BASE}/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async deleteCollectionAdmin(id: string): Promise<{ status: string; message: string }> {
    const response = await fetch(`${COLLECTIONS_API_BASE}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Product API methods
  async createProductAdmin(data: CreateProductRequest): Promise<ProductResponse> {
    const response = await fetch(`${API_BASE}/products/admin`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getProductsAdmin(params?: string): Promise<ProductsResponse> {
    const url = params ? `${API_BASE}/products/admin?${params}` : `${API_BASE}/products/admin`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getSingleProductAdmin(id: string): Promise<ProductResponse> {
    const response = await fetch(`${API_BASE}/products/admin/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateProductAdmin(id: string, data: UpdateProductRequest): Promise<ProductResponse> {
    const response = await fetch(`${API_BASE}/products/admin/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteProductAdmin(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/products/admin/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Variant API methods
  async createVariantAdmin(productId: string, data: CreateVariantRequest, images?: File[], videos?: File[]): Promise<CreateVariantResponse> {
    const formData = new FormData();

    // Add basic data
    formData.append('id', data.id);
    formData.append('color', data.color);
    formData.append('sku', data.sku);
    if (data.addPercentageInBasePrice !== undefined) {
      formData.append('addPercentageInBasePrice', data.addPercentageInBasePrice.toString());
    }

    // Add files if provided
    if (images?.length) {
      images.forEach((file) => {
        formData.append('images', file);
      });
    }
    if (videos?.length) {
      videos.forEach((file) => {
        formData.append('videos', file);
      });
    }

    const response = await fetch(`${API_BASE}/variants/products/${productId}/variants`, {
      method: 'POST',
      headers: this.getAuthHeaderOnly(),
      body: formData,
    });
    return this.handleResponse(response);
  }

  async getProductVariantsAdmin(productId: string): Promise<VariantsResponse> {
    const response = await fetch(`${API_BASE}/variants/products/${productId}/variants`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getSingleVariantAdmin(productId: string, variantId: string): Promise<VariantResponse> {
    const response = await fetch(`${API_BASE}/variants/products/${productId}/variants/${variantId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateVariantAdmin(productId: string, variantId: string, data: UpdateVariantRequest, images?: File[], videos?: File[]): Promise<UpdateVariantResponse> {
    const formData = new FormData();

    if (data.color !== undefined) formData.append('color', data.color);
    if (data.sku !== undefined) formData.append('sku', data.sku);
    if (data.addPercentageInBasePrice !== undefined) {
      formData.append('addPercentageInBasePrice', data.addPercentageInBasePrice.toString());
    }

    if (images?.length) {
      images.forEach((file) => {
        formData.append('images', file);
      });
    }
    if (videos?.length) {
      videos.forEach((file) => {
        formData.append('videos', file);
      });
    }

    const response = await fetch(`${API_BASE}/variants/products/${productId}/variants/${variantId}`, {
      method: 'PUT',
      headers: this.getAuthHeaderOnly(),
      body: formData,
    });
    return this.handleResponse(response);
  }

  async deleteVariantAdmin(productId: string, variantId: string): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE}/variants/products/${productId}/variants/${variantId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Inventory API methods
  async getProductInventoriesAdmin(productId: string): Promise<ProductInventoriesResponse> {
    const response = await fetch(`${API_BASE}/inventory/products/${productId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateInventoryAdmin(productId: string, variantId: string, data: UpdateInventoryRequest): Promise<InventoryResponse> {
    const response = await fetch(`${API_BASE}/inventory/products/${productId}/variants/${variantId}/inventory`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getVariantInventoryAdmin(productId: string, variantId: string): Promise<InventoryResponse> {
    const response = await fetch(`${API_BASE}/inventory/products/${productId}/variants/${variantId}/inventory`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async bulkUpdateInventoryAdmin(data: { updates: Array<{ variantId: string; stock: number; reservedStock?: number }> }): Promise<BulkInventoryResponse> {
    const response = await fetch(`${API_BASE}/inventory/bulk`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Bulk Product API methods
  async createBulkProductAdmin(data: CreateBulkProductRequest): Promise<BulkProductResponse> {
    const response = await fetch(BULK_PRODUCTS_API_BASE, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getBulkProductsAdmin(params?: string): Promise<BulkProductsResponse> {
    const url = params ? `${BULK_PRODUCTS_API_BASE}?${params}` : BULK_PRODUCTS_API_BASE;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getSingleBulkProductAdmin(id: string): Promise<BulkProductResponse> {
    const response = await fetch(`${BULK_PRODUCTS_API_BASE}/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateBulkProductAdmin(id: string, data: UpdateBulkProductRequest): Promise<BulkProductResponse> {
    const response = await fetch(`${BULK_PRODUCTS_API_BASE}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteBulkProductAdmin(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BULK_PRODUCTS_API_BASE}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Bulk Product Variant API methods
async createBulkProductVariantAdmin(
  data: CreateBulkProductVariantRequest,
  images?: File[]
): Promise<BulkProductVariantResponse> {

  const formData = new FormData();

  formData.append('id', String(data.id || ''));
  formData.append('bulkProductId', String(data.bulkProductId || ''));

  if ((data as any).sku !== undefined) {
    formData.append('sku', String((data as any).sku));
  }

  formData.append('color', String(data.color || ''));

  // ✅ IMPORTANT FIX
  data.gsmPricingTiers.forEach((tier, index) => {
    formData.append(
      `gsmPricingTiers[${index}][gsmQuantity]`,
      String(tier.gsmQuantity)
    );

    formData.append(
      `gsmPricingTiers[${index}][addPercentage]`,
      String(tier.addPercentage || 0)
    );
  });

  if (images?.length) {
    images.forEach((file) => {
      formData.append('images', file);
    });
  }

  const token = useAuthStore.getState().token;

  const response = await fetch(BULK_PRODUCT_VARIANTS_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return this.handleResponse(response);
}

  async getBulkProductVariantsByProductAdmin(productId: string): Promise<BulkProductVariantsResponse> {
    const response = await fetch(`${BULK_PRODUCT_VARIANTS_API_BASE}/product/${productId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getSingleBulkProductVariantAdmin(variantId: string, productId?: string): Promise<BulkProductVariantResponse> {
    // If productId is provided, use the safer endpoint that validates the variant belongs to the product
    if (productId) {
      const response = await fetch(`${BULK_PRODUCT_VARIANTS_API_BASE}/product/${productId}/variant/${variantId}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    }
    
    // Fallback to the simpler endpoint if productId is not provided
    const response = await fetch(`${BULK_PRODUCT_VARIANTS_API_BASE}/${variantId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

async updateBulkProductVariantAdmin(
  id: string,
  data: UpdateBulkProductVariantRequest,
  images?: File[]
): Promise<BulkProductVariantResponse> {

  const formData = new FormData();

  if ((data as any).sku !== undefined) {
    formData.append('sku', String((data as any).sku));
  }

  if (data.color !== undefined) {
    formData.append('color', data.color);
  }

  // ✅ IMPORTANT FIX
  if (data.gsmPricingTiers !== undefined) {
    data.gsmPricingTiers.forEach((tier, index) => {
      formData.append(
        `gsmPricingTiers[${index}][gsmQuantity]`,
        String(tier.gsmQuantity)
      );
      formData.append(
        `gsmPricingTiers[${index}][addPercentage]`,
        String(tier.addPercentage || 0)
      );
    });
  }

  if (images?.length) {
    images.forEach((file) => {
      formData.append('images', file);
    });
  }

  const token = useAuthStore.getState().token;

  const response = await fetch(`${BULK_PRODUCT_VARIANTS_API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return this.handleResponse(response);
}

  async deleteBulkProductVariantAdmin(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BULK_PRODUCT_VARIANTS_API_BASE}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Contact API methods
  async getAllContactsAdmin(): Promise<ContactsResponse> {
    const response = await fetch(`${API_BASE}/contacts`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateContactStatusAdmin(id: string, status: 'new' | 'reviewed' | 'resolved'): Promise<ContactResponse> {
    const response = await fetch(`${API_BASE}/contacts/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return this.handleResponse(response);
  }

  async deleteContactAdmin(id: string): Promise<DeleteContactResponse> {
    const response = await fetch(`${API_BASE}/contacts/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // User API methods (Admin)
  async getAllUsersAdmin(): Promise<{ status: string; results: number; data: { users: User[] } }> {
    const response = await fetch(`${API_BASE}/admin/users/all`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Wishlist API methods (User)
  async addToWishlist(productId: string): Promise<{ message: string; wishlistItem: WishlistItem }> {
    const response = await fetch(`${API_BASE}/wishlist`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ productId }),
    });
    return this.handleResponse(response);
  }

  async getWishlist(): Promise<Wishlist> {
    const response = await fetch(`${API_BASE}/wishlist`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async removeFromWishlist(productId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Wishlist Analytics API methods (Admin)
  async getWishlistAnalytics(): Promise<WishlistAnalytics> {
    const response = await fetch(`${API_BASE}/wishlist/analytics`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
