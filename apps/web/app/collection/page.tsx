import type { Metadata } from "next";
import CollectionPage from "@/components/collection/CollectionPage";
import ShopTopCategories from "@/components/home/ShopTopCategories";

export const metadata: Metadata = {
  title: "Choose a Base Product | AB Creation",
  description:
    "Browse our range of customizable apparel — tees, hoodies, polos and more. Pick a base product and put your design on it.",
};

export default function Page() {
  return (
    <main>
      <CollectionPage />
      <ShopTopCategories />
    </main>
  );
}
