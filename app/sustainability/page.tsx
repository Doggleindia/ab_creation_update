import type { Metadata } from "next";
import ProsePage from "@/components/common/ProsePage";

export const metadata: Metadata = { title: "Sustainability | AB Creation" };

export default function SustainabilityPage() {
  return (
    <ProsePage
      title="Sustainability"
      intro="Print-on-demand is our starting point for lower-waste apparel: nothing is produced until someone actually orders it. Here's what that means in practice."
      sections={[
        {
          heading: "Made to order, not to landfill",
          body: [
            "Because every garment is printed after purchase, we don't hold speculative inventory that ends up discarded. What you order is what gets made.",
          ],
        },
        {
          heading: "Eco-friendly inks",
          body: [
            "Our DTF and DTG processes use OEKO-TEX® certified inks that are safe for skin contact, and our workflows are designed to minimise water use compared to traditional dye processes.",
          ],
        },
        {
          heading: "Responsible materials",
          body: [
            "We prioritise 100% cotton and high-GSM blanks that last longer, and we're steadily expanding the share of certified organic and recycled fabrics in the catalog.",
          ],
        },
        {
          heading: "Packaging",
          body: [
            "Orders ship in minimal, recyclable packaging without single-use plastic fillers wherever operationally possible.",
          ],
        },
      ]}
    />
  );
}
