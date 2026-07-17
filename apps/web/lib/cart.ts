"use client";

// Lightweight client-side cart (localStorage). Server-cart wiring to
// /api/cart is a follow-up; this makes the Cart/Checkout screens functional now.
export type CartItem = {
  id: string; // unique line id
  slug: string;
  title: string;
  variant: string; // display string, e.g. "White · Size L · DTF Print"
  image: string;
  price: number; // per unit, INR (display; server recomputes at checkout)
  quantity: number;
  seller?: string;
  custom?: boolean;
  // Order-placement identity (POST /api/orders/checkout needs these)
  productId?: string;
  productType?: "ready" | "bulk";
  variantId?: string;
  color?: string;
  size?: string;
  customDesign?: string; // serialized design-studio state for custom items
  artwork?: string; // data URL of the uploaded design (uploaded at checkout)
};

const KEY = "ab-cart";
const EVENT = "ab-cart-updated";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function addToCart(item: CartItem) {
  const items = getCart();
  const existing = items.find(
    (i) => i.slug === item.slug && i.variant === item.variant && !item.custom,
  );
  if (existing) existing.quantity += item.quantity;
  else items.push(item);
  save(items);
}

export function updateQuantity(id: string, quantity: number) {
  const items = getCart()
    .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))
    .filter((i) => i.quantity > 0);
  save(items);
}

export function removeItem(id: string) {
  save(getCart().filter((i) => i.id !== id));
}

export function clearCart() {
  save([]);
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function subscribeCart(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
