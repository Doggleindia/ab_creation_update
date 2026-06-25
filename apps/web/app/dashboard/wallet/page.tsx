"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import WalletTopUpModal from "@/components/DashboardLayout/WalletTopUpModal"
import { getWalletBalance, getWalletTransactions } from "@/lib/api"

interface Transaction {
  _id: string
  type: string
  amount: number
  status: string
  requestId: string
  createdAt: string
}

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  const fetchWalletData = async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || undefined
        : undefined

    if (!token) {
      setLoading(false)
      return
    }

    try {
      // Fetch balance
      const balanceRes = await getWalletBalance(token)
      if (balanceRes?.status === "success") {
        setBalance(balanceRes.data.balance)
      }

      // Fetch transactions
      const transactionsRes = await getWalletTransactions(
        token,
        pagination.page,
        pagination.limit
      )
      if (transactionsRes?.status === "success") {
        setTransactions(transactionsRes.data.transactions)
        setPagination((prev) => ({
          ...prev,
          total: transactionsRes.data.total,
        }))
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWalletData()
  }, [pagination.page])

  const handleRechargeSuccess = (newBalance: number) => {
    setBalance(newBalance)
    fetchWalletData()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const formatAmount = (amount: number, type: string) => {
    // Recharge types are positive, order payments would be negative
    if (type === "recharge" || type === "refund") {
      return { display: `+₹${amount}`, isPositive: true }
    }
    return { display: `-₹${amount}`, isPositive: false }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "recharge":
        return "Wallet Top-up"
      case "payment":
        return "Order Payment"
      case "refund":
        return "Refund"
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <h2 className="text-lg font-semibold">Wallet</h2>
        <div className="bg-[#7a3a2e] text-white rounded-xl p-6 animate-pulse">
          <div className="h-4 w-32 bg-white/20 rounded mb-2"></div>
          <div className="h-8 w-40 bg-white/20 rounded"></div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="h-6 w-48 bg-gray-100 rounded mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between py-3 border-b">
              <div className="h-4 w-32 bg-gray-100 rounded"></div>
              <div className="h-4 w-16 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-lg font-semibold">Wallet</h2>

      {/* BALANCE CARD */}
      <div className="bg-[#7a3a2e] text-white rounded-xl p-6">
        <p className="text-sm opacity-80">Available Balance</p>
        <p className="text-3xl font-semibold">₹{balance.toLocaleString("en-IN")}</p>

        <Button
          className="mt-4 bg-white text-[#7a3a2e]"
          onClick={() => setShowTopUpModal(true)}
        >
          Add Money
        </Button>
      </div>

      {/* TRANSACTIONS */}
      <div className="bg-white rounded-xl border">
        <h3 className="font-medium p-4 border-b">
          Transaction History
        </h3>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          <>
            {transactions.map((t) => {
              const amountDisplay = formatAmount(t.amount, t.type)
              return (
                <div
                  key={t._id}
                  className="flex justify-between px-4 py-3 border-b last:border-b-0 text-sm"
                >
                  <div>
                    <p className="font-medium">{getTransactionLabel(t.type)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(t.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`font-medium ${
                      amountDisplay.isPositive
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {amountDisplay.display}
                  </span>
                </div>
              )
            })}

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="flex justify-center gap-2 p-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  Previous
                </Button>
                <span className="flex items-center text-sm text-muted-foreground">
                  Page {pagination.page} of{" "}
                  {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    pagination.page >=
                    Math.ceil(pagination.total / pagination.limit)
                  }
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* WALLET TOP UP MODAL */}
      <WalletTopUpModal
        open={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        currentBalance={balance}
        onSuccess={handleRechargeSuccess}
      />
    </div>
  )
}

