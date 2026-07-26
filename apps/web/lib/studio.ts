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
  uppercase?: boolean;
  letterSpacing?: number; // 0–12, relative units scaled with the font size
  strokeColor?: string;
  strokeWidth?: number; // 0 = no outline, 1 = thin, 2 = thick
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

// 14 font styles: 3 system stacks + 11 self-hosted display faces (lib/fonts).
// "display"/"script" stay as aliases so older drafts keep their look.
import { STUDIO_FONTS } from "@/lib/fonts";
export const FONTS: Record<string, { label: string; stack: string }> = {
  ...STUDIO_FONTS,
  display: { label: "Bold Display", stack: "Impact, 'Arial Black', sans-serif" },
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
  diamond: { label: "Diamond", path: "M50 4 L96 50 L50 96 L4 50 Z", category: "shape" },
  ring: {
    label: "Ring",
    path: "M50 4 A46 46 0 1 0 50 96 A46 46 0 1 0 50 4 Z M50 24 A26 26 0 1 1 50 76 A26 26 0 1 1 50 24 Z",
    category: "shape",
  },
  semicircle: { label: "Semicircle", path: "M4 70 A46 46 0 0 1 96 70 Z", category: "shape" },
  plus: {
    label: "Plus",
    path: "M38 8 H62 V38 H92 V62 H62 V92 H38 V62 H8 V38 H38 Z",
    category: "shape",
  },
  arrow: {
    label: "Arrow",
    path: "M6 38 H58 V16 L94 50 L58 84 V62 H6 Z",
    category: "shape",
  },
  shield: {
    label: "Shield",
    path: "M50 4 L90 18 V48 C90 72 74 88 50 96 C26 88 10 72 10 48 V18 Z",
    category: "shape",
  },
  burst: {
    label: "Burst",
    path: "M50 2 L58 32 L84 12 L68 40 L98 40 L70 54 L92 76 L62 66 L62 98 L50 70 L38 98 L38 66 L8 76 L30 54 L2 40 L32 40 L16 12 L42 32 Z",
    category: "shape",
  },
  sun: {
    label: "Sun",
    path: "M50 26 A24 24 0 1 0 50 74 A24 24 0 1 0 50 26 Z M46 2 H54 V16 H46 Z M46 84 H54 V98 H46 Z M2 46 H16 V54 H2 Z M84 46 H98 V54 H84 Z M15 21 L21 15 L31 25 L25 31 Z M69 75 L75 69 L85 79 L79 85 Z M75 31 L69 25 L79 15 L85 21 Z M25 69 L31 75 L21 85 L15 79 Z",
    category: "clipart",
  },
  moon: {
    label: "Moon",
    path: "M62 4 A46 46 0 1 0 96 62 A38 38 0 0 1 62 4 Z",
    category: "clipart",
  },
  mountains: {
    label: "Mountains",
    path: "M4 88 L34 26 L50 56 L64 12 L96 88 Z",
    category: "clipart",
  },
  wave: {
    label: "Wave",
    path: "M4 72 C14 50 22 44 30 50 C24 54 22 60 24 64 C34 46 46 34 60 36 C50 42 46 48 48 54 C60 40 76 34 96 40 C80 44 72 52 70 62 C56 58 46 62 40 70 C30 66 18 68 4 88 Z",
    category: "clipart",
  },
  music: {
    label: "Music Note",
    path: "M38 8 L86 2 V64 A14 14 0 1 1 78 52 V22 L46 26 V76 A14 14 0 1 1 38 64 Z",
    category: "clipart",
  },
  plane: {
    label: "Paper Plane",
    path: "M4 46 L96 8 L70 92 L48 62 L80 24 L40 56 Z",
    category: "clipart",
  },
  pine: {
    label: "Pine Tree",
    path: "M50 4 L72 34 H60 L80 60 H66 L88 88 H56 V96 H44 V88 H12 L34 60 H20 L40 34 H28 Z",
    category: "clipart",
  },
  anchor: {
    label: "Anchor",
    path: "M50 4 A12 12 0 1 0 50 28 A12 12 0 1 0 50 4 Z M44 30 H56 V78 A28 28 0 0 0 78 58 L88 64 A40 40 0 0 1 12 64 L22 58 A28 28 0 0 0 44 78 Z M32 40 H68 V48 H32 Z",
    category: "clipart",
  },
  coffee: {
    label: "Coffee",
    path: "M14 34 H74 V70 A20 20 0 0 1 54 90 H34 A20 20 0 0 1 14 70 Z M78 40 H86 A12 12 0 0 1 86 64 H78 V56 H84 A6 6 0 0 0 84 48 H78 Z M22 8 C28 14 22 20 28 26 H36 C30 20 36 14 30 8 Z M42 8 C48 14 42 20 48 26 H56 C50 20 56 14 50 8 Z",
    category: "clipart",
  },
  cat: {
    label: "Cat",
    path: "M20 8 L36 24 A34 34 0 0 1 64 24 L80 8 L82 34 A34 34 0 0 1 84 44 C84 68 69 84 50 84 C31 84 16 68 16 44 A34 34 0 0 1 18 34 Z M36 42 A4 5 0 1 1 36 54 A4 5 0 1 1 36 42 Z M64 42 A4 5 0 1 1 64 54 A4 5 0 1 1 64 42 Z M46 60 H54 L50 66 Z",
    category: "clipart",
  },
  skate: {
    label: "Skateboard",
    path: "M6 40 A10 10 0 0 1 20 40 L26 46 H74 L80 40 A10 10 0 0 1 94 40 L82 54 H18 Z M30 58 A8 8 0 1 0 30 74 A8 8 0 1 0 30 58 Z M70 58 A8 8 0 1 0 70 74 A8 8 0 1 0 70 58 Z",
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
      { kind: "text", text: "YOUR BRAND", font: "archivo", textColor: "#111111", xPct: 50, yPct: 42, scale: 1.1, letterSpacing: 2 },
      { kind: "text", text: "EST. 2026", font: "mono", textColor: "#111111", xPct: 50, yPct: 58, scale: 0.6, letterSpacing: 4 },
    ],
  },
  {
    id: "jersey",
    label: "Team Jersey",
    els: [
      { kind: "text", text: "CITY TIGERS", font: "bebas", textColor: "#111111", xPct: 50, yPct: 28, scale: 0.9, letterSpacing: 3 },
      { kind: "text", text: "07", font: "anton", textColor: "#ff5c00", xPct: 50, yPct: 60, scale: 2, strokeColor: "#111111", strokeWidth: 1 },
    ],
  },
  {
    id: "varsity",
    label: "Varsity Arc",
    els: [
      { kind: "shape", shape: "shield", fill: "#1e3a8a", xPct: 50, yPct: 48, scale: 1.1, opacity: 95 },
      { kind: "text", text: "ATHLETICS", font: "oswald", bold: true, textColor: "#ffffff", xPct: 50, yPct: 40, scale: 0.75, letterSpacing: 3 },
      { kind: "text", text: "DEPT. 84", font: "oswald", textColor: "#facc15", xPct: 50, yPct: 54, scale: 0.55, letterSpacing: 4 },
    ],
  },
  {
    id: "retro-wave",
    label: "Retro Wave",
    els: [
      { kind: "shape", shape: "sun", fill: "#ff5c00", xPct: 50, yPct: 34, scale: 0.8, opacity: 90 },
      { kind: "text", text: "RETRO", font: "monoton", textColor: "#111111", xPct: 50, yPct: 62, scale: 0.95, letterSpacing: 2 },
    ],
  },
  {
    id: "sunset-club",
    label: "Sunset Club",
    els: [
      { kind: "shape", shape: "circle", fill: "#ff5c00", xPct: 50, yPct: 44, scale: 1, opacity: 90 },
      { kind: "shape", shape: "wave", fill: "#1e3a8a", xPct: 50, yPct: 58, scale: 1.1 },
      { kind: "text", text: "Sunset Club", font: "pacifico", textColor: "#111111", xPct: 50, yPct: 78, scale: 0.85 },
    ],
  },
  {
    id: "wild-outdoors",
    label: "Wild Outdoors",
    els: [
      { kind: "shape", shape: "mountains", fill: "#14532d", xPct: 50, yPct: 40, scale: 1 },
      { kind: "text", text: "WILD OUTDOORS", font: "russo", textColor: "#111111", xPct: 50, yPct: 64, scale: 0.75, letterSpacing: 2 },
      { kind: "text", text: "explore more", font: "caveat", textColor: "#7B5804", xPct: 50, yPct: 76, scale: 0.6 },
    ],
  },
  {
    id: "script-statement",
    label: "Script Statement",
    els: [
      { kind: "text", text: "good vibes", font: "lobster", textColor: "#ff5c00", xPct: 50, yPct: 46, scale: 1.2 },
      { kind: "text", text: "ONLY", font: "bebas", textColor: "#111111", xPct: 50, yPct: 62, scale: 0.7, letterSpacing: 8 },
    ],
  },
  {
    id: "minimal",
    label: "Minimal",
    els: [
      { kind: "text", text: "minimal.", font: "playfair", textColor: "#111111", xPct: 50, yPct: 50, scale: 1 },
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

  // Display faces must be loaded before canvas text renders with them
  try {
    await document.fonts.ready;
  } catch {
    // font loading unavailable — system fallbacks still draw
  }

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
      const raw = el.uppercase ? el.text.toUpperCase() : el.text;
      const fontPx = Math.max(12, w / Math.max(4, raw.length * 0.62));
      ctx.font = `${el.bold ? "700" : "400"} ${fontPx}px ${stack}`;
      try {
        // Scale tracking with the glyph size so DOM and print match
        (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          `${((el.letterSpacing ?? 0) * fontPx) / 40}px`;
      } catch {
        // older canvas — tracking simply not applied
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if ((el.strokeWidth ?? 0) > 0) {
        ctx.strokeStyle = el.strokeColor ?? "#ffffff";
        ctx.lineWidth = Math.max(1, (el.strokeWidth ?? 1) * (fontPx / 28));
        ctx.lineJoin = "round";
        ctx.strokeText(raw, 0, 0);
      }
      ctx.fillStyle = el.textColor ?? "#111111";
      ctx.fillText(raw, 0, 0);
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
