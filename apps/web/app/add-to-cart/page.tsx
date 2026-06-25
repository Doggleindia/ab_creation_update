import Footer from "@/components/Footer"
import CartSection from "@/components/ohers/CartSection"
import CollectionHero from "@/components/Product-Collection/CollectionHero"
import Breadcrumbs from "@/components/Breadcrumbs"

export default function Home() {
  return (
    <>
      <CollectionHero
        title="Cart"
        bannerImage="/images/service/service-bg.png"
      />
      <Breadcrumbs />
      <CartSection/>
      <Footer/>
    </>
  )
}
