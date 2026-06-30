import CollectionProductsPage from "@/components/Product-Collection/CollectionProductsPage";
import Footer from "@/components/Footer";
import ShopTopCategories from "@/components/home/ShopTopCategories";

export default function page() {
  return (
    <>
      <CollectionProductsPage />
      <ShopTopCategories />
      <Footer />
    </>
  );
}
