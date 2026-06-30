import Footer from "@/components/Footer";
import CollectionHero from "@/components/Product-Collection/CollectionHero";
import ChooseHowToShop from "@/components/service/ChooseHowToShop";
import ChooseYourStyle from "@/components/service/ChooseYourStyle";
import WhyChooseUsService from "@/components/service/WhyChooseUsService";
import FAQSection from "@/components/service/FAQSection";
import HowItWorks from "@/components/service/HowItWorks";
import ClientTestimonials from "@/components/product-page/ClientTestimonials";
import EstimateOrderSection from "@/components/look-book/EstimateOrderSection";
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

      {/* 1. DTF (default content) */}
      <ChooseYourStyle />

      {/* 2. Embroidery */}
      <ChooseYourStyle
        title="2. Embroidery"
        description="Embroidery is a premium decoration method where designs are stitched directly into the fabric using high-quality threads. It offers a textured, professional finish that's highly durable and perfect for branded apparel."
        bestFor={[
          "Logos & Text",
          "Ideal for company logos, monograms, and lettering",
          "Small to Medium Designs",
          "Works especially well on polo shirts, caps, jackets, and uniforms",
        ]}
        images={[
          "/images/home/embroidery-service.png",
          "/images/home/embroidery-service.png",
          "/images/home/embroidery-service.png",
        ]}
      />

      {/* 3. Classic Screen Printing */}
      <ChooseYourStyle
        title="3. Classic Screen Printing"
        description="Classic Screen Printing is a traditional and reliable printing method known for its bold colors and long-lasting prints. Ink is pushed through a custom-made screen onto the fabric, making it ideal for large orders with simple, striking designs."
        bestFor={[
          "Bulk Orders",
          "Ideal for large quantities at a lower cost per piece",
          "Simple, Bold Designs",
          "Works especially well on t-shirts, hoodies, and uniforms",
        ]}
        images={[
          "/images/home/screen-printing.png",
          "/images/home/screen-printing.png",
          "/images/home/screen-printing.png",
        ]}
      />

      <ChooseHowToShop />
      <WhyChooseUsService />
      <HowItWorks />
      <ClientTestimonials />
      <FAQSection />
      <EstimateOrderSection />
      <Footer />
    </div>
  );
};

export default page;
