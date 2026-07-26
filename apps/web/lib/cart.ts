"use client";

export type CartItem = {
  id: string;
  slug: string;
  title: string;
  variant: string;
  image: string;
  price: number;
  quantity: number;
  seller?: string;
  custom?: boolean;
  productId?: string;
  productType?: "ready" | "bulk";
  variantId?: string;
  color?: string;
  size?: string;
  customDesign?: string;
  artwork?: string;
  designFiles?: string[];
};

const KEY = "ab-cart";
const EVENT = "ab-cart-updated";

const INITIAL_DEMO_ITEMS: CartItem[] = [
  {
    id: "demo-1",
    slug: "custom-round-neck-tshirt",
    title: "Round Neck T-Shirt — Custom Design",
    variant: "White · Size L · DTF Print",
    image: "/images/home/cat-tshirt.png",
    price: 497,
    quantity: 1,
    custom: true,
  },
  {
    id: "demo-2",
    slug: "geometric-wave-tee",
    title: "Geometric Wave Tee",
    seller: "Rahul's Store",
    variant: "Black · Size M · DTF",
    image: "/images/home/cat-polo.png",
    price: 599,
    quantity: 2,
  },
];

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return INITIAL_DEMO_ITEMS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(INITIAL_DEMO_ITEMS));
      return INITIAL_DEMO_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_ITEMS;
  }
}

function save(items: CartItem[]) {
  if (typeof window === "undefined") return;
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
