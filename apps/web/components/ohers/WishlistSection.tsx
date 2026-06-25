"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Heart, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocalWishlist, setLocalWishlist, toggleWishlistItem, type WishlistItem } from "@/lib/wishlist";

export default function WishlistSection() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = () => {
    setWishlist(getLocalWishlist());
    setLoading(false);
  };

  useEffect(() => {
    loadWishlist();
    window.addEventListener("wishlist-updated", loadWishlist);
    window.addEventListener("storage", loadWishlist);
    return () => {
      window.removeEventListener("wishlist-updated", loadWishlist);
      window.removeEventListener("storage", loadWishlist);
    };
  }, []);

  const handleRemove = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = wishlist.filter((item) => item.slug !== slug);
    setLocalWishlist(updated);
  };

  if (loading) {
    return (
      <section className="bg-white py-20 min-h-[50vh] flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-lg">Loading wishlist...</p>
      </section>
    );
  }

  if (wishlist.length === 0) {
    return (
      <section className="bg-[#F5F1EA] py-28 text-center min-h-[60vh] flex flex-col justify-center items-center px-4">
        <div className="relative mb-6">
          <div className="absolute -inset-1 rounded-full bg-[#E8E6E3] blur-md animate-ping opacity-75"></div>
          <div className="relative bg-white border border-slate-100 p-6 rounded-full shadow-lg">
            <Heart className="h-12 w-12 text-slate-300 stroke-[1.5]" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-3">Your wishlist is empty</h2>
        <p className="text-slate-500 max-w-md mb-8 text-base leading-relaxed">
          Tap the heart icon on any product you like while browsing and they will appear here. Save your favorites for later!
        </p>
        <Button asChild className="bg-[#171717] hover:bg-[#B87D4C] text-white font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition duration-300 group">
          <Link href="/product-collection" className="flex items-center gap-2">
            Continue Shopping
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="bg-[#F5F1EA] py-16 min-h-[60vh]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">My Wishlist</h2>
            <p className="text-slate-500 text-sm mt-1">
              You have {wishlist.length} item{wishlist.length > 1 ? "s" : ""} saved in your favorites.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setLocalWishlist([])}
            className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition duration-300 w-fit self-start md:self-auto rounded-xl px-5 py-2 font-medium"
          >
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlist.map((item) => (
            <div 
              key={item.slug} 
              className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Remove Button */}
              <button
                onClick={(e) => handleRemove(item.slug, e)}
                className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/95 shadow-md hover:bg-red-50 hover:text-red-500 text-slate-500 transition duration-200"
                title="Remove from favorites"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              {/* Product Info Link */}
              <Link href={`/product/${item.slug}`} className="flex-grow flex flex-col">
                {/* Image Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-50">
                  <Image
                    src={item.image || "/images/home/Menclothing.png"}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition duration-300 z-10" />
                </div>

                {/* Content */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-slate-800 line-clamp-1 group-hover:text-[#B87D4C] transition duration-200">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-950">{item.price}</span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1 group-hover:text-slate-600 transition">
                      View details
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <Button asChild className="w-full bg-[#171717] hover:bg-[#B87D4C] text-white font-medium py-3 rounded-xl transition duration-300 shadow-sm">
                  <Link href={`/product/${item.slug}`}>
                    Select Options & Order
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
