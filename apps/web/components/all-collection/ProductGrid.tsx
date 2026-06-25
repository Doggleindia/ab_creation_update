import ProductCard from "./ProductCard"

const products = Array.from({ length: 7 })

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((_, i) => (
        <ProductCard
          key={i}
          image={`/images/home/Menclothing.png`}
          title="T-shirts – Round Neck"
        />
      ))}
    </div>
  )
}
