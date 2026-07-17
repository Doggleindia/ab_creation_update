"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Upload,
  Type,
  Shapes,
  ChevronLeft,
  Trash2,
  RotateCcw,
} from "lucide-react";

const SHIRT_COLORS = [
  { name: "White", hex: "#f3f4f6" },
  { name: "Black", hex: "#1f2937" },
  { name: "Navy", hex: "#1e3a8a" },
  { name: "Sage", hex: "#9caf88" },
  { name: "Red", hex: "#dc2626" },
];
const PRINT_METHODS = [
  "DTF Printing (Full Color)",
  "Screen Print",
  "Embroidery",
  "Heat Transfer",
];
const SIZES = ["S", "M", "L", "XL", "XXL"];

type Placement = { xPct: number; yPct: number; scale: number };

export default function DesignStudioPage() {
  const [color, setColor] = useState(SHIRT_COLORS[0]);
  const [printMethod, setPrintMethod] = useState(PRINT_METHODS[0]);
  const [size, setSize] = useState("L");
  const [side, setSide] = useState<"front" | "back">("front");
  const [image, setImage] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Placement>({
    xPct: 50,
    yPct: 45,
    scale: 1,
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
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

  // Transform readout (approx px within a 300px print area)
  const AREA = 300;
  const px = Math.round((placement.xPct / 100) * AREA);
  const py = Math.round((placement.yPct / 100) * AREA);
  const dim = Math.round(160 * placement.scale);
  const quality =
    placement.scale <= 1 ? "Excellent" : placement.scale <= 1.5 ? "Good" : "Low";
  const qualityColor =
    quality === "Excellent"
      ? "#16a34a"
      : quality === "Good"
        ? "#eab308"
        : "#dc2626";

  return (
    <div className="flex min-h-[calc(100vh-113px)] flex-col bg-[#f3f4f6]">
      {/* Top bar */}
      <div className="flex h-14 items-center justify-between border-b border-[#e5e7eb] bg-white px-4">
        <Link
          href="/collection"
          className="flex items-center gap-1 text-[14px] font-medium text-[#4b5563] hover:text-brand-orange"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
        <span className="font-poppins text-[15px] font-bold text-[#111827]">
          Design Studio
        </span>
        <Link
          href="/design-studio/preview"
          className="rounded-full bg-brand-orange px-5 py-2 text-[13px] font-semibold text-white hover:opacity-90"
        >
          Preview &amp; Order
        </Link>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left toolbar */}
        <aside className="flex flex-row gap-2 border-b border-[#e5e7eb] bg-white p-3 lg:w-16 lg:flex-col lg:border-b-0 lg:border-r">
          <button
            onClick={() => fileRef.current?.click()}
            title="Upload image"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange"
          >
            <Upload className="h-5 w-5" />
          </button>
          <button title="Add text" className="flex h-10 w-10 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#f3f4f6]">
            <Type className="h-5 w-5" />
          </button>
          <button title="Add shape" className="flex h-10 w-10 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#f3f4f6]">
            <Shapes className="h-5 w-5" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
        </aside>

        {/* Center canvas */}
        <main className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="mb-4 flex gap-2">
            {(["front", "back"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-semibold capitalize ${
                  side === s ? "bg-[#111827] text-white" : "bg-white text-[#6b7280]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Mockup */}
          <div
            className="relative flex h-[420px] w-[360px] items-center justify-center rounded-2xl"
            style={{ background: "radial-gradient(circle at 50% 40%, #ffffff, #e5e7eb)" }}
          >
            {/* simple tee silhouette */}
            <div
              className="relative h-[360px] w-[300px] rounded-[40px]"
              style={{
                background: color.hex,
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
                className="absolute left-[32%] top-[25%] h-[46%] w-[36%] rounded border border-dashed border-black/20"
              >
                {image && (
                  <img
                    src={image}
                    alt="Your design"
                    onPointerDown={() => (dragging.current = true)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-move touch-none select-none"
                    style={{
                      left: `${placement.xPct}%`,
                      top: `${placement.yPct}%`,
                      width: `${placement.scale * 70}%`,
                    }}
                    draggable={false}
                  />
                )}
                {!image && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] text-black/40"
                  >
                    <Upload className="h-5 w-5" />
                    Drop design here
                  </button>
                )}
              </div>
            </div>
          </div>
          {image && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() =>
                  setPlacement({ xPct: 50, yPct: 45, scale: 1 })
                }
                className="flex items-center gap-1 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[12px] text-[#4b5563]"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
              <button
                onClick={() => setImage(null)}
                className="flex items-center gap-1 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[12px] text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          )}
        </main>

        {/* Right panel */}
        <aside className="w-full space-y-6 border-t border-[#e5e7eb] bg-white p-5 lg:w-80 lg:border-l lg:border-t-0">
          {/* Transform */}
          <section>
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#111827]">
              Transform
            </h3>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              {[
                ["X Position", `${px} px`],
                ["Y Position", `${py} px`],
                ["Width", `${dim} px`],
                ["Height", `${dim} px`],
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg bg-[#f9fafb] p-2">
                  <p className="text-[11px] text-[#9ca3af]">{label}</p>
                  <p className="font-medium text-[#111827]">{val}</p>
                </div>
              ))}
            </div>
            <label className="mt-3 block text-[12px] text-[#6b7280]">
              Scale
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.05}
                value={placement.scale}
                onChange={(e) =>
                  setPlacement((p) => ({ ...p, scale: Number(e.target.value) }))
                }
                className="mt-1 w-full accent-brand-orange"
              />
            </label>
          </section>

          {/* Product options */}
          <section>
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#111827]">
              Product Options
            </h3>
            <p className="mb-1.5 text-[12px] text-[#6b7280]">Color</p>
            <div className="mb-4 flex gap-2">
              {SHIRT_COLORS.map((c) => (
                <button
                  key={c.name}
                  title={c.name}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 ${
                    color.name === c.name ? "border-brand-orange" : "border-[#e5e7eb]"
                  }`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
            <p className="mb-1.5 text-[12px] text-[#6b7280]">Print Method</p>
            <select
              value={printMethod}
              onChange={(e) => setPrintMethod(e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] focus:border-brand-orange focus:outline-none"
            >
              {PRINT_METHODS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <p className="mb-1.5 mt-4 text-[12px] text-[#6b7280]">Size</p>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`h-8 w-8 rounded-lg border text-[13px] ${
                    size === s
                      ? "border-brand-orange bg-brand-orange text-white"
                      : "border-[#e5e7eb] text-[#111827]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Quality */}
          <section>
            <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-[#111827]">
              Output Quality
            </h3>
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: qualityColor }}
              />
              <span className="text-[13px] font-medium" style={{ color: qualityColor }}>
                {quality}
              </span>
            </div>
          </section>

          {/* Print zones */}
          <section>
            <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-[#111827]">
              Print Zones
            </h3>
            <div className="flex gap-2">
              {(["front", "back"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`flex-1 rounded-lg border py-2 text-[13px] capitalize ${
                    side === s
                      ? "border-brand-orange bg-[#fff7f2] text-brand-orange"
                      : "border-[#e5e7eb] text-[#6b7280]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
