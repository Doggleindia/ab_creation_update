"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutUser } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/ToastProvider"

export default function LogoutModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  // Hooks must run unconditionally on every render (Rules of Hooks), so the
  // early-return for the closed state happens AFTER the hooks are called.
  const router = useRouter()
  const { toast } = useToast()

  if (!open) return null

  const handleLogout = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined

      try {
        const res = await logoutUser(token || undefined)
        if (res?.status === 'success' || res?.message) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('kt-adhesives-cart-cache')
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cart-updated'))
          }
          // Clear token cookie
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
          toast('success', res?.message || 'Logged out')
          onClose()
          router.push('/login')
        } else {
          toast('error', res?.message || 'Logout failed')
        }
      } catch (apiErr: any) {
        // Handle 401 errors gracefully - still logout locally even if token is invalid
        if (apiErr?.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('kt-adhesives-cart-cache')
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cart-updated'))
          }
          // Clear token cookie
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
          toast('success', 'Logged out successfully')
          onClose()
          router.push('/login')
        } else {
          throw apiErr
        }
      }
    } catch (err: any) {
      console.error(err)
      toast('error', err?.response?.data?.message || err?.message || 'Logout error')
    }
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
      <div className="bg-white max-w-4xl w-full relative grid grid-cols-1 md:grid-cols-2">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-sm flex items-center gap-1 z-10"
        >
          <X size={14} /> Close
        </button>

        {/* LEFT */}
        <div className="p-10 flex flex-col justify-center space-y-4">
          <p className="text-sm text-muted-foreground">Log out</p>
          <h3 className="text-lg font-medium">
            Are you sure you want to log out?
          </h3>

          <Button onClick={handleLogout} className="w-32 bg-[#171717] hover:bg-[#B87D4C]">
            Log out
          </Button>
        </div>

        {/* RIGHT IMAGE */}
        <div className="hidden md:block relative">
          <Image
            src="/images/auth/logout.png"
            alt="Logout"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  )
}
