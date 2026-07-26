"use client";

// The Pro Editor — the advanced multi-layer designer from the original
// frontend (curved text, filters, locking, PDF spec sheets), wired into the
// current platform: saves land in the shared drafts store and continue into
// Preview & Order → wallet checkout.

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TShirtDesigner from "@/components/studio/TShirtDesigner";
import { getDesign, upsertDesign } from "@/lib/designs";
import { newId, type El } from "@/lib/studio";

type Previews = { front?: string; back?: string };

const loadDims = (src: string) =>
  new Promise<{ w: number; h: number } | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });

function DesignEditor() {
  const router = useRouter();
  const params = useSearchParams();
  const draftParam = params.get("draft");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [initialState, setInitialState] = useState<unknown>(undefined);
  const [ready, setReady] = useState(false);

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
    // Each exported side becomes a full-bleed image layer, so the existing
    // preview, flattened print file, and checkout all work unchanged.
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
      product: null,
      // Full editor state so Edit reopens the Pro Editor exactly as left
      proEditor: editorState,
    };

    try {
      localStorage.setItem("ab:design", JSON.stringify(state));
      const saved = upsertDesign(draftId, state, "Pro Editor design");
      setDraftId(saved.id);
    } catch {
      // storage full — the order flow still carries the design in memory
    }
    router.push("/design-studio/preview");
  }

  if (!ready) return <div className="min-h-[70vh] bg-neutral-950" />;

  return (
    <div className="min-h-[70vh] bg-neutral-950">
      <TShirtDesigner
        isOpen
        onClose={() => router.push("/design-studio")}
        onSave={(previews, editorState) => void handleSave(previews, editorState)}
        initialState={initialState}
      />
    </div>
  );
}

export default function DesignEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-neutral-950" />}>
      <DesignEditor />
    </Suspense>
  );
}
