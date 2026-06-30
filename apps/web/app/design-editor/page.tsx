"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TShirtDesigner from "@/components/Bulk-Order/TShirtDesigner";
import * as api from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

// Shared key for handing a design off from the studio to a product page.
export const PENDING_DESIGN_KEY = "kt-pending-design";

// Best-effort stash; returns false if storage (e.g. quota) fails.
function stashPendingDesign(payload: Record<string, unknown>): boolean {
  try {
    sessionStorage.setItem(PENDING_DESIGN_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.error("Failed to stash design", e);
    return false;
  }
}

async function dataUrlsToFiles(dataUrls: string[]): Promise<File[]> {
  return Promise.all(
    dataUrls.map(async (src, i) => {
      const blob = await (await fetch(src)).blob();
      const ext = (blob.type && blob.type.split("/")[1]) || "png";
      return new File([blob], `design-${i + 1}.${ext}`, {
        type: blob.type || "image/png",
      });
    })
  );
}

export default function DesignEditorPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white text-center font-sans">
      <div className="max-w-md w-full rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 shadow-2xl backdrop-blur-md">
        <div className="inline-flex p-3 rounded-2xl bg-[#B87D4C]/10 text-[#B87D4C] mb-6">
          <Sparkles className="h-6 w-6" />
        </div>
        
        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">T-Shirt Design Studio</h1>
        <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
          Create your design with premium uploads, typography, shapes, and layers. When you save, we&apos;ll take you to pick a product and place your order with the design attached.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-standalone-designer"));
            }}
            className="w-full py-3 bg-[#B87D4C] hover:bg-[#B87D4C] rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-[#B87D4C]/20"
          >
            Launch Design Studio
          </button>
          
          <Link
            href="/"
            className="w-full py-3 border border-neutral-800 hover:bg-neutral-900 rounded-xl text-neutral-400 hover:text-white font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Storefront
          </Link>
        </div>
      </div>

      {/* Standalone state toggler */}
      <StandaloneDesignerWrapper />
    </div>
  );
}

function StandaloneDesignerWrapper() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [editorState, setEditorState] = useState<any>(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-standalone-designer", handleOpen);
    return () => window.removeEventListener("open-standalone-designer", handleOpen);
  }, []);

  return (
    <TShirtDesigner
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSave={async (previews, state) => {
        setEditorState(state);
        setIsOpen(false);

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || undefined
            : undefined;
        const dataUrls = [previews.front, previews.back].filter(Boolean) as string[];

        // Logged in: upload the artwork now and stash only the (tiny) URLs.
        // This avoids cramming megabytes of base64 into sessionStorage (quota).
        if (token && dataUrls.length) {
          try {
            const files = await dataUrlsToFiles(dataUrls);
            const res = await api.uploadDesigns(files, token);
            stashPendingDesign({ urls: res?.data?.urls || [], state });
            router.push("/all-collection");
            return;
          } catch (e) {
            console.error("Studio design upload failed", e);
            // fall through to stashing the previews for the product page to upload
          }
        }

        // Guest (or upload failed): stash the previews for the product page.
        const ok = stashPendingDesign({ previews, state });
        if (!ok) {
          alert(
            "Your design is too large to carry over automatically. Please open a product and use 'Customize Design Online'."
          );
          router.push("/all-collection");
          return;
        }

        // Ordering requires login, so nudge guests to sign in first.
        // The design stays stashed and attaches once they're logged in.
        router.push(token ? "/all-collection" : "/login");
      }}
      initialState={editorState}
    />
  );
}
