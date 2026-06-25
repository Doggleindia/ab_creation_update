import { Search, Bell, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import Breadcrumbs from "@/components/Breadcrumbs"

export default function DashboardHeader({
  onToggleNotifications,
}: {
  onToggleNotifications: () => void
}) {
  return (
    <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <div>
        <Breadcrumbs transparent isDashboard />
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search"
          className="w-48 h-8"
        />
        <Settings size={18} />
        <Bell onClick={onToggleNotifications} className="cursor-pointer" size={18} />
      </div>
    </header>
  )
}
