import Footer from "@/components/Footer";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#F5F1EA]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-600">Policies</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            Terms and Conditions
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Last updated: February 3, 2026
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 text-gray-700 text-sm leading-7">
        <p>
          By accessing or using our website, you agree to these Terms and
          Conditions. If you do not agree, please do not use the site.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Use of the Site</h2>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          <li>You must be at least 18 years old or have permission from a guardian.</li>
          <li>You agree not to misuse the site or attempt to disrupt services.</li>
          <li>Content is provided for personal and non-commercial use only.</li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Orders and Payments</h2>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          <li>All orders are subject to acceptance and product availability.</li>
          <li>Prices and promotions may change without notice.</li>
          <li>We reserve the right to cancel or limit quantities per order.</li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Intellectual Property</h2>
        <p className="mt-3">
          All content, logos, images, and designs are the property of the
          company and may not be used without permission.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Limitation of Liability</h2>
        <p className="mt-3">
          We are not liable for indirect, incidental, or consequential damages
          arising from your use of the website or products.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Changes to These Terms</h2>
        <p className="mt-3">
          We may update these Terms and Conditions from time to time. Continued
          use of the site means you accept the revised terms.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Contact Us</h2>
        <p className="mt-3">
          If you have questions about these Terms and Conditions, please reach
          out using the contact details listed on our website.
        </p>
      </div>

      <Footer />
    </div>
  );
}
