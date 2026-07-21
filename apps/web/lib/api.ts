import { colorToHex } from "./colors";
import type { Product as CardProduct } from "@/components/collection/ProductCard";
import type {
  ProductDetail,
  ProductColor,
} from "@/components/product/ProductBuyBox";
import type { ProductInfo } from "@/components/product/ProductDetailInfo";

const BACKEND = (process.env.NEXT_PUBLIC_MAIN_BACKEND ?? "").replace(/\/$/, "");

const PLACEHOLDER = "/images/home/cat-tshirt.png";

// Backend customizationTypes -> design badge labels.
const BADGE_MAP: Record<string, string> = {
  DTF: "DTF TRANSFER",
  Screen: "SCREEN PRINT",
  Embroidery: "EMBROIDERY",
  "Heat Transfer": "HEAT TRANSFER",
};

function badgeFor(types?: string[]): string {
  const first = types?.[0];
  return (first && BADGE_MAP[first]) || "CUSTOM";
}

function discountedPrice(basePrice: number, discountPct?: number): number {
  if (!discountPct) return Math.round(basePrice);
  return Math.round(basePrice * (1 - discountPct / 100));
}

// ---- Raw backend shapes (only the fields we consume) ----
type RawVariant = {
  _id: string;
  media?: { images?: string[]; videos?: string[] };
  availableStock?: number;
  addPercentageInBasePrice?: number;
  color?: string;
};

type RawProduct = {
  _id: string;
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  discountPercentage?: number;
  description?: string;
  customizationTypes?: string[];
  colors?: string[];
  sizes?: string[];
  category?: { name?: string; slug?: string } | null;
  categoryId?: { name?: string; slug?: string } | null;
  productDetails?: string[];
  materialAndCare?: { material?: string; careInstructions?: string[] };
  specifications?: Record<string, string | undefined>;
  printZones?: {
    name: string;
    side?: string;
    widthIn?: number;
    heightIn?: number;
    dpi?: number;
  }[];
  measurements?: ProductMeasurement[];
  seller?: { name?: string } | null;
  variants?: RawVariant[];
};

export type ProductMeasurement = {
  size: string;
  chest?: number;
  length?: number;
  shoulder?: number;
  sleeve?: number;
};

export type ProductsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
};

// ---- Fetch helpers ----
async function apiGet<T>(path: string): Promise<T | null> {
  if (!BACKEND) return null;
  try {
    const res = await fetch(`${BACKEND}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function firstImage(p: RawProduct): string {
  for (const v of p.variants ?? []) {
    const img = v.media?.images?.[0];
    if (img) return img;
  }
  return PLACEHOLDER;
}

function toCardProduct(p: RawProduct): CardProduct {
  const cat = p.category ?? p.categoryId ?? null;
  return {
    slug: p.slug,
    title: p.title,
    subtitle: cat?.name || "Custom Apparel",
    price: discountedPrice(p.basePrice, p.discountPercentage),
    badge: badgeFor(p.customizationTypes),
    image: firstImage(p),
    colors: (p.colors ?? []).slice(0, 4).map(colorToHex),
  };
}

// ---- Site content (homepage CMS) ----
export type SiteTestimonial = {
  title?: string;
  body: string;
  name: string;
  role?: string;
};

export type SiteContent = {
  hero?: {
    visible?: boolean;
    badge?: string;
    heading1?: string;
    heading2?: string;
    subheading?: string;
    cta1?: string;
    cta2?: string;
    image?: string;
  };
  trustBadges?: { visible?: boolean; items?: { icon?: string; label: string }[] };
  topCategories?: { visible?: boolean };
  orderingProcess?: { visible?: boolean };
  printingServices?: { visible?: boolean };
  testimonials?: { visible?: boolean; items?: SiteTestimonial[] };
  collectionCarousel?: { visible?: boolean };
  sellerBanner?: { visible?: boolean };
  announcement?: { visible?: boolean; text?: string; hours?: string };
};

export async function getSiteContent(): Promise<SiteContent> {
  const json = await apiGet<{ data: { content: SiteContent } }>(
    "/api/site-content",
  );
  return json?.data?.content ?? {};
}

// ---- Public API ----
export type CollectionParams = {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  printMethod?: string;
  size?: string;
  color?: string;
  priceRange?: string;
};

export async function getProducts(
  params: CollectionParams,
): Promise<{ products: CardProduct[]; meta: ProductsMeta }> {
  const qs = new URLSearchParams();
  qs.set("limit", "16");
  if (params.page) qs.set("page", String(params.page));
  if (params.category) qs.set("category", params.category);
  if (params.search) qs.set("search", params.search);
  if (params.sort) qs.set("sort", params.sort);
  if (params.printMethod) qs.set("printMethod", params.printMethod);
  if (params.size) qs.set("size", params.size);
  if (params.color) qs.set("color", params.color);
  if (params.priceRange) qs.set("priceRange", params.priceRange);

  const json = await apiGet<{ data: RawProduct[]; meta: ProductsMeta }>(
    `/api/products?${qs.toString()}`,
  );

  if (!json?.data) {
    return {
      products: [],
      meta: { page: 1, limit: 16, total: 0, totalPages: 0 },
    };
  }

  return {
    products: json.data.map(toCardProduct),
    meta: json.meta ?? { page: 1, limit: 16, total: json.data.length, totalPages: 1 },
  };
}

export async function getCategories(): Promise<
  { label: string; value: string }[]
> {
  const json = await apiGet<{
    data: { categories: { name: string; slug: string }[] };
  }>(`/api/categories`);
  const cats = json?.data?.categories ?? [];
  return cats
    .filter((c) => c.slug && c.name)
    .map((c) => ({ label: c.name, value: c.slug }));
}

export type FullProduct = {
  detail: ProductDetail & { images: string[] };
  info: Pick<
    ProductInfo,
    "productDetails" | "specifications" | "material" | "careInstructions"
  >;
  measurements: ProductMeasurement[];
};

const SPEC_LABELS: [keyof NonNullable<RawProduct["specifications"]>, string][] = [
  ["fabric", "Fabrics"],
  ["gsm", "GSM"],
  ["fashionType", "Fashion Trends"],
  ["fit", "Fit"],
  ["type", "Type"],
  ["neck", "Neck"],
];

export async function getProductBySlug(
  slug: string,
): Promise<FullProduct | null> {
  const json = await apiGet<{ data: RawProduct }>(
    `/api/products/slug/${encodeURIComponent(slug)}`,
  );
  const p = json?.data;
  if (!p) return null;

  const cat = p.category ?? p.categoryId ?? null;
  const price = discountedPrice(p.basePrice, p.discountPercentage);
  const mrp = p.discountPercentage ? Math.round(p.basePrice) : undefined;

  const images = Array.from(
    new Set((p.variants ?? []).flatMap((v) => v.media?.images ?? [])),
  );
  const inStock = (p.variants ?? []).reduce(
    (sum, v) => sum + (v.availableStock ?? 0),
    0,
  );
  const colors: ProductColor[] = (p.colors ?? []).map((name) => ({
    name,
    hex: colorToHex(name),
    variantId: (p.variants ?? []).find(
      (v) => v.color?.toLowerCase() === name.toLowerCase(),
    )?._id,
  }));

  const specifications = SPEC_LABELS.filter(
    ([key]) => p.specifications?.[key],
  ).map(([key, label]) => ({ label, value: p.specifications![key] as string }));

  // Surface configured print zones as a spec row (e.g. "Full Front 12″×16″")
  if (p.printZones?.length) {
    specifications.push({
      label: "Print Areas",
      value: p.printZones
        .map((z) =>
          z.widthIn && z.heightIn
            ? `${z.name} ${z.widthIn}″×${z.heightIn}″`
            : z.name,
        )
        .join(" · "),
    });
  }

  return {
    detail: {
      productId: p._id,
      slug: p.slug,
      title: p.title,
      subtitle: cat?.name || p.description?.slice(0, 80) || "Custom Apparel",
      price,
      mrp,
      rating: 4.3, // ratings are static per product decision
      ratingCount: "54.3k",
      badge: badgeFor(p.customizationTypes),
      sizes: p.sizes?.length ? p.sizes : ["S", "M", "L", "XL", "XXL"],
      colors: colors.length ? colors : [{ name: "White", hex: "#ffffff" }],
      inStock,
      images: images.length ? images : [PLACEHOLDER],
      sellerName: p.seller?.name ?? null,
    },
    info: {
      productDetails: p.productDetails ?? [],
      specifications,
      material: p.materialAndCare?.material ?? "",
      careInstructions: (p.materialAndCare?.careInstructions ?? []).join(" "),
    },
    measurements: p.measurements ?? [],
  };
}
