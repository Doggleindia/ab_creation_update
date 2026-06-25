import Footer from "@/components/Footer";
import ShopTopCategories from "@/components/home/ShopTopCategories";
import CollectionProductsPage from "@/components/Product-Collection/CollectionProductsPage";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function CollectionPage() {
  return (
    <>
      <Breadcrumbs />
      <CollectionProductsPage />
      <ShopTopCategories />
      <Footer />
    </>
  );
}
