"use client";

// Shared primitives for the Design Studio: the element model, the built-in
// shape/clipart path library, font stacks, print zones, and the canvas
// compositor that flattens a design into a real PNG for production.

export type Zone = "front" | "back" | "left-sleeve" | "right-chest";

export type ElKind = "image" | "text" | "shape";

export type El = {
  id: string;
  kind: ElKind;
  zone: Zone;
  xPct: number; // center, % of zone area
  yPct: number;
  scale: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  opacity: number; // 10–100
  hidden?: boolean;
  // image
  src?: string;
  natW?: number;
  natH?: number;
  // text
  text?: string;
  font?: string; // key of FONTS
  bold?: boolean;
  textColor?: string;
  // shape / clipart
  shape?: string; // key of SHAPE_DEFS
  fill?: string;
};

export const newId = () =>
  `el-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

// Print zones on the tee mockup (percent boxes over the garment) and their
// real-world print width used for DPI math.
export const ZONES: {
  id: Zone;
  label: string;
  area: { left: string; top: string; width: string; height: string };
  widthIn: number;
}[] = [
  { id: "front", label: "Front", area: { left: "30%", top: "24%", width: "40%", height: "48%" }, widthIn: 12 },
  { id: "back", label: "Back", area: { left: "30%", top: "24%", width: "40%", height: "48%" }, widthIn: 12 },
  { id: "left-sleeve", label: "Left Sleeve", area: { left: "4%", top: "24%", width: "15%", height: "13%" }, widthIn: 3.5 },
  { id: "right-chest", label: "Right Chest", area: { left: "54%", top: "27%", width: "18%", height: "15%" }, widthIn: 4 },
];

export const zoneCfg = (z: Zone) => ZONES.find((x) => x.id === z) ?? ZONES[0];

// System font stacks — nothing external to load, prints map 1:1.
export const FONTS: Record<string, { label: string; stack: string }> = {
  sans: { label: "Modern Sans", stack: "Arial, Helvetica, sans-serif" },
  serif: { label: "Classic Serif", stack: "Georgia, 'Times New Roman', serif" },
  display: { label: "Bold Display", stack: "Impact, 'Arial Black', sans-serif" },
  mono: { label: "Typewriter", stack: "'Courier New', Courier, monospace" },
  script: { label: "Script", stack: "'Brush Script MT', 'Segoe Script', cursive" },
};

export const TEXT_COLORS = [
  "#111111", "#ffffff", "#ff5c00", "#b91c1c", "#1e3a8a",
  "#14532d", "#facc15", "#7B5804",
];

// 100×100 viewBox SVG paths. Rendered inline on the canvas page and drawn
// via Path2D in the compositor — one source of truth, fully vector.
export const SHAPE_DEFS: Record<
  string,
  { label: string; path: string; category: "shape" | "clipart" }
> = {
  square: { label: "Square", path: "M10 10 H90 V90 H10 Z", category: "shape" },
  circle: {
    label: "Circle",
    path: "M50 5 A45 45 0 1 0 50 95 A45 45 0 1 0 50 5 Z",
    category: "shape",
  },
  triangle: { label: "Triangle", path: "M50 8 L95 90 H5 Z", category: "shape" },
  star: {
    label: "Star",
    path: "M50 5 L61 38 L96 38 L68 59 L79 92 L50 71 L21 92 L32 59 L4 38 L39 38 Z",
    category: "shape",
  },
  heart: {
    label: "Heart",
    path: "M50 88 C20 65 5 45 5 30 C5 15 17 8 28 8 C38 8 46 14 50 22 C54 14 62 8 72 8 C83 8 95 15 95 30 C95 45 80 65 50 88 Z",
    category: "shape",
  },
  hexagon: {
    label: "Hexagon",
    path: "M50 4 L92 27 V73 L50 96 L8 73 V27 Z",
    category: "shape",
  },
  bolt: {
    label: "Lightning",
    path: "M58 4 L20 56 H44 L38 96 L80 40 H54 Z",
    category: "clipart",
  },
  crown: {
    label: "Crown",
    path: "M10 75 L5 30 L30 48 L50 15 L70 48 L95 30 L90 75 Z M10 82 H90 V92 H10 Z",
    category: "clipart",
  },
  flame: {
    label: "Flame",
    path: "M50 4 C58 24 78 32 78 58 C78 79 65 94 50 94 C35 94 22 79 22 58 C22 46 28 38 34 30 C34 44 40 50 46 52 C42 36 44 18 50 4 Z",
    category: "clipart",
  },
  smiley: {
    label: "Smiley",
    path: "M50 4 A46 46 0 1 0 50 96 A46 46 0 1 0 50 4 Z M33 34 A6 7 0 1 1 33 48 A6 7 0 1 1 33 34 Z M67 34 A6 7 0 1 1 67 48 A6 7 0 1 1 67 34 Z M26 62 C33 76 67 76 74 62 L68 58 C61 68 39 68 32 58 Z",
    category: "clipart",
  },
  peace: {
    label: "Peace",
    path: "M50 4 A46 46 0 1 0 50 96 A46 46 0 1 0 50 4 Z M46 14 A38 38 0 0 0 15 55 L46 55 Z M54 14 L54 55 L85 55 A38 38 0 0 0 54 14 Z M20 64 A38 38 0 0 0 46 85 L46 74 Z M54 74 L54 85 A38 38 0 0 0 80 64 Z",
    category: "clipart",
  },
  paw: {
    label: "Paw",
    path: "M30 20 A9 12 0 1 0 30 44 A9 12 0 1 0 30 20 Z M70 20 A9 12 0 1 0 70 44 A9 12 0 1 0 70 20 Z M12 44 A8 10 0 1 0 12 64 A8 10 0 1 0 12 44 Z M88 44 A8 10 0 1 0 88 64 A8 10 0 1 0 88 44 Z M50 46 C66 46 78 62 78 74 C78 86 68 92 50 92 C32 92 22 86 22 74 C22 62 34 46 50 46 Z",
    category: "clipart",
  },
};

// Starter templates: real element sets added to the active zone.
export const TEMPLATES: {
  id: string;
  label: string;
  els: Partial<El>[];
}[] = [
  {
    id: "brand-badge",
    label: "Brand Badge",
    els: [
      { kind: "text", text: "YOUR BRAND", font: "display", bold: true, textColor: "#111111", xPct: 50, yPct: 42, scale: 1.1 },
      { kind: "text", text: "EST. 2026", font: "mono", textColor: "#111111", xPct: 50, yPct: 58, scale: 0.6 },
    ],
  },
  {
    id: "jersey",
    label: "Team Jersey",
    els: [
      { kind: "text", text: "CITY TIGERS", font: "display", bold: true, textColor: "#111111", xPct: 50, yPct: 28, scale: 0.9 },
      { kind: "text", text: "07", font: "display", bold: true, textColor: "#ff5c00", xPct: 50, yPct: 60, scale: 2 },
    ],
  },
  {
    id: "sunset-club",
    label: "Sunset Club",
    els: [
      { kind: "shape", shape: "circle", fill: "#ff5c00", xPct: 50, yPct: 44, scale: 1, opacity: 90 },
      { kind: "text", text: "SUNSET CLUB", font: "sans", bold: true, textColor: "#111111", xPct: 50, yPct: 72, scale: 0.8 },
    ],
  },
  {
    id: "minimal",
    label: "Minimal",
    els: [
      { kind: "text", text: "minimal.", font: "serif", textColor: "#111111", xPct: 50, yPct: 50, scale: 1 },
    ],
  },
];

// Real-world width an element prints at, in inches.
export const printedWidthIn = (el: El) => zoneCfg(el.zone).widthIn * 0.65 * el.scale;

// Effective DPI for image elements (vector elements are resolution-independent).
export const elDpi = (el: El): number | null => {
  if (el.kind !== "image" || !el.natW) return null;
  return Math.round(el.natW / printedWidthIn(el));
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/**
 * Flatten a design into a transparent PNG data URL — the real print file
 * attached to custom orders. Elements are laid out exactly as on the tee
 * (all zones, front-of-garment coordinates) on a 1000×1160 canvas.
 */
export async function compositeDesign(els: El[]): Promise<string | null> {
  const visible = els.filter((e) => !e.hidden);
  if (visible.length === 0) return null;
  const W = 1000;
  const H = 1160;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  for (const el of visible) {
    const area = zoneCfg(el.zone).area;
    const ax = (parseFloat(area.left) / 100) * W;
    const ay = (parseFloat(area.top) / 100) * H;
    const aw = (parseFloat(area.width) / 100) * W;
    const ah = (parseFloat(area.height) / 100) * H;
    const cx = ax + (el.xPct / 100) * aw;
    const cy = ay + (el.yPct / 100) * ah;
    const w = aw * 0.65 * el.scale;

    ctx.save();
    ctx.globalAlpha = el.opacity / 100;
    ctx.translate(cx, cy);
    ctx.rotate((el.rotation * Math.PI) / 180);
    ctx.scale(el.flipH ? -1 : 1, el.flipV ? -1 : 1);

    if (el.kind === "image" && el.src) {
      try {
        const img = await loadImage(el.src);
        const h = w * (img.naturalHeight / img.naturalWidth);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      } catch {
        // unloadable source — skip the element rather than fail the file
      }
    } else if (el.kind === "text" && el.text) {
      const stack = FONTS[el.font ?? "sans"]?.stack ?? FONTS.sans.stack;
      const fontPx = w / Math.max(4, el.text.length * 0.62);
      ctx.font = `${el.bold ? "700" : "400"} ${Math.max(12, fontPx)}px ${stack}`;
      ctx.fillStyle = el.textColor ?? "#111111";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(el.text, 0, 0);
    } else if (el.kind === "shape" && el.shape) {
      const def = SHAPE_DEFS[el.shape];
      if (def) {
        const s = w / 100;
        ctx.scale(s, s);
        ctx.translate(-50, -50);
        ctx.fillStyle = el.fill ?? "#111111";
        ctx.fill(new Path2D(def.path));
      }
    }
    ctx.restore();
  }
  try {
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}
