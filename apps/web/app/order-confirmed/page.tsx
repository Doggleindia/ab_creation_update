"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, ShoppingBag, ArrowRight, Calendar, CreditCard, Truck, Copy, Check } from "lucide-react"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { getOrderById } from "@/lib/api"
import type { Order } from "@kt/types"

function OrderConfirmedContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const orderId = searchParams.get("orderId")
  const paymentMethod = searchParams.get("paymentMethod") || "Prepaid Online"

  const [copied, setCopied] = useState(false)
  // Amount is sourced from the verified order fetched from the backend, not
  // from the URL (which a user could tamper with). Falls back to the URL value
  // only when the order can't be fetched (e.g. guest checkout).
  const [amount, setAmount] = useState<string | null>(searchParams.get("amount"))

  useEffect(() => {
    if (!orderId) return
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || undefined
        : undefined
    if (!token) return
    let active = true
    getOrderById(orderId, token)
      .then((res) => {
        const order: Partial<Order> = res?.data || res?.order || {}
        if (active && order.totalAmount != null) {
          setAmount(String(order.totalAmount))
        }
      })
      .catch(() => {
        /* keep URL fallback if the order can't be verified */
      })
    return () => {
      active = false
    }
  }, [orderId])

  const handleCopyId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Format amount to INR
  const formatPrice = (value: string | null) => {
    if (!value) return "Rs. 0.00"
    const parsed = parseFloat(value)
    if (isNaN(parsed)) return value
    return `Rs. ${parsed.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf6ef]/30 to-white pt-24 pb-16 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto px-4 w-full">
        
        {/* SUCCESS ICON & HEADER */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 mb-6 relative"
          >
            <CheckCircle2 size={56} className="stroke-[1.5]" />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], scale: [1, 1.4, 1.8] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
            />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight"
          >
            Order Confirmed!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-neutral-500 mt-2 text-sm md:text-base"
          >
            Thank you for shopping with us. Your payment has been received and order is being prepared.
          </motion.p>
        </div>

        {/* ORDER DETAILS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-neutral-100 shadow-xl shadow-neutral-100/50 overflow-hidden mb-8"
        >
          {/* Top banner / highlight */}
          <div className="bg-[#faf6ef] px-6 py-4 border-b border-neutral-100 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <Calendar size={16} className="text-[#c9a24d]" />
              <span>Estimated Delivery: {new Date(Date.now() + 4 * 86400000).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Paid Successfully
            </span>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Quick summary grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-neutral-100 pb-6">
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-wider block mb-1">Order Details</span>
                {orderId ? (
                  <div className="flex items-center gap-2 group">
                    <span className="font-mono text-sm font-semibold text-neutral-800">{orderId}</span>
                    <button
                      onClick={handleCopyId}
                      className="text-neutral-400 hover:text-neutral-600 transition p-1 rounded hover:bg-neutral-50"
                      title="Copy Order ID"
                    >
                      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-neutral-800">KT-ORD-SUCCESS</span>
                )}
              </div>

              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-wider block mb-1">Amount Paid</span>
                <span className="text-lg font-bold text-[#7a3a2e]">
                  {formatPrice(amount)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-neutral-100 pb-6">
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-wider block mb-1">Payment Method</span>
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 mt-0.5">
                  <CreditCard size={16} className="text-neutral-400" />
                  <span>{paymentMethod}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-wider block mb-1">Carrier Status</span>
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 mt-0.5">
                  <Truck size={16} className="text-neutral-400" />
                  <span>Preparing Shipment</span>
                </div>
              </div>
            </div>

            {/* PROCESS TIMELINE */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-4">Delivery Timeline</h3>
              <div className="relative">
                {/* Horizontal line for desktop, vertical for mobile */}
                <div className="absolute left-[15px] md:left-0 md:right-0 top-3 bottom-3 md:bottom-auto md:top-[15px] h-full md:h-[2px] bg-neutral-100 -z-10" />
                <div className="absolute left-[15px] md:left-0 md:right-[66%] top-3 bottom-3 md:bottom-auto md:top-[15px] h-[33%] md:h-[2px] bg-emerald-500 -z-10" />
                
                <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-4 relative z-10">
                  {/* Step 1 */}
                  <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-2 md:w-1/4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/20">
                      1
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-neutral-800">Order Confirmed</div>
                      <div className="text-[10px] text-emerald-600">Payment Verified</div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-2 md:w-1/4">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-amber-500/20 animate-pulse">
                      2
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-neutral-800">Processing</div>
                      <div className="text-[10px] text-amber-600">Preparing Custom Prints</div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-2 md:w-1/4">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-neutral-400">Shipped</div>
                      <div className="text-[10px] text-neutral-400">Awaiting Dispatch</div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-2 md:w-1/4">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-neutral-400">Delivered</div>
                      <div className="text-[10px] text-neutral-400">Enjoy your adhesives!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* CTAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Button
            asChild
            className="w-full sm:w-auto bg-[#7a3a2e] hover:bg-[#682f25] px-8 py-6 rounded-xl font-medium text-white shadow-lg shadow-[#7a3a2e]/10 group transition"
          >
            <Link href={orderId ? `/dashboard/orders/${orderId}` : `/dashboard/orders`}>
              Track Order Status
              <ArrowRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 px-8 py-6 rounded-xl font-medium shadow-sm transition"
          >
            <Link href="/">
              <ShoppingBag size={16} className="mr-1.5" />
              Continue Shopping
            </Link>
          </Button>
        </motion.div>

        {/* HELPFUL SUPPORT INFORMATION */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-neutral-500 max-w-md mx-auto"
        >
          A confirmation email with order details and tracking instructions has been sent. Have questions? Reach out to our customer care team at <a href="mailto:support@kt-adhesives.com" className="underline hover:text-neutral-800">support@kt-adhesives.com</a>
        </motion.p>

      </div>
      <Footer />
    </div>
  )
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#faf6ef]/30 to-white pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7a3a2e]" />
      </div>
    }>
      <OrderConfirmedContent />
    </Suspense>
  )
}
