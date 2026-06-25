// ========== CART TYPES ==========
export type CartPricing = {
  unitPrice: number
  subtotal: number
  discount: number
  finalTotal: number
  currency: string
}

export type CartSnapshot = {
  title: string
  image: string
  size: string
  color: string
}

export type CartItem = {
  _id: string
  productId: string
  variantId: string
  quantity: number
  snapshot: CartSnapshot
  pricing: CartPricing
}

export type ApiAddToCartPayload = {
  productType: "ready" | "bulk" | "custom"
  productId: string
  variantId: string
  quantity: number
  size: string
}

// ========== LOCAL STORAGE FALLBACK ==========
const CART_CACHE_KEY = "kt-adhesives-cart-cache"

export function getLocalCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(CART_CACHE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function setLocalCart(items: CartItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CART_CACHE_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent("cart-updated"))
  } catch (e) {
    console.error("Failed to save cart cache", e)
  }
}

export function notifyCartUpdate(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cart-updated"))
  }
}

// Legacy functions for backward compatibility
export function getCart(): CartItem[] {
  return getLocalCart()
}

export function setCart(items: CartItem[]): void {
  setLocalCart(items)
}

export function getCartCount(): number {
  return getLocalCart().reduce((sum, i) => sum + i.quantity, 0)
}
