import CollectionFilters from "../Product-Collection/Filters";
import ProductGrid from "./ProductGrid";


export default function CollectionPage() {
  return (
    <section className="bg-white">
      {/* Breadcrumb */}
      <div className="bg-[#F5F1EA] px-6 py-4 text-sm text-muted-foreground">
        Home <span className="mx-2">{">"}</span> Collection page
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
          {/* LEFT FILTER */}
          <CollectionFilters />

          {/* RIGHT PRODUCTS */}
          <ProductGrid />
        </div>
      </div>
    </section>
  )
}
