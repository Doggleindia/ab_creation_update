import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Phone, MapPin, Clock } from "lucide-react";
import FeatureStrip from "@/components/common/FeatureStrip";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | AB Creation",
  description:
    "Get in touch with AB Creation for custom apparel, bulk orders, and printing services.",
};

const INFO = [
  {
    icon: MapPin,
    title: "Address",
    lines: ["236 5th SE Avenue, New York", "NY10000, United States"],
  },
  {
    icon: Phone,
    title: "Phone",
    lines: ["Mobile: +(84) 546-6789", "Hotline: +(84) 456-6789"],
  },
  {
    icon: Clock,
    title: "Working Time",
    lines: ["Monday-Friday: 9:00 - 22:00", "Saturday-Sunday: 9:00 - 21:00"],
  },
];

export default function ContactPage() {
  return (
    <main>
      {/* Hero banner */}
      <section className="relative h-[220px] w-full overflow-hidden sm:h-[280px] lg:h-[328px]">
        <Image
          src="/contact-hero.png"
          alt="Contact AB Creation"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="font-poppins text-[36px] font-medium text-black sm:text-[48px]">
            Contact
          </h1>
          <nav className="mt-2 flex items-center gap-3 text-[16px] text-black">
            <Link href="/" className="font-semibold hover:text-brand-orange">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>Contact</span>
          </nav>
        </div>
      </section>

      {/* Get in touch */}
      <section className="w-full bg-white px-4 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-[1152px]">
          <div className="mb-14 text-center">
            <h2 className="font-poppins text-[28px] font-semibold uppercase text-black sm:text-[32px]">
              Get In Touch With Us
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[16px] leading-relaxed text-[#9f9f9f]">
              For More Information About Our Product &amp; Services. Please Feel
              Free To Drop Us An Email. Our Staff Always Be There To Help You
              Out. Do Not Hesitate!
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[380px_1fr]">
            {/* Info list */}
            <div className="flex flex-col gap-12 pt-4">
              {INFO.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.title} className="flex items-start gap-6">
                    <Icon className="mt-1 h-7 w-7 shrink-0 fill-black text-black" />
                    <div>
                      <p className="font-poppins text-[24px] font-medium text-black">
                        {c.title}
                      </p>
                      {c.lines.map((l) => (
                        <p
                          key={l}
                          className="max-w-[254px] font-poppins text-[16px] text-black"
                        >
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

      <FeatureStrip />
    </main>
  );
}
