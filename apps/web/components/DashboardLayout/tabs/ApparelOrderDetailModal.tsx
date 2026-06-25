"use client";

import { useEffect, useState } from "react";
import { getApparelOrderById } from "@/lib/api";
import { X } from "lucide-react";

interface ApparelOrderDetail {
  _id: string;
  productId: {
    _id: string;
    title: string;
    apparelType: string;
  };
  selectedColor: string;
  selectedGSM: number;
  sizesAndQty: { size: string; quantity: number }[];
  printPlacements: string[];
  designFiles: string[];
  deliveryDetails: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    email: string;
  };
  paymentMethod: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  additionalNotes?: string;
}

interface ApparelOrderDetailModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApparelOrderDetailModal({
  orderId,
  isOpen,
  onClose,
}: ApparelOrderDetailModalProps) {
  const [order, setOrder] = useState<ApparelOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusBadgeColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-700";
    const statusLower = status.toLowerCase();
    if (statusLower === "pending") return "bg-yellow-100 text-yellow-700";
    if (statusLower === "processing") return "bg-blue-100 text-blue-700";
    if (statusLower === "shipped") return "bg-purple-100 text-purple-700";
    if (statusLower === "delivered") return "bg-green-100 text-green-700";
    if (statusLower === "cancelled") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const isBase64Image = (str: string) => {
    try {
      return str.startsWith("data:image");
    } catch {
      return false;
    }
  };

  const getTotalQuantity = (sizesAndQty: { size: string; quantity: number }[]) => {
    return sizesAndQty.reduce((sum, item) => sum + item.quantity, 0);
  };

  useEffect(() => {
    if (!isOpen || !orderId) return;

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || undefined
            : undefined;

        if (!token) {
          setError("Not authenticated");
          return;
        }

        const response = await getApparelOrderById(orderId, token);

        if (response.status === "success" && response.data?.order) {
          setOrder(response.data.order);
        } else {
          setError("Failed to load order details");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Order Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading order details...</div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            {/* Order header */}
            <div className="flex justify-between items-start pb-4 border-b">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-medium">#{order._id}</p>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${getStatusBadgeColor(
                  order.status
                )}`}
              >
                {order.status || 'Unknown'}
              </span>
            </div>

            {/* Product Info */}
            <div>
              <h3 className="font-semibold mb-3">Product Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title:</span>
                  <span className="font-medium">{order.productId.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Apparel Type:</span>
                  <span>{order.productId.apparelType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected GSM:</span>
                  <span>{order.selectedGSM}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Color:</span>
                  <span>{order.selectedColor}</span>
                </div>
              </div>
            </div>

            {/* Sizes & Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Sizes & Quantity</h3>
              <div className="space-y-2 text-sm">
                {order.sizesAndQty.map((item, idx) => (
                  <div key={idx} className="flex justify-between bg-gray-50 p-2 rounded">
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
              <div>
                <h3 className="font-semibold mb-3">Print Placements</h3>
                <div className="space-y-2 text-sm">
                  {order.printPlacements.map((placement, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-gray-50 p-2 rounded"
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
              <div>
                <h3 className="font-semibold mb-3">Design Files</h3>
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
              <div>
                <h3 className="font-semibold mb-3">Additional Notes</h3>
                <p className="text-sm bg-gray-50 p-3 rounded">{order.additionalNotes}</p>
              </div>
            )}

            {/* Delivery Details */}
            <div>
              <h3 className="font-semibold mb-3">Delivery Details</h3>
              <div className="space-y-2 text-sm">
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

            {/* Payment & Status */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Price:</span>
                <span className="text-[#7a3a2e]">₹{order.totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date:</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full mt-6 px-4 py-2 bg-[#7a3a2e] text-white rounded-lg hover:bg-[#6a2f25] transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
