import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Phone, MapPin, Clock, Mail } from "lucide-react";
import FeatureStrip from "@/components/common/FeatureStrip";
import ContactForm from "@/components/contact/ContactForm";
import { getSiteData } from "@/lib/api";

export const metadata: Metadata = {
  title: "Contact Us | AB Creation",
  description:
    "Get in touch with AB Creation for custom apparel, bulk orders, and printing services.",
};

export default async function ContactPage() {
  // Contact details come from admin Settings → Business Information;
  // unset cards are hidden rather than showing placeholder data.
  const { content, settings } = await getSiteData();
  const business = settings.business ?? {};
  const addressLines = [
    business.address,
    [business.cityState, business.pin].filter(Boolean).join(" — "),
  ].filter((l): l is string => Boolean(l && l.trim()));

  const INFO = [
    addressLines.length > 0
      ? { icon: MapPin, title: "Address", lines: addressLines }
      : null,
    business.phone
      ? { icon: Phone, title: "Phone", lines: [business.phone] }
      : null,
    business.email
      ? { icon: Mail, title: "Email", lines: [business.email] }
      : null,
    {
      icon: Clock,
      title: "Working Time",
      lines: [content.announcement?.hours || "Mon–Sat, 9:00 AM – 5:30 PM"],
    },
  ].filter((c): c is NonNullable<typeof c> => c !== null);

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
