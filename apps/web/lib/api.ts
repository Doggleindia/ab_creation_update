import axios from "axios";

const backendURL = process.env.NEXT_PUBLIC_MAIN_BACKEND || "";

// For backend API calls (from Node.js)
const api = axios.create({
  baseURL: backendURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// For client-side API calls to Next.js routes
const clientApi = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach the auth token from localStorage when a caller hasn't
// already set an Authorization header. This keeps existing explicit-token calls
// working while removing the need to thread the token through every request.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && !config.headers?.Authorization) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const loginUser = async (email: string, password: string) => {
  const res = await api.post("/api/users/login", { email, password });
  return res.data;
};

export const signupUser = async (name: string, email: string, password: string) => {
  const res = await api.post("/api/users/signup", { name, email, password });
  return res.data;
};

export const forgotPassword = async (email: string) => {
  const res = await api.post("/api/users/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const res = await api.post("/api/users/reset-password", { email, otp, newPassword });
  return res.data;
};

export const logoutUser = async (token?: string) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.post("/api/users/logout", {}, { headers });
  return res.data;
};

export const contactUs = async (name: string, email: string, message: string, subject: string) => {
    const res = await api.post("/api/contacts", { name, email, message, subject });
    return res.data;
}

export const getLookbookAll = async () => {
  const res = await api.get("/api/lookbook");
  return res.data;
};

export const getCategories = async () => {
  const res = await api.get("/api/categories");
  return res.data;
};

export const getCollections = async () => {
  const res = await clientApi.get("/api/collections");
  return res.data;
};

export const getProducts = async (params?: Record<string, unknown>) => {
  const res = await clientApi.get("/api/products", { params });
  return res.data;
};

export const getProductBySlug = async (slug: string) => {
  const res = await api.get(`/api/products/slug/${slug}`);
  return res.data;
};

// ========== BULK PRODUCTS API ==========
export const getBulkProductsPublic = async (params?: Record<string, any>) => {
  // Backend endpoint as requested: /bulk-products/public
  const res = await api.get("/api/bulk-products/public", { params });
  return res.data;
};

export const getBulkProductBySlug = async (slug: string) => {
  const res = await api.get(`/api/bulk-products/slug/${slug}`);
  return res.data;
};

// ========== APPAREL API ==========
export const getAllApparel = async (token?: string) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.get("/api/apparel", { headers });
  return res.data;
};

export const getApparelById = async (id: string, token?: string) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.get(`/api/apparel/${id}`, { headers });
  return res.data;
};

export const createCustomOrder = async (
  productId: string,
  orderData: {
    selectedGSM: number;
    selectedColor: string;
    designFiles: string[];
    printPlacements: string[];
    additionalNotes?: string;
    sizesAndQty: { size: string; quantity: number }[];
    deliveryDetails: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      email: string;
    };
  },
  token?: string
) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.post(`/api/custom-orders/${productId}/custom-order`, orderData, { headers });
  return res.data;
};

export const getMyApparelOrders = async (token?: string) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.get("/api/custom-orders/my-orders", { headers });
  return res.data;
};

export const getApparelOrderById = async (id: string, token?: string) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.get(`/api/custom-orders/my-orders/${id}`, { headers });
  return res.data;
};

// ========== TICKETS API ==========
export const createTicket = async (formData: FormData, token?: string) => {
  const config: any = {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };

  // Use the shared `api` instance so the request hits the backend base URL.
  // (Previously this used a relative axios.post with no matching Next route.)
  // FormData sets multipart/form-data automatically.
  const res = await api.post(`/api/tickets/create`, formData, config);
  return res.data;
};

export const getMyTickets = async (token?: string) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.get("/api/tickets/my-tickets", { headers });
  return res.data;
};

// ========== WALLET API ==========
export const getWalletBalance = async (token?: string) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.get("/api/wallet/balance", { headers });
  return res.data;
};

// Step 1: create a Razorpay order for a wallet recharge. Returns
// { orderId, amount, currency, keyId } for opening the Razorpay checkout.
export const createWalletRecharge = async (amount: number, token?: string) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.post(
    "/api/wallet/recharge/create",
    { amount },
    { headers }
  );
  return res.data;
};

// Step 2: after the Razorpay checkout succeeds, verify the payment so the
// wallet is credited server-side.
export const verifyWalletRecharge = async (
  payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  },
  token?: string
) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.post("/api/wallet/recharge/verify", payload, {
    headers,
  });
  return res.data;
};

export const getWalletTransactions = async (
  token?: string,
  page: number = 1,
  limit: number = 10
) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.get("/api/wallet/transactions", {
    headers,
    params: { page, limit },
  });
  return res.data;
};

// ========== PROFILE API ==========
export const getUserProfile = async (token?: string, dateFilter?: string) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const params: Record<string, string> = {};
  if (dateFilter) params.dateFilter = dateFilter;
  const res = await api.get("/api/users/profile", { headers, params });
  return res.data;
};

export const updateUserProfile = async (
  profileData: {
    name?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
      country?: string;
    };
  },
  token?: string
) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.put("/api/users/profile", profileData, { headers });
  return res.data;
};

// ========== CART API ==========
export const addToCart = async (
  cartData: {
    productType: "ready" | "bulk" | "custom";
    productId: string;
    variantId: string;
    quantity: number;
    size: string;
  },
  token?: string
) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.post("/api/cart", cartData, { headers });
  return res.data;
};

export const getCart = async (token?: string) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.get("/api/cart", { headers });
  return res.data;
};

export const updateCartItem = async (
  cartItemId: string,
  quantity: number,
  token?: string
) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.put("/api/cart", { cartItemId, quantity }, { headers });
  return res.data;
};
export const removeFromCart = async (cartItemId: string, token?: string) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.delete(`/api/cart/${cartItemId}`, { headers });
  return res.data;
};

// Fetch a single order owned by the logged-in user. The backend enforces that
// the order belongs to this user, so the confirmation screen can show verified
// amounts/status instead of trusting URL query params.
export const getOrderById = async (orderId: string, token?: string) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.get(`/api/orders/${orderId}`, { headers });
  return res.data;
};

export const buyNowOrder = async (
  orderData: {
    productId: string;
    productType: "ready" | "bulk";
    variantId?: string;
    color?: string;
    size?: string;
    quantity: number;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country?: string;
    };
    phoneNumber: string;
    customDesign?: string;
    anyText?: string;
    guestName?: string;
    guestEmail?: string;
  },
  token?: string
) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await api.post("/api/orders/buynow", orderData, { headers });
  return res.data;
};

export default api;
