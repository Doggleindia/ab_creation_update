"use client";

// Multi-draft store for Design Studio creations (localStorage, same pattern
// as lib/cart and lib/wishlist). The studio also keeps writing the legacy
// single-draft key "ab:design" — that is what the preview page consumes.

export type DesignDraftState = {
  image: string | null;
  colorName?: string;
  colorHex?: string;
  colorDisplay?: string;
  printMethod?: string;
  zone?: string;
  placement?: unknown;
  opacity?: number;
  product?: {
    productId?: string;
    slug?: string;
    title?: string;
    price?: number;
    variantId?: string;
  } | null;
};

export type DesignDraft = {
  id: string;
  name: string;
  savedAt: string; // ISO
  state: DesignDraftState;
};

const KEY = "ab:designs";
const LEGACY_KEY = "ab:design";
const EVENT = "ab-designs-updated";

function read(): DesignDraft[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(drafts: DesignDraft[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(drafts));
  } catch {
    // storage full (large artwork data URLs) — keep the newest few
    try {
      localStorage.setItem(KEY, JSON.stringify(drafts.slice(0, 3)));
    } catch {
      // give up quietly; drafts stay in memory for this session
    }
  }
  window.dispatchEvent(new Event(EVENT));
}

export function draftName(state: DesignDraftState): string {
  const garment = state.product?.title ?? "Custom design";
  return state.colorDisplay || state.colorName
    ? `${garment} · ${state.colorDisplay ?? state.colorName}`
    : garment;
}

/** All drafts, newest first. Migrates the legacy single draft on first read. */
export function getDesigns(): DesignDraft[] {
  const drafts = read();
  if (drafts.length > 0) return drafts;
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const state = JSON.parse(legacy) as DesignDraftState;
      const migrated: DesignDraft = {
        id: "legacy-draft",
        name: draftName(state),
        savedAt: new Date().toISOString(),
        state,
      };
      write([migrated]);
      return [migrated];
    }
  } catch {
    // corrupted legacy draft — ignore
  }
  return drafts;
}

export function getDesign(id: string): DesignDraft | null {
  return getDesigns().find((d) => d.id === id) ?? null;
}

/** Insert or update a draft; newest first. Returns the stored draft. */
export function upsertDesign(
  id: string | null,
  state: DesignDraftState,
  name?: string,
): DesignDraft {
  const drafts = read();
  const existing = id ? drafts.find((d) => d.id === id) : null;
  const draft: DesignDraft = {
    id: existing?.id ?? `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: name ?? existing?.name ?? draftName(state),
    savedAt: new Date().toISOString(),
    state,
  };
  write([draft, ...drafts.filter((d) => d.id !== draft.id)]);
  return draft;
}

export function renameDesign(id: string, name: string) {
  write(read().map((d) => (d.id === id ? { ...d, name: name.trim() || d.name } : d)));
}

export function removeDesign(id: string) {
  write(read().filter((d) => d.id !== id));
}

/** Make a draft the studio/preview's "current" design (legacy key). */
export function activateDesign(draft: DesignDraft) {
  try {
    localStorage.setItem(LEGACY_KEY, JSON.stringify(draft.state));
  } catch {
    // storage full — preview will fall back to defaults
  }
}

export function subscribeDesigns(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
