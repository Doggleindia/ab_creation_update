import type { Metadata } from "next";
import ProductGallery from "@/components/product/ProductGallery";
import ProductBuyBox, {
  type ProductDetail,
} from "@/components/product/ProductBuyBox";
import ProductDetailInfo, {
  type ProductInfo,
} from "@/components/product/ProductDetailInfo";

// Representative product. Structured to be replaced by the live API
// (GET /api/products/slug/{slug}) without touching the presentational parts.
const DEMO_PRODUCT: ProductDetail & { images: string[] } = {
  slug: "round-neck-classic-t-shirt",
  title: "Round Neck Classic T-Shirt",
  subtitle: "Premium Heavyweight Cotton — printed to order",
  price: 899,
  mrp: 1299,
  rating: 4.3,
  ratingCount: "54.3k",
  badge: "EMBROIDERY",
  sizes: ["S", "M", "L", "XL", "XXL"],
  colors: [
    { name: "White", hex: "#ffffff" },
    { name: "Black", hex: "#111111" },
    { name: "Navy", hex: "#1e3a8a" },
    { name: "Sage", hex: "#9ca3af" },
  ],
  inStock: 128,
  images: [
    "/images/product/pdp-1.png",
    "/images/product/pdp-2.png",
    "/images/product/pdp-3.png",
    "/images/product/pdp-4.png",
    "/images/product/pdp-5.png",
    "/images/product/pdp-6.png",
  ],
};

const DEMO_INFO: ProductInfo = {
  productDetails: [
    "Blue T-shirt for men",
    "Typography Printed",
    "Regular Length",
    "Short Sleeves, Regular Sleeves",
    "Round neckline",
    "Knitted cotton",
    "Slip-on closure",
  ],
  specifications: [
    { label: "Fabrics", value: "Cotton, Cotton" },
    { label: "Fashion Trends", value: "Typography or Slogan Print" },
    { label: "Fit", value: "Relaxed Fit" },
    { label: "Type", value: "Long Sleeve Tee" },
    { label: "Neck", value: "Round Neck" },
  ],
  material: "100% ring-spun combed cotton, 180 GSM",
  careInstructions:
    "Machine wash cold with like colours. Do not bleach. Tumble dry low. Iron on reverse; do not iron directly on the print.",
  rating: 4.3,
  ratingCount: "54.3k",
  ratingBars: [
    { star: 5, count: "39k", pct: 72, color: "#22c55e" },
    { star: 4, count: "9.8k", pct: 18, color: "#4ade80" },
    { star: 3, count: "3.2k", pct: 6, color: "#facc15" },
  ],
  reviews: [
    {
      initials: "RA",
      name: "Rupam Adhikary",
      rating: 4,
      date: "OCT 20, 2023",
      text: '"Extremely comfortable and stylish. The padding is really good for all-day wear. The print quality on the polo is excellent and hasn\'t faded after several washes."',
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
  ],
};

export const metadata: Metadata = {
  title: `${DEMO_PRODUCT.title} | AB Creation`,
  description: DEMO_PRODUCT.subtitle,
};

export default function ProductDetailPage() {
  return (
    <main>
      <section className="w-full bg-white px-4 py-8 sm:px-8 lg:px-[86.5px]">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,540px)_1fr]">
          <ProductGallery images={DEMO_PRODUCT.images} />
          <ProductBuyBox product={DEMO_PRODUCT} />
        </div>
      </section>

      <ProductDetailInfo info={DEMO_INFO} />
    </main>
  );
}
