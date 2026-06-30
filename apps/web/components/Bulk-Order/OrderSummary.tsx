import { Button } from "@/components/ui/button";

interface ApparelProduct {
  _id: string;
  title: string;
  apparelType: string;
  availableGSM: number[];
  baseColors: string[];
  designTemplates: string[];
  printPlacements: string[];
  basePrice: number;
}

interface OrderSummaryProps {
  product: ApparelProduct | null;
  selectedGSM: string;
  selectedColor: string;
  printPlacements: string[];
  quantity: string;
  total: number;
  onProceed?: () => void;
  submitting?: boolean;
}

export default function OrderSummary({
  product,
  selectedGSM,
  selectedColor,
  printPlacements,
  quantity,
  total,
  onProceed,
  submitting,
}: OrderSummaryProps) {
  return (
    <div className="rounded-md bg-[#F5F1EA] p-6 text-sm">
      <h4 className="mb-4 font-semibold">ORDER SUMMARY</h4>

      <ul className="space-y-2 text-muted-foreground">
        <li>
          Product: {selectedGSM ? `${selectedGSM} GSM` : "—"} {product?.title || "—"} {selectedColor ? `– ${selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}` : ""}
        </li>
        <li>Print Type: DTF Printing</li>
        <li>Total Quantity: {quantity || "—"} pcs</li>
        <li>Print Locations: {printPlacements.length > 0 ? printPlacements.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(", ") : "—"}</li>
        <li>Subtotal: ₹{total.toFixed(2)}</li>
        <li>Shipping: —</li>
        <li>Estimated Taxes: ₹0.00</li>
        <li>Estimated Delivery: [Enter pincode to see]</li>
        <li className="font-medium text-black">TOTAL TO PAY: ₹{total.toFixed(2)}</li>
      </ul>

      <Button
        onClick={onProceed}
        disabled={submitting || !onProceed}
        className="mt-6 w-full bg-[#7A4A2B] hover:bg-[#B87D4C] text-white"
      >
        {submitting ? "Placing order..." : "Proceed To Payment"}
      </Button>
    </div>
  );
}
