import type { Metadata } from "next";
import ProsePage from "@/components/common/ProsePage";

export const metadata: Metadata = { title: "Shipping Policy | AB Creation" };

export default function ShippingPolicyPage() {
  return (
    <ProsePage
      title="Shipping Policy"
      intro="We ship across India. Every order is produced on demand, so total delivery time is production time plus shipping time."
      sections={[
        {
          heading: "Production time",
          body: [
            "Standard production takes 7-10 business days after your design is approved. Rush production (24-48 hours) is available on select products — mention your deadline when ordering or requesting a bulk quote.",
          ],
        },
        {
          heading: "Shipping methods",
          body: [
            "Standard delivery takes 5-7 business days and is free on qualifying orders. Express (2-3 business days) and Super Rush (24-48 hours) options are available at checkout with their prices shown before you pay.",
          ],
        },
        {
          heading: "Tracking",
          body: [
            "You'll receive tracking details by email once your order is dispatched, and you can follow every stage — production, quality check, dispatch, delivery — on the Track Order page.",
          ],
        },
        {
          heading: "Bulk orders",
          body: [
            "Bulk shipments are quoted individually and include pan-India fulfilment. Delivery timelines are agreed as part of your quote.",
          ],
        },
        {
          heading: "Damaged or lost shipments",
          body: [
            "If your order arrives damaged or goes missing in transit, contact support within 48 hours of the delivery estimate and we'll reprint or refund it to your wallet.",
          ],
        },
      ]}
    />
  );
}
