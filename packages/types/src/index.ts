/**
 * Shared domain types for the KT Adhesives platform.
 *
 * These describe the core entities exchanged between the backend API, the
 * storefront (web), and the admin panel. Import them as TYPES only, e.g.:
 *
 *   import type { Order, Product } from "@kt/types";
 */

// ---- Enums / unions ----

export type ProductType = "ready" | "bulk";

export type ProductStatus = "draft" | "published";

export type EntityStatus = "active" | "inactive";

export type CollectionName =
  | "MENS-COLLECTIONS"
  | "WOMENS-COLLECTIONS"
  | "KIDS-COLLECTIONS";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type WalletTransactionType = "recharge" | "payment" | "refund";

export type WalletTransactionStatus = "pending" | "completed" | "failed";

// ---- Common ----

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface VariantMedia {
  images: string[];
  videos: string[];
}

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

export interface ProductSeo {
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
}

export interface CustomizationTypeItem {
  type: "DTF" | "Screen" | "Embroidery" | "Heat Transfer";
  addPercentage: number;
}

export interface GsmPricingTier {
  gsmQuantity: number;
  addPercentage?: number;
  finalPrice?: number;
}

// ---- Catalog ----

export interface Collection {
  _id: string;
  id: string;
  name: CollectionName;
  slug: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  categoriesCount?: number;
}

export interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
  images?: string[];
  collectionId?: string | Collection;
  productsCount?: number;
  status?: EntityStatus;
  createdAt: string;
  updatedAt: string;
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
  status: ProductStatus;
  seo?: ProductSeo;
  variantsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BulkProduct {
  _id: string;
  id: string;
  title: string;
  slug: string;
  categoryId: Category | string;
  description?: string;
  uploadYourDesign?: "optional" | "required";
  anyText?: "optional" | "required";
  sizes?: string[];
  colors?: string[];
  quantities?: number[];
  gsmQuantity: number[];
  customizationTypes?: CustomizationTypeItem[];
  basePrice: number;
  status: ProductStatus;
  productDetails?: string[];
  materialAndCare?: MaterialAndCare;
  specifications?: Specifications;
  createdAt: string;
  updatedAt: string;
}

export interface BulkProductVariant {
  _id: string;
  id: string;
  bulkProductId: string | BulkProduct;
  color: string;
  gsmPricingTiers: GsmPricingTier[];
  sku?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// ---- Commerce ----

export interface Order {
  _id: string;
  orderId: string;
  userId?: string;
  productType: ProductType;
  productId: string | Product | BulkProduct;
  variantId: string | Variant | BulkProductVariant;
  color?: string;
  size?: string;
  quantity: number;
  totalAmount: number;
  shippingAddress: Address;
  phoneNumber: string;
  customDesign?: string;
  anyText?: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface WalletTransaction {
  _id: string;
  type: WalletTransactionType;
  amount: number;
  userId?: string;
  status: WalletTransactionStatus;
  requestId: string;
  createdAt?: string;
}

// ---- Auth ----

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: Partial<Address>;
  createdAt?: string;
  updatedAt?: string;
}
