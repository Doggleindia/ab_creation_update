"use client";

import { apiFetch } from "@/lib/auth";

export type SellerSubmission = {
  _id: string;
  title: string;
  description?: string;
  status: "pending" | "approved" | "rejected" | "changes";
  method: string;
  color?: string;
  retailPrice: number;
  sizes: string[];
  tags: string[];
  images: string[];
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  baseProductId?: { _id: string; title?: string; basePrice?: number } | string | null;
  baseProductName?: string;
  publishedProductId?:
    | { _id: string; slug?: string; views?: number; status?: string }
    | string
    | null;
};

export type SellerOrder = {
  _id: string;
  orderId: string;
  quantity: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt?: string;
  size?: string;
  color?: string;
  productId?: { _id?: string; title?: string; slug?: string } | null;
};

export const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  approved: { label: "Live", cls: "bg-[#dcfce7] text-[#16a34a]" },
  pending: { label: "Under Review", cls: "bg-[#fef3c7] text-[#b45309]" },
  changes: { label: "Changes Requested", cls: "bg-[#fdf3dd] text-[#b07d1a]" },
  rejected: { label: "Rejected", cls: "bg-[#fee2e2] text-[#ba1a1a]" },
};

export const ORDER_CHIP: Record<string, { label: string; cls: string }> = {
  pending: { label: "New", cls: "bg-[#dbeafe] text-[#2563eb]" },
  confirmed: { label: "Confirmed", cls: "bg-[#cffafe] text-[#0e7490]" },
  in_production: { label: "In Production", cls: "bg-[#fdecc8] text-[#b45309]" },
  quality_check: { label: "Quality Check", cls: "bg-[#fef3c7] text-[#b45309]" },
  ready_to_pack: { label: "Packing", cls: "bg-[#dcfce7] text-[#16a34a]" },
  shipped: { label: "Shipped", cls: "bg-[#dbeafe] text-[#2563eb]" },
  delivered: { label: "Delivered", cls: "bg-[#dcfce7] text-[#16a34a]" },
  cancelled: { label: "Cancelled", cls: "bg-[#fee2e2] text-[#ba1a1a]" },
};

export const getSubmissions = () =>
  apiFetch<{ data: { sellerProducts: SellerSubmission[] } }>(
    "/api/seller-products/mine",
  ).then((j) => j.data?.sellerProducts ?? []);

export const getSellerOrders = () =>
  apiFetch<{ data: { orders: SellerOrder[] } }>("/api/orders/seller/mine").then(
    (j) => j.data?.orders ?? [],
  );

export const publishedId = (s: SellerSubmission): string | null => {
  const p = s.publishedProductId;
  if (!p) return null;
  return typeof p === "object" ? (p._id ?? null) : String(p);
};

export const marginOf = (s: SellerSubmission): number => {
  const base =
    typeof s.baseProductId === "object" ? (s.baseProductId?.basePrice ?? 0) : 0;
  return Math.max(0, (s.retailPrice ?? 0) - base);
};

/** Units sold per published product id, from the seller's orders. */
export const soldByProduct = (orders: SellerOrder[]): Map<string, number> => {
  const m = new Map<string, number>();
  for (const o of orders) {
    if (o.orderStatus === "cancelled") continue;
    const id = o.productId?._id ? String(o.productId._id) : null;
    if (!id) continue;
    m.set(id, (m.get(id) ?? 0) + (o.quantity || 0));
  }
  return m;
};
