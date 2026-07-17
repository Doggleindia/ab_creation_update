import { Award, ShieldCheck, Truck, Headset } from "lucide-react";

const FEATURES = [
  { icon: Award, title: "High Quality", sub: "Crafted from top materials" },
  { icon: ShieldCheck, title: "Warranty Protection", sub: "Over 2 years" },
  { icon: Truck, title: "Free Shipping", sub: "Order over ₹999" },
  { icon: Headset, title: "24 / 7 Support", sub: "Dedicated support" },
];

export default function FeatureStrip() {
  return (
    <section className="w-full bg-[#f9fafb] px-4 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto grid max-w-[1152px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="flex items-center gap-4">
              <Icon className="h-9 w-9 text-brand-copper" strokeWidth={1.5} />
              <div>
                <p className="text-[15px] font-bold text-[#111827]">{f.title}</p>
                <p className="text-[13px] text-[#6b7280]">{f.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
