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
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: string;
  totalAmount: number;
  quantity: number;
  size?: string;
  color?: string;
  productType: "ready" | "bulk";
  customDesign?: string;
  designFiles?: string[];
  phoneNumber?: string;
  createdAt?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  userId?: { name?: string; email?: string } | null;
  productId?: { title?: string; name?: string; basePrice?: number } | null;
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
  createdAt?: string;
  address?: { street?: string; city?: string; state?: string; pincode?: string };
};

export type AdminProduct = {
  _id: string;
  title: string;
  slug: string;
  basePrice: number;
  isActive?: boolean;
  status?: string;
  colors?: string[];
  sizes?: string[];
  customizationTypes?: string[];
  specifications?: { fabric?: string };
  variants?: { _id: string; color?: string; media?: { images?: string[] } }[];
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
