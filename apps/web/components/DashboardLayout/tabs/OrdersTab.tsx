export default function OrdersTab() {
  return (
    <div className="bg-[#faf6ef] rounded-xl p-6">
      <div className="flex justify-between mb-4">
        <div>
          <p className="font-medium">#96459761</p>
          <p className="text-xs text-muted-foreground">
            Order placed on 17 Jan, 2021
          </p>
        </div>
        <span className="text-sm font-medium">Pending</span>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mt-6 text-xs">
        {["Order Placed", "Packaging", "Out For Delivery", "Delivered"].map(
          (step, i) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full ${
                  i < 2 ? "bg-[#7a3a2e]" : "bg-gray-300"
                }`}
              />
              <span className="mt-2">{step}</span>
            </div>
          )
        )}
      </div>
    </div>
  )
}
