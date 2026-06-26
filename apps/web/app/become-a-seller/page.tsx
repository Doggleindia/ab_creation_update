import Link from "next/link";
import { ArrowRight, TrendingUp, Truck, Palette, BadgeIndianRupee, Headset, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Become a Seller | AB Creation",
  description:
    "Partner with AB Creation. Sell your custom apparel and printing designs with our production, fulfilment, and wallet-based payouts.",
};

const benefits = [
  {
    icon: TrendingUp,
    title: "Grow your brand",
    description: "Reach more customers and scale your apparel business without holding inventory.",
  },
  {
    icon: Palette,
    title: "Premium printing",
    description: "DTF, screen printing and embroidery handled by our studio at consistent quality.",
  },
  {
    icon: Truck,
    title: "Pan-India fulfilment",
    description: "We print, pack and ship to your customers across the country.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Simple payouts",
    description: "Track every order and settlement through your wallet dashboard.",
  },
  {
    icon: Headset,
    title: "Dedicated support",
    description: "A partner team to help you with designs, orders and escalations.",
  },
  {
    icon: ShieldCheck,
    title: "No upfront cost",
    description: "Start free — you only pay for what you produce and sell.",
  },
];

const steps = [
  { n: "01", title: "Apply", text: "Share your details and what you'd like to sell." },
  { n: "02", title: "Onboard", text: "We set up your catalogue and pricing together." },
  { n: "03", title: "Sell & earn", text: "List products, take orders, and we handle production." },
];

export default function BecomeASellerPage() {
  return (
    <main className="bg-[#F5F1EA]">
      {/* HERO */}
      <section className="bg-[#171717] text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 bg-[#CBAA75] text-[#171717] text-xs font-semibold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6">
            ✦ Partner Program
          </span>
          <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight">
            Become an <span className="text-[#CBAA75]">AB Creation</span> Seller
          </h1>
          <p className="mt-6 text-[17px] md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Partner with us and grow your business. You bring the designs and customers —
            we handle premium printing, fulfilment and payouts.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact-us"
              className="inline-flex items-center justify-center gap-2 bg-[#CBAA75] hover:bg-[#B87D4C] text-[#171717] font-bold px-8 py-3.5 rounded-full transition-colors"
            >
              Apply to Sell
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/product-collection"
              className="inline-flex items-center justify-center border border-white/30 hover:border-[#CBAA75] hover:text-[#CBAA75] text-white font-semibold px-8 py-3.5 rounded-full transition-colors"
            >
              See what we make
            </Link>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="text-3xl md:text-[40px] font-bold text-center text-[#171717] mb-4">
          Why sell with us
        </h2>
        <p className="text-center text-neutral-600 mb-12 max-w-2xl mx-auto">
          Everything you need to launch and scale a custom-apparel business — without the overhead.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white border border-[#E8E6E3] rounded-2xl p-7 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F5F1EA] flex items-center justify-center mb-5">
                <Icon className="w-6 h-6 text-[#B87D4C]" />
              </div>
              <h3 className="text-lg font-bold text-[#171717] mb-2">{title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-y border-[#E8E6E3]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <h2 className="text-3xl md:text-[40px] font-bold text-center text-[#171717] mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="text-5xl font-bold text-[#CBAA75] mb-3">{s.n}</div>
                <h3 className="text-lg font-bold text-[#171717] mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#171717]">
          Ready to start selling?
        </h2>
        <p className="mt-4 text-neutral-600 max-w-xl mx-auto">
          Tell us about your business and our partner team will get you set up.
        </p>
        <Link
          href="/contact-us"
          className="mt-8 inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-[#B87D4C] text-white font-bold px-8 py-3.5 rounded-full transition-colors"
        >
          Apply to Sell
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
