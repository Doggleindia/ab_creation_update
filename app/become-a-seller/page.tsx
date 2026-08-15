import type { Metadata } from "next";
import SellerHero from "@/components/seller/SellerHero";
import HowItWorksSection from "@/components/seller/HowItWorksSection";
import EarningsSection from "@/components/seller/EarningsSection";
import ProductsCatalogSection from "@/components/seller/ProductsCatalogSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import ExploreCollectionSection from "@/components/home/ExploreCollectionSection";
import SellerPartnerSection from "@/components/home/SellerPartnerSection";

export const metadata: Metadata = {
  title: "Join as Seller | AB Creation",
  description:
    "Build your apparel brand with AB Creation — no inventory, no upfront costs. We handle printing, fulfilment, and payouts.",
};

export default function BecomeASellerPage() {
  return (
    <main>
      <SellerHero />
      <HowItWorksSection />
      <EarningsSection />
      <ProductsCatalogSection />
      <TestimonialsSection />
      <ExploreCollectionSection />
      <SellerPartnerSection />
    </main>
  );
}
