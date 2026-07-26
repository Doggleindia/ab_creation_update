import { Award, Zap, Eye, Percent } from "lucide-react";

const FEATURES = [
  {
    icon: Award,
    title: "Top Quality",
    description:
      "Premium fabrics and state-of-the-art printing techniques ensure your designs last.",
  },
  {
    icon: Zap,
    title: "Ultra-Fast Speed",
    description:
      "Rapid turnarounds on both bulk orders and print-on-demand fulfillment.",
  },
  {
    icon: Eye,
    title: "Full Visibility",
    description:
      "Track every stage of your order in real-time from production to delivery.",
  },
  {
    icon: Percent,
    title: "Bulk Tiered Pricing",
    description:
      "Save more as you scale. Automated tier discounts apply directly at checkout.",
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="w-full bg-[#111827] px-4 py-20 text-white sm:px-8 lg:px-[86.5px]">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="font-poppins text-[13px] font-bold uppercase tracking-[2px] text-brand-orange">
            Why Choose Us
          </span>
          <h2 className="font-poppins text-3xl font-extrabold text-white sm:text-[42px]">
            The Smarter Way to Print and Pay
          </h2>
          <p className="max-w-2xl font-poppins text-[16px] text-[#9ca3af] sm:text-[18px]">
            Transparent pricing, premium quality, and effortless order management for
            brands and creators.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-[#1f2937]/50 p-6 transition-all duration-300 hover:border-brand-orange/50 hover:bg-[#1f2937]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange transition-colors group-hover:bg-brand-orange group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-poppins text-[20px] font-bold text-white">
                  {item.title}
                </h3>
                <p className="font-poppins text-[14px] leading-relaxed text-[#9ca3af]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
