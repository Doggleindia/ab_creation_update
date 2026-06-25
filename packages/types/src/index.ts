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

export interface MediaSet {
  images?: string[];
  videos?: string[];
}

// ---- Catalog ----

export interface Collection {
  _id: string;
  id: string;
  name: string;
  slug: string;
  status?: EntityStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
  collectionId?: string | Collection | null;
  images?: string[];
  status?: EntityStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Variant {
  _id: string;
  id?: string;
  productId: string;
  color: string;
  sku: string;
  addPercentageInBasePrice?: number;
  media?: MediaSet;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  id: string;
  title: string;
  categoryId: string | Category;
  basePrice: number;
  discountPercentage?: number;
  description?: string;
  slug: string;
  sizes?: string[];
  colors?: string[];
  customizationTypes?: string[];
  status: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface GsmPricingTier {
  gsmQuantity: number;
  addPercentage: number;
  finalPrice?: number;
}

export interface BulkProduct {
  _id: string;
  id: string;
  title: string;
  slug: string;
  categoryId: string | Category;
  basePrice: number;
  sizes?: string[];
  colors?: string[];
  status?: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface BulkProductVariant {
  _id: string;
  id?: string;
  bulkProductId: string;
  color: string;
  sku?: string;
  gsmPricingTiers: GsmPricingTier[];
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
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
