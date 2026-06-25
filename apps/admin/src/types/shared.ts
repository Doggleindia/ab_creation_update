/**
 * Canonical domain types shared across the KT Adhesives apps.
 *
 * Re-exported from the @kt/types workspace package so the admin panel can adopt
 * the shared vocabulary incrementally. Prefer importing entity/enum types from
 * here (e.g. `import type { Order, OrderStatus } from "../types/shared"`) over
 * redefining them locally.
 */
export type {
  Product,
  Variant,
  Category,
  Collection,
  BulkProduct,
  BulkProductVariant,
  GsmPricingTier,
  Order,
  WalletTransaction,
  Address,
  ProductType,
  ProductStatus,
  EntityStatus,
  OrderStatus,
  PaymentStatus,
  WalletTransactionType,
  WalletTransactionStatus,
} from "@kt/types";
