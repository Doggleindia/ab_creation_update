"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Minus, Plus, Share2, ShieldCheck, Truck } from "lucide-react";
import { addToCart } from "@/lib/cart";

const SIZES = ["S", "M", "L", "XL", "XXL"];
const BASE_PRICE = 599;
const PRINT_FEE = 120;

export default function PreviewOrderPage() {
  const router = useRouter();
  const [size, setSize] = useState("L");
  const [qty, setQty] = useState(1);

  const unit = BASE_PRICE + PRINT_FEE;
  const subtotal = unit * qty;

  function addAndCheckout() {
    addToCart({
      id: `custom-${Date.now()}`,
      slug: "custom-design",
      title: "Custom Design T-Shirt",
      variant: `White · Size ${size} · DTF Print`,
      image: "/images/home/hero-tee.png",
      price: unit,
      quantity: qty,
      custom: true,
    });
    router.push("/cart");
  }

  return (
    <main className="min-h-[calc(100vh-113px)] bg-[#f9fafb]">
      {/* Editor bar */}
      <div className="flex h-14 items-center justify-between border-b border-[#e5e7eb] bg-white px-4">
        <Link
          href="/design-studio"
          className="flex items-center gap-1 text-[14px] font-medium text-[#4b5563] hover:text-brand-orange"
        >
          <ChevronLeft className="h-4 w-4" /> Back to editor
        </Link>
        <span className="font-poppins text-[15px] font-bold text-[#111827]">
          Preview &amp; Order
        </span>
        <span className="w-24" />
      </div>

      <div className="mx-auto max-w-[1152px] px-4 py-8 sm:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[55fr_45fr]">
          {/* Left: mockup gallery */}
          <div>
            <div className="flex aspect-square items-center justify-center rounded-2xl border border-[#e8e6e3] bg-white">
              <div
                className="h-[70%] w-[60%] rounded-[40px] bg-[#f3f4f6]"
                style={{
                  clipPath:
                    "polygon(20% 8%, 35% 0, 65% 0, 80% 8%, 100% 20%, 88% 34%, 82% 26%, 82% 100%, 18% 100%, 18% 26%, 12% 34%, 0 20%)",
                  boxShadow: "inset 0 4px 24px rgba(0,0,0,0.1)",
                }}
              />
            </div>
            <div className="mt-4 flex gap-3">
              {["Front", "Back"].map((t, i) => (
                <button
                  key={t}
                  className={`flex h-20 flex-1 items-center justify-center rounded-xl border text-[13px] ${
                    i === 0 ? "border-brand-orange" : "border-[#e8e6e3]"
                  } bg-white text-[#6b7280]`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Right: order config */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
              <span className="inline-block rounded-full bg-[#516161] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                DTF Print
              </span>
              <h1 className="mt-3 font-poppins text-xl font-bold text-[#111827]">
                Custom Design T-Shirt
              </h1>
              <p className="mt-1 text-[14px] text-[#6b7280]">
                Premium Heavyweight Cotton · Your artwork
              </p>

              {/* Size */}
              <p className="mb-2 mt-5 text-[13px] font-medium text-[#111827]">Size</p>
              <div className="flex gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`h-9 w-9 rounded-lg border text-[13px] ${
                      size === s
                        ? "border-brand-orange bg-brand-orange text-white"
                        : "border-[#e8e6e3] text-[#111827]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Quantity */}
              <p className="mb-2 mt-5 text-[13px] font-medium text-[#111827]">Quantity</p>
              <div className="flex w-fit items-center rounded-full border border-[#e8e6e3]">
                <button
                  aria-label="Decrease"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-[14px] font-medium">{qty}</span>
                <button
                  aria-label="Increase"
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-9 w-9 items-center justify-center"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
              <div className="flex flex-col gap-2 text-[14px]">
                <div className="flex justify-between text-[#4b5563]">
                  <span>Base price</span>
                  <span>₹{BASE_PRICE}</span>
                </div>
                <div className="flex justify-between text-[#4b5563]">
                  <span>Print (DTF)</span>
                  <span>₹{PRINT_FEE}</span>
                </div>
                <div className="flex justify-between text-[#4b5563]">
                  <span>Quantity</span>
                  <span>× {qty}</span>
                </div>
                <div className="flex justify-between border-t border-[#e8e6e3] pt-2 text-[17px] font-bold text-[#111827]">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <button
                onClick={addAndCheckout}
                className="mt-5 w-full rounded-full bg-brand-orange py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Add to Cart &amp; Checkout
              </button>
              <div className="mt-4 flex items-center justify-between text-[11px] text-[#6b7280]">
                <span className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" /> Share design
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> Secure
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="h-4 w-4" /> Fast delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
