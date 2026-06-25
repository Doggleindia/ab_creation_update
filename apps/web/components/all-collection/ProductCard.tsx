import Image from "next/image"

export default function ProductCard({
  image,
  title,
}: {
  image: string
  title: string
}) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition"
        />

        <span className="absolute bottom-3 left-3 bg-white text-xs px-3 py-1 rounded shadow">
          {title}
        </span>
      </div>
    </div>
  )
}
