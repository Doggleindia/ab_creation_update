import Hero from "@/components/home/Hero";
import ShopTopCategories from "@/components/home/ShopTopCategories";
import OrderingProcessSection from "@/components/home/OrderingProcessSection";
import PrintingServicesSection from "@/components/home/PrintingServicesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import ExploreCollectionSection from "@/components/home/ExploreCollectionSection";
import SellerPartnerSection from "@/components/home/SellerPartnerSection";

export default function Home() {
  return (
    <>
      <Hero />
      <ShopTopCategories />
      <OrderingProcessSection />
      <PrintingServicesSection />
      <TestimonialsSection />
      <ExploreCollectionSection />
      <SellerPartnerSection />
    </>
  );
}
