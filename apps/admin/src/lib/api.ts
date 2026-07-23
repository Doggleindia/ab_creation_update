// Thin fetch wrapper for the backend admin API.
export const BACKEND = (
  (import.meta.env.VITE_MAIN_BACKEND as string) ?? ""
).replace(/\/$/, "");

const KEY = "ab-admin-auth";

export type AdminUser = { id: string; name: string; email: string };
type Session = { token: string; admin: AdminUser };

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session | null) {
  if (session) localStorage.setItem(KEY, JSON.stringify(session));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("ab-admin-auth"));
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getSession()?.token;
  const res = await fetch(`${BACKEND}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const j = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) setSession(null);
    throw new ApiError(j?.message || `Request failed (${res.status})`, res.status);
  }
  return j as T;
}

// Multipart variant — lets the browser set the boundary header itself.
export async function apiForm<T>(
  path: string,
  form: FormData,
  method = "POST",
): Promise<T> {
  const token = getSession()?.token;
  const res = await fetch(`${BACKEND}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const j = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) setSession(null);
    throw new ApiError(j?.message || `Request failed (${res.status})`, res.status);
  }
  return j as T;
}

export async function adminLogin(email: string, password: string) {
  const j = await api<{
    token: string;
    data: { admin?: AdminUser; user?: AdminUser };
  }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const admin = (j.data.admin ?? j.data.user)!;
  setSession({ token: j.token, admin });
  return admin;
}

export const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export const shortDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
    : "—";

// ---- Shared backend shapes (fields we render) ----
export type AdminOrder = {
  _id: string;
  orderId: string;
  orderStatus: "pending" | "confirmed" | "in_production" | "quality_check" | "ready_to_pack" | "shipped" | "delivered" | "cancelled";
  paymentStatus: string;
  totalAmount: number;
  quantity: number;
  size?: string;
  color?: string;
  productType: "ready" | "bulk";
  shippingMethod?: "standard" | "express" | "rush";
  customDesign?: string;
  designFiles?: string[];
  phoneNumber?: string;
  carrier?: string;
  trackingNumber?: string;
  internalNote?: string;
  assignee?: string;
  productionStartedAt?: string;
  qcFails?: number;
  updatedAt?: string;
  createdAt?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  userId?: { name?: string; email?: string } | null;
  productId?: { _id?: string; title?: string; name?: string; basePrice?: number } | null;
  variantId?: { media?: { images?: string[] }; color?: string } | null;
};

export type Application = {
  _id: string;
  type: "seller" | "bulk";
  status: "pending" | "approved" | "rejected";
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  gstNumber?: string;
  brandName?: string;
  website?: string;
  productsToSell?: string;
  expectedVolume?: string;
  categories?: string[];
  message?: string;
  rejectionReason?: string;
  portfolioFiles?: string[];
  priority?: boolean;
  internalNotes?: string;
  checklist?: string[];
  quote?: {
    amount?: number;
    notes?: string;
    status?: "sent" | "accepted" | "declined" | "in_production" | "completed";
    sentAt?: string;
    respondedAt?: string;
    changeRequest?: { note?: string; at?: string };
  };
  assignee?: string;
  createdAt?: string;
  address?: { street?: string; city?: string; state?: string; pincode?: string };
};

export type AdminProduct = {
  _id: string;
  id?: string; // human code PROD###
  title: string;
  slug: string;
  basePrice: number;
  isActive?: boolean;
  status?: string;
  description?: string;
  discountPercentage?: number;
  colors?: string[];
  sizes?: string[];
  customizationTypes?: string[];
  categoryId?: { _id: string; name?: string } | string | null;
  specifications?: { fabric?: string; gsm?: string; fit?: string; neck?: string };
  printZones?: {
    name: string;
    side?: "front" | "back";
    widthIn?: number;
    heightIn?: number;
    dpi?: number;
  }[];
  measurements?: {
    size: string;
    chest?: number;
    length?: number;
    shoulder?: number;
    sleeve?: number;
  }[];
  variants?: {
    _id: string;
    color?: string;
    sku?: string;
    media?: { images?: string[] };
  }[];
};

export type SellerProductSub = {
  _id: string;
  title: string;
  description?: string;
  method: string;
  color?: string;
  retailPrice: number;
  sizes: string[];
  tags: string[];
  images: string[];
  status: "pending" | "approved" | "rejected" | "changes";
  adminNotes?: string;
  checklist?: string[];
  rejectionReason?: string;
  createdAt?: string;
  baseProductName?: string;
  sellerId?: { name?: string; email?: string } | null;
  baseProductId?: { title?: string; basePrice?: number } | string | null;
  publishedProductId?: { slug?: string } | string | null;
};

export type ContactMsg = {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "new" | "reviewed" | "resolved";
  createdAt?: string;
};

export type WalletTxn = {
  _id: string;
  type: string;
  amount: number;
  status: string;
  createdAt?: string;
  requestId?: string;
  userId?: { name?: string; email?: string } | string | null;
};
