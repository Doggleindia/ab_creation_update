import Link from "next/link";
import { Quote } from "lucide-react";
import type { SiteTestimonial } from "@/lib/api";

const TESTIMONIALS = [
  {
    body: "The print quality is top notch! Our merch sold out in 2 days. Customer support helped us with bulk sizing seamlessly.",
    name: "Sarah Jenkins",
    role: "Founder, TechStart",
    initials: "SJ",
  },
  {
    body: "Fastest turnaround we've experienced. DTF prints came out crisp with vibrant colors. Will definitely reorder for our next release.",
    name: "Marcus Chen",
    role: "Creative Director",
    initials: "MC",
  },
  {
    body: "Exceptional embroidery precision on our staff polo shirts. AB Creation handles all our event merchandise with 100% reliability.",
    name: "David Ross",
    role: "Event Coordinator",
    initials: "DR",
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
            body: t.body,
            name: t.name,
            role: t.role ?? "",
            initials: initialsOf(t.name),
          }))
      : TESTIMONIALS;

  return (
    <section className="w-full bg-[#faf3ea] px-4 py-20 sm:px-8 lg:px-[86.5px]">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-poppins text-3xl font-extrabold text-[#111827] sm:text-[42px]">
            What Our Clients think
          </h2>
          <p className="font-poppins text-[16px] text-[#6b7280] sm:text-[18px]">
            Thousands of brands trust AB Creation for their custom apparel needs.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map((t) => (
            <div
              key={t.name}
              className="flex flex-col justify-between rounded-2xl border border-[#e5e5e5] bg-white p-7 shadow-sm"
            >
              <div className="flex flex-col gap-4">
                <Quote className="h-8 w-8 text-brand-orange" />
                <p className="font-poppins text-[15px] leading-relaxed text-[#374151]">
                  "{t.body}"
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-orange/10 font-poppins text-[14px] font-bold text-brand-orange">
                  {t.initials}
                </span>
                <div className="flex flex-col">
                  <span className="font-poppins text-[14px] font-bold text-[#111827]">
                    {t.name}
                  </span>
                  <span className="font-poppins text-[13px] text-[#6b7280]">
                    {t.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/contact-us"
          className="rounded-full border-2 border-brand-orange px-8 py-3 font-poppins text-[15px] font-bold text-brand-orange transition-colors hover:bg-brand-orange hover:text-white"
        >
          See All Reviews →
        </Link>
      </div>
    </section>
  );
}
