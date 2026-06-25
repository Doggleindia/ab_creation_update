'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Menu, Search, User, ShoppingCart, Heart, X } from 'lucide-react'
import { getCartCount, setLocalCart } from '@/lib/cart'
import { getWishlistCount } from '@/lib/wishlist'

import { Separator } from "@/components/ui/separator"
import { getCollections, getCart } from '@/lib/api'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [collections, setCollections] = useState<Array<{ _id: string; slug: string; name: string }>>([])

  const [showCollections, setShowCollections] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const update = () => setCartCount(getCartCount())
    update()

    // Sync cart from server on mount if logged in
    const syncCart = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined
      if (token) {
        try {
          const response = await getCart(token)
          if (response?.status === 'success' && response?.cartItems) {
            setLocalCart(response.cartItems)
          }
        } catch (error) {
          console.error('Failed to sync cart with server', error)
        }
      }
    }
    syncCart()

    window.addEventListener('cart-updated', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('cart-updated', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  useEffect(() => {
    const updateWishlist = () => setWishlistCount(getWishlistCount())
    updateWishlist()
    window.addEventListener('wishlist-updated', updateWishlist)
    window.addEventListener('storage', updateWishlist)
    return () => {
      window.removeEventListener('wishlist-updated', updateWishlist)
      window.removeEventListener('storage', updateWishlist)
    }
  }, [])


  useEffect(() => {
    const loadCollections = async () => {
      try {
        const response = await getCollections()
        if (response?.status === 'success' && response?.data?.collections) {
          setCollections(response.data.collections)
        }
      } catch (error) {
        console.error('Failed to load collections', error)
      }
    }
    loadCollections()
  }, [])

  return (
    <nav className="sticky top-0 z-50 w-full bg-white">
      {/* Top Banner */}
      <div className="w-full bg-black text-white text-sm">
        <div className="container mx-auto max-w-screen-2xl flex items-center justify-between px-4 md:px-6 lg:px-8 py-2">
          <span className="text-xs md:text-sm">If you order today estimate delivery time is 12 September.</span>
          <div className="flex items-center space-x-4 text-xs md:text-sm">
            <span>🕐 9:00 AM - 5:30 PM</span>
            <span>📞 Call us: (912) 112 12 12</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="border-b border-slate-200 relative">
        <div className="container mx-auto max-w-screen-2xl flex h-20 items-center justify-between px-4 md:px-6 lg:px-8">
          {isSearchOpen ? (
            <div className="flex w-full items-center gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for products, categories, or collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-10 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-slate-800 text-base"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-medium transition"
                  >
                    Clear
                  </button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full flex items-center justify-center"
                onClick={() => {
                  setIsSearchOpen(false)
                  setSearchQuery('')
                }}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close Search</span>
              </Button>
            </div>
          ) : (
            <>
              {/* Logo - Left */}
              <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-2xl font-bold text-orange-500">INK & PRESS</span>
              </Link>

              {/* Desktop Menu - Center */}
              <div className="hidden items-center space-x-8 lg:flex">
                <div
                  className="relative"
                  onMouseEnter={() => setShowCollections(true)}
                  onMouseLeave={() => setShowCollections(false)}
                >
                  <Link
                    href="/product-collection"
                    className="text-base font-medium text-slate-800 hover:text-orange-500 transition-colors"
                  >
                    Products
                  </Link>

                  {showCollections && (
                    <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 z-50">
                      {collections.length > 0 ? (
                        collections.map((collection) => (
                          <Link
                            key={collection._id}
                            href={`/product-collection?collectionSlug=${encodeURIComponent(collection.slug)}`}
                            className="block rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 transition"
                          >
                            {collection.name.replace(/-COLLECTIONS$/i, ' Collection')}
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-500">Loading collections...</div>
                      )}
                    </div>
                  )}
                </div>
                <Link href="/service" className="text-base font-medium text-slate-800 hover:text-orange-500 transition-colors">
                  Services
                </Link>
                <Link href="/contact-us" className="text-base font-medium text-slate-800 hover:text-orange-500 transition-colors">
                  Contact us
                </Link>
                <Link href="/look-book" className="text-base font-medium text-slate-800 hover:text-orange-500 transition-colors">
                  Look Book
                </Link>
                <Link href="/bulk-products" className="text-base font-medium text-slate-800 hover:text-orange-500 transition-colors">
                  Bulk Order
                </Link>
                <Link href="/" className="text-base font-medium text-slate-800 hover:text-orange-500 transition-colors">
                  Join as Seller
                </Link>
              </div>

              {/* Right Icons + Design Now Button + Mobile Menu */}
              <div className="flex items-center space-x-4 lg:space-x-6">

                {/* Search Icon */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5 text-slate-800" />
                  <span className="sr-only">Search</span>
                </Button>

                {/* User Icon */}
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                  <Link href="/dashboard" className="flex items-center justify-center">
                    <User className="h-5 w-5 text-slate-800" />
                    <span className="sr-only">Account</span>
                  </Link>
                </Button>

                {/* Wishlist Icon */}
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 relative">
                  <Link href="/wishlist" className="flex items-center justify-center">
                    <Heart className={wishlistCount > 0 ? "h-5 w-5 text-red-500 fill-red-500" : "h-5 w-5 text-slate-800"} />
                    <span className="sr-only">Wishlist</span>
                  </Link>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>

                {/* Cart Icon */}
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 relative">
                  <Link href="/add-to-cart" className="flex items-center justify-center">
                    <ShoppingCart className={cartCount > 0 ? "h-5 w-5 text-red-500" : "h-5 w-5 text-slate-800"} />
                    <span className="sr-only">Cart</span>
                  </Link>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>

                {/* Design Now Button */}
                <Button className="hidden lg:flex bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-full">
                  <Link href="/" className="w-full h-full flex items-center justify-center">
                    Design Now
                  </Link>
                </Button>

                {/* Mobile Menu Button */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 lg:hidden"
                    >
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                    <div className="flex flex-col h-full">
                      {/* Mobile Menu Items */}
                      <div className="flex-1 p-6 space-y-4">
                        <SheetClose asChild>
                          <Link href="/product-collection" className="block p-3 text-lg font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                            Products
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/service" className="block p-3 text-lg font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                            Services
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/contact-us" className="block p-3 text-lg font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                            Contact us
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/look-book" className="block p-3 text-lg font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                            Look Book
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/bulk-products" className="block p-3 text-lg font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                            Bulk Products
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/" className="block p-3 text-lg font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                            Join as Seller
                          </Link>
                        </SheetClose>
                        <Separator />
                      </div>

                      {/* Mobile Bottom Actions */}
                      <div className="p-6 border-t border-slate-200 bg-slate-50">
                        <div className="space-y-3">
                          <SheetClose asChild>
                            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium">
                              Design Now
                            </Button>
                          </SheetClose>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          )}
        </div>

        {/* Suggestion Dropdown if search is open */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-2xl rounded-b-3xl py-8 px-6 md:px-12 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
            <div className="container mx-auto max-w-4xl">
              {searchQuery.trim() === "" ? (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Popular Searches</h4>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['Adhesive Tape', 'Custom T-Shirts', 'Packaging Tape', 'Stickers', 'Ink Press', 'Poster'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="px-4 py-2 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-600 rounded-full text-sm font-medium transition-colors border border-slate-100"
                      >
                        {term}
                      </button>
                    ))}
                  </div>

                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Browse Categories</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {collections.map((col) => (
                      <Link
                        key={col._id}
                        href={`/product-collection?collectionSlug=${encodeURIComponent(col.slug)}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-200 text-center transition group"
                      >
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-orange-500 transition-colors">
                          {col.name.replace(/-COLLECTIONS$/i, ' Collection')}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-slate-500">
                      Showing results for "<span className="font-semibold text-slate-800">{searchQuery}</span>"
                    </span>
                  </div>

                  <div className="space-y-3">
                    {['Adhesive Sheet', 'Double Sided Tape', 'Premium Logo Print', 'Custom Sticker Pack', 'Adhesive Roll', 'Custom Printed Mug']
                      .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((item, idx) => (
                        <Link
                          key={idx}
                          href={`/product-collection?q=${encodeURIComponent(item)}`}
                          onClick={() => {
                            setIsSearchOpen(false)
                            setSearchQuery('')
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-orange-50/50 rounded-xl transition group"
                        >
                          <Search className="h-4 w-4 text-slate-400 group-hover:text-orange-500" />
                          <span className="text-sm font-medium text-slate-700 group-hover:text-orange-600">
                            {item}
                          </span>
                        </Link>
                      ))}
                    {['Adhesive Sheet', 'Double Sided Tape', 'Premium Logo Print', 'Custom Sticker Pack', 'Adhesive Roll', 'Custom Printed Mug']
                      .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-slate-500 text-sm">No quick matches found for "{searchQuery}". Press Enter to search all items.</p>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
