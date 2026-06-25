"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { XCircle, RefreshCw, ShoppingCart, LifeBuoy, AlertTriangle, ChevronRight, CornerDownRight } from "lucide-react"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"

function PaymentFailedContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const errorMessage = searchParams.get("error") || "The transaction was declined by the issuing bank."

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/20 to-white pt-24 pb-16 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto px-4 w-full">
        
        {/* FAILURE ICON & HEADER */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: 45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-rose-50 text-rose-500 mb-6 relative"
          >
            <XCircle size={56} className="stroke-[1.5]" />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], scale: [1, 1.4, 1.8] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-rose-500/30"
            />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight"
          >
            Payment Failed
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-neutral-500 mt-2 text-sm md:text-base max-w-md mx-auto"
          >
            We couldn't process your payment. Don't worry, no funds have been debited from your account.
          </motion.p>
        </div>

        {/* ERROR DETAILS & TROUBLESHOOTING */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-neutral-100 shadow-xl shadow-rose-100/30 overflow-hidden mb-8"
        >
          {/* Header Highlight */}
          <div className="bg-rose-50/50 px-6 py-4 border-b border-rose-100/50 flex items-center gap-2 text-sm font-medium text-rose-800">
            <AlertTriangle size={16} className="text-rose-500" />
            <span>Transaction Reference Code: {orderId ? `#${orderId}` : "Pre-authorization Failed"}</span>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            
            {/* Error Message Box */}
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
              <span className="text-xs text-neutral-400 uppercase tracking-wider block mb-1">Reason for Failure</span>
              <p className="text-sm font-semibold text-neutral-800 italic">
                "{errorMessage}"
              </p>
            </div>

            {/* Troubleshooting List */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-3">What can you do?</h3>
              <ul className="space-y-3">
                <li className="flex gap-2.5 text-xs text-neutral-600">
                  <ChevronRight size={14} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Verify that your billing details, card number, expiry date, and CVV are entered correctly.</span>
                </li>
                <li className="flex gap-2.5 text-xs text-neutral-600">
                  <ChevronRight size={14} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Ensure your card has sufficient balance or credit limit for this transaction.</span>
                </li>
                <li className="flex gap-2.5 text-xs text-neutral-600">
                  <ChevronRight size={14} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Check if online transactions / international usage is enabled on your bank account/app.</span>
                </li>
                <li className="flex gap-2.5 text-xs text-neutral-600">
                  <ChevronRight size={14} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Wait a couple of minutes for network congestion to clear and retry.</span>
                </li>
              </ul>
            </div>

          </div>
        </motion.div>

        {/* ACTIONS */}
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
            <Link href="/add-to-cart">
              <RefreshCw size={16} className="mr-1.5 animate-spin-hover group-hover:rotate-180 transition-transform duration-500" />
              Retry Checkout
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 px-8 py-6 rounded-xl font-medium shadow-sm transition"
          >
            <Link href="/contact-us">
              <LifeBuoy size={16} className="mr-1.5" />
              Contact Support
            </Link>
          </Button>
        </motion.div>

        {/* SECURITY & HELP */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-neutral-500 max-w-md mx-auto"
        >
          Your billing connection is fully encrypted. If your bank account has been debited, the amount will be refunded automatically by your bank within 3-5 working days.
        </motion.p>

      </div>
      <Footer />
    </div>
  )
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-rose-50/20 to-white pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7a3a2e]" />
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  )
}
