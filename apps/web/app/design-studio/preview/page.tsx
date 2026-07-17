"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Download,
  Eye,
  HelpCircle,
  History,
  Info,
  Mail,
  MessageCircle,
  Minus,
  Plus,
  BadgeCheck,
  PenLine,
} from "lucide-react";
import { addToCart } from "@/lib/cart";

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const GARMENT_COST = 299;
const PRINTING_COST = 149;
const CUSTOMIZATION_FEE = 49;
const BULK_QTY = 6;
const BULK_PRICE = 449;

type DesignState = {
  image: string | null;
  colorName: string;
  colorHex: string;
  colorDisplay: string;
  printMethod: string;
  zone: string;
  placement: { xPct: number; yPct: number; scale: number; rotation: number };
  opacity: number;
  product?: {
    productId: string;
    slug: string;
    title: string;
    price: number;
    variantId?: string;
  } | null;
};

const FALLBACK: DesignState = {
  image: null,
  colorName: "White",
  colorHex: "#ffffff",
  colorDisplay: "#f6f6f6",
  printMethod: "DTF Printing (Full Color)",
  zone: "front",
  placement: { xPct: 50, yPct: 50, scale: 1, rotation: 0 },
  opacity: 100,
};

type View = "front" | "back" | "artwork" | "fabric";

function Tee({
  design,
  showDesign,
}: {
  design: DesignState;
  showDesign: boolean;
}) {
  return (
    <div
      className="relative h-[76%] w-[64%]"
      style={{
        background: design.colorDisplay,
        clipPath:
          "polygon(20% 8%, 35% 0, 65% 0, 80% 8%, 100% 20%, 88% 34%, 82% 26%, 82% 100%, 18% 100%, 18% 26%, 12% 34%, 0 20%)",
        boxShadow: "inset 0 4px 24px rgba(0,0,0,0.12)",
      }}
    >
      {showDesign && design.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={design.image}
          alt="Your design"
          className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
          style={{
            left: "50%",
            top: "42%",
            width: `${design.placement.scale * 30}%`,
            opacity: design.opacity / 100,
            transform: `translate(-50%, -50%) rotate(${design.placement.rotation}deg)`,
          }}
          draggable={false}
        />
      )}
    </div>
  );
}

export default function PreviewOrderPage() {
  const router = useRouter();
  const [design, setDesign] = useState<DesignState>(FALLBACK);
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [view, setView] = useState<View>("front");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ab:design");
      if (raw) setDesign({ ...FALLBACK, ...JSON.parse(raw) });
    } catch {
      // fall through to defaults
    }
  }, []);

  const garmentCost = design.product?.price ?? GARMENT_COST;
  const fullUnit = garmentCost + PRINTING_COST + CUSTOMIZATION_FEE;
  const unit = qty >= BULK_QTY ? Math.min(BULK_PRICE, fullUnit) : fullUnit;
  const productTitle = design.product?.title ?? "Round Neck T-Shirt";

  function addAndCheckout() {
    // Keep the serialized design (minus the heavy artwork data URL) so
    // checkout can submit it as the order's customDesign payload.
    const { image: artwork, ...designMeta } = design;
    addToCart({
      id: `custom-${Date.now()}`,
      slug: design.product?.slug ?? "custom-design",
      title: `${productTitle} — Custom Design`,
      variant: `${design.colorName} · Size ${size} · DTF Print`,
      image: "/images/home/hero-tee.png",
      price: unit,
      quantity: qty,
      custom: true,
      productId: design.product?.productId,
      productType: design.product ? "ready" : undefined,
      variantId: design.product?.variantId,
      color: design.colorName,
      size,
      customDesign: JSON.stringify(designMeta),
      artwork: artwork ?? undefined,
    });
    router.push("/cart");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  }

  const THUMBS: { id: View; label: string }[] = [
    { id: "front", label: "Front" },
    { id: "back", label: "Back" },
    { id: "artwork", label: "Artwork" },
    { id: "fabric", label: "Fabric" },
  ];

  return (
    <main className="min-h-[calc(100vh-113px)] bg-white">
      {/* Editor bar */}
      <div className="flex h-16 items-center justify-between border-b border-[#c4c7c7] bg-white px-4 sm:px-8">
        <Link
          href="/design-studio"
          className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.5px] text-black hover:text-brand-orange"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Editor
        </Link>
        <span className="absolute left-1/2 -translate-x-1/2 text-[22px] font-bold text-black">
          Preview &amp; Order
        </span>
        <div className="flex items-center gap-4">
          <button aria-label="History" className="hidden text-black hover:text-brand-orange sm:block">
            <History className="h-5 w-5" />
          </button>
          <button aria-label="Help" className="hidden text-black hover:text-brand-orange sm:block">
            <HelpCircle className="h-5 w-5" />
          </button>
          <button
            onClick={addAndCheckout}
            className="rounded-full bg-brand-orange px-5 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[45fr_38fr]">
          {/* Left: mockup gallery */}
          <div>
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[12px] bg-[#edeae5]">
              {view === "artwork" ? (
                design.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={design.image}
                    alt="Artwork"
                    className="max-h-[70%] max-w-[70%] select-none object-contain"
                    draggable={false}
                  />
                ) : (
                  <p className="text-[14px] text-[#9ca3af]">
                    No artwork uploaded yet
                  </p>
                )
              ) : view === "fabric" ? (
                <div
                  className="h-full w-full"
                  style={{ background: design.colorDisplay }}
                />
              ) : (
                <Tee design={design} showDesign={view === "front"} />
              )}
              <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-black shadow-[0px_1px_3px_rgba(0,0,0,0.15)]">
                <Eye className="h-4 w-4" /> Live Preview
              </span>
            </div>

            <div className="mt-4 flex gap-4">
              {THUMBS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setView(t.id)}
                  title={t.label}
                  className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-[8px] bg-[#edeae5] ${
                    view === t.id
                      ? "border-2 border-black"
                      : "border border-[#c4c7c7]"
                  }`}
                >
                  {t.id === "artwork" ? (
                    design.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={design.image}
                        alt="Artwork thumbnail"
                        className="max-h-[70%] max-w-[70%] object-contain"
                        draggable={false}
                      />
                    ) : (
                      <span className="text-[10px] text-[#9ca3af]">Art</span>
                    )
                  ) : t.id === "fabric" ? (
                    <span
                      className="h-full w-full"
                      style={{ background: design.colorDisplay }}
                    />
                  ) : (
                    <span
                      className="h-[70%] w-[62%]"
                      style={{
                        background: design.colorDisplay,
                        clipPath:
                          "polygon(20% 8%, 35% 0, 65% 0, 80% 8%, 100% 20%, 88% 34%, 82% 26%, 82% 100%, 18% 100%, 18% 26%, 12% 34%, 0 20%)",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            <a
              href={design.image ?? undefined}
              download="ab-creation-design.png"
              className={`mt-6 flex w-fit items-center gap-2 text-[14px] font-medium ${
                design.image
                  ? "text-black hover:text-brand-orange"
                  : "pointer-events-none text-[#9ca3af]"
              }`}
            >
              <Download className="h-4 w-4" /> Download Mockup
            </a>
          </div>

          {/* Right: order config */}
          <div className="flex flex-col">
            {/* Product summary */}
            <div className="rounded-[12px] bg-[#f3f3f4] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-[24px] font-bold tracking-[-0.48px] text-black">
                    {productTitle}
                  </h1>
                  <p className="mt-1 text-[14px] text-[#444748]">
                    Premium Heavyweight Cotton
                  </p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] border border-[#c4c7c7] bg-white">
                  <span
                    className="h-9 w-8"
                    style={{
                      background: design.colorDisplay,
                      clipPath:
                        "polygon(20% 8%, 35% 0, 65% 0, 80% 8%, 100% 20%, 88% 34%, 82% 26%, 82% 100%, 18% 100%, 18% 26%, 12% 34%, 0 20%)",
                    }}
                  />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#c4c7c7]/50 pt-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[#444748]">
                    Color
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-[15px] text-black">
                    <span
                      className="h-4 w-4 rounded-full border border-[#c4c7c7]"
                      style={{ background: design.colorHex }}
                    />
                    {design.colorName}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[#444748]">
                    Print Method
                  </p>
                  <p className="mt-2 text-[15px] text-black">DTF Print</p>
                </div>
              </div>
            </div>

            {/* Size */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#444748]">
                  Select Size
                </p>
                <button className="text-[13px] font-bold text-black underline hover:text-brand-orange">
                  Size Chart
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`flex h-12 w-12 items-center justify-center rounded-[8px] text-[14px] font-semibold ${
                      size === s
                        ? "bg-black text-white"
                        : "border border-[#c4c7c7] text-black hover:border-black"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-8">
              <p className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#444748]">
                Quantity
              </p>
              <div className="mt-3 flex w-fit items-center rounded-[8px] border border-[#c4c7c7]">
                <button
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center text-black"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-[15px] font-medium text-black">
                  {qty}
                </span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center text-black"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className="mt-8 rounded-[12px] border border-[#c4c7c7] p-6">
              <div className="flex flex-col gap-3 text-[15px]">
                <div className="flex justify-between text-[#444748]">
                  <span>Garment cost</span>
                  <span>₹{garmentCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#444748]">
                  <span>Printing cost</span>
                  <span>₹{PRINTING_COST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#444748]">
                  <span>Customization fee</span>
                  <span>₹{CUSTOMIZATION_FEE.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#c4c7c7] pt-4">
                  <span className="text-[18px] font-bold text-black">
                    Total per piece
                  </span>
                  <span className="text-[24px] font-bold text-black">
                    ₹{unit.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-[8px] bg-[#ecfdf5] p-3">
                <Info className="h-4 w-4 shrink-0 text-[#16a34a]" />
                <p className="text-[13px] text-[#166534]">
                  Order {BULK_QTY}+ for ₹{BULK_PRICE}/piece{" "}
                  <button className="font-semibold underline">
                    Bulk Pricing
                  </button>
                </p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={addAndCheckout}
              className="mt-8 w-full rounded-full bg-brand-orange py-4 text-[18px] font-bold text-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-opacity hover:opacity-90"
            >
              Add to Cart
            </button>

            {/* Share */}
            <div className="mt-10 flex flex-col items-center gap-4">
              <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#444748]">
                Share this design
              </p>
              <div className="flex gap-4">
                <button
                  aria-label="Copy link"
                  onClick={copyLink}
                  title={copied ? "Copied!" : "Copy link"}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c4c7c7] text-black hover:bg-[#f3f3f4]"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  aria-label="Share on WhatsApp"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c4c7c7] text-black hover:bg-[#f3f3f4]"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button
                  aria-label="Share via email"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c4c7c7] text-black hover:bg-[#f3f3f4]"
                >
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Assurance badges */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-[8px] bg-[#f3f3f4] p-4">
                <BadgeCheck className="h-5 w-5 shrink-0 text-[#7B5804]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-black">
                  Design Saved
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-[8px] bg-[#f3f3f4] p-4">
                <PenLine className="h-5 w-5 shrink-0 text-[#7B5804]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-black">
                  Free Edits Before Production
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
