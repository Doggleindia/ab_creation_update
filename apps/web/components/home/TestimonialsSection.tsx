import Link from "next/link";
import { Quote } from "lucide-react";
import type { SiteTestimonial } from "@/lib/api";

// Neutral, on-brand testimonials. (The Figma mock used competitor placeholder
// copy — swapped here so we don't ship another brand's name on the site.)
const TESTIMONIALS = [
  {
    title: "Exactly what our team wanted",
    body: "We ordered custom tees for our startup and the print quality blew us away. The design studio made it so easy to get everything just right.",
    name: "Aarav M.",
    role: "Founder, Northline Labs",
    initials: "AM",
  },
  {
    title: "Perfect for our bulk order",
    body: "Needed 200 hoodies for a college fest on a tight deadline. AB Creation delivered on time with consistent quality across every single piece.",
    name: "Sneha R.",
    role: "Event Lead",
    initials: "SR",
  },
  {
    title: "Our go-to printing partner",
    body: "From design help to doorstep delivery, the whole process was smooth. We keep coming back for every new drop we launch.",
    name: "Rohan K.",
    role: "Store Owner",
    initials: "RK",
  },
];

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function TestimonialsSection({
  items,
}: {
  items?: SiteTestimonial[];
}) {
  const cards =
    items?.filter((t) => t.name && t.body).length
      ? items!
          .filter((t) => t.name && t.body)
          .map((t) => ({
            title: t.title || `${t.name.split(" ")[0]}'s experience`,
            body: t.body,
            name: t.name,
            role: t.role ?? "",
            initials: initialsOf(t.name),
          }))
      : TESTIMONIALS;
  return (
    <section className="w-full bg-[#faf3ea] px-4 py-20 sm:px-8 lg:px-[86.5px]">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-poppins text-3xl font-bold text-[#111827] sm:text-[40px]">
            What Our Clients think
          </h2>
          <p className="text-[16px] text-[#6b7280]">
            Get inspired from some of our happy customers showing off their
            custom apparel
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-7 md:grid-cols-3">
          {cards.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-lg border border-[#e5e5e5] bg-white p-5"
            >
              <Quote className="h-6 w-6 fill-brand-gold text-brand-gold" />
              <h3 className="mt-4 text-[19px] font-bold text-[#222222]">
                {t.title}
              </h3>
              <p className="mt-3 flex-1 text-[13px] leading-5 text-[#555555]">
                {t.body}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-brand-gold/20 text-[15px] font-bold text-brand-copper">
                  {t.initials}
                </span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#222222]">
                    {t.name}
                  </span>
                  <span className="text-[13px] text-[#006cb9]">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/contact-us"
          className="rounded-full border-2 border-brand-orange px-12 py-3 text-[16px] font-bold text-brand-orange transition-colors hover:bg-brand-orange hover:text-white"
        >
          Read More
        </Link>
      </div>
    </section>
  );
}
