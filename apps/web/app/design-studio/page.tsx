"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ChevronDown,
  RotateCw,
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

type Zone = "front" | "back" | "left-sleeve" | "right-chest";

const ZONES: { id: Zone; label: string; area: React.CSSProperties }[] = [
  {
    id: "front",
    label: "Front",
    area: { left: "30%", top: "24%", width: "40%", height: "48%" },
  },
  {
    id: "back",
    label: "Back",
    area: { left: "30%", top: "24%", width: "40%", height: "48%" },
  },
  {
    id: "left-sleeve",
    label: "Left Sleeve",
    area: { left: "4%", top: "24%", width: "15%", height: "13%" },
  },
  {
    id: "right-chest",
    label: "Right Chest",
    area: { left: "54%", top: "27%", width: "18%", height: "15%" },
  },
];

type Placement = { xPct: number; yPct: number; scale: number; rotation: number };

const DEFAULT_PLACEMENT: Placement = { xPct: 50, yPct: 50, scale: 1, rotation: 0 };

const sectionLabel =
  "text-[12px] font-semibold tracking-[0.6px] text-[#444748]";
const fieldLabel = "text-[10px] font-bold uppercase text-[#444748]";

export default function DesignStudioPage() {
  const router = useRouter();
  const [color, setColor] = useState(SHIRT_COLORS[0]);
  const [printMethod, setPrintMethod] = useState(PRINT_METHODS[0]);
  const [zone, setZone] = useState<Zone>("front");
  const [image, setImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(100);
  const [placement, setPlacement] = useState<Placement>(DEFAULT_PLACEMENT);
  const [savedFlash, setSavedFlash] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const side: "front" | "back" = zone === "back" ? "back" : "front";
  const zoneCfg = ZONES.find((z) => z.id === zone) ?? ZONES[0];

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || !areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setPlacement((p) => ({
      ...p,
      xPct: Math.max(10, Math.min(90, xPct)),
      yPct: Math.max(10, Math.min(90, yPct)),
    }));
  }

  function designState() {
    return {
      image,
      colorName: color.name,
      colorHex: color.hex,
      colorDisplay: color.display,
      printMethod,
      zone,
      placement,
      opacity,
    };
  }

  function saveDraft() {
    try {
      sessionStorage.setItem("ab:design", JSON.stringify(designState()));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch {
      // storage full (large artwork) — draft stays in memory only
    }
  }

  function goToPreview() {
    try {
      sessionStorage.setItem("ab:design", JSON.stringify(designState()));
    } catch {
      // storage full — preview falls back to defaults
    }
    router.push("/design-studio/preview");
  }

  // Transform readout in print-area pixels (300px reference area)
  const AREA = 300;
  const px = Math.round((placement.xPct / 100) * AREA);
  const py = Math.round((placement.yPct / 100) * AREA);
  const dim = Math.round(160 * placement.scale);

  // Print quality falls off as the artwork is scaled up
  const dpi = Math.round(320 / placement.scale);
  const great = dpi >= 200;
  const barPct = Math.min(100, Math.round((dpi / 375) * 100));

  return (
    <div className="flex min-h-[calc(100vh-113px)] flex-col bg-[#e8e8e8]">
      {/* Top bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#c4c7c7] bg-white px-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="hidden text-[18px] font-extrabold tracking-tight text-black sm:block">
            AB CREATION
          </span>
          <span className="hidden h-6 w-px bg-[#c4c7c7] sm:block" />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold text-black">
              Round Neck T-Shirt
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
              onClick={() => setZone(s)}
              className={`rounded-full px-6 py-1.5 text-[13px] font-semibold capitalize transition-colors ${
                side === s
                  ? "bg-white text-black shadow-[0px_1px_2px_rgba(0,0,0,0.1)]"
                  : "text-[#444748]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
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

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left toolbar */}
        <aside className="flex shrink-0 flex-row items-center justify-between border-b border-[#c4c7c7] bg-white px-2 py-2 lg:w-16 lg:flex-col lg:border-b-0 lg:border-r lg:px-0 lg:py-4">
          <div className="flex flex-row gap-1 lg:flex-col lg:gap-2">
            {[
              { icon: Upload, label: "Upload", onClick: () => fileRef.current?.click() },
              { icon: Type, label: "Text" },
              { icon: Shapes, label: "Shapes" },
              { icon: Sparkles, label: "Clipart" },
              { icon: LayoutGrid, label: "Templates" },
            ].map(({ icon: Icon, label, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="flex w-14 flex-col items-center gap-1 rounded-lg py-2 text-[#444748] transition-colors hover:bg-[#f3f3f4] hover:text-black"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[9px] font-bold uppercase tracking-[0.5px]">
                  {label}
                </span>
              </button>
            ))}
            <div className="mx-2 hidden border-t border-[#c4c7c7] lg:block" />
            <button className="flex w-14 flex-col items-center gap-1 rounded-lg py-2 text-[#444748] transition-colors hover:bg-[#f3f3f4] hover:text-black">
              <Layers className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-[0.5px]">
                Layers
              </span>
            </button>
          </div>
          <div className="flex flex-row gap-1 lg:flex-col lg:gap-2">
            <button
              aria-label="Undo"
              className="flex h-10 w-14 items-center justify-center rounded-lg text-[#444748] hover:bg-[#f3f3f4]"
            >
              <Undo2 className="h-5 w-5" />
            </button>
            <button
              aria-label="Redo"
              className="flex h-10 w-14 items-center justify-center rounded-lg text-[#444748] hover:bg-[#f3f3f4]"
            >
              <Redo2 className="h-5 w-5" />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
        </aside>

        {/* Center canvas */}
        <main className="relative flex flex-1 items-center justify-center overflow-hidden p-8">
          {/* decorative diamond */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[62%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white/70" />

          {/* Tee mockup */}
          <div className="relative">
            <div
              className="relative h-[440px] w-[380px]"
              style={{
                background: color.display,
                clipPath:
                  "polygon(20% 8%, 35% 0, 65% 0, 80% 8%, 100% 20%, 88% 34%, 82% 26%, 82% 100%, 18% 100%, 18% 26%, 12% 34%, 0 20%)",
                boxShadow: "inset 0 4px 24px rgba(0,0,0,0.12)",
              }}
            >
              {/* print area */}
              <div
                ref={areaRef}
                onPointerMove={onPointerMove}
                onPointerUp={() => (dragging.current = false)}
                onPointerLeave={() => (dragging.current = false)}
                className="absolute border-[1.5px] border-dashed border-[#9ca3af]"
                style={zoneCfg.area}
              >
                <span
                  className={`absolute -top-6 left-0 whitespace-nowrap text-[10px] font-bold uppercase tracking-[1.5px] ${
                    color.name === "White" ? "text-[#9ca3af]" : "text-white/70"
                  }`}
                >
                  {zoneCfg.label} print area
                </span>

                {image ? (
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${placement.xPct}%`,
                      top: `${placement.yPct}%`,
                      width: `${placement.scale * 65}%`,
                    }}
                  >
                    <div
                      className="relative border-[1.5px] border-[#3b82f6]"
                      style={{ transform: `rotate(${placement.rotation}deg)` }}
                    >
                      {/* rotate handle */}
                      <button
                        aria-label="Rotate design"
                        onClick={() =>
                          setPlacement((p) => ({
                            ...p,
                            rotation: (p.rotation + 15) % 360,
                          }))
                        }
                        className="absolute -top-8 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-[#3b82f6] bg-white text-[#3b82f6]"
                      >
                        <RotateCw className="h-3 w-3" />
                      </button>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt="Your design"
                        onPointerDown={() => (dragging.current = true)}
                        className="block w-full cursor-move touch-none select-none"
                        style={{ opacity: opacity / 100 }}
                        draggable={false}
                      />
                      {/* selection handles */}
                      {[
                        "-left-1 -top-1",
                        "left-1/2 -top-1 -translate-x-1/2",
                        "-right-1 -top-1",
                        "-left-1 top-1/2 -translate-y-1/2",
                        "-right-1 top-1/2 -translate-y-1/2",
                        "-left-1 -bottom-1",
                        "left-1/2 -bottom-1 -translate-x-1/2",
                        "-right-1 -bottom-1",
                      ].map((pos) => (
                        <span
                          key={pos}
                          className={`absolute ${pos} h-2 w-2 border border-[#3b82f6] bg-white`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className={`flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] ${
                      color.name === "White" ? "text-black/40" : "text-white/60"
                    }`}
                  >
                    <Upload className="h-5 w-5" />
                    Drop design here
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Right panel */}
        <aside className="flex w-full shrink-0 flex-col border-t border-[#c4c7c7] bg-white lg:w-80 lg:border-l lg:border-t-0">
          {/* Tabs */}
          <div className="flex gap-6 border-b border-[#c4c7c7] px-4">
            {["Design", "Product", "Inspect"].map((tab, i) => (
              <button
                key={tab}
                className={`py-4 text-[12px] font-semibold tracking-[0.6px] ${
                  i === 0
                    ? "-mb-px border-b-2 border-black text-black"
                    : "text-[#444748]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-8 p-6">
            {/* Transform */}
            <section className="flex flex-col gap-4">
              <h3 className={sectionLabel}>Transform</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["X Position", `${px} px`],
                  ["Y Position", `${py} px`],
                  ["Width", `${dim} px`],
                  ["Height", `${dim} px`],
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
                  className="flex h-10 flex-1 items-center justify-center rounded-[8px] border border-[#c4c7c7] text-black hover:bg-[#f3f3f4]"
                >
                  <FlipHorizontal2 className="h-4 w-4" />
                </button>
                <button
                  aria-label="Flip vertical"
                  className="flex h-10 flex-1 items-center justify-center rounded-[8px] border border-[#c4c7c7] text-black hover:bg-[#f3f3f4]"
                >
                  <FlipVertical2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className={fieldLabel}>Opacity</span>
                  <span className="text-[14px] font-bold text-[#1a1c1c]">
                    {opacity}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="h-1.5 w-full accent-black"
                />
              </div>
              <label className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className={fieldLabel}>Scale</span>
                  <span className="text-[14px] font-bold text-[#1a1c1c]">
                    {placement.scale.toFixed(2)}×
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.05}
                  value={placement.scale}
                  onChange={(e) =>
                    setPlacement((p) => ({ ...p, scale: Number(e.target.value) }))
                  }
                  className="h-1.5 w-full accent-black"
                />
              </label>
            </section>

            {/* Product options */}
            <section className="flex flex-col gap-4 border-t border-[#c4c7c7] pt-6">
              <h3 className={sectionLabel}>Product Options</h3>
              <div className="flex flex-col gap-3">
                <span className={fieldLabel}>Color</span>
                <div className="flex items-center gap-2">
                  {SHIRT_COLORS.map((c) => {
                    const selected = color.name === c.name;
                    return (
                      <button
                        key={c.name}
                        title={c.name}
                        onClick={() => setColor(c)}
                        className={`h-8 w-8 rounded-full border ${
                          selected
                            ? "border-2 border-black ring-2 ring-inset ring-white"
                            : "border-[#c4c7c7]"
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
            </section>

            {/* Output quality */}
            <section className="flex flex-col gap-4 border-t border-[#c4c7c7] pt-6">
              <h3 className={sectionLabel}>Output Quality</h3>
              <div className="flex flex-col gap-3 rounded-[12px] bg-[#f9f9f9] p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2
                      className={`h-4 w-4 ${great ? "text-[#16a34a]" : "text-[#dc2626]"}`}
                    />
                    <span
                      className={`text-[14px] font-bold ${
                        great ? "text-[#16a34a]" : "text-[#dc2626]"
                      }`}
                    >
                      {great ? "Great Print Quality" : "Low Print Quality"}
                    </span>
                  </span>
                  <span className="text-[14px] font-bold text-[#1a1c1c]">
                    {dpi} DPI
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8e8e8]">
                  <div
                    className={`h-full rounded-full ${great ? "bg-[#22c55e]" : "bg-[#dc2626]"}`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
                <div className="flex items-start justify-between gap-2 text-[11px] leading-[16.5px] text-[#444748]">
                  <span>Dimensions: 2400 x 2400 px</span>
                  <span>Print Size: 12&quot; x 12&quot;</span>
                </div>
              </div>
            </section>

            {/* Print zones */}
            <section className="flex flex-col gap-4 border-t border-[#c4c7c7] pt-6">
              <h3 className={sectionLabel}>Print Zones</h3>
              <div className="grid grid-cols-2 gap-2">
                {ZONES.map((z) => {
                  const selected = zone === z.id;
                  return (
                    <button
                      key={z.id}
                      onClick={() => setZone(z.id)}
                      className={`flex flex-col items-center gap-2 rounded-[12px] py-3.5 ${
                        selected
                          ? "border-2 border-black bg-[#f3f3f4]"
                          : "border border-[#c4c7c7]"
                      }`}
                    >
                      <span
                        className={`text-[11px] font-bold ${
                          selected ? "text-[#1a1c1c]" : "text-[#444748]"
                        }`}
                      >
                        {z.label}
                      </span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          selected ? "bg-black" : "bg-[#c4c7c7]"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </aside>
      </div>

      {/* Bottom status bar */}
      <div className="flex h-8 shrink-0 items-center justify-between border-t border-[#c4c7c7] bg-white px-4 text-[11px] text-[#444748]">
        <div className="flex items-center gap-3">
          <span>Canvas: 2400 × 2400 px</span>
          <span className="h-3.5 w-px bg-[#c4c7c7]" />
          <span className="capitalize">Zone: {zoneCfg.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button aria-label="Zoom out" className="hover:text-black">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="font-semibold text-[#1a1c1c]">100%</span>
            <button aria-label="Zoom in" className="hover:text-black">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="h-3.5 w-px bg-[#c4c7c7]" />
          <button className="font-semibold hover:text-black">Fit</button>
        </div>
      </div>
    </div>
  );
}
