"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createWalletRecharge, verifyWalletRecharge } from "@/lib/api"

interface WalletTopUpModalProps {
  open: boolean
  onClose: () => void
  currentBalance: number
  onSuccess: (newBalance: number) => void
}

// Lazily inject the Razorpay checkout SDK once.
const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false)
    if ((window as any).Razorpay) return resolve(true)
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

export default function WalletTopUpModal({
  open,
  onClose,
  currentBalance,
  onSuccess,
}: WalletTopUpModalProps) {
  const [amount, setAmount] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const handleRecharge = async () => {
    const numAmount = parseInt(amount)

    // Validate amount
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (numAmount < 100) {
      setError("Minimum recharge amount is ₹100")
      return
    }

    setError("")
    setLoading(true)

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || undefined
          : undefined

      if (!token) {
        setError("Please login to recharge wallet")
        setLoading(false)
        return
      }

      const sdkReady = await loadRazorpayScript()
      if (!sdkReady) {
        setError("Failed to load payment gateway. Please try again.")
        setLoading(false)
        return
      }

      // Step 1: create the Razorpay order on the backend
      const orderRes = await createWalletRecharge(numAmount, token)
      const { orderId, amount: orderAmount, currency, keyId } = orderRes?.data || {}

      if (!orderId || !keyId) {
        setError(orderRes?.message || "Failed to start recharge")
        setLoading(false)
        return
      }

      // Step 2: open Razorpay checkout; verify on success
      const rzp = new (window as any).Razorpay({
        key: keyId,
        amount: Math.round((orderAmount ?? numAmount) * 100),
        currency: currency || "INR",
        order_id: orderId,
        name: "KT Adhesives",
        description: "Wallet recharge",
        handler: async (resp: any) => {
          try {
            const verifyRes = await verifyWalletRecharge(
              {
                razorpayOrderId: resp.razorpay_order_id,
                razorpayPaymentId: resp.razorpay_payment_id,
                razorpaySignature: resp.razorpay_signature,
              },
              token
            )
            if (verifyRes?.status === "success") {
              onSuccess(verifyRes.data.balance)
              setAmount("")
              onClose()
            } else {
              setError(verifyRes?.message || "Payment verification failed")
            }
          } catch {
            setError("Payment verification failed. If money was deducted, contact support.")
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        theme: { color: "#7a3a2e" },
      })
      rzp.open()
    } catch (err: unknown) {
      console.error("Recharge error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to recharge wallet. Please try again."
      setError(errorMessage)
      setLoading(false)
    }
  }

  const handleClose = () => {
    setAmount("")
    setError("")
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Money to Wallet</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Balance Display */}
          <div className="bg-[#7a3a2e]/10 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-lg font-semibold text-[#7a3a2e]">
              ₹{currentBalance.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter Amount (₹)</label>
            <Input
              placeholder="Enter amount (minimum ₹100)"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setError("")
              }}
              min="100"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            {[500, 1000, 2000, 5000].map((amt) => (
              <Button
                key={amt}
                variant="outline"
                size="sm"
                onClick={() => {
                  setAmount(amt.toString())
                  setError("")
                }}
                className={amount === amt.toString() ? "border-[#7a3a2e] text-[#7a3a2e]" : ""}
              >
                ₹{amt}
              </Button>
            ))}
          </div>

          {/* Submit Button */}
          <Button
            className="bg-[#7a3a2e] w-full hover:bg-[#6a2a1e]"
            onClick={handleRecharge}
            disabled={loading || !amount}
          >
            {loading ? "Processing..." : "Proceed to Pay"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
