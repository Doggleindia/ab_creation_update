"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  Edit3,
  Grid,
  Scissors,
  Star,
} from "lucide-react";
import { addToCart } from "@/lib/cart";

export type ProductColor = { name: string; hex: string; variantId?: string };

export type ProductDetail = {
  productId: string;
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  mrp?: number;
  rating: number;
  ratingCount: string;
  badge: string;
  sizes: string[];
  colors: ProductColor[];
  inStock: number;
  images?: string[];
  sellerName?: string | null;
};

export type SpecRow = { label: string; value: string };

const ALL_COLORS: ProductColor[] = [
  { name: "Black", hex: "#000000" },
  { name: "Navy", hex: "#1e3a8a" },
  { name: "Red", hex: "#dc2626" },
  { name: "Gray", hex: "#9ca3af" },
  { name: "White", hex: "#ffffff" },
  { name: "Orange", hex: "#ff6b00" },
  { name: "Royal Blue", hex: "#2563eb" },
  { name: "Dark Green", hex: "#14532d" },
  { name: "Purple", hex: "#7e22ce" },
  { name: "Pink", hex: "#f472b6" },
];

const PRINT_METHODS = [
  {
    id: "dtg",
    name: "Direct-to-Garment",
    icon: Edit3,
    description:
      "Unlimited print colors and designs. Soft hand feel, comfortable to wear.",
  },
  {
    id: "heat",
    name: "Heat Transfer",
    icon: Grid,
    description:
      "Unlimited colors. Firm, plastic-like feel with sharp and clean print.",
  },
  {
    id: "embroidery",
    name: "Embroidery",
    icon: Scissors,
    description:
      "Vibrant & durable for larger text or simple graphics. Textured, slightly raised feel.",
    incompatible: true,
  },
];

const QUANTITY_PILLS = [
  "2 Pcs Sample",
  "5 Pcs",
  "10 Pcs",
  "15 Pcs",
  "20 Pcs",
  "50 Pcs",
  "75 Pcs",
  "100 Pcs",
];

const GSM_PILLS = [
  "100 GSM",
  "120 GSM",
  "150 GSM",
  "200 GSM",
  "250 GMS",
  "300 GSM",
];

export default function ProductBuyBox({
  product,
}: {
  product: ProductDetail;
  specs?: SpecRow[];
}) {
  const router = useRouter();

  // State
  const [selectedColor, setSelectedColor] = useState<string>("Orange");
  const [printMethod, setPrintMethod] = useState<string>("dtg");
  const [decorationArea, setDecorationArea] = useState<string>("Full Front");
  const [backside, setBackside] = useState<string>("Blank");
  const [qtyPill, setQtyPill] = useState<string>("2 Pcs Sample");
  const [gsmPill, setGsmPill] = useState<string>("100 GSM");
  const [customText, setCustomText] = useState<string>("");
  const [added, setAdded] = useState<boolean>(false);

  // Size breakdown quantities
  const [sizeCounts, setSizeCounts] = useState<Record<string, number>>({
    "S (36)": 4,
    "M (38)": 2,
    "L (40)": 0,
    "XL (42)": 0,
    "XXL (44)": 0,
  });

  const totalSelectedQty = Object.values(sizeCounts).reduce((a, b) => a + b, 0);

  function handleQtyChange(size: string, delta: number) {
    setSizeCounts((prev) => ({
      ...prev,
      [size]: Math.max(0, (prev[size] ?? 0) + delta),
    }));
  }

  function onAddToCart() {
    addToCart({
      id: `${product.slug}-${selectedColor}-${printMethod}`,
      slug: product.slug,
      title: product.title,
      variant: `${selectedColor} · ${printMethod.toUpperCase()} · ${gsmPill}`,
      image: product.images?.[0] ?? "/images/home/cat-polo.png",
      price: product.price,
      quantity: Math.max(1, totalSelectedQty),
      productId: product.productId,
      productType: "ready",
      custom: true,
      color: selectedColor,
    });
    setAdded(true);
    setTimeout(() => router.push("/cart"), 450);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title + Rating */}
      <div className="flex flex-col gap-2">
        <h1 className="font-poppins text-[26px] font-bold leading-snug text-[#1b1c1b]">
          Customized Polo T-Shirt With Your Company Logo | Order Logo Printed Tees
        </h1>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[13px]">
          <div className="flex items-center gap-1 text-[#ff8c00]">
            {Array.from({ length: 4 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-[#ff8c00] text-[#ff8c00]" />
            ))}
            <Star className="h-4 w-4 fill-none text-[#ff8c00]" />
          </div>
          <span className="font-bold text-[#1b1c1b]">4.3</span>
          <span className="text-[#6b7280]">(733 Reviews)</span>
          <span className="ml-2 font-medium text-[#6b7280]">
            12240+ Orders Delivered
          </span>
        </div>
      </div>

      {/* Price Card */}
      <div className="flex flex-col justify-center rounded-xl bg-[#f8f9fa] p-4">
        <div className="flex items-center gap-3">
          <span className="font-poppins text-[30px] font-bold text-[#1b1c1b]">
            ₹ 500
          </span>
          <span className="text-[18px] text-[#9ca3af] line-through">
            ₹ 1,590.00
          </span>
          <span className="rounded bg-[#ff5500] px-2 py-0.5 text-[11px] font-bold text-white">
            SAVE 12%
          </span>
        </div>
        <p className="mt-1 text-[12px] italic text-[#6b7280]">
          Inclusive of All Taxes
        </p>
      </div>

      {/* Color Selection */}
      <div className="flex flex-col gap-3">
        <span className="text-[13px] font-bold uppercase tracking-wide text-[#1b1c1b]">
          COLOR:{" "}
          <span className="text-[#ff5500]">{selectedColor.toUpperCase()}</span>
        </span>

        <div className="grid grid-cols-5 gap-3 sm:grid-cols-5">
          {ALL_COLORS.map((c) => {
            const isSelected = selectedColor.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c.name)}
                className="flex flex-col items-center gap-1.5 focus:outline-none"
              >
                <div
                  className={`h-14 w-full rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-[#ff5500] ring-2 ring-[#ff5500]/20"
                      : "border-[#e5e7eb] hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
                <span
                  className={`text-[11px] font-medium ${
                    isSelected ? "font-bold text-[#ff5500]" : "text-[#6b7280]"
                  }`}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECT PRINT METHOD */}
      <div className="flex flex-col gap-3">
        <span className="text-[13px] font-bold uppercase tracking-wide text-[#1b1c1b]">
          SELECT PRINT METHOD
        </span>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {PRINT_METHODS.map((method) => {
            const IconComp = method.icon;
            const isSelected = printMethod === method.id;
            return (
              <button
                key={method.id}
                onClick={() => setPrintMethod(method.id)}
                className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 text-center transition-all ${
                  isSelected
                    ? "border-black bg-white shadow-sm"
                    : "border-[#e5e7eb] bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center">
                  <IconComp className="h-6 w-6 text-black" />
                  <span className="mt-2 text-[14px] font-bold text-[#1b1c1b]">
                    {method.name}
                  </span>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-[#6b7280]">
                    {method.description}
                  </p>
                </div>

                {method.incompatible && (
                  <span className="mt-3 text-[11px] font-medium text-[#9ca3af]">
                    Incompatible
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Decoration Area & Backside */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Decoration Area */}
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-[#1b1c1b]">
            Decoration Area*
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled
              className="flex flex-col rounded-lg border border-dashed border-[#e5e7eb] bg-[#f9fafb] p-3 text-left opacity-60"
            >
              <span className="text-[12px] font-medium text-gray-500">
                Left Chest
              </span>
              <span className="text-[10px] text-gray-400">Incompatible</span>
            </button>
            <button
              onClick={() => setDecorationArea("Full Front")}
              className={`flex flex-col rounded-lg border p-3 text-left transition-all ${
                decorationArea === "Full Front"
                  ? "border-[#0088ff] bg-[#f0f8ff]"
                  : "border-[#e5e7eb] bg-white"
              }`}
            >
              <span className="text-[12px] font-medium text-[#1b1c1b]">
                Full Front
              </span>
            </button>
          </div>
        </div>

        {/* Backside */}
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-[#1b1c1b]">
            Backside*
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled
              className="flex flex-col rounded-lg border border-dashed border-[#e5e7eb] bg-[#f9fafb] p-3 text-left opacity-60"
            >
              <span className="text-[12px] font-medium text-gray-500">
                Printed
              </span>
              <span className="text-[10px] text-gray-400">Incompatible</span>
            </button>
            <button
              onClick={() => setBackside("Blank")}
              className={`flex flex-col rounded-lg border p-3 text-left transition-all ${
                backside === "Blank"
                  ? "border-[#0088ff] bg-[#f0f8ff]"
                  : "border-[#e5e7eb] bg-white"
              }`}
            >
              <span className="text-[12px] font-medium text-[#1b1c1b]">
                Blank
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* QUANTITY Pills */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-bold uppercase tracking-wide text-[#1b1c1b]">
          QUANTITY: <span className="text-[#1b1c1b]">{qtyPill}</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {QUANTITY_PILLS.map((pill) => (
            <button
              key={pill}
              onClick={() => setQtyPill(pill)}
              className={`rounded-lg px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                qtyPill === pill
                  ? "bg-[#1b1c1b] text-white"
                  : "border border-[#e5e7eb] bg-white text-[#374151] hover:border-gray-400"
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* GSM QUALITY Pills */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-bold uppercase tracking-wide text-[#1b1c1b]">
          GSM QUALITY
        </span>
        <div className="flex flex-wrap gap-2">
          {GSM_PILLS.map((gsm) => (
            <button
              key={gsm}
              onClick={() => setGsmPill(gsm)}
              className={`rounded-lg px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                gsmPill === gsm
                  ? "bg-[#1b1c1b] text-white"
                  : "border border-[#e5e7eb] bg-white text-[#374151] hover:border-gray-400"
              }`}
            >
              {gsm}
            </button>
          ))}
        </div>
      </div>

      {/* Size Breakdown Matrix */}
      <div className="rounded-xl border border-[#ffe4d6] bg-[#fffcf9] p-5">
        <div className="flex items-center justify-between pb-2 text-[13px] font-bold text-[#ff5500]">
          <span>Select 100 pieces.</span>
          <span>Selected: {totalSelectedQty}/100</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#fee2e2]">
          <div
            className="h-full rounded-full bg-[#ff5500] transition-all"
            style={{ width: `${Math.min(100, (totalSelectedQty / 100) * 100)}%` }}
          />
        </div>

        {/* Counter Rows */}
        <div className="mt-4 flex flex-col divide-y divide-[#f3f4f6]">
          {Object.entries(sizeCounts).map(([sz, val]) => (
            <div
              key={sz}
              className="flex items-center justify-between py-3 text-[14px]"
            >
              <span className="font-bold text-[#1b1c1b]">{sz}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQtyChange(sz, -1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-black hover:text-black"
                >
                  −
                </button>
                <span className="w-5 text-center font-bold">{val}</span>
                <button
                  onClick={() => handleQtyChange(sz, 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-black hover:text-black"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button: Upload Your Design */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          onClick={onAddToCart}
          disabled={added}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b00] to-[#ff4500] py-4 font-poppins text-[17px] font-bold text-white shadow-lg transition-transform hover:opacity-95 active:scale-[0.99]"
        >
          {added ? (
            <>
              <Check className="h-5 w-5" /> Design Saved &amp; Added to Cart
            </>
          ) : (
            "Upload Your Design"
          )}
        </button>
      </div>

      {/* Info Callouts Container */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#ffedd5] bg-[#fff7ed] p-4 text-[13px] text-[#9a3412]">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ea580c]" />
          <p className="leading-snug">
            <span className="font-bold">Design Approval:</span> We&apos;ll send a
            design for your approval after order is confirmed.
          </p>
        </div>
        <div className="flex items-start gap-2.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ea580c]" />
          <p className="leading-snug">
            <span className="font-bold">No Logo?</span> Place order with text
            only - our team will create a custom design for you.
          </p>
        </div>
      </div>

      {/* Customization Textarea */}
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-bold text-[#1b1c1b]">
          Any Text or Customization Needed (Optional)
        </label>
        <textarea
          rows={3}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Write here..."
          className="w-full rounded-xl border border-gray-200 p-3 text-[14px] text-[#1b1c1b] placeholder-gray-400 focus:border-[#ff5500] focus:outline-none"
        />
      </div>
    </div>
  );
}
