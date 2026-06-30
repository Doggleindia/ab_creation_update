import Image from "next/image";
import Link from "next/link";

interface BulkProductCardProps {
  image: string;
  title: string;
  description?: string;
  price: string;
  priceSuffix?: string;
  badge?: string;
  slug: string;
}

export default function BulkProductCard({
  image,
  title,
  description = "",
  price,
  priceSuffix,
  badge,
  slug
}: BulkProductCardProps) {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Badge */}
      {badge && (
        <span className="absolute top-3 left-3 bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded z-10">
          {badge}
        </span>
      )}

      {/* Image */}
      <Link href={`/bulk-products/${slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-2">
        <Link href={`/bulk-products/${slug}`}>
          <h3 className="text-sm font-semibold text-gray-900 hover:text-[#B87D4C] transition">
            {title}
          </h3>
        </Link>

        {description && (
          <p className="text-xs text-gray-500 line-clamp-1">{description}</p>
        )}

        <p className="text-base text-gray-900">
          <span className="font-bold">{price}</span>
          {priceSuffix && (
            <span className="text-xs font-normal text-gray-500">{priceSuffix}</span>
          )}
        </p>
      </div>
    </div>
  );
}
