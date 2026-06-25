// ========== WISHLIST TYPES ==========
export type WishlistItem = {
  slug: string;
  title: string;
  image: string;
  price: string;
  description?: string;
};

const WISHLIST_CACHE_KEY = "kt-adhesives-wishlist-cache";

export function getLocalWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setLocalWishlist(items: WishlistItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WISHLIST_CACHE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("wishlist-updated"));
  } catch (e) {
    console.error("Failed to save wishlist cache", e);
  }
}

export function toggleWishlistItem(item: WishlistItem): void {
  const current = getLocalWishlist();
  const exists = current.some((i) => i.slug === item.slug);
  let updated: WishlistItem[];
  
  if (exists) {
    updated = current.filter((i) => i.slug !== item.slug);
  } else {
    updated = [...current, item];
  }
  
  setLocalWishlist(updated);
}

export function isInWishlist(slug: string): boolean {
  return getLocalWishlist().some((i) => i.slug === slug);
}

export function getWishlistCount(): number {
  return getLocalWishlist().length;
}
