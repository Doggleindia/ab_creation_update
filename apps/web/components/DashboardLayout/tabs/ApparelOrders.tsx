"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyApparelOrders } from "@/lib/api";
import { useRouter } from "next/navigation";

interface ApparelOrderItem {
  _id: string;
  productId: {
    _id: string;
    title: string;
    apparelType: string;
  };
  selectedColor: string;
  selectedGSM: number;
  sizesAndQty: { size: string; quantity: number }[];
  totalPrice: number;
  status: string | undefined;
  createdAt: string;
  paymentMethod?: string;
}

interface ApparelOrdersResponse {
  status: string;
  results?: number;
  data?: {
    orders: ApparelOrderItem[];
  };
}

export default function ApparelOrders() {
  const [orders, setOrders] = useState<ApparelOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUnauthorized = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/login");
  };

  const getTotalQuantity = (sizesAndQty: { size: string; quantity: number }[]) => {
    return sizesAndQty.reduce((sum, item) => sum + item.quantity, 0);
  };

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
    const fetchApparelOrders = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || undefined
            : undefined;

        if (!token) {
          handleUnauthorized();
          return;
        }

        const response = await getMyApparelOrders(token);

        if (response.status === "success" && response.data?.orders) {
          setOrders(response.data.orders);
          setError(null);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching apparel orders:", err);
        setError("Failed to load apparel orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApparelOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading apparel orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No apparel orders found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {orders.map((o) => (
        <div key={o._id} className="bg-white rounded-xl border p-5">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-medium">#{o._id}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(o.createdAt).toLocaleString()} · {getTotalQuantity(o.sizesAndQty)} item
                {getTotalQuantity(o.sizesAndQty) !== 1 ? "s" : ""}
              </p>
            </div>

            <span
              className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
                getStatusBadgeColor(o.status)
              }`}
            >
              {o.status || 'Unknown'}
            </span>
          </div>

          <div className="mb-4 text-sm">
            <div>Total: ₹{o.totalPrice}</div>
            <div>Payment: {o.paymentMethod || 'N/A'}</div>
          </div>

          <Link href={`/dashboard/apparel-orders/${o._id}`} className="text-sm underline">
            View details
          </Link>
        </div>
      ))}
    </div>
  );
}
