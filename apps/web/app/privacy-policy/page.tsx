import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#fbf4ea]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-600">Policies</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Last updated: February 3, 2026
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 text-gray-700 text-sm leading-7">
        <p>
          This Privacy Policy explains how we collect, use, and protect your
          information when you visit our website or place an order.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Information We Collect</h2>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          <li>Contact details such as name, email address, phone number, and shipping address.</li>
          <li>Order details including products purchased and payment status.</li>
          <li>Basic usage data like pages visited and device or browser type.</li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">How We Use Information</h2>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          <li>To process orders, payments, shipping, and returns.</li>
          <li>To provide customer support and respond to inquiries.</li>
          <li>To improve the website, products, and overall experience.</li>
          <li>To send updates related to your order or important account notices.</li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Sharing and Disclosure</h2>
        <p className="mt-3">
          We only share information with trusted service providers needed to
          operate our business (payment processors, shipping partners, analytics
          tools). We do not sell personal data.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Cookies and Analytics</h2>
        <p className="mt-3">
          We may use cookies or similar technologies to remember preferences and
          understand how the site is used. You can control cookies in your
          browser settings.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Data Retention</h2>
        <p className="mt-3">
          We retain personal information only as long as needed for legitimate
          business purposes and legal requirements.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Your Rights</h2>
        <p className="mt-3">
          You may request access, correction, or deletion of your personal
          information, subject to applicable laws.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Contact Us</h2>
        <p className="mt-3">
          For privacy-related questions, please reach out using the contact
          details listed on our website.
        </p>
      </div>

      <Footer />
    </div>
  );
}
