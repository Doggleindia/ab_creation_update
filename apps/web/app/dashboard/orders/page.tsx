"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
  createdAt?: string
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"ready" | "bulk">("ready")
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
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
    setError(null)
    setCurrentPage(1) // Reset page to 1 when tab changes
    const url = host ? `${host}/api/orders/history?productType=${activeTab}` : `/api/orders/history?productType=${activeTab}`
    fetch(url, { headers })
      .then(async (res) => {
        if (res.status === 401) {
          handleUnauthorized()
          return
        }
        const data = await res.json()
        setOrders(data?.data || [])
      })
      .catch((err) => {
        console.error("Failed to load orders:", err)
        setError('Failed to load orders')
      })
      .finally(() => setLoading(false))
  }, [activeTab])

  const indexOfLastOrder = currentPage * itemsPerPage
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage
  const currentOrders = orders ? orders.slice(indexOfFirstOrder, indexOfLastOrder) : []
  const totalPages = orders ? Math.ceil(orders.length / itemsPerPage) : 0

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) {
        pages.push("...")
      }
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) {
        pages.push("...")
      }
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold mb-6 text-neutral-900">Orders History</h2>

      {/* Tab Navigation */}
      <div className="flex gap-6 border-b mb-6">
        <button
          onClick={() => {
            setActiveTab("ready")
            setOrders(null)
          }}
          className={`pb-3 px-1 font-semibold text-sm transition-colors ${activeTab === "ready"
            ? "border-b-2 border-[#B87D4C] text-[#B87D4C]"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Ready Product
        </button>
        <button
          onClick={() => {
            setActiveTab("bulk")
            setOrders(null)
          }}
          className={`pb-3 px-1 font-semibold text-sm transition-colors ${activeTab === "bulk"
            ? "border-b-2 border-[#B87D4C] text-[#B87D4C]"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Bulk Product
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {loading && <div className="text-sm text-neutral-500">Loading orders...</div>}
        {error && <div className="text-sm text-red-600 font-medium">{error}</div>}
        
        {!loading && !error && (!orders || orders.length === 0) && (
          <div className="text-sm text-neutral-500 py-4">
            No {activeTab === "ready" ? "ready" : "bulk"} product orders found.
          </div>
        )}
        
        {!loading && !error && orders && orders.length > 0 && (
          <div className="flex flex-col gap-4">
            {currentOrders.map((o) => (
              <div key={o._id} className="bg-white rounded-xl border p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-3">
                  <div>
                    <p className="font-semibold text-neutral-800">Order #{o.orderId || o._id}</p>
                    <p className="text-xs text-muted-foreground">
                      Placed on {o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : ''}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusBadgeColor(o.orderStatus)}`}>
                      Status: {o.orderStatus || 'Pending'}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      Payment: {o.paymentStatus || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded bg-neutral-100 flex items-center justify-center shrink-0 overflow-hidden relative border border-[#E8E6E3]">
                    {o.productId?.image || o.productId?.images?.[0] ? (
                      <img 
                        src={o.productId?.image || o.productId?.images?.[0]} 
                        alt={o.productId?.title || o.productId?.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-medium">No Image</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-sm text-neutral-900">
                      {o.productId?.title || o.productId?.name || "Product Item"}
                    </h4>
                    <p className="text-xs text-neutral-600">
                      Color: <span className="font-semibold">{o.variantId?.color || o.color || "N/A"}</span> · Size: <span className="font-semibold">{o.size || "N/A"}</span>
                    </p>
                    <p className="text-xs text-neutral-600">
                      Quantity: <span className="font-semibold">{o.quantity}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-[#B87D4C]">
                      ₹ {o.totalAmount}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t text-xs">
                  {o.productType === "bulk" && (o.customDesign || o.anyText) && (
                    <p className="text-muted-foreground italic max-w-xs truncate">
                      Note: {o.customDesign ? `Design: ${o.customDesign}` : ""} {o.anyText ? `(${o.anyText})` : ""}
                    </p>
                  )}
                  <div className="flex gap-4 ml-auto">
                    <Link href={`/dashboard/orders/${o._id}`} className="text-[#B87D4C] font-semibold hover:underline">
                      View Order Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border border-neutral-200 bg-white px-4 py-3 sm:px-6 rounded-xl mt-4 shadow-sm">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs text-neutral-500 font-medium">
                      Showing <span className="font-semibold text-neutral-800">{indexOfFirstOrder + 1}</span> to{" "}
                      <span className="font-semibold text-neutral-800">
                        {Math.min(indexOfLastOrder, orders?.length || 0)}
                      </span>{" "}
                      of <span className="font-semibold text-neutral-800">{orders?.length || 0}</span> orders
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-lg border border-neutral-200" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-lg px-3 py-2 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border-r border-neutral-200"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      
                      {getPageNumbers().map((page, idx) => {
                        if (page === "...") {
                          return (
                            <span
                              key={`ellipsis-${idx}`}
                              className="relative inline-flex items-center px-3 py-2 text-xs font-semibold text-neutral-400 border-r border-neutral-200 cursor-default select-none"
                            >
                              ...
                            </span>
                          )
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page as number)}
                            aria-current={currentPage === page ? "page" : undefined}
                            className={`relative inline-flex items-center px-4 py-2 text-xs font-semibold focus:z-20 border-r border-neutral-200 last:border-r-0 transition-all duration-200 ${
                              currentPage === page
                                ? "bg-[#171717] text-white hover:bg-[#663026]"
                                : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}

                      <button
                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-lg px-3 py-2 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
