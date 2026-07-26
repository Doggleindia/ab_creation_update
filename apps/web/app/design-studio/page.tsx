"use client";

// The Design Studio — the advanced multi-layer Pro Editor (curved text,
// image filters, layer locking, front/back canvases, PDF spec sheets).
// Saves land in the shared drafts store and continue to Preview & Order,
// paying from the wallet like every other purchase.

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TShirtDesigner from "@/components/studio/TShirtDesigner";
import { getDesign, upsertDesign } from "@/lib/designs";
import { studioFontClasses } from "@/lib/fonts";
import { newId, type El } from "@/lib/studio";

const BACKEND = (process.env.NEXT_PUBLIC_MAIN_BACKEND ?? "").replace(/\/$/, "");

type Previews = { front?: string; back?: string };

type ProductContext = {
  productId: string;
  slug: string;
  title: string;
  price: number;
  variantId?: string;
};

const loadDims = (src: string) =>
  new Promise<{ w: number; h: number } | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });

function DesignStudio() {
  const router = useRouter();
  const params = useSearchParams();
  const draftParam = params.get("draft");
  const productSlug = params.get("product");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [initialState, setInitialState] = useState<unknown>(undefined);
  const [product, setProduct] = useState<ProductContext | null>(null);
  const [ready, setReady] = useState(false);

  // Product context (?product=<slug>) so the order carries the real garment
  useEffect(() => {
    if (!productSlug || !BACKEND) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${BACKEND}/api/products/slug/${encodeURIComponent(productSlug)}`,
        );
        if (!res.ok) return;
        const j = await res.json();
        const p = j?.data;
        if (!p?._id || cancelled) return;
        setProduct({
          productId: p._id,
          slug: p.slug,
          title: p.title,
          price: Math.round(p.basePrice * (1 - (p.discountPercentage || 0) / 100)),
          // Checkout resolves the variant by id — default to the first one
          variantId: p.variants?.[0]?._id,
        });
      } catch {
        // the studio still works without product context
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  // Draft re-editing (?draft=<id>): restore the exact editor state
  useEffect(() => {
    if (draftParam) {
      const saved = getDesign(draftParam);
      const pro = (saved?.state as { proEditor?: unknown } | undefined)?.proEditor;
      if (saved && pro) {
        setDraftId(saved.id);
        setInitialState(pro);
      }
    }
    setReady(true);
  }, [draftParam]);

  async function handleSave(previews: Previews, editorState: unknown) {
    // Each exported side becomes a full-bleed image layer, so the order
    // preview, flattened print file and checkout all work unchanged.
    const els: El[] = [];
    for (const side of ["front", "back"] as const) {
      const src = previews[side];
      if (!src) continue;
      const dims = await loadDims(src);
      els.push({
        id: newId(),
        kind: "image",
        zone: side,
        xPct: 50,
        yPct: 50,
        scale: 1.5,
        rotation: 0,
        flipH: false,
        flipV: false,
        opacity: 100,
        src,
        natW: dims?.w,
        natH: dims?.h,
      });
    }

    const color =
      (editorState as { color?: string } | undefined)?.color ?? "#f6f6f6";
    const state = {
      version: 2,
      els,
      image: previews.front ?? previews.back ?? null,
      colorName: "Custom",
      colorHex: color,
      colorDisplay: color,
      printMethod: "DTF Printing (Full Color)",
      zone: "front",
      placement: { xPct: 50, yPct: 50, scale: 1, rotation: 0 },
      opacity: 100,
      product,
      // Full editor state so Edit reopens the studio exactly as left
      proEditor: editorState,
    };

    try {
      localStorage.setItem("ab:design", JSON.stringify(state));
      const saved = upsertDesign(
        draftId,
        state,
        product ? `${product.title} design` : "Studio design",
      );
      setDraftId(saved.id);
    } catch {
      // storage full — the order flow still carries the design in memory
    }
    router.push("/design-studio/preview");
  }

  if (!ready) return <div className="min-h-[70vh] bg-[#eef0f2]" />;

  return (
    <div className={`min-h-[70vh] bg-[#eef0f2] ${studioFontClasses}`}>
      <TShirtDesigner
        isOpen
        onClose={() => router.push("/collection")}
        onSave={(previews, editorState) => void handleSave(previews, editorState)}
        initialState={initialState}
      />
    </div>
  );
}

export default function DesignStudioPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-[#eef0f2]" />}>
      <DesignStudio />
    </Suspense>
  );
}
