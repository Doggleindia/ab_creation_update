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
}

export default function OrderSummary({
  product,
  selectedGSM,
  selectedColor,
  printPlacements,
  quantity,
  total,
}: OrderSummaryProps) {
  return (
    <div className="rounded-md bg-[#f6efe5] p-6 text-sm">
      <h4 className="mb-4 font-semibold">ORDER SUMMARY</h4>

      <ul className="space-y-2 text-muted-foreground">
        <li>
          Product: {selectedGSM ? `${selectedGSM} GSM` : "—"} {product?.title || "—"} {selectedColor ? `– ${selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}` : ""}
        </li>
        <li>Print Type: DTF Printing</li>
        <li>Total Quantity: {quantity || "—"} pcs</li>
        <li>Print Location: {printPlacements.length > 0 ? printPlacements.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(", ") : "—"}</li>
        <li>Subtotal: ₹{total.toFixed(2)}</li>
        <li>Shipping: —</li>
        <li className="font-medium text-black">TOTAL TO PAY: ₹{total.toFixed(2)}</li>
      </ul>

      <Button className="mt-6 w-full bg-[#7a3a2e] hover:bg-[#682f25]">
        Proceed To Payment
      </Button>
    </div>
  );
}
