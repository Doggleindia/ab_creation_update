import { notFound } from "next/navigation";
import BulkOrderDetails from "@/components/Bulk-Order/BulkOrderDetails";
import Footer from "@/components/Footer";
import { getBulkProductBySlug } from "@/lib/api";

interface PageProps {
  params: Promise<{
    productid: string;
  }>;
}

export default async function BulkOrderDetailsPage({ params }: PageProps) {
  const { productid } = await params;
  
  try {
    // Fetch from API using slug
    const response = await getBulkProductBySlug(productid);
    const product = response?.data;
    
    if (!product) {
      notFound();
    }

    return (
      <div>
        <BulkOrderDetails product={product} />
        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Error fetching bulk product:", error);
    notFound();
  }
}
