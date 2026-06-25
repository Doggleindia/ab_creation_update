"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import WalletTopUpModal from "@/components/DashboardLayout/WalletTopUpModal"
import * as api from "@/lib/api"
import {
  getLocalCart,
  setLocalCart,
  notifyCartUpdate,
  type CartItem,
} from "@/lib/cart"
import { useRouter } from "next/navigation"

function formatPrice(amount: number) {
  return `Rs. ${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
}

export default function CartSection() {
  const [cart, setCartState] = useState<CartItem[]>([])
  const [grandTotal, setGrandTotal] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)
  const router = useRouter()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const [profileData, setProfileData] = useState<any>(null)
  const [useSavedAddress, setUseSavedAddress] = useState(true)

  // Wallet top-up modal, opened when checkout fails with 402 (low balance)
  const [showTopUp, setShowTopUp] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)

  const [deliveryDetails, setDeliveryDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined
      if (token) {
        try {
          const res = await api.getUserProfile(token)
          if (res?.status === "success" && res?.data?.user) {
            setProfileData(res.data.user)
          }
        } catch (error) {
          console.error("Failed to load profile", error)
        }
      }
    }
    if (isLoggedIn) {
      fetchProfile()
    } else {
      setProfileData(null)
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (profileData) {
      setDeliveryDetails({
        fullName: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        address: profileData.address?.street || "",
        city: profileData.address?.city || "",
        state: profileData.address?.state || "",
        pincode: profileData.address?.pincode || "",
      })
    }
  }, [profileData])

  const hasSavedAddress = !!(
    profileData?.address?.street &&
    profileData?.address?.city &&
    profileData?.address?.state &&
    profileData?.address?.pincode &&
    profileData?.phone
  )

  const handleCheckout = async () => {
    setCheckoutError(null)
    setLoadingCheckout(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined

      // Purchases require login (orders are paid from the wallet).
      if (!token) {
        setCheckoutError("Please log in to place an order.")
        setLoadingCheckout(false)
        router.push("/login")
        return
      }

      const street = isLoggedIn && useSavedAddress && hasSavedAddress ? profileData.address.street : deliveryDetails.address
      const city = isLoggedIn && useSavedAddress && hasSavedAddress ? profileData.address.city : deliveryDetails.city
      const state = isLoggedIn && useSavedAddress && hasSavedAddress ? profileData.address.state : deliveryDetails.state
      const pincode = isLoggedIn && useSavedAddress && hasSavedAddress ? profileData.address.pincode : deliveryDetails.pincode
      const phone = isLoggedIn && useSavedAddress && hasSavedAddress ? profileData.phone : deliveryDetails.phone

      if (!street || !city || !state || !pincode || !phone) {
        throw new Error("Please complete the delivery details (address, city, state, pincode, phone number).")
      }

      // Place the whole cart in one atomic request (all-or-nothing).
      const response = await api.checkoutCart(
        {
          items: cart.map((item) => ({
            productId: item.productId,
            productType: "ready" as const,
            variantId: item.variantId || undefined,
            color: item.snapshot.color || undefined,
            size: item.snapshot.size || undefined,
            quantity: item.quantity,
          })),
          shippingAddress: { street, city, state, pincode },
          phoneNumber: phone,
        },
        token
      )

      const orderId = response?.data?.orderId || response?.data?.orders?.[0]?._id

      // Clear cart (the order already succeeded atomically server-side)
      try {
        const deletePromises = cart.map((item) => api.removeFromCart(item._id, token))
        await Promise.all(deletePromises)
      } catch (deleteError) {
        console.error("Failed to clear cart items on backend", deleteError)
      }
      setCartState([])
      setLocalCart([])
      notifyCartUpdate()

      // Redirect to order confirmation
      router.push(`/order-confirmed?orderId=${orderId}&amount=${grandTotal}`)
    } catch (err: any) {
      console.error("Checkout failed:", err)
      // 402 = insufficient wallet balance → prompt the user to recharge
      if (err?.response?.status === 402) {
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined
          const balRes = await api.getWalletBalance(token)
          setWalletBalance(balRes?.data?.balance ?? 0)
        } catch {
          setWalletBalance(0)
        }
        setCheckoutError("Insufficient wallet balance. Please recharge to complete your order.")
        setShowTopUp(true)
      } else {
        setCheckoutError(err?.response?.data?.message || err?.message || "Checkout failed. Please try again.")
      }
    } finally {
      setLoadingCheckout(false)
    }
  }

  const refreshCart = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined
    setIsLoggedIn(!!token)
    setCartError(null)
    setLoading(true)

    if (token) {
      try {
        const data = await api.getCart(token)
        const items = data.cartItems || []
        setCartState(items)
        setLocalCart(items)
        setGrandTotal(typeof data.grandTotal === "number" ? data.grandTotal : items.reduce((sum: number, item: CartItem) => sum + item.pricing.finalTotal, 0) || 0)
      } catch (error: any) {
        console.error("Failed to load cart", error)
        setCartError("Unable to load cart. Showing saved items.")
        const localCart = getLocalCart()
        setCartState(localCart)
        setGrandTotal(localCart.reduce((sum, item) => sum + item.pricing.finalTotal, 0))
      } finally {
        setLoading(false)
      }
    } else {
      const localCart = getLocalCart()
      setCartState(localCart)
      setGrandTotal(localCart.reduce((sum, item) => sum + item.pricing.finalTotal, 0))
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCart()
    const onUpdate = () => {
      refreshCart().catch(() => { })
    }
    window.addEventListener("cart-updated", onUpdate)
    window.addEventListener("storage", onUpdate)
    return () => {
      window.removeEventListener("cart-updated", onUpdate)
      window.removeEventListener("storage", onUpdate)
    }
  }, [refreshCart])

  const handleQuantityChange = async (id: string, value: number) => {
    const qty = Math.max(1, Math.floor(value))
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined
    setLoading(true)
    setCartError(null)

    if (token) {
      try {
        await api.updateCartItem(id, qty, token)
        await refreshCart()
      } catch (error: any) {
        console.error("Failed to update cart item", error)
        setCartError(error?.message || "Unable to update quantity")
      } finally {
        setLoading(false)
      }
    } else {
      const items = getLocalCart()
      const updated = items.map((item) => {
        if (item._id !== id) return item
        const unitPrice = item.pricing.unitPrice
        const subtotal = unitPrice * qty
        const discountPerUnit = item.quantity ? item.pricing.discount / item.quantity : 0
        const discount = discountPerUnit * qty
        return {
          ...item,
          quantity: qty,
          pricing: {
            ...item.pricing,
            subtotal,
            discount,
            finalTotal: subtotal - discount,
          },
        }
      })
      setLocalCart(updated)
      notifyCartUpdate()
      setCartState(updated)
      setGrandTotal(updated.reduce((sum, item) => sum + item.pricing.finalTotal, 0))
      setLoading(false)
    }
  }

  const handleRemove = async (id: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined
    setLoading(true)
    setCartError(null)

    if (token) {
      try {
        await api.removeFromCart(id, token)
        await refreshCart()
      } catch (error: any) {
        console.error("Failed to remove cart item", error)
        setCartError(error?.message || "Unable to remove item")
      } finally {
        setLoading(false)
      }
    } else {
      const updated = getLocalCart().filter((item) => item._id !== id)
      setLocalCart(updated)
      notifyCartUpdate()
      setCartState(updated)
      setGrandTotal(updated.reduce((sum, item) => sum + item.pricing.finalTotal, 0))
      setLoading(false)
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.pricing.subtotal, 0)

  if (cart.length === 0) {
    return (
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-6">
            {loading ? "Loading cart..." : "Your cart is empty."}
          </p>
          <Button asChild variant="outline" className="border-black">
            <Link href="/">Continue shopping</Link>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
          {/* LEFT – CART TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F1EA] text-left">
                <tr>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Quantity</th>
                  <th className="p-4 font-medium">Subtotal</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 rounded-md overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={item.snapshot.image || "/images/home/Menclothing.png"}
                            alt={item.snapshot.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-medium">{item.snapshot.title}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {[item.snapshot.color, item.snapshot.size].filter(Boolean).join(" / ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {formatPrice(item.pricing.unitPrice)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center border rounded-md overflow-hidden w-fit">

                        {/* Minus */}
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(item._id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || loading}
                          className="px-3 py-1 text-lg font-semibold hover:bg-gray-100 disabled:opacity-40"
                        >
                          −
                        </button>

                        {/* Quantity */}
                        <div className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </div>

                        {/* Plus */}
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(item._id, item.quantity + 1)
                          }
                          disabled={loading}
                          className="px-3 py-1 text-lg font-semibold hover:bg-gray-100 disabled:opacity-40"
                        >
                          +
                        </button>

                      </div>
                    </td>
                    <td className="p-4 font-medium">
                      {formatPrice(item.pricing.subtotal)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(item._id)}
                        className="text-[#CBAA75] hover:opacity-80"
                        aria-label="Remove"
                        disabled={loading}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RIGHT – CART TOTALS */}
          <div className="bg-[#F5F1EA] p-8 rounded-lg h-fit">
            <h3 className="text-lg font-semibold mb-6">Cart Totals</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span className="text-[#CBAA75]">{formatPrice(cart.length ? grandTotal : subtotal)}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-8 border-black" asChild>
              <Link href="/">Continue shopping</Link>
            </Button>
            {!isLoggedIn ? (
              <div className="mt-8 space-y-4">
                <div className="p-4 rounded-md border border-[#E8E6E3] bg-white text-sm text-center">
                  <p className="font-semibold text-neutral-800">Please log in to place your order</p>
                  <p className="text-neutral-600 mt-1">
                    Orders are paid from your wallet, so you&apos;ll need an account to check out.
                  </p>
                </div>
                <Button className="w-full bg-[#171717] hover:bg-[#B87D4C]" asChild>
                  <Link href="/login">Log in to continue</Link>
                </Button>
              </div>
            ) : hasSavedAddress && useSavedAddress ? (
              <div className="mt-8 space-y-4">
                <div className="p-4 rounded-md border border-[#E8E6E3] bg-white text-sm">
                  <p className="font-semibold text-neutral-800">Deliver to Saved Address:</p>
                  <p className="text-neutral-700 mt-1 font-medium">{profileData?.name}</p>
                  <p className="text-neutral-600">{profileData?.phone}</p>
                  <p className="text-neutral-600 mt-1">
                    {profileData?.address?.street}, {profileData?.address?.city}, {profileData?.address?.state} - {profileData?.address?.pincode}
                  </p>
                  <button
                    type="button"
                    onClick={() => setUseSavedAddress(false)}
                    className="text-xs text-[#B87D4C] hover:underline mt-2 font-medium block text-left"
                  >
                    Use a different address
                  </button>
                </div>
                {checkoutError && <div className="text-sm text-red-600 font-medium">{checkoutError}</div>}
                <Button
                  className="w-full bg-[#171717] hover:bg-[#B87D4C]"
                  onClick={handleCheckout}
                  disabled={loadingCheckout}
                >
                  {loadingCheckout ? 'Placing order...' : 'Buy Now'}
                </Button>
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-neutral-800">Delivery Details</h4>
                    {hasSavedAddress && (
                      <button
                        type="button"
                        onClick={() => setUseSavedAddress(true)}
                        className="text-xs text-[#B87D4C] hover:underline font-medium"
                      >
                        Use saved address
                      </button>
                    )}
                  </div>

                  <Input
                    placeholder="Phone"
                    value={deliveryDetails.phone}
                    onChange={(e) => setDeliveryDetails((d) => ({ ...d, phone: e.target.value }))}
                  />
                  <Input
                    placeholder="Address"
                    value={deliveryDetails.address}
                    onChange={(e) => setDeliveryDetails((d) => ({ ...d, address: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="City"
                      value={deliveryDetails.city}
                      onChange={(e) => setDeliveryDetails((d) => ({ ...d, city: e.target.value }))}
                    />
                    <Input
                      placeholder="State"
                      value={deliveryDetails.state}
                      onChange={(e) => setDeliveryDetails((d) => ({ ...d, state: e.target.value }))}
                    />
                  </div>
                  <Input
                    placeholder="Pincode"
                    value={deliveryDetails.pincode}
                    onChange={(e) => setDeliveryDetails((d) => ({ ...d, pincode: e.target.value }))}
                  />
                  {checkoutError && <div className="text-sm text-red-600 font-medium">{checkoutError}</div>}
                </div>
                <Button
                  className="w-full bg-[#171717] hover:bg-[#B87D4C]"
                  onClick={handleCheckout}
                  disabled={loadingCheckout}
                >
                  {loadingCheckout ? 'Placing order...' : 'Buy Now'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <WalletTopUpModal
        open={showTopUp}
        onClose={() => setShowTopUp(false)}
        currentBalance={walletBalance}
        onSuccess={(newBalance: number) => {
          setWalletBalance(newBalance)
          setShowTopUp(false)
          setCheckoutError("Wallet recharged. Click Buy Now to place your order.")
        }}
      />
    </section>
  )
}
