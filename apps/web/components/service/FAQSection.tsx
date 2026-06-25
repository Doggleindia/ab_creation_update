"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is it free to sell with Printful?",
    answer:
      "Yes, it's free to use Printful. There are no monthly fees, and you only pay when you place an order.",
  },
  {
    question: "How much does Printful cost per month?",
    answer:
      "Printful has no monthly subscription fees. Costs depend only on the products and services you order.",
  },
  {
    question: "What’s included in the product pricing?",
    answer:
      "Product pricing includes printing, packaging, and fulfillment. Shipping costs are calculated separately.",
  },
  {
    question: "Can I get a discount on sample orders?",
    answer:
      "Yes, Printful offers discounted sample orders so you can test product quality before selling.",
  },
  {
    question: "Can I cancel the Growth plan at any time?",
    answer:
      "Yes, you can cancel or change your plan at any time from your account settings.",
  },
  {
    question: "How do you accept payments?",
    answer:
      "We accept major credit cards, PayPal, and other supported payment methods depending on your region.",
  },
  {
    question:
      "How much does a product cost if I order it for myself, my team, or my company?",
    answer:
      "Product cost depends on the item, printing method, quantity, and shipping destination.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-[#ffffff] py-24">
      <div className="max-w-4xl mx-auto px-4">
        {/* TITLE */}
        <h2 className="text-center text-lg font-semibold tracking-wide text-gray-900 mb-12">
          FREQUENTLY ASKED QUESTIONS
        </h2>

        {/* FAQ LIST */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="border border-gray-200 rounded-md bg-white"
              >
                {/* QUESTION */}
                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {faq.question}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* ANSWER */}
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
