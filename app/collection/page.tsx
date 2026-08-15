import type { Metadata } from "next";
import CollectionView from "@/components/collection/CollectionView";
import ShopTopCategories from "@/components/home/ShopTopCategories";
import { getProducts, getCategories } from "@/lib/api";

export const metadata: Metadata = {
  title: "Choose a Base Product | AB Creation",
  description:
    "Browse our range of customizable apparel — tees, hoodies, polos and more. Pick a base product and put your design on it.",
};

type SearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const [{ products, meta }, categories] = await Promise.all([
    getProducts({
      category: one(sp.category),
      search: one(sp.search),
      sort: one(sp.sort),
      page: Number(one(sp.page)) || 1,
      printMethod: one(sp.printMethod),
      size: one(sp.size),
      color: one(sp.color),
      priceRange: one(sp.priceRange),
    }),
    getCategories(),
  ]);

  return (
    <main>
      <CollectionView products={products} meta={meta} categories={categories} />
      <ShopTopCategories />
    </main>
  );
}
