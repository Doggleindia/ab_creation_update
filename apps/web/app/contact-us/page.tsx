import Footer from "@/components/Footer";
import GetInTouchSection from "@/components/ohers/GetInTouchSection";
import CollectionHero from "@/components/Product-Collection/CollectionHero";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Home() {
  return (
    <>
      <CollectionHero
        title="Contact Us"
        bannerImage="/images/service/service-bg.png"
      />
      <Breadcrumbs />
      <GetInTouchSection />
      <Footer />
    </>
  );
}
