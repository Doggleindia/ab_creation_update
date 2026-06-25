import Footer from "@/components/Footer";
import TestimonialsSection from "@/components/home/TestimonialsSection";
// import WhyChooseUs from "@/components/home/WhyChooseUs";
import CollectionHero from "@/components/Product-Collection/CollectionHero";
import ChooseHowToShop from "@/components/service/ChooseHowToShop";
import ChooseYourStyle from "@/components/service/ChooseYourStyle";
import FAQSection from "@/components/service/FAQSection";
import HowItWorks from "@/components/service/HowItWorks";
import Breadcrumbs from "@/components/Breadcrumbs";
const page = () => {
  return (
    <div>
      <CollectionHero
        title="Services"
        bannerImage="/images/service/service-bg.png"
      />
      <Breadcrumbs />
      <h2 className="text-center text-2xl font-bold tracking-widest text-gray-800 pt-8">
        CHOOSE YOUR STYLE
      </h2>

      <ChooseYourStyle />
      <ChooseYourStyle />
      <ChooseYourStyle />
      <ChooseHowToShop />
      {/* <WhyChooseUs/> */}
      <HowItWorks/>
        <TestimonialsSection/>
        <FAQSection/>
      <Footer />
    </div>
  );
};

export default page;
