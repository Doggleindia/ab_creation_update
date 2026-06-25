"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  User,
  ShoppingBag,
  Wallet,
  Ticket,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import LogoutModal from "../auth/LogoutModal"

const menu = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Profile", href: "/dashboard/profile", icon: User },
  { label: "Order history", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { label: "Tickets", href: "/dashboard/tickets", icon: Ticket },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [openLogout, setOpenLogout] = useState(false)
  const [userName, setUserName] = useState("User")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const rawUser = localStorage.getItem("user")
      if (rawUser) {
        try {
          const user = JSON.parse(rawUser)
          if (user?.name) {
            setUserName(user.name)
          }
        } catch (e) {
          console.error("Failed to parse user from localStorage", e)
        }
      }
    }
  }, [])

  return (
    <>
      <aside className="w-64 bg-white border-r p-4 hidden lg:block">
        <div className="mb-6 font-semibold">{userName}</div>

        <nav className="space-y-1">
          {menu.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
                  isActive
                    ? "bg-[#f3f4f6] font-medium text-black"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            )
          })}

          {/* LOGOUT (ACTION) */}
          <button
            onClick={() => setOpenLogout(true)}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </nav>
      </aside>

      {/* LOGOUT MODAL */}
      <LogoutModal
        open={openLogout}
        onClose={() => setOpenLogout(false)}
      />
    </>
  )
}
