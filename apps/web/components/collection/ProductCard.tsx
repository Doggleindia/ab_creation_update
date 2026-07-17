import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

export type Product = {
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  badge: string;
  image: string;
  colors: string[];
};

// Print-method badge colours (all dark, per the Figma design).
const BADGE_COLORS: Record<string, string> = {
  EMBROIDERY: "#516161",
  "SCREEN PRINT": "#3f3f46",
  "DTF TRANSFER": "#1f2937",
};

export default function ProductCard({ product }: { product: Product }) {
  const badgeColor = BADGE_COLORS[product.badge] ?? "#516161";

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-[#707070] bg-white">
      {/* Image */}
      <div className="relative h-[268px] w-full bg-[#f0edeb]">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-contain p-4"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          />
        </Link>
        <span
          className="absolute left-3 top-3 rounded px-2 py-1 font-poppins text-[10px] font-semibold uppercase tracking-[0.5px] text-white"
          style={{ backgroundColor: badgeColor }}
        >
          {product.badge}
        </span>
        <button
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 flex items-center justify-center rounded-full bg-white/80 p-2 backdrop-blur-[2px] transition-colors hover:bg-white"
        >
          <Heart className="h-4 w-4 text-[#1b1c1b]" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1 px-4 pb-4 pt-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-[16px] font-bold leading-[25.6px] text-[#1b1c1b]">
            {product.title}
          </h3>
        </Link>
        <p className="font-poppins text-[14px] tracking-[0.14px] text-[#3d3d3d]">
          {product.subtitle}
        </p>

        <div className="flex items-center justify-between pt-3">
          <p className="text-[24px] font-semibold leading-[31.2px] text-[#111111]">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
          <div className="flex items-start gap-1">
            {product.colors.map((c, i) => (
              <span
                key={i}
                className="h-3 w-3 rounded-full border"
                style={{ backgroundColor: c, borderColor: "#8e7164" }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3">
          <Link
            href={`/product/${product.slug}`}
            className="flex items-center justify-center rounded border border-[#a04100] py-[11px] font-poppins text-[13px] text-[#a04100] transition-colors hover:bg-[#a04100]/5"
          >
            Add to Cart
          </Link>
          <Link
            href={`/design-studio?product=${product.slug}`}
            className="flex items-center justify-center rounded bg-[#a04100] py-[11px] font-poppins text-[13px] text-white transition-opacity hover:opacity-90"
          >
            Customize
          </Link>
        </div>
      </div>
    </div>
  );
}
