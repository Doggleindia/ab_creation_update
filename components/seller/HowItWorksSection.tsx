import { Store, Palette, ShoppingCart, Truck } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: Store,
    title: "Create Your Store",
    copy: "Set up your professional branded storefront in minutes.",
  },
  {
    num: "02",
    icon: Palette,
    title: "Design Products",
    copy: "Upload your artwork and create custom products instantly.",
  },
  {
    num: "03",
    icon: ShoppingCart,
    title: "Customer Orders",
    copy: "Customers buy directly from your AB Creation shop.",
  },
  {
    num: "04",
    icon: Truck,
    title: "We Print & Ship",
    copy: "We handle fulfillment and ship directly to your fans.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full bg-white py-16">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="mb-10 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-orange">
            The Process
          </p>
          <h2 className="mt-2 font-poppins text-[28px] font-semibold text-[#242424] sm:text-[32px]">
            How It Works
          </h2>
          <span className="mx-auto mt-3 block h-[3px] w-12 rounded-full bg-brand-orange" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ num, icon: Icon, title, copy }) => (
            <div
              key={num}
              className="flex flex-col gap-3 rounded-[12px] border border-[#f3e7d9] bg-[#fdf6ee] p-6"
            >
              <span className="text-[13px] font-semibold text-[#9ca3af]">
                {num}
              </span>
              <Icon className="h-6 w-6 text-brand-orange" />
              <h3 className="text-[18px] font-bold text-[#242424]">{title}</h3>
              <p className="text-[14px] leading-6 text-[#6b7280]">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
