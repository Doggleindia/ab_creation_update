import type { Metadata } from "next";
import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";
import FeatureStrip from "@/components/common/FeatureStrip";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | AB Creation",
  description:
    "Get in touch with AB Creation for custom apparel, bulk orders, and printing services.",
};

const INFO = [
  { icon: Phone, title: "Phone", lines: ["+91 912 112 12 12"] },
  {
    icon: MapPin,
    title: "Address",
    lines: ["Patricia C. Amedee", "41 Waldeck, Nashville"],
  },
  { icon: Clock, title: "Working Time", lines: ["Mon–Sat", "9:00 AM – 5:30 PM"] },
];

export default function ContactPage() {
  return (
    <main>
      {/* Header */}
      <section className="w-full bg-[#171717] px-4 py-16 text-center text-white sm:px-8">
        <h1 className="font-poppins text-3xl font-bold sm:text-[40px]">Contact</h1>
        <nav className="mt-3 flex items-center justify-center gap-2 text-[14px] text-white/70">
          <Link href="/" className="hover:text-brand-orange">Home</Link>
          <span>/</span>
          <span className="text-brand-gold">Contact</span>
        </nav>
      </section>

      <FeatureStrip />

      {/* Get in touch */}
      <section className="w-full bg-white px-4 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-[1152px]">
          <div className="mb-10 text-center">
            <h2 className="font-poppins text-2xl font-bold text-[#111827] sm:text-[32px]">
              Get In Touch With Us
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] text-[#6b7280]">
              For more information about our products &amp; services, please feel
              free to drop us a message. We&apos;re here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
            {/* Info cards */}
            <div className="flex flex-col gap-4">
              {INFO.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.title}
                    className="flex items-start gap-4 rounded-2xl border border-[#e8e6e3] bg-[#f9fafb] p-5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10">
                      <Icon className="h-5 w-5 text-brand-orange" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#111827]">
                        {c.title}
                      </p>
                      {c.lines.map((l) => (
                        <p key={l} className="text-[14px] text-[#6b7280]">
                          {l}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Form */}
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
