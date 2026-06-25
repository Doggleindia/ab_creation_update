import Footer from "@/components/Footer";
import WishlistSection from "@/components/ohers/WishlistSection";
import CollectionHero from "@/components/Product-Collection/CollectionHero";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "My Wishlist | AB Creation",
  description: "Browse and order from your favorite items saved in your wishlist.",
};

export default function WishlistPage() {
  return (
    <>
      <CollectionHero
        title="My Wishlist"
        bannerImage="/images/service/service-bg.png"
      />
      <Breadcrumbs />
      <WishlistSection />
      <Footer />
    </>
  );
}
