// Map human colour names (as stored on products) to hex for swatches.
const COLOR_HEX: Record<string, string> = {
  white: "#ffffff",
  black: "#111111",
  navy: "#1e3a8a",
  "navy blue": "#1e3a8a",
  blue: "#2563eb",
  "royal blue": "#1d4ed8",
  gray: "#9ca3af",
  grey: "#9ca3af",
  red: "#dc2626",
  green: "#16a34a",
  sage: "#9caf88",
  yellow: "#eab308",
  orange: "#ea580c",
  purple: "#7c3aed",
  pink: "#ec4899",
  brown: "#8b5e34",
  beige: "#e7ddca",
  cream: "#f5f1ea",
  maroon: "#7f1d1d",
  teal: "#0f766e",
  olive: "#4d7c0f",
};

export function colorToHex(name: string): string {
  return COLOR_HEX[name?.toLowerCase().trim()] ?? "#9ca3af";
}
