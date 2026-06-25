// Customer types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalPurchase: number;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  orderStatus: 'Active' | 'Completed' | 'Cancelled';
  createdAt: string;
  lastOrderDate: string;
}

// Order types
export type OrderStatus = 'Paid' | 'Processing' | 'Shipping' | 'Delivered' | 'Cancelled';
export type PrintingType = 'DTF' | 'Embroidered' | 'Screen Printing';
export type ProductType = 'Hoodie' | 'T-Shirt' | 'Tops';

export interface OrderItem {
  id: string;
  productType: ProductType;
  printingType: PrintingType;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  createdAt: string;
  estimatedDelivery: string;
  trackingNumber?: string;
}

// Contact types
export interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface ContactsResponse {
  status: string;
  results: number;
  data: {
    contacts: Contact[];
  };
}

export interface ContactResponse {
  status: string;
  message: string;
  data: {
    contact: Contact;
  };
}

export interface DeleteContactResponse {
  status: string;
  message: string;
}

// Wallet types
export type TransactionType = 'Credit' | 'Debit' | 'Refund' | 'Withdrawal';
export type TransactionStatus = 'Completed' | 'Pending' | 'Failed';

export interface WalletTransaction {
  id: string;
  userId: string;
  userName: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  description: string;
  createdAt: string;
  reference?: string;
}

export interface WalletAccount {
  id: string;
  totalCredit: number;
  totalDebit: number;
  currentBalance: number;
  transactions: WalletTransaction[];
  lastUpdated: string;
}

// LookBook types
export type MediaType = 'image' | 'video' | 'none';

export interface LookBookMedia {
  _id: string;
  title: string;
  mediaType: MediaType;
  mediaUrl: string;
  publicId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface LookBook {
  id: string;
  media: LookBookMedia[];
  lastUpdated: string;
}

// Collection types
export interface Collection {
  _id: string;
  id: string;
  name: 'MENS-COLLECTIONS' | 'WOMENS-COLLECTIONS' | 'KIDS-COLLECTIONS';
  slug: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  categoriesCount?: number;
}

export interface CollectionResponse {
  status: string;
  data: {
    collection: Collection;
  };
}

export interface CollectionsResponse {
  status: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: number;
  data: {
    collections: Collection[];
  };
}

export interface CreateCollectionRequest {
  id: string;
  name: 'MENS-COLLECTIONS' | 'WOMENS-COLLECTIONS' | 'KIDS-COLLECTIONS';
  slug: string;
  status?: 'active' | 'inactive';
}

export interface UpdateCollectionRequest {
  name?: 'MENS-COLLECTIONS' | 'WOMENS-COLLECTIONS' | 'KIDS-COLLECTIONS';
  slug?: string;
  status?: 'active' | 'inactive';
}

// Category types
export interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
  images?: string[];
  collectionId?: string | Collection;
  productsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithParent extends Omit<Category, 'collectionId'> {
  collectionId?: {
    _id: string;
    id: string;
    name: string;
    slug: string;
  } | string | Collection;
}

export interface CategoryResponse {
  status: string;
  data: {
    category: Category;
  };
}

export interface CategoriesResponse {
  status: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: number;
  data: {
    categories: CategoryWithParent[];
  };
}

export interface CreateCategoryRequest {
  id: string;
  name: string;
  slug: string;
  images?: string[];
  collectionId?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  images?: string[];
  collectionId?: string;
}

// Product types
export interface Product {
  _id: string;
  id: string;
  title: string;
  slug: string;
  categoryId: Category | string;
  basePrice: number;
  customizationTypes: string[];
  discountPercentage?: number;
  description?: string;
  sizes?: string[];
  colors?: string[];
  productDetails?: string[];
  materialAndCare?: MaterialAndCare;
  specifications?: Specifications;
  status: 'draft' | 'published';
  seo?: {
    metaKeywords?: string[];
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    ogUrl?: string;
    schemaMarkup?: string;
  };
  variantsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  id: string;
  title: string;
  categoryId: string;
  basePrice: number;
  customizationTypes: string[];
  discountPercentage?: number;
  description?: string;
  slug: string;
  sizes?: string[];
  colors?: string[];
  productDetails?: string[];
  materialAndCare?: MaterialAndCare;
  specifications?: Specifications;
  status?: 'draft' | 'published';
  seo?: {
    metaKeywords?: string[];
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    ogUrl?: string;
    schemaMarkup?: string;
  };
}

export interface UpdateProductRequest {
  title?: string;
  categoryId?: string;
  basePrice?: number;
  customizationTypes?: string[];
  discountPercentage?: number;
  description?: string;
  slug?: string;
  sizes?: string[];
  colors?: string[];
  productDetails?: string[];
  materialAndCare?: MaterialAndCare;
  specifications?: Specifications;
  status?: 'draft' | 'published';
  seo?: {
    metaKeywords?: string[];
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    ogUrl?: string;
    schemaMarkup?: string;
  };
}

export interface ProductsResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: number;
  data: Product[];
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  data: Product;
}

// Variant types
export interface VariantMedia {
  images: string[];
  videos: string[];
}

export interface Variant {
  _id: string;
  id: string;
  productId: string | { _id: string; id: string; title: string; basePrice?: number };
  color: string;
  sku: string;
  addPercentageInBasePrice?: number;
  media: VariantMedia;
  inventory?: {
    stock: number;
    reservedStock: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVariantRequest {
  id: string;
  color: string;
  sku: string;
  addPercentageInBasePrice?: number;
}

export interface UpdateVariantRequest {
  color?: string;
  sku?: string;
  addPercentageInBasePrice?: number;
}

export interface VariantsResponse {
  success: boolean;
  results: number;
  data: Variant[];
}

export interface VariantResponse {
  success: boolean;
  data: Variant;
}

export interface CreateVariantResponse {
  status: string;
  data: {
    variant: Variant;
    basePrice: number;
    calculatedPrice: number;
  };
}

export interface UpdateVariantResponse {
  status: string;
  data: {
    variant: Variant;
    finalPrice?: number;
  };
}

// Inventory types
export interface Inventory {
  _id: string;
  variantId: {
    _id: string;
    id: string;
    productId: {
      _id: string;
      id: string;
      title: string;
      audience: string;
    };
    size: string;
    color: string;
    sku: string;
  };
  stock: number;
  reservedStock: number;
  availableStock: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  id?: string;
}

export interface UpdateInventoryRequest {
  stock: number;
  reservedStock: number;
}

export interface BulkUpdateInventoryRequest {
  items: {
    productId: string;
    variantId: string;
    stock: number;
    reservedStock: number;
  }[];
}

export interface InventoryResponse {
  status: string;
  data: {
    inventory: Inventory;
  };
}

export interface BulkInventoryResponse {
  status: string;
  message: string;
}

export interface ProductInventory {
  variantId: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
}

export interface ProductInventoriesResponse {
  status: string;
  results: number;
  data: {
    productId: string;
    inventories: ProductInventory[];
  };
}

// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Wishlist types
export interface WishlistItem {
  _id: string;
  userId: string;
  productId: string;
  addedAt: string;
}

export interface WishlistItemWithProduct {
  _id: string;
  productId: {
    _id: string;
    title: string;
    basePrice: number;
    audience: string;
    categoryId: {
      _id: string;
      name: string;
    };
  };
  addedAt: string;
}

export interface Wishlist {
  wishlist: WishlistItemWithProduct[];
}

export interface WishlistAnalyticsItem {
  productId: string;
  productTitle: string;
  category: string;
  wishlistCount: number;
}

export interface WishlistAnalytics {
  analytics: WishlistAnalyticsItem[];
}

export interface CustomizationTypeItem {
  type: 'DTF' | 'Screen' | 'Embroidery' | 'Heat Transfer';
  addPercentage: number;
}

// Bulk Product types
export interface MaterialAndCare {
  material?: string;
  careInstructions?: string[];
}

export interface Specifications {
  fabric?: string;
  fashionType?: string;
  fit?: string;
  type?: string;
  neck?: string;
  sleeveLength?: string;
  pattern?: string;
  occasion?: string;
  closure?: string;

  [key: string]: string | undefined;
}

export interface BulkProduct {
  _id: string;
  id: string;
  title: string;
  slug: string;
  categoryId: Category | string;
  description?: string;
  uploadYourDesign?: 'optional' | 'required';
  anyText?: 'optional' | 'required';
  sizes?: string[];
  colors?: string[];
  quantities?: number[];
  gsmQuantity: number[];
  customizationTypes?: CustomizationTypeItem[];
  basePrice: number;
  status: 'draft' | 'published';
  productDetails?: string[];
  materialAndCare?: MaterialAndCare;
  specifications?: Specifications;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBulkProductRequest {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  description?: string;
  uploadYourDesign?: 'optional' | 'required';
  anyText?: 'optional' | 'required';
  sizes: string[];
  colors: string[];
  quantities: number[];
  gsmQuantity: number[];
  customizationTypes: CustomizationTypeItem[];
  basePrice: number;
  status?: 'draft' | 'published';
  productDetails?: string[];
  materialAndCare?: MaterialAndCare;
  specifications?: Specifications;
}

export interface UpdateBulkProductRequest {
  title?: string;
  slug?: string;
  categoryId?: string;
  description?: string;
  uploadYourDesign?: 'optional' | 'required';
  anyText?: 'optional' | 'required';
  sizes?: string[];
  colors?: string[];
  quantities?: number[];
  gsmQuantity?: number[];
  customizationTypes?: CustomizationTypeItem[];
  basePrice?: number;
  status?: 'draft' | 'published';
  productDetails?: string[];
  materialAndCare?: MaterialAndCare;
  specifications?: Specifications;
}

export interface BulkProductResponse {
  success: boolean;
  message?: string;
  data: BulkProduct;
}

export interface BulkProductsResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: number;
  data: BulkProduct[];
}

export interface GSMPricingTier {
  gsmQuantity: number;
  addPercentage?: number;
  finalPrice?: number;
}

export interface BulkProductVariant {
  _id: string;
  id: string;
  bulkProductId: string | BulkProduct;
  color: string;
  gsmPricingTiers: GSMPricingTier[];
  sku?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBulkProductVariantRequest {
  id: string;
  bulkProductId: string;
  color: string;
  gsmPricingTiers: GSMPricingTier[];
  sku?: string;
  images?: string[];
}

export interface UpdateBulkProductVariantRequest {
  color?: string;
  gsmPricingTiers?: GSMPricingTier[];
  sku?: string;
  images?: string[];
}

export interface BulkProductVariantResponse {
  success: boolean;
  message?: string;
  data: BulkProductVariant;
}

export interface BulkProductVariantsResponse {
  success: boolean;
  count?: number;
  results?: number;
  data: BulkProductVariant[];
}

// Pagination
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}
