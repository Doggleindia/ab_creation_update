import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { isInWishlist, toggleWishlistItem } from "@/lib/wishlist";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductCardProps {
  image: string;
  title: string;
  description?: string;
  price: string;
  badge?: string;
  slug: string;
  colors?: string[];
}

export default function ProductCard({
  image,
  title,
  description = "",
  price,
  badge,
  slug,
  colors = []
}: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsFavorited(isInWishlist(slug));
    const handleUpdate = () => {
      setIsFavorited(isInWishlist(slug));
    };
    window.addEventListener("wishlist-updated", handleUpdate);
    return () => {
      window.removeEventListener("wishlist-updated", handleUpdate);
    };
  }, [slug]);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleConfirm = () => {
    toggleWishlistItem({
      slug,
      title,
      image,
      price,
      description,
    });
    setIsOpen(false);
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Confirm Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-100 rounded-xl shadow-xl z-[100]">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Heart className={`h-5 w-5 ${isFavorited ? "fill-[#C79280] text-[#C79280]" : "text-[#B87D4C] fill-[#B87D4C]/10"}`} />
              {isFavorited ? "Remove from Wishlist" : "Add to Wishlist"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {isFavorited 
                ? `Are you sure you want to remove "${title}" from your wishlist?`
                : `Would you like to add "${title}" to your wishlist?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-3 justify-end mt-4">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 sm:flex-none bg-white border border-gray-300 text-gray-700 text-sm font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 sm:flex-none text-white text-sm font-semibold py-2.5 px-6 rounded-lg transition ${
                isFavorited 
                  ? "bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/10"
                  : "bg-[#171717] hover:bg-[#B87D4C] shadow-md shadow-[#B87D4C]/10"
              }`}
            >
              Yes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badge */}
      {badge && (
        <span
          className={`absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1 rounded z-10 ${
            badge.toLowerCase().includes("screen") ? "bg-[#B87D4C]" : "bg-[#3F3F46]"
          }`}
        >
          {badge}
        </span>
      )}

      {/* Wishlist Icon */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition"
      >
        <Heart
          className={`h-5 w-5 ${isFavorited ? "fill-[#C79280] text-[#C79280]" : "text-gray-600"
            }`}
        />
      </button>

      {/* Image */}
      <Link href={`/product/${slug}`}>
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
      <div className="p-4 space-y-3">
        <Link href={`/product/${slug}`}>
          <h3 className="text-sm font-semibold text-gray-900 hover:text-[#B87D4C] transition">
            {title}
          </h3>
        </Link>

        {description && (
          <p className="text-xs text-gray-500 truncate">{description}</p>
        )}

        <p className="text-lg font-bold text-gray-900">{price}</p>

        {/* Colors */}
        {colors && colors.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {colors.map((color) => {
              const colorMap: Record<string, string> = {
                "Red": "bg-red-500",
                "Black": "bg-black",
                "Blue": "bg-[#171717]",
                "White": "bg-white border border-gray-300",
                "Green": "bg-green-500",
                "Yellow": "bg-[#CBAA75]",
                "Purple": "bg-[#171717]",
                "Pink": "bg-pink-500",
                "Orange": "bg-[#B87D4C]",
                "Gray": "bg-gray-500",
                "Navy Blue": "bg-[#171717]",
                "Navy": "bg-[#171717]",
              };
              return (
                <div
                  key={color}
                  className={`h-4 w-4 rounded-full cursor-pointer hover:ring-2 ring-gray-400 transition ${colorMap[color] || "bg-gray-300"}`}
                  title={color}
                />
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link
            href={`/product/${slug}`}
            className="flex-1 text-center bg-white border border-[#B87D4C] text-[#B87D4C] text-xs font-semibold py-2 px-3 rounded hover:bg-[#F5F1EA] transition"
          >
            Add to Cart
          </Link>
          <Link
            href={`/product/${slug}`}
            className="flex-1 text-center bg-[#B87D4C] text-white text-xs font-semibold py-2 px-3 rounded hover:bg-[#171717] transition"
          >
            Customize
          </Link>
        </div>
      </div>
    </div>
  );
}
