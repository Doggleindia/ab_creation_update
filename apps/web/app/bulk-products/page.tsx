import BulkOrderPage from '@/components/Bulk-Order/BulkOrderPage'
import Footer from '@/components/Footer'
import Breadcrumbs from '@/components/Breadcrumbs'

const page = () => {
  return (
    <div>
      <Breadcrumbs />
      <BulkOrderPage />
      <Footer/>
    </div>
  )
}

export default page