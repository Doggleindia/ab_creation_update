import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import ShopByCollection from "@/components/all-collection/ShopByCollection";
import NewestArrivals from "@/components/all-collection/NewestArrivals";
import ClientTestimonials from "@/components/product-page/ClientTestimonials";
import FeatureStrip from "@/components/common/FeatureStrip";

export default function CollectionPage() {
  return (
    <>
      <Breadcrumbs customSegments={[{ label: "Collection page" }]} />
      <ShopByCollection />
      <NewestArrivals />
      <ClientTestimonials />
      <FeatureStrip />
      <Footer />
    </>
  );
}
