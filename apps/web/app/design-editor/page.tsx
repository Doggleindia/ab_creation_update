"use client";

import { useState, useEffect } from "react";
import TShirtDesigner from "@/components/Bulk-Order/TShirtDesigner";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function DesignEditorPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white text-center font-sans">
      <div className="max-w-md w-full rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 shadow-2xl backdrop-blur-md">
        <div className="inline-flex p-3 rounded-2xl bg-[#B87D4C]/10 text-[#B87D4C] mb-6">
          <Sparkles className="h-6 w-6" />
        </div>
        
        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">T-Shirt Design Studio</h1>
        <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
          Welcome to the interactive standalone designer sandbox. Experiment with premium uploads, typography layouts, vector shapes, and layer ordering in this playground.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-standalone-designer"));
            }}
            className="w-full py-3 bg-[#B87D4C] hover:bg-[#B87D4C] rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-[#B87D4C]/20"
          >
            Launch Designer Sandbox
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
      onSave={(previews, state) => {
        setEditorState(state);
        alert("Design Saved Successfully in Sandbox!");
        console.log("Visual Previews:", previews);
        console.log("JSON Editor State:", state);
      }}
      initialState={editorState}
    />
  );
}
