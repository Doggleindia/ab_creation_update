import type { Metadata } from "next";
import ProsePage from "@/components/common/ProsePage";

export const metadata: Metadata = {
  title: "Terms & Conditions | AB Creation",
};

export default function TermsPage() {
  return (
    <ProsePage
      title="Terms & Conditions"
      intro="These terms govern your use of the AB Creation storefront, design studio, wallet, and seller & bulk-order programs. By placing an order or submitting an application you agree to them."
      sections={[
        {
          heading: "Orders & payment",
          body: [
            "Orders are paid from your AB Creation wallet at the moment of checkout. An order is confirmed once payment succeeds and stock is reserved. Prices shown include taxes unless stated otherwise; shipping is calculated per order.",
          ],
        },
        {
          heading: "Custom designs",
          body: [
            "You confirm that you own, or are licensed to use, any artwork you upload, and that it does not infringe third-party rights or contain unlawful content. We may decline to print artwork that violates this policy and will refund the affected order to your wallet.",
          ],
        },
        {
          heading: "Production & delivery",
          body: [
            "Standard production is 7-10 business days after design approval, plus shipping time. Estimated delivery dates are estimates, not guarantees. Once an order is dispatched, tracking details are available on the Track Order page.",
          ],
        },
        {
          heading: "Cancellations & returns",
          body: [
            "Ready-made products can be returned within 7 days of delivery in unused condition. Custom-printed items can only be returned for production defects or printing errors, since they are made specifically for you. Approved refunds are credited to your wallet.",
          ],
        },
        {
          heading: "Seller & bulk programs",
          body: [
            "Seller and bulk applications are reviewed by our team and may be approved or rejected at our discretion. Approved sellers receive account credentials by email and are bound by the commission and payout terms shared during onboarding.",
          ],
        },
        {
          heading: "Liability",
          body: [
            "Our liability for any order is limited to the amount paid for that order. We are not liable for indirect or consequential losses.",
          ],
        },
      ]}
    />
  );
}
