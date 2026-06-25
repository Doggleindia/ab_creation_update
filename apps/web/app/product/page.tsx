import Footer from "@/components/Footer";
import LookbookSection from "@/components/home/LookbookSection";
import CollectionHero from "@/components/Product-Collection/CollectionHero";
import CollectionProductsPage from "@/components/Product-Collection/CollectionProductsPage";
import ExploreCategories from "@/components/Product-Collection/ExploreCategories";

export default function CollectionPage() {
  return (
    <>
      <CollectionHero
        title="T - Shirts"
        bannerImage="/images/home/lookbook-bg.png"
      />
      <CollectionProductsPage />
      <ExploreCategories/>
      <LookbookSection />
      <Footer />
    </>
  );
}
