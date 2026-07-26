import Hero from "@/components/home/Hero";
import ShopTopCategories from "@/components/home/ShopTopCategories";
import OrderingProcessSection from "@/components/home/OrderingProcessSection";
import PrintingServicesSection from "@/components/home/PrintingServicesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import ExploreCollectionSection from "@/components/home/ExploreCollectionSection";
import SellerPartnerSection from "@/components/home/SellerPartnerSection";
import { getSiteContent } from "@/lib/api";

export default async function Home() {
  const content = await getSiteContent();
  const visible = (section?: { visible?: boolean }) => section?.visible !== false;

  return (
    <>
      {visible(content.hero) && (
        <Hero content={content.hero} trust={content.trustBadges} />
      )}
      {visible(content.topCategories) && <ShopTopCategories />}
      {visible(content.orderingProcess) && <OrderingProcessSection />}
      {visible(content.printingServices) && <PrintingServicesSection />}
      {visible(content.testimonials) && (
        <TestimonialsSection items={content.testimonials?.items} />
      )}
      {visible(content.collectionCarousel) && <ExploreCollectionSection />}
      {visible(content.sellerBanner) && <SellerPartnerSection />}
    </>
  );
}
