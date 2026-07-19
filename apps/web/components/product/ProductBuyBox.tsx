"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronUp,
  Info,
  Palette,
  RotateCcw,
  ShoppingCart,
  Star,
  Truck,
  Zap,
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
};

export type SpecRow = { label: string; value: string };

export default function ProductBuyBox({
  product,
  specs = [],
}: {
  product: ProductDetail;
  specs?: SpecRow[];
}) {
  const [specsOpen, setSpecsOpen] = useState(true);
  const router = useRouter();
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function onAddToCart() {
    const selectedColor = product.colors.find((c) => c.name === color);
    addToCart({
      id: `${product.slug}-${color}-${size}`,
      slug: product.slug,
      title: product.title,
      variant: `${color} · Size ${size} · ${product.badge}`,
      image: product.images?.[0] ?? "/images/home/hero-tee.png",
      price: product.price,
      quantity: qty,
      productId: product.productId,
      productType: "ready",
      variantId: selectedColor?.variantId,
      color,
      size,
    });
    setAdded(true);
    setTimeout(() => router.push("/cart"), 450);
  }

  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Badge */}
      <span className="w-fit rounded bg-[#516161] px-2 py-1 font-poppins text-[10px] font-semibold uppercase tracking-[0.5px] text-white">
        {product.badge}
      </span>

      {/* Title + rating */}
      <div className="flex flex-col gap-2">
        <h1 className="font-poppins text-[28px] font-bold leading-tight text-[#1b1c1b]">
          {product.title}
        </h1>
        <p className="text-[15px] text-[#3d3d3d]">{product.subtitle}</p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded bg-[#22c55e] px-2 py-0.5 text-[13px] font-semibold text-white">
            {product.rating.toFixed(1)}
            <Star className="h-3 w-3 fill-white" />
          </span>
          <span className="text-[13px] text-[#5a4136]">
            {product.ratingCount} Verified Buyers
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-end gap-3">
        <span className="text-[32px] font-bold text-[#111111]">
          ₹{product.price.toLocaleString("en-IN")}
        </span>
        {product.mrp && (
          <span className="pb-1 text-[18px] text-[#9ca3af] line-through">
            ₹{product.mrp.toLocaleString("en-IN")}
          </span>
        )}
        {discount > 0 && (
          <span className="pb-1 text-[16px] font-semibold text-[#22c55e]">
            {discount}% OFF
          </span>
        )}
      </div>
      <p className="-mt-3 text-[13px] text-[#6b7280]">Inclusive of all taxes</p>

      {/* Stock */}
      <p className="text-[14px] font-medium text-[#059669]">
        In Stock — {product.inStock} available
      </p>

      {/* Size */}
      <div className="flex flex-col gap-2">
        <span className="flex items-center justify-between text-[14px] font-semibold text-[#1b1c1b]">
          Size
          <a
            href="#size-chart"
            className="text-[13px] font-bold text-black underline hover:text-brand-orange"
          >
            Size Chart
          </a>
        </span>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`flex h-11 min-w-[44px] items-center justify-center rounded-md border px-3 text-[14px] font-medium transition-colors ${
                size === s
                  ? "border-[#a04100] bg-[#a04100] text-white"
                  : "border-[#d1d5db] text-[#1b1c1b] hover:border-[#a04100]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-semibold text-[#1b1c1b]">
          Color: <span className="font-normal text-[#3d3d3d]">{color}</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((c) => (
            <button
              key={c.name}
              onClick={() => setColor(c.name)}
              aria-label={c.name}
              className={`h-9 w-9 rounded-full border-2 transition-transform ${
                color === c.name
                  ? "border-[#a04100] scale-110"
                  : "border-[#e5e7eb]"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-semibold text-[#1b1c1b]">Quantity</span>
        <div className="flex h-11 w-fit items-center rounded-md border border-[#d1d5db]">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-full w-11 items-center justify-center text-[18px] text-[#1b1c1b]"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-[15px] font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="flex h-full w-11 items-center justify-center text-[18px] text-[#1b1c1b]"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <Link
          href={`/design-studio?product=${product.slug}`}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-orange py-3.5 text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Palette className="h-5 w-5" />
          Customize Design Online
        </Link>
        <button
          onClick={onAddToCart}
          disabled={added}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#1b1c1b] py-3.5 text-[16px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-80"
        >
          {added ? (
            <>
              <Check className="h-5 w-5" /> Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </>
          )}
        </button>
      </div>

      {/* Fabric & specifications */}
      {specs.length > 0 && (
        <div className="border-t border-[#e5e7eb] pt-4">
          <button
            onClick={() => setSpecsOpen((v) => !v)}
            className="flex w-full items-center justify-between text-[12px] font-bold uppercase tracking-[0.6px] text-[#374151]"
          >
            Fabric &amp; Specifications
            <ChevronUp
              className={`h-4 w-4 transition-transform ${specsOpen ? "" : "rotate-180"}`}
            />
          </button>
          {specsOpen && (
            <dl className="grid grid-cols-1 gap-x-8 gap-y-2 pt-4 sm:grid-cols-2">
              {specs.map((s) => (
                <div key={s.label} className="flex gap-1.5 text-[14px]">
                  <dt className="font-bold text-[#1b1c1b]">{s.label}:</dt>
                  <dd className="text-[#374151]">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {/* Print method note */}
      <div className="flex items-start gap-3 rounded-[8px] bg-[#f3f4f6] p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#374151]" />
        <p className="text-[13px] leading-5 text-[#374151]">
          Printed with DTF (Direct to Film) for superior durability and color
          vibrance.
        </p>
      </div>

      {/* Perks */}
      <div className="flex items-start justify-between gap-4 rounded-[8px] border border-[#e5e7eb] p-4">
        {[
          { icon: Truck, label: "Free Shipping 5+" },
          { icon: Zap, label: "Rush Available" },
          { icon: RotateCcw, label: "Easy Returns" },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="flex flex-1 flex-col items-center gap-2 text-center"
          >
            <Icon className="h-4 w-4 text-brand-orange" />
            <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#6b7280]">
              {label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
