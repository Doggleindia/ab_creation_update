import Image from "next/image";
import Link from "next/link";
import WishlistButton from "@/components/common/WishlistButton";

export type Product = {
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  badge: string;
  image: string;
  colors: string[];
};

// Badge background colors matching Figma design
const BADGE_COLORS: Record<string, string> = {
  EMBROIDERY: "#516161",
  "SCREEN PRINT": "#3f3f46",
  "DTF TRANSFER": "#1f2937",
  "OVERSIZED FIT": "#516161",
  "ECO-FRIENDLY": "#d97706",
  BESTSELLER: "#059669",
  "HEAVYWEIGHT": "#475569",
};

export default function ProductCard({ product }: { product: Product }) {
  if (!product) return null;

  const badgeText = product.badge || "CUSTOM";
  const badgeColor = BADGE_COLORS[badgeText.toUpperCase()] ?? "#516161";
  const colorsList = Array.isArray(product.colors) ? product.colors : [];
  const priceDisplay =
    typeof product.price === "number"
      ? product.price.toLocaleString("en-IN")
      : (product.price || "0");

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Image container */}
      <div className="relative aspect-square w-full bg-[#f4f2ef]">
        <Link href={`/product/${product.slug || ""}`} className="block h-full w-full">
          <Image
            src={product.image || "/images/home/cat-tshirt.png"}
            alt={product.title || "Custom Apparel"}
            fill
            className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          />
        </Link>
        <span
          className="absolute left-3 top-3 rounded-md px-2.5 py-1 font-poppins text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
          style={{ backgroundColor: badgeColor }}
        >
          {badgeText}
        </span>
        <WishlistButton
          item={{
            slug: product.slug || "",
            title: product.title || "",
            price: typeof product.price === "number" ? product.price : 0,
            image: product.image || "",
          }}
          className="absolute right-3 top-3 flex items-center justify-center rounded-full bg-white/90 p-2 text-gray-700 shadow-sm backdrop-blur-[2px] transition-colors hover:bg-white hover:text-red-500"
        />
      </div>

      {/* Product Content */}
      <div className="flex flex-1 flex-col justify-between p-4 font-poppins">
        <div className="flex flex-col gap-1">
          <Link href={`/product/${product.slug || ""}`}>
            <h3 className="text-[16px] font-bold leading-tight text-[#111827] hover:text-brand-orange">
              {product.title || "Custom Product"}
            </h3>
          </Link>
          <p className="text-[13px] text-[#6b7280]">
            {product.subtitle || "Custom Apparel"}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3">
          <p className="text-[20px] font-extrabold text-[#111827]">
            ₹{priceDisplay}
          </p>
          <div className="flex items-center gap-1.5">
            {colorsList.map((c, i) => (
              <span
                key={i}
                className="h-3.5 w-3.5 rounded-full border border-gray-300 shadow-inner"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-4">
          <Link
            href={`/product/${product.slug || ""}`}
            className="flex items-center justify-center rounded-lg border border-brand-orange py-2.5 text-[13px] font-bold text-brand-orange transition-colors hover:bg-brand-orange/10"
          >
            Add to Cart
          </Link>
          <Link
            href={`/design-studio?product=${product.slug || ""}`}
            className="flex items-center justify-center rounded-lg bg-brand-orange py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
          >
            Customize
          </Link>
        </div>
      </div>
    </div>
  );
}
