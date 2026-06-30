import Footer from '@/components/Footer'
import LookbookSection from '@/components/look-book/LookbookSection'
import EstimateOrderSection from '@/components/look-book/EstimateOrderSection'
import CollectionHero from '@/components/Product-Collection/CollectionHero'
import Breadcrumbs from '@/components/Breadcrumbs'
import React from 'react'

const page = () => {
  return (
    <div>
       <CollectionHero
              title="Lookbook"
              bannerImage="/images/home/lookbook-bg.png"
            />
      <Breadcrumbs />
      <LookbookSection />
      <EstimateOrderSection />
      <Footer/>
    </div>
  )
}

export default page