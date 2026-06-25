export default function NotificationsPanel() {
  return (
    <aside className="w-80 bg-white border-l p-4 hidden xl:block">
      <h3 className="font-semibold mb-4">Notifications</h3>

      <div className="space-y-4 text-sm">
        <div>
          <p className="font-medium">
            Your ticket was resolved
          </p>
          <p className="text-muted-foreground">
            3 hours ago
          </p>
        </div>

        <div>
          <p className="font-medium">
            You have successfully added money
          </p>
          <p className="text-muted-foreground">
            12 hours ago
          </p>
        </div>

        <div>
          <p className="font-medium">
            Added delivery address
          </p>
          <p className="text-muted-foreground">
            Today, 11:59 AM
          </p>
        </div>
      </div>
    </aside>
  )
}
