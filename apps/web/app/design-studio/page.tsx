"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getDesign, upsertDesign } from "@/lib/designs";
import { studioFontClasses } from "@/lib/fonts";
import {
  type El,
  FONTS,
  SHAPE_DEFS,
  TEMPLATES,
  TEXT_COLORS,
  ZONES,
  type Zone,
  elDpi,
  newId,
  zoneCfg,
} from "@/lib/studio";
import {
  Upload,
  Type,
  Shapes,
  Sparkles,
  LayoutGrid,
  Layers,
  Undo2,
  Redo2,
  X,
  Minus,
  Plus,
  FlipHorizontal2,
  FlipVertical2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  RotateCw,
  Trash2,
} from "lucide-react";

const SHIRT_COLORS = [
  { name: "White", hex: "#ffffff", display: "#f6f6f6" },
  { name: "Black", hex: "#000000", display: "#1f2224" },
  { name: "Grey", hex: "#9ca3af", display: "#9ca3af" },
  { name: "Navy", hex: "#000080", display: "#1e2a5e" },
];
const PRINT_METHODS = [
  "DTF Printing (Full Color)",
  "Screen Print",
  "Embroidery",
  "Heat Transfer",
];

const sectionLabel = "text-[12px] font-semibold tracking-[0.6px] text-[#444748]";
const fieldLabel = "text-[10px] font-bold uppercase text-[#444748]";

const BACKEND = (process.env.NEXT_PUBLIC_MAIN_BACKEND ?? "").replace(/\/$/, "");

type ProductContext = {
  productId: string;
  slug: string;
  title: string;
  price: number;
  variantsByColor: Record<string, string>;
};

type Picker = "shapes" | "clipart" | "templates" | "layers" | null;

const elName = (el: El) =>
  el.kind === "image"
    ? "Uploaded artwork"
    : el.kind === "text"
      ? `“${(el.text ?? "").slice(0, 18) || "Text"}”`
      : (SHAPE_DEFS[el.shape ?? ""]?.label ?? "Shape");

function DesignStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product");
  const [product, setProduct] = useState<ProductContext | null>(null);

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
        const variantsByColor: Record<string, string> = {};
        for (const v of p.variants ?? []) {
          if (v.color && v._id) variantsByColor[v.color.toLowerCase()] = v._id;
        }
        setProduct({
          productId: p._id,
          slug: p.slug,
          title: p.title,
          price: Math.round(p.basePrice * (1 - (p.discountPercentage || 0) / 100)),
          variantsByColor,
        });
      } catch {
        // studio still works without product context
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  const [color, setColor] = useState(SHIRT_COLORS[0]);
  const [printMethod, setPrintMethod] = useState(PRINT_METHODS[0]);
  const [zone, setZone] = useState<Zone>("front");
  const [els, setEls] = useState<El[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [picker, setPicker] = useState<Picker>(null);
  const [tab, setTab] = useState<"design" | "product" | "inspect">("design");
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [savedFlash, setSavedFlash] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragSnap = useRef<El[] | null>(null);
  const sliderSnap = useRef<El[] | null>(null);
  const textSnap = useRef<El[] | null>(null);
  const draftId = useRef<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  // Always-current els for pure commit/undo logic
  const elsRef = useRef<El[]>([]);

  // ---- Undo / redo -------------------------------------------------------
  const [history, setHistory] = useState<{ past: El[][]; future: El[][] }>({
    past: [],
    future: [],
  });
  const pushPast = useCallback((snapshot: El[]) => {
    setHistory((h) => ({ past: [...h.past.slice(-49), snapshot], future: [] }));
  }, []);
  // Discrete mutation: records the previous state for undo. State updaters
  // must stay pure, so history is pushed OUTSIDE the setEls updater.
  const commit = useCallback(
    (next: El[] | ((prev: El[]) => El[])) => {
      const current = elsRef.current;
      const resolved = typeof next === "function" ? next(current) : next;
      pushPast(current);
      setEls(resolved);
    },
    [pushPast],
  );
  function undo() {
    if (history.past.length === 0) return;
    const prev = history.past[history.past.length - 1];
    setHistory((h) => ({
      past: h.past.slice(0, -1),
      future: [els, ...h.future].slice(0, 50),
    }));
    setEls(prev);
    setSelectedId(null);
  }
  function redo() {
    if (history.future.length === 0) return;
    const next = history.future[0];
    setHistory((h) => ({ past: [...h.past, els], future: h.future.slice(1) }));
    setEls(next);
    setSelectedId(null);
  }

  // ---- Draft load (v2 elements, legacy single-image, ?draft=) ------------
  useEffect(() => {
    try {
      const wanted = searchParams.get("draft");
      let d: Record<string, unknown> | null = null;
      if (wanted) {
        const saved = getDesign(wanted);
        if (saved) {
          draftId.current = saved.id;
          d = saved.state as Record<string, unknown>;
        }
      }
      if (!d) {
        const raw = localStorage.getItem("ab:design");
        if (!raw) return;
        d = JSON.parse(raw);
      }
      if (!d) return;
      if (Array.isArray(d.els) && d.els.length > 0) {
        setEls(d.els as El[]);
      } else if (d.image) {
        // Legacy single-image draft → one image element
        const p = (d.placement as { xPct: number; yPct: number; scale: number; rotation: number }) ?? {
          xPct: 50, yPct: 50, scale: 1, rotation: 0,
        };
        setEls([
          {
            id: newId(),
            kind: "image",
            zone: ((d.zone as Zone) ?? "front"),
            xPct: p.xPct, yPct: p.yPct, scale: p.scale, rotation: p.rotation,
            flipH: false, flipV: false,
            opacity: typeof d.opacity === "number" ? d.opacity : 100,
            src: d.image as string,
          },
        ]);
      }
      if (d.colorName) {
        const c = SHIRT_COLORS.find((x) => x.name === d.colorName);
        if (c) setColor(c);
      }
      if (typeof d.printMethod === "string") setPrintMethod(d.printMethod);
      if (typeof d.zone === "string" && ZONES.some((z) => z.id === d.zone)) {
        setZone(d.zone as Zone);
      }
    } catch {
      // corrupted draft — start fresh
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Element helpers ---------------------------------------------------
  elsRef.current = els;
  const zoneEls = els.filter((e) => e.zone === zone);
  const selected = els.find((e) => e.id === selectedId) ?? null;

  function selectEl(id: string) {
    setSelectedId(id);
    setTab("design");
  }

  const baseEl = (kind: El["kind"]): El => ({
    id: newId(),
    kind,
    zone,
    xPct: 50,
    yPct: 50,
    scale: kind === "text" ? 0.9 : 0.7,
    rotation: 0,
    flipH: false,
    flipV: false,
    opacity: 100,
  });

  function addImage(src: string) {
    const img = new Image();
    img.onload = () => {
      const el: El = { ...baseEl("image"), src, natW: img.naturalWidth, natH: img.naturalHeight };
      commit((prev) => [...prev, el]);
      setSelectedId(el.id);
    };
    img.src = src;
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => addImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function addText() {
    const el: El = { ...baseEl("text"), text: "Your text", font: "sans", bold: true, textColor: color.name === "Black" || color.name === "Navy" ? "#ffffff" : "#111111" };
    commit((prev) => [...prev, el]);
    setSelectedId(el.id);
    setTab("design");
  }

  function addShape(key: string) {
    const el: El = { ...baseEl("shape"), shape: key, fill: color.name === "Black" || color.name === "Navy" ? "#ffffff" : "#111111" };
    commit((prev) => [...prev, el]);
    setSelectedId(el.id);
    setPicker(null);
    setTab("design");
  }

  function applyTemplate(id: string) {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    const added = t.els.map((partial) => ({ ...baseEl((partial.kind ?? "text") as El["kind"]), ...partial, id: newId(), zone }));
    commit((prev) => [...prev, ...(added as El[])]);
    setSelectedId(added[added.length - 1]?.id ?? null);
    setPicker(null);
  }

  const updateSel = useCallback(
    (patch: Partial<El>, record = false) => {
      if (!selectedId) return;
      const apply = (prev: El[]) => prev.map((e) => (e.id === selectedId ? { ...e, ...patch } : e));
      if (record) commit(apply);
      else setEls(apply);
    },
    [selectedId, commit],
  );

  function removeEl(id: string) {
    commit((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function duplicateSel() {
    if (!selected) return;
    const copy: El = { ...selected, id: newId(), xPct: Math.min(90, selected.xPct + 6), yPct: Math.min(90, selected.yPct + 6) };
    commit((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  }

  function reorder(id: string, dir: -1 | 1) {
    commit((prev) => {
      const i = prev.findIndex((e) => e.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  // Keyboard: delete removes selection, escape deselects (never while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        removeEl(selectedId);
      }
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // ---- Canvas drag -------------------------------------------------------
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || !areaRef.current || !selectedId) return;
    const rect = areaRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    updateSel({
      xPct: Math.max(5, Math.min(95, xPct)),
      yPct: Math.max(5, Math.min(95, yPct)),
    });
  }
  function endDrag() {
    // Record for undo only when the drag actually moved something
    if (dragging.current && dragSnap.current && dragSnap.current !== els) {
      pushPast(dragSnap.current);
    }
    dragging.current = false;
    dragSnap.current = null;
  }

  // ---- Persistence -------------------------------------------------------
  const primaryImage = els.find((e) => e.kind === "image" && !e.hidden) ?? els.find((e) => e.kind === "image");
  function designState() {
    return {
      version: 2,
      els,
      // Legacy fields so older consumers (dashboard cards, cart meta) keep working
      image: primaryImage?.src ?? null,
      colorName: color.name,
      colorHex: color.hex,
      colorDisplay: color.display,
      printMethod,
      zone,
      placement: primaryImage
        ? { xPct: primaryImage.xPct, yPct: primaryImage.yPct, scale: primaryImage.scale, rotation: primaryImage.rotation }
        : { xPct: 50, yPct: 50, scale: 1, rotation: 0 },
      opacity: primaryImage?.opacity ?? 100,
      product: product
        ? {
            productId: product.productId,
            slug: product.slug,
            title: product.title,
            price: product.price,
            variantId: product.variantsByColor[color.name.toLowerCase()],
          }
        : null,
    };
  }

  function saveDraft() {
    try {
      localStorage.setItem("ab:design", JSON.stringify(designState()));
      const saved = upsertDesign(draftId.current, designState());
      draftId.current = saved.id;
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch {
      // storage full (large artwork) — draft stays in memory only
    }
  }

  function goToPreview() {
    try {
      localStorage.setItem("ab:design", JSON.stringify(designState()));
      const saved = upsertDesign(draftId.current, designState());
      draftId.current = saved.id;
    } catch {
      // storage full — preview falls back to defaults
    }
    router.push("/design-studio/preview");
  }

  // ---- Derived readouts --------------------------------------------------
  const AREA = 300;
  const cfg = zoneCfg(zone);
  const selW = selected ? Math.round(AREA * 0.65 * selected.scale) : 0;
  const selH =
    selected?.kind === "image" && selected.natW && selected.natH
      ? Math.round(selW * (selected.natH / selected.natW))
      : selW;
  const selDpi = selected ? elDpi(selected) : null;
  const dpiGreat = selDpi === null || selDpi >= 200;

  const imageEls = els.filter((e) => e.kind === "image" && !e.hidden);
  const lowDpiCount = imageEls.filter((e) => (elDpi(e) ?? 999) < 200).length;

  const renderElContent = (el: El) => {
    if (el.kind === "image" && el.src) {
      /* eslint-disable-next-line @next/next/no-img-element */
      return <img src={el.src} alt="" className="block w-full select-none" draggable={false} />;
    }
    if (el.kind === "text") {
      // Box width in px: tee is 380px wide, element box = 65% of zone × scale
      const raw = el.uppercase ? (el.text ?? "").toUpperCase() : (el.text ?? "");
      const areaWPct = parseFloat(zoneCfg(el.zone).area.width) / 100;
      const boxPx = 380 * areaWPct * 0.65 * el.scale;
      const fontPx = Math.max(9, boxPx / Math.max(4, raw.length * 0.62));
      return (
        <span
          className="block whitespace-nowrap text-center leading-none"
          style={{
            fontFamily: FONTS[el.font ?? "sans"]?.stack,
            fontWeight: el.bold ? 700 : 400,
            color: el.textColor ?? "#111111",
            fontSize: `${fontPx}px`,
            letterSpacing: `${((el.letterSpacing ?? 0) * fontPx) / 40}px`,
            WebkitTextStroke:
              (el.strokeWidth ?? 0) > 0
                ? `${Math.max(0.5, ((el.strokeWidth ?? 1) * fontPx) / 56)}px ${el.strokeColor ?? "#ffffff"}`
                : undefined,
          }}
        >
          {raw}
        </span>
      );
    }
    if (el.kind === "shape" && el.shape && SHAPE_DEFS[el.shape]) {
      return (
        <svg viewBox="0 0 100 100" className="block w-full">
          <path d={SHAPE_DEFS[el.shape].path} fill={el.fill ?? "#111111"} fillRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  // Text sizing needs a container-query unit; give elements a container
  const elBox = (el: El, isSelected: boolean) => (
    <div
      key={el.id}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${el.xPct}%`,
        top: `${el.yPct}%`,
        width: `${el.scale * 65}%`,
        zIndex: els.indexOf(el) + 1,
      }}
    >
      <div
        className={`relative ${isSelected ? "border-[1.5px] border-[#3b82f6]" : "border-[1.5px] border-transparent"}`}
        style={{
          transform: `rotate(${el.rotation}deg) scaleX(${el.flipH ? -1 : 1}) scaleY(${el.flipV ? -1 : 1})`,
          opacity: el.opacity / 100,
        }}
      >
        {isSelected && (
          <button
            aria-label="Rotate element"
            onClick={() => updateSel({ rotation: (el.rotation + 15) % 360 }, true)}
            className="absolute -top-8 left-1/2 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-[#3b82f6] bg-white text-[#3b82f6]"
          >
            <RotateCw className="h-3 w-3" />
          </button>
        )}
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            selectEl(el.id);
            dragging.current = true;
            dragSnap.current = els;
          }}
          onDoubleClick={() => {
            if (el.kind === "text") {
              selectEl(el.id);
              setTimeout(() => textInputRef.current?.focus(), 0);
            }
          }}
          className="cursor-move touch-none"
        >
          {renderElContent(el)}
        </div>
        {isSelected &&
          [
            "-left-1 -top-1", "left-1/2 -top-1 -translate-x-1/2", "-right-1 -top-1",
            "-left-1 top-1/2 -translate-y-1/2", "-right-1 top-1/2 -translate-y-1/2",
            "-left-1 -bottom-1", "left-1/2 -bottom-1 -translate-x-1/2", "-right-1 -bottom-1",
          ].map((pos) => (
            <span key={pos} className={`absolute ${pos} h-2 w-2 border border-[#3b82f6] bg-white`} />
          ))}
      </div>
    </div>
  );

  // ---- Pickers (rendered via function call) ------------------------------
  const renderPicker = () => {
    if (!picker) return null;
    if (picker === "layers") {
      const ordered = [...zoneEls].reverse(); // top-most first
      return (
        <div className="absolute left-0 top-0 z-40 max-h-[420px] w-64 overflow-y-auto rounded-r-xl border border-[#c4c7c7] bg-white p-3 shadow-lg lg:left-16">
          <div className="flex items-center justify-between pb-2">
            <p className="text-[12px] font-bold uppercase tracking-[0.6px] text-black">
              Layers — {cfg.label}
            </p>
            <button aria-label="Close layers" onClick={() => setPicker(null)} className="text-[#6b7280] hover:text-black">
              <X className="h-4 w-4" />
            </button>
          </div>
          {ordered.length === 0 && (
            <p className="py-4 text-[12px] text-[#9ca3af]">Nothing on this zone yet.</p>
          )}
          {ordered.map((el) => (
            <div
              key={el.id}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 ${selectedId === el.id ? "bg-[#f3f3f4]" : ""}`}
            >
              <button
                onClick={() => selectEl(el.id)}
                className="min-w-0 flex-1 truncate text-left text-[12.5px] font-semibold text-black"
              >
                {elName(el)}
              </button>
              <button
                aria-label={el.hidden ? "Show" : "Hide"}
                onClick={() => commit((prev) => prev.map((e) => (e.id === el.id ? { ...e, hidden: !e.hidden } : e)))}
                className="p-1 text-[#6b7280] hover:text-black"
              >
                {el.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button aria-label="Bring forward" onClick={() => reorder(el.id, 1)} className="p-1 text-[#6b7280] hover:text-black">
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button aria-label="Send backward" onClick={() => reorder(el.id, -1)} className="p-1 text-[#6b7280] hover:text-black">
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button aria-label="Delete layer" onClick={() => removeEl(el.id)} className="p-1 text-[#dc2626] hover:opacity-70">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      );
    }
    if (picker === "templates") {
      return (
        <div className="absolute left-0 top-0 z-40 w-64 rounded-r-xl border border-[#c4c7c7] bg-white p-3 shadow-lg lg:left-16">
          <div className="flex items-center justify-between pb-2">
            <p className="text-[12px] font-bold uppercase tracking-[0.6px] text-black">Templates</p>
            <button aria-label="Close templates" onClick={() => setPicker(null)} className="text-[#6b7280] hover:text-black">
              <X className="h-4 w-4" />
            </button>
          </div>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t.id)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2.5 text-[13px] font-semibold text-black hover:bg-[#f3f3f4]"
            >
              {t.label}
              <span className="text-[10px] font-bold uppercase text-[#9ca3af]">
                {t.els.length} layer{t.els.length === 1 ? "" : "s"}
              </span>
            </button>
          ))}
          <p className="px-2 pt-1 text-[10.5px] leading-4 text-[#9ca3af]">
            Starter layouts — every layer stays editable.
          </p>
        </div>
      );
    }
    const category = picker === "shapes" ? "shape" : "clipart";
    const entries = Object.entries(SHAPE_DEFS).filter(([, d]) => d.category === category);
    return (
      <div className="absolute left-0 top-0 z-40 max-h-[440px] w-64 overflow-y-auto rounded-r-xl border border-[#c4c7c7] bg-white p-3 shadow-lg lg:left-16">
        <div className="flex items-center justify-between pb-2">
          <p className="text-[12px] font-bold uppercase tracking-[0.6px] text-black">
            {picker === "shapes" ? "Shapes" : "Clipart"}
          </p>
          <button aria-label="Close picker" onClick={() => setPicker(null)} className="text-[#6b7280] hover:text-black">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {entries.map(([key, def]) => (
            <button
              key={key}
              title={def.label}
              onClick={() => addShape(key)}
              className="flex aspect-square items-center justify-center rounded-lg border border-[#e5e7eb] p-2.5 hover:border-black"
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <path d={def.path} fill="#1a1c1c" fillRule="evenodd" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const TOOLS: { icon: typeof Upload; label: string; onClick: () => void; active?: boolean }[] = [
    { icon: Upload, label: "Upload", onClick: () => fileRef.current?.click() },
    { icon: Type, label: "Text", onClick: addText },
    { icon: Shapes, label: "Shapes", onClick: () => setPicker((p) => (p === "shapes" ? null : "shapes")), active: picker === "shapes" },
    { icon: Sparkles, label: "Clipart", onClick: () => setPicker((p) => (p === "clipart" ? null : "clipart")), active: picker === "clipart" },
    { icon: LayoutGrid, label: "Templates", onClick: () => setPicker((p) => (p === "templates" ? null : "templates")), active: picker === "templates" },
  ];

  return (
    <div className={`flex min-h-[calc(100vh-113px)] flex-col bg-[#e8e8e8] ${studioFontClasses}`}>
      {/* Top bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#c4c7c7] bg-white px-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="hidden text-[18px] font-extrabold tracking-tight text-black sm:block">
            AB CREATION
          </span>
          <span className="hidden h-6 w-px bg-[#c4c7c7] sm:block" />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold text-black">
              {product?.title ?? "Round Neck T-Shirt"}
            </p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[1px] text-[#444748]">
              {color.name} · {printMethod.split(" ")[0]} Printing
            </p>
          </div>
        </div>

        {/* Front / Back segmented control */}
        <div className="hidden rounded-full bg-[#f3f3f4] p-1 md:flex">
          {(["front", "back"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setZone(s);
                setSelectedId(null);
              }}
              className={`rounded-full px-6 py-1.5 text-[13px] font-semibold capitalize transition-colors ${
                (zone === "back" ? "back" : "front") === s && (zone === "front" || zone === "back")
                  ? "bg-white text-black shadow-[0px_1px_2px_rgba(0,0,0,0.1)]"
                  : "text-[#444748]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/design-editor"
            className="hidden rounded-full border border-[#c4c7c7] bg-white px-4 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-[#f3f3f4] md:block"
            title="Advanced multi-layer editor with curved text, filters and PDF spec sheets"
          >
            Pro Editor
          </Link>
          <button
            onClick={saveDraft}
            className="rounded-full border border-[#c4c7c7] bg-white px-4 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-[#f3f3f4]"
          >
            {savedFlash ? "Saved ✓" : "Save Draft"}
          </button>
          <button
            onClick={goToPreview}
            className="rounded-full bg-brand-orange px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Preview &amp; Order
          </button>
          <span className="h-6 w-px bg-[#c4c7c7]" />
          <Link
            href="/collection"
            aria-label="Close editor"
            className="text-black hover:text-brand-orange"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col lg:flex-row">
        {/* Left toolbar */}
        <aside className="flex shrink-0 flex-row items-center justify-between border-b border-[#c4c7c7] bg-white px-2 py-2 lg:w-16 lg:flex-col lg:border-b-0 lg:border-r lg:px-0 lg:py-4">
          <div className="flex flex-row gap-1 lg:flex-col lg:gap-2">
            {TOOLS.map(({ icon: Icon, label, onClick, active }) => (
              <button
                key={label}
                onClick={onClick}
                className={`flex w-14 flex-col items-center gap-1 rounded-lg py-2 transition-colors ${
                  active ? "bg-[#f3f3f4] text-black" : "text-[#444748] hover:bg-[#f3f3f4] hover:text-black"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[9px] font-bold uppercase tracking-[0.5px]">{label}</span>
              </button>
            ))}
            <div className="mx-2 hidden border-t border-[#c4c7c7] lg:block" />
            <button
              onClick={() => setPicker((p) => (p === "layers" ? null : "layers"))}
              className={`flex w-14 flex-col items-center gap-1 rounded-lg py-2 transition-colors ${
                picker === "layers" ? "bg-[#f3f3f4] text-black" : "text-[#444748] hover:bg-[#f3f3f4] hover:text-black"
              }`}
            >
              <Layers className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-[0.5px]">
                Layers{zoneEls.length > 0 ? ` (${zoneEls.length})` : ""}
              </span>
            </button>
          </div>
          <div className="flex flex-row gap-1 lg:flex-col lg:gap-2">
            <button
              aria-label="Undo"
              onClick={undo}
              disabled={history.past.length === 0}
              className="flex h-10 w-14 items-center justify-center rounded-lg text-[#444748] hover:bg-[#f3f3f4] disabled:cursor-not-allowed disabled:text-[#c4c7c7]"
            >
              <Undo2 className="h-5 w-5" />
            </button>
            <button
              aria-label="Redo"
              onClick={redo}
              disabled={history.future.length === 0}
              className="flex h-10 w-14 items-center justify-center rounded-lg text-[#444748] hover:bg-[#f3f3f4] disabled:cursor-not-allowed disabled:text-[#c4c7c7]"
            >
              <Redo2 className="h-5 w-5" />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
        </aside>

        {renderPicker()}

        {/* Center canvas */}
        <main
          className="relative flex flex-1 items-center justify-center overflow-hidden p-8"
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[62%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white/70" />

          <div className="relative" style={{ transform: `scale(${canvasZoom})` }}>
            <div
              className="relative h-[440px] w-[380px]"
              style={{
                background: color.display,
                clipPath:
                  "polygon(20% 8%, 35% 0, 65% 0, 80% 8%, 100% 20%, 88% 34%, 82% 26%, 82% 100%, 18% 100%, 18% 26%, 12% 34%, 0 20%)",
                boxShadow: "inset 0 4px 24px rgba(0,0,0,0.12)",
              }}
            >
              <div
                ref={areaRef}
                onPointerMove={onPointerMove}
                onPointerDown={() => setSelectedId(null)}
                className="absolute border-[1.5px] border-dashed border-[#9ca3af]"
                style={cfg.area}
              >
                <span
                  className={`absolute -top-6 left-0 whitespace-nowrap text-[10px] font-bold uppercase tracking-[1.5px] ${
                    color.name === "White" ? "text-[#9ca3af]" : "text-white/70"
                  }`}
                >
                  {cfg.label} print area
                </span>

                {zoneEls.filter((e) => !e.hidden).map((el) => elBox(el, el.id === selectedId))}

                {zoneEls.length === 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fileRef.current?.click();
                    }}
                    className={`flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] ${
                      color.name === "White" ? "text-black/40" : "text-white/60"
                    }`}
                  >
                    <Upload className="h-5 w-5" />
                    Drop design here — or add text, shapes, templates
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Right panel */}
        <aside className="flex w-full shrink-0 flex-col border-t border-[#c4c7c7] bg-white lg:w-80 lg:border-l lg:border-t-0">
          <div className="flex gap-6 border-b border-[#c4c7c7] px-4">
            {(["design", "product", "inspect"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-4 text-[12px] font-semibold capitalize tracking-[0.6px] ${
                  tab === t ? "-mb-px border-b-2 border-black text-black" : "text-[#9ca3af] hover:text-black"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-8 p-6">
            {tab === "design" && (
              <>
                {!selected ? (
                  <p className="rounded-[12px] bg-[#f9f9f9] p-4 text-[13px] leading-5 text-[#6b7280]">
                    Select an element on the canvas — or add one from the toolbar
                    (Upload, Text, Shapes, Clipart, Templates).
                  </p>
                ) : (
                  <>
                    <section className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h3 className={sectionLabel}>{elName(selected)}</h3>
                        <div className="flex items-center gap-1">
                          <button
                            aria-label="Duplicate element"
                            onClick={duplicateSel}
                            className="rounded-lg p-2 text-[#444748] hover:bg-[#f3f3f4] hover:text-black"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            aria-label="Delete element"
                            onClick={() => removeEl(selected.id)}
                            className="rounded-lg p-2 text-[#dc2626] hover:bg-[#fef2f2]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          ["X Position", `${Math.round((selected.xPct / 100) * AREA)} px`],
                          ["Y Position", `${Math.round((selected.yPct / 100) * AREA)} px`],
                          ["Width", `${selW} px`],
                          ["Height", `${selH} px`],
                        ].map(([label, val]) => (
                          <div key={label} className="flex flex-col gap-1.5">
                            <span className={fieldLabel}>{label}</span>
                            <div className="flex h-10 items-center rounded-[8px] bg-[#f9f9f9] px-3 text-[14px] text-[#1a1c1c]">
                              {val}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button
                          aria-label="Flip horizontal"
                          onClick={() => updateSel({ flipH: !selected.flipH }, true)}
                          className={`flex h-10 flex-1 items-center justify-center rounded-[8px] border ${
                            selected.flipH ? "border-black bg-[#f3f3f4] text-black" : "border-[#c4c7c7] text-[#444748] hover:border-black"
                          }`}
                        >
                          <FlipHorizontal2 className="h-4 w-4" />
                        </button>
                        <button
                          aria-label="Flip vertical"
                          onClick={() => updateSel({ flipV: !selected.flipV }, true)}
                          className={`flex h-10 flex-1 items-center justify-center rounded-[8px] border ${
                            selected.flipV ? "border-black bg-[#f3f3f4] text-black" : "border-[#c4c7c7] text-[#444748] hover:border-black"
                          }`}
                        >
                          <FlipVertical2 className="h-4 w-4" />
                        </button>
                      </div>

                      {(
                        [
                          ["Opacity", selected.opacity, 10, 100, 1, (v: number) => updateSel({ opacity: v })],
                          ["Scale", selected.scale, 0.2, 2, 0.05, (v: number) => updateSel({ scale: v })],
                          ["Rotation", selected.rotation, 0, 359, 1, (v: number) => updateSel({ rotation: v })],
                        ] as const
                      ).map(([label, value, min, max, step, set]) => (
                        <label key={label} className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className={fieldLabel}>{label}</span>
                            <span className="text-[14px] font-bold text-[#1a1c1c]">
                              {label === "Scale" ? `${(value as number).toFixed(2)}×` : label === "Rotation" ? `${value}°` : `${value}%`}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={value as number}
                            onPointerDown={() => (sliderSnap.current = els)}
                            onPointerUp={() => {
                              if (sliderSnap.current) pushPast(sliderSnap.current);
                              sliderSnap.current = null;
                            }}
                            onChange={(e) => set(Number(e.target.value))}
                            className="h-1.5 w-full accent-black"
                          />
                        </label>
                      ))}
                    </section>

                    {selected.kind === "text" && (
                      <section className="flex flex-col gap-4 border-t border-[#c4c7c7] pt-6">
                        <h3 className={sectionLabel}>Text</h3>
                        <input
                          ref={textInputRef}
                          value={selected.text ?? ""}
                          onFocus={() => (textSnap.current = els)}
                          onChange={(e) => updateSel({ text: e.target.value })}
                          onBlur={() => {
                            if (textSnap.current && textSnap.current !== els) {
                              pushPast(textSnap.current);
                            }
                            textSnap.current = null;
                          }}
                          placeholder="Your text"
                          className="h-11 w-full rounded-[8px] border border-[#c4c7c7] bg-[#f9f9f9] px-3 text-[14px] text-[#1a1c1c] focus:border-brand-orange focus:outline-none"
                        />
                        <div>
                          <span className={fieldLabel}>Font Style</span>
                          <div className="mt-2 grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1">
                            {Object.entries(FONTS)
                              .filter(([key]) => !["display", "script"].includes(key))
                              .map(([key, f]) => (
                                <button
                                  key={key}
                                  onClick={() => updateSel({ font: key }, true)}
                                  className={`flex h-12 flex-col items-center justify-center rounded-[8px] border px-2 ${
                                    (selected.font ?? "sans") === key
                                      ? "border-2 border-black bg-[#f3f3f4]"
                                      : "border-[#c4c7c7] hover:border-black"
                                  }`}
                                >
                                  <span
                                    className="max-w-full truncate text-[15px] leading-none text-[#1a1c1c]"
                                    style={{ fontFamily: f.stack }}
                                  >
                                    Aa Bb
                                  </span>
                                  <span className="max-w-full truncate pt-1 text-[8.5px] font-bold uppercase tracking-[0.4px] text-[#9ca3af]">
                                    {f.label}
                                  </span>
                                </button>
                              ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateSel({ bold: !selected.bold }, true)}
                            className={`h-10 flex-1 rounded-[8px] border text-[14px] font-bold ${
                              selected.bold ? "border-black bg-black text-white" : "border-[#c4c7c7] text-black"
                            }`}
                          >
                            Bold
                          </button>
                          <button
                            onClick={() => updateSel({ uppercase: !selected.uppercase }, true)}
                            className={`h-10 flex-1 rounded-[8px] border text-[13px] font-bold ${
                              selected.uppercase ? "border-black bg-black text-white" : "border-[#c4c7c7] text-black"
                            }`}
                          >
                            AA
                          </button>
                        </div>
                        <label className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className={fieldLabel}>Letter Spacing</span>
                            <span className="text-[14px] font-bold text-[#1a1c1c]">
                              {selected.letterSpacing ?? 0}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={12}
                            step={1}
                            value={selected.letterSpacing ?? 0}
                            onPointerDown={() => (sliderSnap.current = els)}
                            onPointerUp={() => {
                              if (sliderSnap.current) pushPast(sliderSnap.current);
                              sliderSnap.current = null;
                            }}
                            onChange={(e) => updateSel({ letterSpacing: Number(e.target.value) })}
                            className="h-1.5 w-full accent-black"
                          />
                        </label>
                        <div className="flex flex-col gap-2">
                          <span className={fieldLabel}>Text Colour</span>
                          <div className="flex flex-wrap items-center gap-2">
                            {TEXT_COLORS.map((c) => (
                              <button
                                key={c}
                                aria-label={`Text colour ${c}`}
                                onClick={() => updateSel({ textColor: c }, true)}
                                className={`h-7 w-7 rounded-full border ${
                                  selected.textColor === c ? "border-2 border-black" : "border-[#c4c7c7]"
                                }`}
                                style={{ background: c }}
                              />
                            ))}
                            <input
                              type="color"
                              aria-label="Custom text colour"
                              value={selected.textColor ?? "#111111"}
                              onChange={(e) => updateSel({ textColor: e.target.value })}
                              onBlur={() => pushPast(els)}
                              className="h-7 w-9 cursor-pointer rounded border border-[#c4c7c7] bg-white p-0.5"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className={fieldLabel}>Outline</span>
                          <div className="flex gap-2">
                            {([
                              [0, "None"],
                              [1, "Thin"],
                              [2, "Thick"],
                            ] as const).map(([w, label]) => (
                              <button
                                key={label}
                                onClick={() => updateSel({ strokeWidth: w }, true)}
                                className={`h-9 flex-1 rounded-[8px] border text-[12.5px] font-bold ${
                                  (selected.strokeWidth ?? 0) === w
                                    ? "border-black bg-black text-white"
                                    : "border-[#c4c7c7] text-black"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                          {(selected.strokeWidth ?? 0) > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {TEXT_COLORS.map((c) => (
                                <button
                                  key={c}
                                  aria-label={`Outline colour ${c}`}
                                  onClick={() => updateSel({ strokeColor: c }, true)}
                                  className={`h-6 w-6 rounded-full border ${
                                    (selected.strokeColor ?? "#ffffff") === c
                                      ? "border-2 border-black"
                                      : "border-[#c4c7c7]"
                                  }`}
                                  style={{ background: c }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </section>
                    )}

                    {selected.kind === "shape" && (
                      <section className="flex flex-col gap-4 border-t border-[#c4c7c7] pt-6">
                        <h3 className={sectionLabel}>Fill Colour</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {TEXT_COLORS.map((c) => (
                            <button
                              key={c}
                              aria-label={`Fill colour ${c}`}
                              onClick={() => updateSel({ fill: c }, true)}
                              className={`h-7 w-7 rounded-full border ${
                                selected.fill === c ? "border-2 border-black" : "border-[#c4c7c7]"
                              }`}
                              style={{ background: c }}
                            />
                          ))}
                          <input
                            type="color"
                            aria-label="Custom fill colour"
                            value={selected.fill ?? "#111111"}
                            onChange={(e) => updateSel({ fill: e.target.value })}
                            onBlur={() => pushPast(els)}
                            className="h-7 w-9 cursor-pointer rounded border border-[#c4c7c7] bg-white p-0.5"
                          />
                        </div>
                      </section>
                    )}

                    {selected.kind === "image" && (
                      <section className="flex flex-col gap-3 border-t border-[#c4c7c7] pt-6">
                        <h3 className={sectionLabel}>Print Quality</h3>
                        <div className="flex flex-col gap-3 rounded-[12px] bg-[#f9f9f9] p-4">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <CheckCircle2 className={`h-4 w-4 ${dpiGreat ? "text-[#16a34a]" : "text-[#dc2626]"}`} />
                              <span className={`text-[14px] font-bold ${dpiGreat ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
                                {dpiGreat ? "Great Print Quality" : "Low Print Quality"}
                              </span>
                            </span>
                            <span className="text-[14px] font-bold text-[#1a1c1c]">
                              {selDpi ?? "—"} DPI
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8e8e8]">
                            <div
                              className={`h-full rounded-full ${dpiGreat ? "bg-[#22c55e]" : "bg-[#dc2626]"}`}
                              style={{ width: `${Math.min(100, Math.round(((selDpi ?? 0) / 375) * 100))}%` }}
                            />
                          </div>
                          <div className="flex items-start justify-between gap-2 text-[11px] leading-[16.5px] text-[#444748]">
                            <span>
                              File: {selected.natW ?? "?"} × {selected.natH ?? "?"} px
                            </span>
                            <span>
                              Prints ≈ {(cfg.widthIn * 0.65 * selected.scale).toFixed(1)}&quot; wide
                            </span>
                          </div>
                        </div>
                      </section>
                    )}
                  </>
                )}
              </>
            )}

            {tab === "product" && (
              <>
                <section className="flex flex-col gap-4">
                  <h3 className={sectionLabel}>Product Options</h3>
                  <div className="flex flex-col gap-3">
                    <span className={fieldLabel}>Color</span>
                    <div className="flex items-center gap-2">
                      {SHIRT_COLORS.map((c) => {
                        const isSel = color.name === c.name;
                        return (
                          <button
                            key={c.name}
                            title={c.name}
                            onClick={() => setColor(c)}
                            className={`h-8 w-8 rounded-full border ${
                              isSel ? "border-2 border-black ring-2 ring-inset ring-white" : "border-[#c4c7c7]"
                            }`}
                            style={{ background: c.hex }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <span className={fieldLabel}>Print Method</span>
                    <div className="relative">
                      <select
                        value={printMethod}
                        onChange={(e) => setPrintMethod(e.target.value)}
                        className="h-11 w-full appearance-none rounded-[8px] border border-[#c4c7c7] bg-[#f9f9f9] px-3 text-[14px] text-[#1a1c1c] focus:border-brand-orange focus:outline-none"
                      >
                        {PRINT_METHODS.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#444748]" />
                    </div>
                  </div>
                  {product && (
                    <p className="rounded-[12px] bg-[#f9f9f9] p-4 text-[13px] leading-5 text-[#444748]">
                      Designing on <b className="text-black">{product.title}</b> — garment cost ₹
                      {product.price.toLocaleString("en-IN")}.
                    </p>
                  )}
                </section>

                <section className="flex flex-col gap-4 border-t border-[#c4c7c7] pt-6">
                  <h3 className={sectionLabel}>Print Zones</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {ZONES.map((z) => {
                      const isSel = zone === z.id;
                      const count = els.filter((e) => e.zone === z.id).length;
                      return (
                        <button
                          key={z.id}
                          onClick={() => {
                            setZone(z.id);
                            setSelectedId(null);
                          }}
                          className={`flex flex-col items-center gap-2 rounded-[12px] py-3.5 ${
                            isSel ? "border-2 border-black bg-[#f3f3f4]" : "border border-[#c4c7c7]"
                          }`}
                        >
                          <span className={`text-[11px] font-bold ${isSel ? "text-[#1a1c1c]" : "text-[#444748]"}`}>
                            {z.label}
                            {count > 0 ? ` · ${count}` : ""}
                          </span>
                          <span className={`h-1.5 w-1.5 rounded-full ${isSel ? "bg-black" : "bg-[#c4c7c7]"}`} />
                        </button>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {tab === "inspect" && (
              <section className="flex flex-col gap-4">
                <h3 className={sectionLabel}>Design Summary</h3>
                {els.length === 0 ? (
                  <p className="rounded-[12px] bg-[#f9f9f9] p-4 text-[13px] text-[#6b7280]">
                    Nothing on the garment yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {ZONES.filter((z) => els.some((e) => e.zone === z.id)).map((z) => (
                      <div key={z.id} className="rounded-[12px] bg-[#f9f9f9] p-4">
                        <p className="text-[12px] font-bold uppercase tracking-[0.6px] text-black">
                          {z.label}
                        </p>
                        {els
                          .filter((e) => e.zone === z.id)
                          .map((e) => {
                            const d = elDpi(e);
                            return (
                              <div key={e.id} className="flex items-center justify-between pt-2 text-[12.5px]">
                                <span className={e.hidden ? "text-[#c4c7c7] line-through" : "text-[#444748]"}>
                                  {elName(e)}
                                </span>
                                <span
                                  className={`font-semibold ${
                                    d === null ? "text-[#16a34a]" : d >= 200 ? "text-[#16a34a]" : "text-[#dc2626]"
                                  }`}
                                >
                                  {d === null ? "Vector" : `${d} DPI`}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                )}
                {lowDpiCount > 0 && (
                  <p className="flex items-start gap-2 rounded-[12px] bg-[#fef2f2] p-4 text-[12.5px] leading-5 text-[#b91c1c]">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {lowDpiCount} image{lowDpiCount === 1 ? "" : "s"} below 200 DPI —
                    shrink {lowDpiCount === 1 ? "it" : "them"} or upload higher-resolution files.
                  </p>
                )}
                <p className="text-[11.5px] leading-4 text-[#9ca3af]">
                  Text and shapes are vector — they print sharp at any size. Image
                  DPI is computed from the file&apos;s real pixels and its printed
                  width on the garment.
                </p>
              </section>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom status bar */}
      <div className="flex h-8 shrink-0 items-center justify-between border-t border-[#c4c7c7] bg-white px-4 text-[11px] text-[#444748]">
        <div className="flex items-center gap-3">
          <span className="capitalize">Zone: {cfg.label}</span>
          <span className="h-3.5 w-px bg-[#c4c7c7]" />
          <span>
            {zoneEls.length} element{zoneEls.length === 1 ? "" : "s"} here · {els.length} total
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              aria-label="Zoom out"
              onClick={() => setCanvasZoom((z) => Math.max(0.6, Math.round((z - 0.1) * 10) / 10))}
              disabled={canvasZoom <= 0.6}
              className="text-[#444748] hover:text-black disabled:cursor-not-allowed disabled:text-[#c4c7c7]"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-9 text-center font-semibold text-[#1a1c1c]">
              {Math.round(canvasZoom * 100)}%
            </span>
            <button
              aria-label="Zoom in"
              onClick={() => setCanvasZoom((z) => Math.min(1.4, Math.round((z + 0.1) * 10) / 10))}
              disabled={canvasZoom >= 1.4}
              className="text-[#444748] hover:text-black disabled:cursor-not-allowed disabled:text-[#c4c7c7]"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="h-3.5 w-px bg-[#c4c7c7]" />
          <button
            onClick={() => setCanvasZoom(1)}
            className="font-semibold text-[#1a1c1c] hover:text-brand-orange"
          >
            Fit
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DesignStudioPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-[#e8e8e8]" />}>
      <DesignStudio />
    </Suspense>
  );
}
