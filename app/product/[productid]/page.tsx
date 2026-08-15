import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/product/ProductGallery";
import ProductBuyBox, { type SpecRow } from "@/components/product/ProductBuyBox";
import SizeChartSection from "@/components/product/SizeChartSection";
import ProductDetailInfo, {
  type RatingBar,
  type Review,
} from "@/components/product/ProductDetailInfo";
import { getProductBySlug } from "@/lib/api";

// Ratings & reviews are static per product decision (no review backend yet).
const RATING_BARS: RatingBar[] = [
  { star: 5, count: "39k", pct: 72, color: "#22c55e" },
  { star: 4, count: "9.8k", pct: 18, color: "#4ade80" },
  { star: 3, count: "3.2k", pct: 6, color: "#facc15" },
];

const REVIEWS: Review[] = [
  {
    initials: "RA",
    name: "Rupam Adhikary",
    rating: 4,
    date: "OCT 20, 2023",
    text: '"Extremely comfortable and stylish. The padding is really good for all-day wear. The print quality is excellent and hasn\'t faded after several washes."',
    avatarBg: "#ffdbcc",
    avatarText: "#a04100",
  },
  {
    initials: "SK",
    name: "Suresh Kumar",
    rating: 5,
    date: "SEP 15, 2023",
    text: '"Perfect for our corporate event. The team was very helpful with the design approval process. Highly recommended for bulk orders!"',
    avatarBg: "#dae1e3",
    avatarText: "#586062",
  },
];

type Params = Promise<{ productid: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { productid } = await params;
  const product = await getProductBySlug(productid);
  if (!product) return { title: "Product not found | AB Creation" };
  return {
    title: `${product.detail.title} | AB Creation`,
    description: product.detail.subtitle,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const { productid } = await params;
  const product = await getProductBySlug(productid);

  if (!product) notFound();

  const { detail, info } = product;

  // Compact spec rows for the buy box's Fabric & Specifications block
  const specs: SpecRow[] = [
    info.material ? { label: "Material", value: info.material } : null,
    ...info.specifications.map((s) => ({ label: s.label, value: s.value })),
    info.careInstructions?.[0]
      ? { label: "Care", value: info.careInstructions[0] }
      : null,
  ].filter((s): s is SpecRow => Boolean(s));

  return (
    <main>
      <section className="w-full bg-white px-4 py-8 sm:px-8 lg:px-[86.5px]">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,540px)_1fr]">
          <ProductGallery
            images={detail.images}
            wishlistItem={{
              slug: detail.slug,
              title: detail.title,
              price: detail.price,
              image: detail.images[0],
            }}
          />
          <ProductBuyBox product={detail} specs={specs} />
        </div>
      </section>

      <SizeChartSection measurements={product.measurements} />

      <ProductDetailInfo
        info={{
          ...info,
          rating: detail.rating,
          ratingCount: detail.ratingCount,
          ratingBars: RATING_BARS,
          reviews: REVIEWS,
        }}
      />
    </main>
  );
}
