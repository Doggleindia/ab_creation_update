"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Order = {
  _id: string
  orderId?: string
  productType: "ready" | "bulk"
  productId?: {
    _id: string
    title: string
    name?: string
    images?: string[]
    image?: string
  }
  variantId?: {
    _id: string
    color: string
  }
  color?: string
  size?: string
  quantity: number
  totalAmount: number
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  }
  phoneNumber?: string
  customDesign?: string
  anyText?: string
  orderStatus: string
  paymentStatus: string
  userId?: {
    _id: string
    name: string
    email: string
  }
  guestName?: string
  guestEmail?: string
  createdAt?: string
}

export default function OrderDetails({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const base = process.env.NEXT_PUBLIC_MAIN_BACKEND
  const host = base ? String(base).replace(/\/$/, "") : ''

  const handleUnauthorized = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    router.push('/login')
  }

  const getStatusBadgeColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-700";
    const statusLower = status.toLowerCase();
    if (statusLower === "pending") return "bg-yellow-100 text-yellow-700";
    if (statusLower === "processing") return "bg-[#E8E6E3] text-[#B87D4C]";
    if (statusLower === "shipped") return "bg-[#E8E6E3] text-[#B87D4C]";
    if (statusLower === "delivered") return "bg-green-100 text-green-700";
    if (statusLower === "cancelled") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  useEffect(() => {
    const headers: Record<string, string> = {}
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined
    if (token) headers['Authorization'] = `Bearer ${token}`

    setLoading(true)
    const url = host ? `${host}/api/orders/${orderId}` : `/api/orders/${orderId}`
    fetch(url, { headers })
      .then(async (res) => {
        if (res.status === 401) {
          handleUnauthorized()
          return
        }
        const data = await res.json()
        setOrder(data?.data || data?.order || null)
      })
      .catch((err) => {
        console.error("Failed to load order:", err)
        setError('Failed to load order')
      })
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) return <div className="text-sm text-neutral-500 py-4">Loading order...</div>
  if (error) return <div className="text-sm text-red-600 font-medium py-4">{error}</div>
  if (!order) return <div className="text-sm text-neutral-500 py-4">No order found.</div>

  const displayName = order.guestName || order.userId?.name || "Customer"
  const displayEmail = order.guestEmail || order.userId?.email || "N/A"

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Order #{order.orderId || order._id}</h2>
        <Link href="/dashboard/orders" className="text-sm text-[#B87D4C] hover:underline font-semibold">
          Back to orders
        </Link>
      </div>

      <div className="bg-[#F5F1EA] p-6 rounded-lg space-y-6 border border-[#F5F1EA]">
        {/* Statuses Header */}
        <div className="flex flex-wrap gap-4 justify-between items-center border-b pb-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider block">Order Status</span>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize inline-block ${getStatusBadgeColor(order.orderStatus)}`}>
              {order.orderStatus || 'Pending'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider block">Payment Status</span>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize inline-block ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {order.paymentStatus || 'Pending'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider block">Date Placed</span>
            <span className="text-sm font-semibold text-neutral-800">
              {order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : 'N/A'}
            </span>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="border-b pb-6">
          <h4 className="font-bold text-neutral-800 mb-3">Delivery Details</h4>
          <div className="bg-white p-4 rounded border border-[#E8E6E3] text-sm space-y-1.5">
            <div><span className="text-muted-foreground">Full Name:</span> <span className="font-semibold text-neutral-800">{displayName}</span></div>
            <div><span className="text-muted-foreground">Phone Number:</span> <span className="font-semibold text-neutral-800">{order.phoneNumber}</span></div>
            <div><span className="text-muted-foreground">Email:</span> <span className="font-semibold text-neutral-800">{displayEmail}</span></div>
            <div className="pt-1.5 border-t mt-1.5">
              <span className="text-muted-foreground block mb-0.5">Shipping Address:</span>
              <span className="font-medium text-neutral-800">
                {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode} ({order.shippingAddress?.country || "India"})
              </span>
            </div>
          </div>
        </div>

        {/* Order Item */}
        <div>
          <h4 className="font-bold text-neutral-800 mb-3">Ordered Item</h4>
          <div className="bg-white p-4 rounded border border-[#E8E6E3] flex items-start gap-4">
            <div className="w-20 h-20 rounded bg-neutral-100 flex items-center justify-center shrink-0 overflow-hidden relative border border-[#E8E6E3]">
              {order.productId?.image || order.productId?.images?.[0] ? (
                <img loading="lazy" decoding="async" 
                  src={order.productId?.image || order.productId?.images?.[0]} 
                  alt={order.productId?.title || order.productId?.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-xs text-neutral-400 font-medium">No Image</span>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <h5 className="font-semibold text-neutral-900">{order.productId?.title || order.productId?.name || "Product Item"}</h5>
              <div className="text-xs text-neutral-600 space-y-0.5">
                <div>Color: <span className="font-medium">{order.variantId?.color || order.color || "N/A"}</span></div>
                <div>Size: <span className="font-medium">{order.size || "N/A"}</span></div>
                <div>Quantity: <span className="font-medium">{order.quantity}</span></div>
                {order.productType === "bulk" && (
                  <>
                    {order.customDesign && <div>Custom Design: <span className="font-medium">{order.customDesign}</span></div>}
                    {order.anyText && <div>Customization Text: <span className="font-medium">{order.anyText}</span></div>}
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-base font-bold text-[#B87D4C]">₹ {order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Grand Total */}
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-sm font-semibold text-neutral-700">Total Amount:</span>
          <span className="text-lg font-black text-[#B87D4C]">₹ {order.totalAmount}</span>
        </div>
      </div>
    </div>
  )
}
