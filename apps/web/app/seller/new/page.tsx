"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CloudUpload,
  Crosshair,
  Sparkles,
  Type,
  X,
} from "lucide-react";
import { apiFetch, getToken, getUser, BACKEND } from "@/lib/auth";
import { inr } from "@/lib/seller";

const STEPS = ["Select Garment", "Upload Design", "Position & Preview", "Set Pricing", "Submit"];
const DRAFT_KEY = "ab:seller-product-draft";
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

const COLOR_HEX: Record<string, string> = {
  black: "#1f2224", white: "#ffffff", navy: "#1e3a8a", blue: "#2563eb",
  red: "#b91c1c", green: "#14532d", grey: "#9ca3af", gray: "#9ca3af",
  beige: "#f5e9d0", brown: "#7c4a03", pink: "#f9a8d4", yellow: "#facc15",
  steel: "#94a3b8", maroon: "#7f1d1d", olive: "#4d5c2a", cream: "#f7f3e8",
};

const METHODS = [
  { id: "DTF", title: "DTF Print", desc: "Vibrant colors, smooth finish, great for detailed designs" },
  { id: "Screen", title: "Screen Print", desc: "Durable solid colors, best value at volume" },
  { id: "Embroidery", title: "Embroidery", desc: "Premium stitched finish, ideal for logos" },
];

type Garment = {
  _id: string;
  title: string;
  basePrice: number;
  colors?: string[];
  sizes?: string[];
  specifications?: { fabric?: string; gsm?: string };
  categoryId?: { name?: string } | string | null;
  category?: { name?: string } | null;
  printZones?: { name: string; side?: string; widthIn?: number; heightIn?: number }[];
  variants?: { _id: string; color?: string; media?: { images?: string[] } }[];
};

type Zone = { name: string; widthCm: number; heightCm: number };

const zonesOf = (g: Garment | null): Zone[] => {
  const fromProduct = (g?.printZones ?? [])
    .filter((z) => z.widthIn && z.heightIn)
    .map((z) => ({
      name: z.name + (z.side === "back" ? " (Back)" : ""),
      widthCm: Math.round((z.widthIn ?? 0) * 2.54 * 10) / 10,
      heightCm: Math.round((z.heightIn ?? 0) * 2.54 * 10) / 10,
    }));
  return fromProduct.length > 0
    ? fromProduct
    : [{ name: "Full Front", widthCm: 35, heightCm: 40 }];
};

const catOf = (g: Garment) => {
  const viaId = typeof g.categoryId === "object" ? g.categoryId?.name : undefined;
  return viaId ?? g.category?.name ?? "Other";
};

const imageFor = (g: Garment | null, color: string): string | null => {
  if (!g) return null;
  const match = g.variants?.find(
    (x) => (x.color ?? "").toLowerCase() === color.toLowerCase() && x.media?.images?.[0],
  );
  const any = g.variants?.find((x) => x.media?.images?.[0]);
  return match?.media?.images?.[0] ?? any?.media?.images?.[0] ?? null;
};

function NewProductWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");

  const [step, setStep] = useState(0);
  const [garments, setGarments] = useState<Garment[]>([]);
  const [catFilter, setCatFilter] = useState("all");
  const [garment, setGarment] = useState<Garment | null>(null);
  const [files, setFiles] = useState<{ file: File; preview: string; name: string }[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [color, setColor] = useState("White");
  const [method, setMethod] = useState("DTF");
  const [zoneIdx, setZoneIdx] = useState(0);
  const [pos, setPos] = useState({ xCm: 0, yCm: 4, widthCm: 24, heightCm: 24, rotationDeg: 0 });
  const [designNat, setDesignNat] = useState<{ w: number; h: number } | null>(null);
  const [form, setForm] = useState({ title: "", description: "", tags: "", margin: "300" });
  const [sizes, setSizes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mockupOpen, setMockupOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const zoneBoxRef = useRef<HTMLDivElement>(null);

  // Seller guard (mirrors SellerShell — this page runs full-screen without it)
  useEffect(() => {
    if (!getToken()) router.replace("/login?next=/seller/new");
    else if (getUser()?.accountType !== "seller") router.replace("/");
  }, [router]);

  // Base garments = the live published catalog
  useEffect(() => {
    fetch(`${BACKEND}/api/products?limit=100`)
      .then((r) => r.json())
      .then((j) => setGarments(j?.data ?? []))
      .catch(() => {});
  }, []);

  // Edit / resubmit prefill
  useEffect(() => {
    if (!editId || garments.length === 0 || !getToken()) return;
    apiFetch<{
      data: {
        sellerProducts: {
          _id: string;
          title?: string; description?: string; retailPrice?: number;
          method?: string; color?: string; sizes?: string[]; tags?: string[];
          images?: string[]; baseProductId?: { _id?: string; basePrice?: number } | string | null;
          placement?: { zone?: string; xCm?: number; yCm?: number; widthCm?: number; heightCm?: number; rotationDeg?: number };
        }[];
      };
    }>("/api/seller-products/mine")
      .then((j) => {
        const sub = (j.data?.sellerProducts ?? []).find((s) => s._id === editId);
        if (!sub) return;
        const baseId =
          typeof sub.baseProductId === "object" ? sub.baseProductId?._id : sub.baseProductId;
        const g = garments.find((x) => x._id === baseId) ?? null;
        if (g) setGarment(g);
        setColor(sub.color ?? "White");
        setMethod(sub.method ?? "DTF");
        setSizes(sub.sizes ?? []);
        setExistingImages(sub.images ?? []);
        const base = g?.basePrice ?? 0;
        setForm({
          title: sub.title ?? "",
          description: sub.description ?? "",
          tags: (sub.tags ?? []).join(", "),
          margin: String(Math.max(1, (sub.retailPrice ?? base) - base)),
        });
        if (sub.placement) {
          setPos({
            xCm: sub.placement.xCm ?? 0,
            yCm: sub.placement.yCm ?? 4,
            widthCm: sub.placement.widthCm ?? 24,
            heightCm: sub.placement.heightCm ?? 24,
            rotationDeg: sub.placement.rotationDeg ?? 0,
          });
        }
      })
      .catch(() => {});
  }, [editId, garments]);

  // Defaults that follow the selected garment
  useEffect(() => {
    if (!garment) return;
    setColor((c) =>
      garment.colors?.some((x) => x.toLowerCase() === c.toLowerCase())
        ? c
        : (garment.colors?.[0] ?? "White"),
    );
    setSizes((s) => (s.length > 0 ? s : (garment.sizes?.length ? garment.sizes : ALL_SIZES.slice(1, 5))));
    setZoneIdx(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garment?._id]);

  const zones = zonesOf(garment);
  const zone = zones[Math.min(zoneIdx, zones.length - 1)];
  const designUrl = files[0]?.preview ?? existingImages[0] ?? null;
  const garmentImg = imageFor(garment, color);
  const sizeOptions = garment?.sizes?.length ? garment.sizes : ALL_SIZES;

  // Measure the artwork's natural pixel size (drives the DPI check)
  useEffect(() => {
    if (!designUrl) {
      setDesignNat(null);
      return;
    }
    const img = new Image();
    img.onload = () => setDesignNat({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setDesignNat(null);
    img.src = designUrl;
  }, [designUrl]);

  // Keep the design box inside the active zone, aspect-linked to the artwork
  useEffect(() => {
    setPos((p) => {
      const widthCm = Math.min(p.widthCm, zone.widthCm);
      const heightCm = designNat
        ? Math.round(((widthCm * designNat.h) / designNat.w) * 10) / 10
        : Math.min(p.heightCm, zone.heightCm);
      return { ...p, widthCm, heightCm: Math.min(heightCm, zone.heightCm) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneIdx, garment?._id, designNat?.w]);

  const dpi = designNat ? Math.round(designNat.w / (pos.widthCm / 2.54)) : null;
  const dpiTone = dpi === null ? null : dpi >= 300 ? "great" : dpi >= 200 ? "ok" : "low";

  const retail = (garment?.basePrice ?? 0) + (Number(form.margin) || 0);

  // Real price context from the live catalog (same category)
  const priceHint = useMemo(() => {
    if (!garment) return null;
    const cat = catOf(garment);
    const prices = garments
      .filter((g) => catOf(g) === cat)
      .map((g) => g.basePrice)
      .sort((a, b) => a - b);
    if (prices.length < 2) return null;
    return { low: prices[0], high: prices[prices.length - 1], cat };
  }, [garment, garments]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next: { file: File; preview: string; name: string }[] = [];
    for (const file of Array.from(list).slice(0, 5 - files.length - existingImages.length)) {
      if (!/^image\//.test(file.type)) continue;
      if (file.size > 25 * 1024 * 1024) continue;
      next.push({ file, preview: URL.createObjectURL(file), name: file.name });
    }
    setFiles((f) => [...f, ...next].slice(0, 5));
  }

  function saveDraft() {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ garmentId: garment?._id ?? null, color, method, zoneIdx, pos, form, sizes, step }),
      );
      setNotice("Draft saved on this device. Artwork files can't be stored — re-add them when you return.");
    } catch {
      setNotice("Could not save the draft on this device.");
    }
  }

  // Restore draft (new submissions only)
  useEffect(() => {
    if (editId || garments.length === 0) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      const g = garments.find((x) => x._id === d.garmentId);
      if (g) setGarment(g);
      if (d.color) setColor(d.color);
      if (d.method) setMethod(d.method);
      if (typeof d.zoneIdx === "number") setZoneIdx(d.zoneIdx);
      if (d.pos) setPos(d.pos);
      if (d.form) setForm(d.form);
      if (Array.isArray(d.sizes) && d.sizes.length) setSizes(d.sizes);
    } catch {
      // draft restore is best-effort
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garments.length, editId]);

  async function submit() {
    setBusy(true);
    setError("");
    try {
      let images = existingImages;
      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append("images", f.file, f.name));
        const j = await apiFetch<{ data: { urls: string[] } }>("/api/seller-products/upload", {
          method: "POST",
          body: fd,
        });
        images = [...existingImages, ...(j.data?.urls ?? [])].slice(0, 5);
      }
      if (images.length === 0) throw new Error("Upload at least one design image.");

      const payload = {
        title: form.title,
        description: form.description,
        baseProductId: garment?._id,
        method,
        color,
        retailPrice: retail,
        sizes,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        images,
        placement: {
          zone: zone.name,
          xCm: pos.xCm,
          yCm: pos.yCm,
          widthCm: pos.widthCm,
          heightCm: pos.heightCm,
          rotationDeg: pos.rotationDeg,
        },
      };
      if (editId) {
        await apiFetch(`/api/seller-products/${editId}/resubmit`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/seller-products", { method: "POST", body: JSON.stringify(payload) });
      }
      localStorage.removeItem(DRAFT_KEY);
      setStep(5);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the design.");
    } finally {
      setBusy(false);
    }
  }

  function resetAll() {
    setStep(0);
    setGarment(null);
    setFiles([]);
    setExistingImages([]);
    setForm({ title: "", description: "", tags: "", margin: "300" });
    setSizes([]);
    setPos({ xCm: 0, yCm: 4, widthCm: 24, heightCm: 24, rotationDeg: 0 });
    setDesignNat(null);
    router.replace("/seller/new");
  }

  // ---- Position canvas: cm → % of the zone box ----
  const cmToPct = useCallback(
    (cm: number, axis: "x" | "y") => (cm / (axis === "x" ? zone.widthCm : zone.heightCm)) * 100,
    [zone],
  );

  function onDragStart(e: React.PointerEvent) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: pos.xCm, baseY: pos.yCm };
  }
  function onDragMove(e: React.PointerEvent) {
    if (!dragRef.current || !zoneBoxRef.current) return;
    const rect = zoneBoxRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragRef.current.startX) * (zone.widthCm / rect.width);
    const dy = (e.clientY - dragRef.current.startY) * (zone.heightCm / rect.height);
    setPos((p) => {
      const maxX = (zone.widthCm - p.widthCm) / 2;
      const maxY = zone.heightCm - p.heightCm;
      return {
        ...p,
        xCm: Math.round(Math.min(maxX, Math.max(-maxX, dragRef.current!.baseX + dx)) * 10) / 10,
        yCm: Math.round(Math.min(maxY, Math.max(0, dragRef.current!.baseY + dy)) * 10) / 10,
      };
    });
  }
  function onDragEnd() {
    dragRef.current = null;
  }

  const setWidth = (widthCm: number) => {
    const w = Math.min(Math.max(2, widthCm), zone.widthCm);
    const h = designNat ? Math.round(((w * designNat.h) / designNat.w) * 10) / 10 : pos.heightCm;
    setPos((p) => ({ ...p, widthCm: Math.round(w * 10) / 10, heightCm: Math.min(h, zone.heightCm) }));
  };

  const canContinue =
    step === 0 ? !!garment
    : step === 1 ? !!designUrl
    : step === 2 ? true
    : step === 3 ? form.title.trim().length > 0 && retail > (garment?.basePrice ?? 0)
    : true;

  const inputCls =
    "h-11 w-full rounded-[8px] border border-[#c4c7c7] bg-white px-4 text-[14.5px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none";
  const labelCls = "text-[11px] font-bold uppercase tracking-[0.6px] text-[#444748]";

  // Shared design-overlay renderer (position canvas, pricing preview, mockup modal)
  const renderOverlay = (interactive: boolean) =>
    designUrl && (
      <div
        {...(interactive
          ? {
              role: "button",
              "aria-label": "Drag to position the design",
              onPointerDown: onDragStart,
              onPointerMove: onDragMove,
              onPointerUp: onDragEnd,
            }
          : {})}
        className={`absolute ${interactive ? "cursor-move border-2 border-dashed border-[#3b82f6] bg-white/5" : ""}`}
        style={{
          width: `${cmToPct(pos.widthCm, "x")}%`,
          height: `${cmToPct(pos.heightCm, "y")}%`,
          left: `${50 + cmToPct(pos.xCm, "x") - cmToPct(pos.widthCm, "x") / 2}%`,
          top: `${cmToPct(pos.yCm, "y")}%`,
          transform: `rotate(${pos.rotationDeg}deg)`,
          touchAction: "none",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={designUrl} alt="Design" draggable={false} className="h-full w-full object-contain" />
        {interactive &&
          ["-left-1 -top-1", "-right-1 -top-1", "-left-1 -bottom-1", "-right-1 -bottom-1"].map((c) => (
            <span key={c} className={`absolute ${c} h-2.5 w-2.5 border border-[#3b82f6] bg-white`} />
          ))}
      </div>
    );

  /* ---------- Success ---------- */
  if (step === 5) {
    return (
      <main className="flex min-h-[75vh] w-full items-start justify-center bg-white px-4 py-16">
        <div className="flex w-full max-w-[640px] flex-col items-center text-center">
          <span className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#22c55e]">
            <Check className="h-9 w-9 text-white" strokeWidth={3.5} />
          </span>
          <h1 className="pt-6 text-[28px] font-bold tracking-[-0.5px] text-black">
            Product submitted for review!
          </h1>
          <p className="max-w-[480px] pt-3 text-[15px] leading-6 text-[#6b7280]">
            Our team will review your product within 24–48 hours. You&apos;ll receive an
            email notification once it&apos;s approved.
          </p>
          <div className="mt-8 flex w-full items-center gap-4 rounded-[12px] border border-[#e5e7eb] p-4 text-left">
            <span className="h-16 w-16 shrink-0 overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-[#f3f4f6]">
              {designUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={designUrl} alt="" className="h-full w-full object-cover" />
              )}
            </span>
            <span>
              <span className="block text-[16px] font-bold text-black">{form.title}</span>
              <span className="block text-[14px] text-[#374151]">
                {inr(retail)} · {garment?.title}
              </span>
              <span className="mt-1.5 inline-block rounded-md bg-[#fef3c7] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.5px] text-[#b45309]">
                Under Review
              </span>
            </span>
          </div>
          <div className="mt-8 flex w-full max-w-[480px] flex-col gap-3">
            <button
              onClick={resetAll}
              className="rounded-full bg-brand-orange py-3.5 text-[15px] font-bold text-white hover:opacity-90"
            >
              Create Another Product
            </button>
            <Link
              href="/seller"
              className="rounded-full border border-[#c4c7c7] py-3.5 text-center text-[15px] font-bold text-brand-orange hover:border-brand-orange"
            >
              Go to Dashboard
            </Link>
          </div>
          <p className="pt-8 text-[13.5px] text-[#6b7280]">
            Need help?{" "}
            <Link href="/contact-us" className="font-semibold text-black underline">
              Contact our seller support team
            </Link>
          </p>
        </div>
      </main>
    );
  }

  /* ---------- Wizard ---------- */
  return (
    <main className="min-h-[80vh] w-full bg-[#f8f9fb] pb-28">
      {/* Wizard header + stepper */}
      <div className="sticky top-0 z-30 border-b border-[#e5e7eb] bg-white">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
          <div className="flex min-w-0 items-center gap-6">
            <span className="hidden shrink-0 text-[17px] font-extrabold tracking-tight text-black lg:block">
              {editId ? "Edit Product" : "Create New Product"}
            </span>
            <nav className="flex items-center gap-3 overflow-x-auto">
              {STEPS.map((label, i) => (
                <span key={label} className="flex shrink-0 items-center gap-3">
                  <button
                    onClick={() => i < step && setStep(i)}
                    disabled={i > step}
                    className={`flex items-center gap-1.5 text-[12.5px] ${
                      i === step
                        ? "font-bold text-black underline underline-offset-8"
                        : i < step
                          ? "font-semibold text-black"
                          : "font-semibold text-[#9ca3af]"
                    }`}
                  >
                    {i < step ? (
                      <Check className="h-3.5 w-3.5 text-[#16a34a]" strokeWidth={3} />
                    ) : (
                      <span
                        className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-bold ${
                          i === step ? "bg-black text-white" : "text-[#9ca3af]"
                        }`}
                      >
                        {i + 1}
                      </span>
                    )}
                    {label}
                  </button>
                  {i < STEPS.length - 1 && <span className="h-px w-5 bg-[#d1d5db]" />}
                </span>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <button
              onClick={saveDraft}
              className="rounded-lg border border-[#c4c7c7] px-4 py-2 text-[13px] font-bold text-black hover:border-black"
            >
              Save Draft
            </button>
            <Link href="/seller/products" aria-label="Close wizard" className="p-1.5 text-[#374151] hover:text-black">
              <X className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {notice && (
        <p className="mx-auto mt-4 w-fit max-w-[90%] rounded-lg bg-[#dcfce7] px-4 py-2.5 text-[13px] font-medium text-[#166534]">
          {notice}
        </p>
      )}

      <div className="w-full px-4 pt-8 sm:px-8">
        {/* STEP 1: Select garment */}
        {step === 0 && (
          <>
            <h1 className="text-[26px] font-bold tracking-[-0.5px] text-black">
              Choose a base product
            </h1>
            <p className="pt-1 text-[14.5px] text-[#6b7280]">
              Select the garment you want to put your design on
            </p>
            <div className="flex flex-wrap gap-2 pt-5">
              {["all", ...Array.from(new Set(garments.map(catOf)))].map((c) => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  className={`rounded-full px-4 py-2 text-[13px] font-bold capitalize ${
                    catFilter === c
                      ? "bg-black text-white"
                      : "bg-[#eeeff1] text-[#374151] hover:bg-[#e2e4e7]"
                  }`}
                >
                  {c === "all" ? "All" : c}
                </button>
              ))}
            </div>
            {garments.length === 0 && (
              <p className="pt-10 text-[14px] text-[#6b7280]">Loading the garment catalog…</p>
            )}
            <div className="grid grid-cols-1 gap-5 pt-6 sm:grid-cols-2 xl:grid-cols-4">
              {garments
                .filter((g) => catFilter === "all" || catOf(g) === catFilter)
                .map((g) => {
                  const img = imageFor(g, g.colors?.[0] ?? "");
                  const selected = garment?._id === g._id;
                  return (
                    <div
                      key={g._id}
                      className={`overflow-hidden rounded-[12px] border bg-white ${
                        selected ? "border-2 border-black" : "border-[#e5e7eb]"
                      }`}
                    >
                      <div className="relative flex h-[210px] items-center justify-center bg-[#f6f5f2]">
                        {img ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={img} alt={g.title} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[12px] text-[#c4c7c7]">No image</span>
                        )}
                        {selected && (
                          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black">
                            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[15.5px] font-bold text-black">{g.title}</p>
                        <p className="pt-0.5 text-[12.5px] text-[#6b7280]">
                          {[g.specifications?.fabric, g.specifications?.gsm ? `${g.specifications.gsm} GSM` : null]
                            .filter(Boolean)
                            .join(" · ") || catOf(g)}
                        </p>
                        <p className="pt-2 text-[14px] font-semibold text-black">
                          Base cost: {inr(g.basePrice)}
                        </p>
                        <div className="flex gap-1.5 pt-2.5">
                          {(g.colors ?? []).slice(0, 8).map((c) => (
                            <span
                              key={c}
                              title={c}
                              className="h-3.5 w-3.5 rounded-full border border-[#d1d5db]"
                              style={{ background: COLOR_HEX[c.toLowerCase()] ?? "#e5e7eb" }}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => setGarment(selected ? null : g)}
                          className={`mt-3.5 w-full rounded-[8px] border py-2.5 text-[14px] font-bold ${
                            selected
                              ? "border-black bg-[#f3f4f6] text-black"
                              : "border-[#c4c7c7] text-black hover:border-black"
                          }`}
                        >
                          {selected ? "Selected ✓" : "Select"}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}

        {/* STEP 2: Upload design */}
        {step === 1 && garment && (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div>
              <h1 className="text-[26px] font-bold tracking-[-0.5px] text-black">
                Upload your design
              </h1>
              <p className="pt-1 text-[14.5px] text-[#6b7280]">
                Your design will be printed on the {garment.title}
              </p>
              <button
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  addFiles(e.dataTransfer.files);
                }}
                className="mt-6 flex w-full flex-col items-center rounded-[12px] border border-[#c4c7c7] bg-[#f3f4f6] px-6 py-14 hover:border-black"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
                  <CloudUpload className="h-6 w-6 text-[#374151]" />
                </span>
                <span className="pt-5 text-[18px] font-bold text-black">
                  Drag &amp; drop your artwork
                </span>
                <span className="pt-1 text-[15px] text-black underline">or Browse Files</span>
                <span className="pt-4 text-[12.5px] text-[#6b7280]">
                  PNG, JPG or SVG · Transparent background recommended
                </span>
                <span className="text-[12.5px] text-[#6b7280]">Min 300 DPI · Max 25MB · Up to 5 files</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              {(files.length > 0 || existingImages.length > 0) && (
                <div className="flex flex-wrap gap-3 pt-4">
                  {existingImages.map((url) => (
                    <span key={url} className="relative h-20 w-20 overflow-hidden rounded-[8px] border border-[#e5e7eb]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        aria-label="Remove image"
                        onClick={() => setExistingImages((xs) => xs.filter((x) => x !== url))}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {files.map((f, i) => (
                    <span key={f.preview} className="relative h-20 w-20 overflow-hidden rounded-[8px] border border-[#e5e7eb]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.preview} alt={f.name} className="h-full w-full object-cover" />
                      <button
                        aria-label="Remove file"
                        onClick={() => setFiles((xs) => xs.filter((_, j) => j !== i))}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="flex items-center gap-2 pt-6 text-[14.5px] font-bold text-black">
                <Type className="h-4 w-4" /> Or use our text tool
              </p>
              <p className="pt-1 text-[13px] leading-5 text-[#6b7280]">
                Create text-based artwork in the{" "}
                <Link href="/design-studio" target="_blank" className="font-semibold text-black underline">
                  Design Studio
                </Link>
                , download it, and upload the file here.
              </p>
              <div className="mt-5 rounded-[12px] border border-[#e5e7eb] bg-white p-5 text-[13.5px] leading-6 text-[#374151]">
                <p className="font-bold text-black">ⓘ For best results:</p>
                <ul className="list-disc pl-5 pt-1">
                  <li>Use a transparent PNG or SVG</li>
                  <li>Minimum 2400 × 3200px for full-front prints</li>
                  <li>High contrast against your chosen garment colour</li>
                </ul>
              </div>
            </div>

            {/* Right: garment preview + colors + method */}
            <div>
              <div className="relative overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-[#eceae6]">
                {garmentImg ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={garmentImg} alt={garment.title} className="w-full object-cover" />
                ) : (
                  <div className="flex h-[420px] items-center justify-center text-[13px] text-[#9ca3af]">
                    No garment image
                  </div>
                )}
                <span className="pointer-events-none absolute left-1/2 top-[24%] h-[52%] w-[46%] -translate-x-1/2 rounded border-2 border-dashed border-white/80">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white/80 px-2 py-0.5 text-[10px] font-bold tracking-[0.5px] text-[#6b7280]">
                    PRINT AREA
                  </span>
                </span>
              </div>
              <p className="pt-5 text-[14px] font-bold text-black">Available Garment Colors</p>
              <div className="flex flex-wrap gap-2.5 pt-2.5">
                {(garment.colors ?? []).map((c) => {
                  const active = c.toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      key={c}
                      title={c}
                      aria-label={`Colour ${c}`}
                      onClick={() => setColor(c)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                        active ? "border-black" : "border-[#e5e7eb]"
                      }`}
                      style={{ background: COLOR_HEX[c.toLowerCase()] ?? "#e5e7eb" }}
                    >
                      {active && (
                        <Check
                          className={`h-4 w-4 ${["white", "beige", "yellow", "cream"].includes(c.toLowerCase()) ? "text-black" : "text-white"}`}
                          strokeWidth={3}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="pt-6 text-[14px] font-bold text-black">Select Print Method</p>
              <div className="flex flex-col gap-2.5 pt-2.5">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex items-start gap-3 rounded-[12px] border bg-white p-4 text-left ${
                      method === m.id ? "border-2 border-black" : "border-[#e5e7eb] hover:border-black"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                        method === m.id ? "border-black" : "border-[#c4c7c7]"
                      }`}
                    >
                      {method === m.id && <span className="h-2 w-2 rounded-full bg-black" />}
                    </span>
                    <span>
                      <span className="block text-[14.5px] font-bold text-black">{m.title}</span>
                      <span className="block text-[12.5px] text-[#6b7280]">{m.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Position & preview */}
        {step === 2 && garment && (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_420px]">
            {/* Canvas */}
            <div className="flex items-start justify-center rounded-[12px] border border-[#e5e7eb] bg-[#f0f0ee] p-6">
              <div className="relative w-full max-w-[560px] select-none">
                {garmentImg ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={garmentImg} alt={garment.title} className="w-full rounded-[8px]" draggable={false} />
                ) : (
                  <div className="flex h-[480px] items-center justify-center text-[13px] text-[#9ca3af]">
                    No garment image
                  </div>
                )}
                <div
                  ref={zoneBoxRef}
                  className="absolute left-1/2 top-[24%] h-[52%] w-[46%] -translate-x-1/2 rounded border border-dashed border-black/30"
                >
                  {renderOverlay(true)}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div>
              <h1 className="text-[24px] font-bold tracking-[-0.5px] text-black">
                Position &amp; Preview
              </h1>
              <p className="pt-1 text-[13.5px] text-[#6b7280]">
                Drag the design on the garment or fine-tune the values below.
              </p>
              <div className="mt-5 rounded-[12px] border border-[#e5e7eb] bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-bold text-black">Design Placement</p>
                  <button
                    onClick={() =>
                      setPos((p) => ({ ...p, xCm: 0, yCm: Math.round(Math.max(0, (zone.heightCm - p.heightCm) / 2) * 10) / 10 }))
                    }
                    className="flex items-center gap-1.5 rounded-full border border-[#c4c7c7] px-3.5 py-1.5 text-[12.5px] font-bold text-black hover:border-black"
                  >
                    <Crosshair className="h-3.5 w-3.5" /> Center design
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3.5 pt-4">
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Position X (cm)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={pos.xCm}
                      onChange={(e) => setPos((p) => ({ ...p, xCm: Number(e.target.value) || 0 }))}
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Position Y (cm)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={pos.yCm}
                      onChange={(e) => setPos((p) => ({ ...p, yCm: Math.max(0, Number(e.target.value) || 0) }))}
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Width (cm)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={pos.widthCm}
                      onChange={(e) => setWidth(Number(e.target.value) || 2)}
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Height (cm){designNat ? " · linked" : ""}</span>
                    <input
                      type="number"
                      value={pos.heightCm}
                      readOnly={!!designNat}
                      onChange={(e) =>
                        !designNat && setPos((p) => ({ ...p, heightCm: Number(e.target.value) || 2 }))
                      }
                      className={`${inputCls} ${designNat ? "bg-[#f3f4f6] text-[#6b7280]" : ""}`}
                    />
                  </label>
                  <label className="col-span-2 flex flex-col gap-1.5">
                    <span className={labelCls}>Rotation (deg)</span>
                    <input
                      type="number"
                      step={5}
                      value={pos.rotationDeg}
                      onChange={(e) => setPos((p) => ({ ...p, rotationDeg: Number(e.target.value) || 0 }))}
                      className={inputCls}
                    />
                  </label>
                </div>

                <p className="pt-5 text-[14px] font-bold text-black">Print Zone</p>
                <select
                  value={Math.min(zoneIdx, zones.length - 1)}
                  onChange={(e) => setZoneIdx(Number(e.target.value))}
                  className={`${inputCls} mt-2`}
                >
                  {zones.map((z, i) => (
                    <option key={z.name} value={i}>
                      {z.name}
                    </option>
                  ))}
                </select>
                <p className="pt-1.5 text-[12px] italic text-[#6b7280]">
                  {zone.widthCm}cm × {zone.heightCm}cm maximum area
                </p>

                {dpi !== null && (
                  <div
                    className={`mt-5 rounded-[10px] p-4 text-[13px] leading-5 ${
                      dpiTone === "great"
                        ? "bg-[#f0fdf4] text-[#166534]"
                        : dpiTone === "ok"
                          ? "bg-[#fefce8] text-[#854d0e]"
                          : "bg-[#fef2f2] text-[#991b1b]"
                    }`}
                  >
                    <p className="font-bold">
                      {dpiTone === "great" ? "✓" : "⚠"} {dpi} DPI —{" "}
                      {dpiTone === "great"
                        ? "Excellent print quality"
                        : dpiTone === "ok"
                          ? "Good print quality"
                          : "Low resolution"}
                    </p>
                    <p>
                      Current print size: {pos.widthCm} × {pos.heightCm} cm.{" "}
                      {dpiTone === "great"
                        ? "No pixelation will occur during manufacturing."
                        : dpiTone === "ok"
                          ? "Fine for most designs; very large prints may soften."
                          : "Upload a higher-resolution file or reduce the print size."}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setMockupOpen(true)}
                  disabled={!designUrl}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-orange py-3 text-[14.5px] font-bold text-brand-orange hover:bg-[#fff7ed] disabled:opacity-40"
                >
                  <Sparkles className="h-4 w-4" /> Generate Mockup Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Set pricing */}
        {step === 3 && garment && (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_520px]">
            <div>
              <div className="rounded-[12px] border border-[#e5e7eb] bg-white p-6">
                <div className="relative mx-auto max-w-[480px]">
                  {garmentImg && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={garmentImg} alt={garment.title} className="w-full rounded-[8px]" />
                  )}
                  <div className="absolute left-1/2 top-[24%] h-[52%] w-[46%] -translate-x-1/2">
                    {renderOverlay(false)}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-[12px] border border-[#e5e7eb] bg-white p-5 text-[14px]">
                <span>
                  <span className="block font-bold text-black">
                    {garment.title} · {method} Print
                  </span>
                  <span className="block text-[12.5px] text-[#6b7280]">
                    {[garment.specifications?.gsm ? `${garment.specifications.gsm} GSM` : null, garment.specifications?.fabric, color]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-[12px] text-[#6b7280]">Base cost</span>
                  <span className="block font-bold text-black">{inr(garment.basePrice)}</span>
                </span>
              </div>
            </div>

            <div className="rounded-[12px] border border-[#e5e7eb] bg-white p-6">
              <h2 className="text-[17px] font-bold text-black">Product details</h2>
              <div className="flex flex-col gap-4 pt-4">
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Product Title</span>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., Geometric Wave Abstract Tee"
                    className={inputCls}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Description</span>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Tell the story behind your design…"
                    className="w-full rounded-[8px] border border-[#c4c7c7] p-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Tags (comma separated)</span>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="abstract, geometric, casual"
                    className={inputCls}
                  />
                </label>
              </div>

              <h2 className="pt-6 text-[17px] font-bold text-black">Pricing</h2>
              <div className="grid grid-cols-2 gap-4 pt-3">
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Base Cost</span>
                  <input
                    value={inr(garment.basePrice)}
                    readOnly
                    className={`${inputCls} bg-[#f3f4f6] text-[#6b7280]`}
                  />
                  <span className="text-[11px] text-[#9ca3af]">AB Creation production cost</span>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Your Margin (₹)</span>
                  <input
                    type="number"
                    min={1}
                    value={form.margin}
                    onChange={(e) => setForm((f) => ({ ...f, margin: e.target.value }))}
                    className={inputCls}
                  />
                  <span className="text-[11px] text-[#9ca3af]">Paid to your wallet on delivery</span>
                </label>
              </div>
              <div className="mt-4 rounded-[10px] bg-[#f3f4f6] p-5 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#6b7280]">
                  Final Retail Price
                </p>
                <p className="pt-1 text-[34px] font-bold leading-none text-black">{inr(retail)}</p>
                <p className="pt-1.5 text-[12.5px] text-[#6b7280]">
                  {inr(garment.basePrice)} base + {inr(Number(form.margin) || 0)} your margin
                </p>
              </div>
              {priceHint && (
                <p className="mt-3 rounded-[8px] bg-[#f0fdf4] px-4 py-3 text-[12.5px] text-[#166534]">
                  💡 {priceHint.cat} garments in our catalog have base costs between{" "}
                  {inr(priceHint.low)} and {inr(priceHint.high)} — price your margin with that in mind.
                </p>
              )}

              <p className={`${labelCls} pt-6`}>Size Availability</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2.5">
                {sizeOptions.map((s) => {
                  const on = sizes.includes(s);
                  return (
                    <label
                      key={s}
                      className="flex cursor-pointer items-center gap-1.5 text-[13.5px] font-bold text-black"
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => setSizes((xs) => (on ? xs.filter((x) => x !== s) : [...xs, s]))}
                        className="h-4 w-4 rounded accent-black"
                      />
                      {s}
                    </label>
                  );
                })}
              </div>

              {error && (
                <p className="mt-4 rounded-[8px] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#ba1a1a]">
                  {error}
                </p>
              )}
              <div className="flex items-center gap-3 pt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 rounded-full border-2 border-brand-orange px-6 py-3 text-[14.5px] font-bold text-brand-orange hover:bg-[#fff7ed]"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={() => void submit()}
                  disabled={busy || !canContinue || sizes.length === 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-orange py-3 text-[15px] font-bold text-white hover:opacity-90 disabled:opacity-40"
                >
                  {busy ? "Submitting…" : editId ? "Resubmit for Review 🚀" : "Submit for Review 🚀"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer nav (steps 1–3) */}
      {step < 3 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e5e7eb] bg-white">
          <div className="flex w-full items-center justify-between px-4 py-3.5 sm:px-8">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 rounded-[8px] border border-[#c4c7c7] px-6 py-2.5 text-[14px] font-bold text-black hover:border-black"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <span className="text-[13px] text-[#6b7280]">
                {garment ? `Selected: ${garment.title}` : "Select a garment to continue"}
              </span>
            )}
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue}
              className="flex items-center gap-2 rounded-full bg-brand-orange px-8 py-3 text-[15px] font-bold text-white hover:opacity-90 disabled:opacity-40"
            >
              {step === 2 ? "Continue to Pricing" : "Continue"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mockup preview modal */}
      {mockupOpen && designUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setMockupOpen(false)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-[16px] bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close preview"
              onClick={() => setMockupOpen(false)}
              className="absolute right-4 top-4 text-[#6b7280] hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-[16px] font-bold text-black">Mockup Preview</h3>
            <p className="text-[12.5px] text-[#6b7280]">
              {garment?.title} · {color} · {zone.name} · {pos.widthCm}×{pos.heightCm}cm
            </p>
            <div className="relative mx-auto mt-4 max-w-[460px]">
              {garmentImg && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={garmentImg} alt="" className="w-full rounded-[10px]" />
              )}
              <div className="absolute left-1/2 top-[24%] h-[52%] w-[46%] -translate-x-1/2">
                {renderOverlay(false)}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-white" />}>
      <NewProductWizard />
    </Suspense>
  );
}
