import Footer from "@/components/Footer";

export default function RefundCancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#F5F1EA]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-600">Policies</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            Refund and Cancellation Policy
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Last updated: February 3, 2026
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 text-gray-700 text-sm leading-7">
        <p>
          We want you to be satisfied with your purchase. The following policy
          explains when refunds, cancellations, and exchanges are available.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Eligibility</h2>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          <li>Items must be returned in original condition and packaging.</li>
          <li>Returns are accepted within 14 days of delivery unless stated otherwise.</li>
          <li>Proof of purchase is required for all refunds or exchanges.</li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Refunds</h2>
        <p className="mt-3">
          Once the returned item is received and inspected, we will notify you
          of approval or rejection. Approved refunds will be processed to the
          original payment method within 5 to 10 business days.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Cancellations</h2>
        <p className="mt-3">
          Orders can be canceled before they are shipped. If your order has
          already shipped, it will be handled as a return.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Shipping Costs</h2>
        <p className="mt-3">
          Shipping fees are non-refundable unless the return is due to an error
          on our part. Return shipping costs are the customer�s responsibility.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Non-Returnable Items</h2>
        <p className="mt-3">
          Custom or personalized items, as well as clearance items, may be
          non-returnable. Please check product pages for specific exceptions.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Contact Us</h2>
        <p className="mt-3">
          To request a refund or cancellation, please contact our support team
          using the details listed on our website.
        </p>
      </div>

      <Footer />
    </div>
  );
}
