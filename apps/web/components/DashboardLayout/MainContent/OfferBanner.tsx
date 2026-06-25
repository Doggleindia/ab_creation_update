import { Button } from "@/components/ui/button"

export default function OfferBanner() {
  return (
    <div className="bg-[#faf6ef] rounded-lg p-6 flex items-center justify-between">
      <div>
        <p className="font-medium mb-1">
          50% off first order
        </p>
        <p className="text-sm text-muted-foreground">
          Valid for 48 hours, 50% off up to 50 EUR or equivalent currency
          (products only, excl. shipping).
        </p>

        <Button className="mt-4 bg-[#7a3a2e] hover:bg-[#682f25]">
          ORDER NOW
        </Button>
      </div>

      {/* Illustration placeholder */}
      <div className="hidden md:block text-muted-foreground">
        🎁
      </div>
    </div>
  )
}
