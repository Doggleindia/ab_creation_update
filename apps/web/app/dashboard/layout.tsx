"use client"


import DashboardHeader from "@/components/DashboardLayout/DashboardHeader"
import NotificationsPanel from "@/components/DashboardLayout/NotificationsPanel"
import Sidebar from "@/components/DashboardLayout/Sidebar"
import { useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const [showNotifications, setShowNotifications] = useState(true)
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
         onToggleNotifications={() =>
            setShowNotifications((prev) => !prev)
          }
        />

        <div className="flex flex-1 overflow-hidden">
          {/* CONTENT */}
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>

          {/* NOTIFICATIONS */}
         {showNotifications && <NotificationsPanel />}
        </div>
      </div>
    </div>
  )
}
