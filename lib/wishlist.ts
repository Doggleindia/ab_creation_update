"use client";

// Client-side wishlist (localStorage), same pattern as lib/cart.
export type WishlistItem = {
  slug: string;
  title: string;
  price: number;
  image: string;
};

const KEY = "ab-wishlist";
const EVENT = "ab-wishlist-updated";

export function getWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(items: WishlistItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function inWishlist(slug: string): boolean {
  return getWishlist().some((i) => i.slug === slug);
}

export function toggleWishlist(item: WishlistItem): boolean {
  const items = getWishlist();
  const idx = items.findIndex((i) => i.slug === item.slug);
  if (idx >= 0) {
    items.splice(idx, 1);
    save(items);
    return false;
  }
  items.push(item);
  save(items);
  return true;
}

export function removeFromWishlist(slug: string) {
  save(getWishlist().filter((i) => i.slug !== slug));
}

export function subscribeWishlist(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
