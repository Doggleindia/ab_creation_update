import type { Metadata } from "next";
import ProsePage from "@/components/common/ProsePage";

export const metadata: Metadata = { title: "Privacy Policy | AB Creation" };

export default function PrivacyPolicyPage() {
  return (
    <ProsePage
      title="Privacy Policy"
      intro="AB Creation respects your privacy. This policy explains what information we collect when you use our storefront and design studio, how we use it, and the choices you have."
      sections={[
        {
          heading: "Information we collect",
          body: [
            "Account details you provide (name, email, phone), order and shipping information, custom design files you upload, and payment records for wallet transactions. We also collect basic usage data such as pages visited and device type to keep the site reliable.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "To produce and deliver your orders, print your uploaded designs, process wallet payments, respond to support requests, and review seller or bulk-order applications. We do not sell your personal information to third parties.",
          ],
        },
        {
          heading: "Design files",
          body: [
            "Artwork you upload is used solely to fulfil your order or review your application. You retain all rights to your designs; we only reproduce them on the products you order.",
          ],
        },
        {
          heading: "Payments",
          body: [
            "Wallet recharges are processed by Razorpay. We never store your card, UPI, or banking credentials — payment collection happens on Razorpay's secure systems and we record only the outcome of the transaction.",
          ],
        },
        {
          heading: "Data retention & your rights",
          body: [
            "Order records are retained for accounting and warranty purposes. You can request a copy of your data, correction of inaccurate details, or deletion of your account by contacting support.",
          ],
        },
      ]}
    />
  );
}
