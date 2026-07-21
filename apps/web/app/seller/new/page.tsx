"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, ChevronDown, CloudUpload, X } from "lucide-react";
import SellerShell from "@/components/seller/SellerShell";
import { apiFetch, getToken, BACKEND } from "@/lib/auth";

const METHODS = ["DTF", "Screen", "Embroidery", "Heat Transfer"];
const COLORS = ["White", "Black", "Navy", "Grey", "Red", "Green"];
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

type BaseProduct = { _id: string; title: string; basePrice: number };

function NewSubmission() {
  const params = useSearchParams();
  const editId = params.get("edit");
  const fileRef = useRef<HTMLInputElement>(null);

  const [bases, setBases] = useState<BaseProduct[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    baseProductId: "",
    method: "DTF",
    color: "White",
    retailPrice: "",
    sizes: ["S", "M", "L", "XL"] as string[],
    tags: "",
  });

  useEffect(() => {
    fetch(`${BACKEND}/api/products?limit=16`)
      .then((r) => r.json())
      .then((j) =>
        setBases(
          (j.data ?? []).map(
            (p: { _id: string; title: string; basePrice: number }) => ({
              _id: p._id,
              title: p.title,
              basePrice: p.basePrice,
            }),
          ),
        ),
      )
      .catch(() => {});
  }, []);

  // Prefill when editing a rejected/changes submission
  useEffect(() => {
    if (!editId || !getToken()) return;
    apiFetch<{
      data: {
        sellerProducts: {
          _id: string;
          title: string;
          description?: string;
          method: string;
          color?: string;
          retailPrice: number;
          sizes: string[];
          tags: string[];
          images: string[];
          baseProductId?: string | { _id?: string } | null;
        }[];
      };
    }>("/api/seller-products/mine")
      .then((j) => {
        const s = (j.data?.sellerProducts ?? []).find((x) => x._id === editId);
        if (!s) return;
        setForm({
          title: s.title,
          description: s.description ?? "",
          baseProductId:
            typeof s.baseProductId === "object"
              ? (s.baseProductId?._id ?? "")
              : (s.baseProductId ?? ""),
          method: s.method,
          color: s.color ?? "White",
          retailPrice: String(s.retailPrice),
          sizes: s.sizes.length ? s.sizes : ["S", "M", "L", "XL"],
          tags: s.tags.join(", "),
        });
        setImages(s.images);
      })
      .catch(() => {});
  }, [editId]);

  const base = bases.find((b) => b._id === form.baseProductId);
  const retail = Number(form.retailPrice) || 0;
  const margin = base ? retail - base.basePrice : null;

  async function uploadImages(list: FileList | null) {
    if (!list?.length) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      Array.from(list)
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, 5 - images.length)
        .forEach((f) => fd.append("images", f, f.name));
      const j = await apiFetch<{ data: { urls: string[] } }>(
        "/api/seller-products/upload",
        { method: "POST", body: fd },
      );
      setImages((imgs) => [...imgs, ...(j.data?.urls ?? [])].slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.baseProductId) {
      setError("Choose the base garment your design prints on.");
      return;
    }
    if (images.length === 0) {
      setError("Upload at least one design image.");
      return;
    }
    if (base && retail <= base.basePrice) {
      setError(
        `Retail price must be above the garment base price (₹${base.basePrice}).`,
      );
      return;
    }
    setBusy(true);
    try {
      const body = JSON.stringify({
        title: form.title,
        description: form.description || undefined,
        baseProductId: form.baseProductId,
        method: form.method,
        color: form.color,
        retailPrice: retail,
        sizes: form.sizes,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 10),
        images,
      });
      if (editId) {
        await apiFetch(`/api/seller-products/${editId}/resubmit`, {
          method: "PATCH",
          body,
        });
      } else {
        await apiFetch("/api/seller-products", { method: "POST", body });
      }
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not submit the design.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <SellerShell title="Submission Received">
        <div className="flex flex-col items-center py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e]">
            <Check className="h-8 w-8 text-white" strokeWidth={3} />
          </div>
          <h2 className="pt-5 text-[24px] font-bold text-black">
            {editId ? "Design resubmitted!" : "Design submitted for review!"}
          </h2>
          <p className="max-w-[440px] pt-3 text-[14px] leading-6 text-[#6b7280]">
            Our curation team reviews submissions within 48 hours. Once
            approved, your design is published to the storefront automatically
            and you&apos;ll get an email confirmation.
          </p>
          <div className="flex gap-4 pt-8">
            <Link
              href="/seller/products"
              className="rounded-full bg-brand-orange px-8 py-3 text-[15px] font-bold text-white hover:opacity-90"
            >
              My Products
            </Link>
            <button
              onClick={() => {
                setDone(false);
                setImages([]);
                setForm((f) => ({ ...f, title: "", description: "", tags: "", retailPrice: "" }));
              }}
              className="rounded-full border border-[#c4c7c7] px-8 py-3 text-[15px] font-bold text-black hover:bg-[#f3f4f6]"
            >
              Submit Another
            </button>
          </div>
        </div>
      </SellerShell>
    );
  }

  return (
    <SellerShell
      title={editId ? "Edit & Resubmit" : "New Product Submission"}
      subtitle="Pick a garment, upload your artwork, set your price."
    >
      <form onSubmit={submit} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          {/* 1. Garment */}
          <section>
            <h2 className="text-[16px] font-bold text-black">
              1 · Select Garment
            </h2>
            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#444748]">
                  Base Product
                </span>
                <div className="relative">
                  <select
                    required
                    value={form.baseProductId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, baseProductId: e.target.value }))
                    }
                    className="h-11 w-full appearance-none rounded-[8px] border border-[#c4c7c7] bg-white px-4 pr-9 text-[15px] text-black focus:border-brand-orange focus:outline-none"
                  >
                    <option value="" disabled>
                      Choose a garment
                    </option>
                    {bases.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.title} — base ₹{b.basePrice}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#444748]" />
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#444748]">
                  Garment Color
                </span>
                <div className="relative">
                  <select
                    value={form.color}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, color: e.target.value }))
                    }
                    className="h-11 w-full appearance-none rounded-[8px] border border-[#c4c7c7] bg-white px-4 pr-9 text-[15px] text-black focus:border-brand-orange focus:outline-none"
                  >
                    {COLORS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#444748]" />
                </div>
              </label>
            </div>
            <div className="pt-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#444748]">
                Sizes Offered
              </span>
              <div className="flex flex-wrap gap-2 pt-2">
                {ALL_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        sizes: f.sizes.includes(s)
                          ? f.sizes.filter((x) => x !== s)
                          : [...f.sizes, s],
                      }))
                    }
                    className={`h-10 min-w-[44px] rounded-[8px] px-3 text-[13.5px] font-bold ${
                      form.sizes.includes(s)
                        ? "bg-black text-white"
                        : "border border-[#c4c7c7] text-black hover:border-black"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 2. Artwork */}
          <section>
            <h2 className="text-[16px] font-bold text-black">
              2 · Upload Design
            </h2>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void uploadImages(e.dataTransfer.files);
              }}
              className="mt-4 flex w-full flex-col items-center gap-2 rounded-[8px] border-2 border-dashed border-[#c4c7c7] px-6 py-10 hover:border-brand-orange"
            >
              <CloudUpload className="h-6 w-6 text-[#6b7280]" />
              <span className="text-[14px] font-semibold text-black">
                {uploading ? "Uploading…" : "Click or drag artwork here"}
              </span>
              <span className="text-[12px] text-[#9ca3af]">
                PNG or JPG, up to 5 images — the first is the main mockup
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => void uploadImages(e.target.files)}
            />
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-4">
                {images.map((url, i) => (
                  <span
                    key={url}
                    className="relative h-20 w-20 overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-[#f8f9fb]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() =>
                        setImages((imgs) => imgs.filter((_, j) => j !== i))
                      }
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[9px] font-bold uppercase text-white">
                        Main
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* 3. Details */}
          <section>
            <h2 className="text-[16px] font-bold text-black">3 · Details</h2>
            <div className="flex flex-col gap-4 pt-4">
              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#444748]">
                  Product Title
                </span>
                <input
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. Neon Tiger Streetwear Tee"
                  className="h-11 w-full rounded-[8px] border border-[#c4c7c7] px-4 text-[15px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#444748]">
                  Description
                </span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Tell buyers about the design…"
                  className="w-full rounded-[8px] border border-[#c4c7c7] px-4 py-3 text-[15px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#444748]">
                    Print Method
                  </span>
                  <div className="relative">
                    <select
                      value={form.method}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, method: e.target.value }))
                      }
                      className="h-11 w-full appearance-none rounded-[8px] border border-[#c4c7c7] bg-white px-4 pr-9 text-[15px] text-black focus:border-brand-orange focus:outline-none"
                    >
                      {METHODS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#444748]" />
                  </div>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#444748]">
                    Tags (comma separated)
                  </span>
                  <input
                    value={form.tags}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tags: e.target.value }))
                    }
                    placeholder="streetwear, neon, tiger"
                    className="h-11 w-full rounded-[8px] border border-[#c4c7c7] px-4 text-[15px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                  />
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Pricing rail */}
        <aside className="h-fit rounded-[12px] border border-[#e5e7eb] bg-[#f8f9fb] p-6 lg:sticky lg:top-24">
          <h2 className="text-[16px] font-bold text-black">4 · Set Pricing</h2>
          <label className="block pt-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#444748]">
              Retail Price
            </span>
            <div className="mt-2 flex h-12 items-center rounded-[8px] border border-[#c4c7c7] bg-white px-4">
              <span className="pr-1 text-[16px] text-[#6b7280]">₹</span>
              <input
                required
                inputMode="numeric"
                value={form.retailPrice}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    retailPrice: e.target.value.replace(/[^\d]/g, ""),
                  }))
                }
                placeholder="649"
                className="w-full text-[16px] font-bold text-black focus:outline-none"
              />
            </div>
          </label>
          <div className="flex flex-col gap-2 pt-5 text-[14px]">
            <div className="flex justify-between text-[#6b7280]">
              <span>Garment base cost</span>
              <span>{base ? `₹${base.basePrice}` : "—"}</span>
            </div>
            <div className="flex justify-between border-t border-[#e5e7eb] pt-2 font-bold text-black">
              <span>Your margin per sale</span>
              <span className={margin !== null && margin <= 0 ? "text-[#ba1a1a]" : "text-[#16a34a]"}>
                {margin !== null && retail > 0 ? `₹${margin}` : "—"}
              </span>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-[8px] bg-[#fef2f2] px-3 py-2.5 text-[13px] text-[#ba1a1a]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || uploading}
            className="mt-6 w-full rounded-full bg-brand-orange py-3.5 text-[15px] font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy
              ? "Submitting…"
              : editId
                ? "Resubmit for Review"
                : "Submit for Review"}
          </button>
          <p className="pt-3 text-center text-[12px] leading-5 text-[#9ca3af]">
            Reviewed within 48 hours. Approved designs go live on the
            storefront automatically.
          </p>
        </aside>
      </form>
    </SellerShell>
  );
}

export default function NewSubmissionPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-white" />}>
      <NewSubmission />
    </Suspense>
  );
}
