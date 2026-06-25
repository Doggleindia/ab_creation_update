"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getApparelOrderById } from "@/lib/api"

interface ApparelOrderDetail {
  _id: string
  productId: {
    _id: string
    title: string
    apparelType: string
  }
  selectedColor: string
  selectedGSM: number
  sizesAndQty: { size: string; quantity: number }[]
  printPlacements: string[]
  designFiles: string[]
  deliveryDetails: {
    fullName: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
    email: string
  }
  paymentMethod: string
  totalPrice: number
  status: string
  createdAt: string
  additionalNotes?: string
}

export default function ApparelOrderDetails({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const [order, setOrder] = useState<ApparelOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleUnauthorized = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
    router.push("/login")
  }

  const isBase64Image = (str: string) => {
    try {
      return str.startsWith("data:image")
    } catch {
      return false
    }
  }

  const getTotalQuantity = (sizesAndQty: { size: string; quantity: number }[]) => {
    return sizesAndQty.reduce((sum, item) => sum + item.quantity, 0)
  }

  const getStatusBadgeColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-700";
    const statusLower = status.toLowerCase();
    if (statusLower === "pending") return "bg-yellow-100 text-yellow-700";
    if (statusLower === "processing") return "bg-blue-100 text-blue-700";
    if (statusLower === "shipped") return "bg-purple-100 text-purple-700";
    if (statusLower === "delivered") return "bg-green-100 text-green-700";
    if (statusLower === "cancelled") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  }

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || undefined
            : undefined

        if (!token) {
          handleUnauthorized()
          return
        }

        const response = await getApparelOrderById(orderId, token)

        if (response.status === "success" && response.data?.order) {
          setOrder(response.data.order)
          setError(null)
        } else {
          setError("Failed to load order")
        }
      } catch (err) {
        console.error("Error fetching order:", err)
        setError("Failed to load order details")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  if (loading) return <div>Loading order...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>
  if (!order) return <div>No order found.</div>

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Order #{order._id}</h2>
        <Link href="/dashboard/orders" className="text-sm underline">
          Back to orders
        </Link>
      </div>

      <div className="bg-[#faf6ef] p-5 rounded-lg space-y-4">
        {/* Order Status and Meta */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Status:</span>
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
                getStatusBadgeColor(order.status)
              }`}
            >
              {order.status || 'Unknown'}
            </span>
          </div>
          <div>Payment: {order.paymentMethod}</div>
          <div>
            Placed: {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
          </div>
        </div>

        {/* Product Information */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Product Information</h4>
          <div className="text-sm space-y-1 bg-white p-3 rounded">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Title:</span>
              <span className="font-medium">{order.productId.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span>{order.productId.apparelType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GSM:</span>
              <span>{order.selectedGSM}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Color:</span>
              <span>{order.selectedColor}</span>
            </div>
          </div>
        </div>

        {/* Sizes & Quantity */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Sizes & Quantity</h4>
          <div className="space-y-2 text-sm">
            {order.sizesAndQty.map((item, idx) => (
              <div key={idx} className="flex justify-between bg-white p-2 rounded">
                <span className="capitalize">{item.size}:</span>
                <span className="font-medium">{item.quantity} pcs</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total Quantity:</span>
              <span>{getTotalQuantity(order.sizesAndQty)} pcs</span>
            </div>
          </div>
        </div>

        {/* Print Placements */}
        {order.printPlacements && order.printPlacements.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Print Placements</h4>
            <div className="space-y-2 text-sm">
              {order.printPlacements.map((placement, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white p-2 rounded"
                >
                  <span className="w-2 h-2 bg-[#7a3a2e] rounded-full"></span>
                  {placement}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Design Files */}
        {order.designFiles && order.designFiles.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Design Files</h4>
            <div className="grid grid-cols-2 gap-3">
              {order.designFiles.map((file, idx) => (
                <div key={idx} className="rounded-lg border overflow-hidden">
                  {isBase64Image(file) ? (
                    <img
                      src={file}
                      alt={`Design ${idx + 1}`}
                      className="w-full h-32 object-cover"
                    />
                  ) : file.startsWith("http") ? (
                    <img
                      src={file}
                      alt={`Design ${idx + 1}`}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-xs text-muted-foreground">
                      File Link
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {order.additionalNotes && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Additional Notes</h4>
            <p className="text-sm bg-white p-3 rounded">{order.additionalNotes}</p>
          </div>
        )}

        {/* Delivery Details */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Delivery Details</h4>
          <div className="text-sm bg-white p-3 rounded space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Full Name:</span>
              <span>{order.deliveryDetails.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span>{order.deliveryDetails.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{order.deliveryDetails.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Address:</span>
              <span className="text-right">{order.deliveryDetails.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">City:</span>
              <span>{order.deliveryDetails.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">State:</span>
              <span>{order.deliveryDetails.state}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pincode:</span>
              <span>{order.deliveryDetails.pincode}</span>
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="pt-4 border-t">
          <div className="text-lg font-semibold">
            Total Amount: <span className="text-[#7a3a2e]">₹{order.totalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
