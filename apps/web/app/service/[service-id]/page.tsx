import Footer from "@/components/Footer";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CreateCustomDTGSection from "@/components/service/each-service/CreateCustomDTGSection";
import HeroServices from "@/components/service/each-service/HeroServices";
import PrintingProcessSection from "@/components/service/each-service/PrintingProcessSection";
import ServiceSection from "@/components/service/each-service/ServiceSection";
import TrustedBrands from "@/components/service/each-service/TrustedBrands";
import Breadcrumbs from "@/components/Breadcrumbs";

const page = () => {
  return (
    <div>
      <HeroServices
        title="Vibrant DTF Printing for Any Fabric"
        description="Discover the art of vibrant DTF printing on diverse fabrics. From cotton to polyester, our advanced technology ensures stunning, durable prints that bring your designs to life on any material."
        bannerImage="/images/service/service-bg.png"
      />
      <Breadcrumbs />

<ServiceSection/>
<PrintingProcessSection/>
<TrustedBrands/>
<TestimonialsSection/>
<CreateCustomDTGSection/>
      <Footer />
    </div>
  );
};

export default page;
