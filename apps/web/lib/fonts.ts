"use client";

// Display fonts for the Design Studio, self-hosted at build time via
// next/font. Each entry's fontFamily string is used both in the DOM preview
// and in the canvas compositor (after document.fonts.ready), so what you see
// is exactly what prints.
import {
  Anton,
  Archivo_Black,
  Bebas_Neue,
  Caveat,
  Lobster,
  Monoton,
  Oswald,
  Pacifico,
  Permanent_Marker,
  Playfair_Display,
  Russo_One,
} from "next/font/google";

const anton = Anton({ subsets: ["latin"], weight: "400", display: "swap" });
const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", display: "swap" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], weight: "700", display: "swap" });
const lobster = Lobster({ subsets: ["latin"], weight: "400", display: "swap" });
const monoton = Monoton({ subsets: ["latin"], weight: "400", display: "swap" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400", display: "swap" });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: "700", display: "swap" });
const russo = Russo_One({ subsets: ["latin"], weight: "400", display: "swap" });

// Wrapper class that guarantees every @font-face is injected on pages that
// render designs (studio + preview apply this to their root element).
export const studioFontClasses = [
  anton.className,
  archivoBlack.className,
  bebas.className,
  caveat.className,
  lobster.className,
  monoton.className,
  oswald.className,
  pacifico.className,
  marker.className,
  playfair.className,
  russo.className,
].join(" ");

export const STUDIO_FONTS: Record<string, { label: string; stack: string }> = {
  sans: { label: "Modern Sans", stack: "Arial, Helvetica, sans-serif" },
  oswald: { label: "Oswald", stack: oswald.style.fontFamily },
  anton: { label: "Anton", stack: anton.style.fontFamily },
  bebas: { label: "Bebas Neue", stack: bebas.style.fontFamily },
  archivo: { label: "Archivo Black", stack: archivoBlack.style.fontFamily },
  russo: { label: "Russo One", stack: russo.style.fontFamily },
  playfair: { label: "Playfair Display", stack: playfair.style.fontFamily },
  serif: { label: "Classic Serif", stack: "Georgia, 'Times New Roman', serif" },
  pacifico: { label: "Pacifico", stack: pacifico.style.fontFamily },
  lobster: { label: "Lobster", stack: lobster.style.fontFamily },
  caveat: { label: "Caveat", stack: caveat.style.fontFamily },
  marker: { label: "Permanent Marker", stack: marker.style.fontFamily },
  monoton: { label: "Monoton", stack: monoton.style.fontFamily },
  mono: { label: "Typewriter", stack: "'Courier New', Courier, monospace" },
};
