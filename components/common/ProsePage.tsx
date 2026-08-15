import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type ProseSection = { heading: string; body: string[] };

export default function ProsePage({
  title,
  intro,
  sections,
  updated = "19 July 2026",
}: {
  title: string;
  intro: string;
  sections: ProseSection[];
  updated?: string;
}) {
  return (
    <main className="w-full bg-white px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-[760px]">
        <nav className="flex items-center gap-2 pb-8 text-[13px]">
          <Link href="/" className="text-[#6b7280] hover:text-brand-orange">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <span className="font-semibold text-black">{title}</span>
        </nav>
        <h1 className="text-[32px] font-bold tracking-[-0.64px] text-black">
          {title}
        </h1>
        <p className="pt-2 text-[13px] text-[#9ca3af]">Last updated: {updated}</p>
        <p className="pt-6 text-[15px] leading-7 text-[#374151]">{intro}</p>
        {sections.map((s) => (
          <section key={s.heading} className="pt-8">
            <h2 className="text-[19px] font-bold text-black">{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="pt-3 text-[15px] leading-7 text-[#374151]">
                {p}
              </p>
            ))}
          </section>
        ))}
        <p className="border-t border-[#e5e7eb] pt-6 mt-10 text-[14px] text-[#6b7280]">
          Questions?{" "}
          <Link
            href="/contact-us"
            className="font-semibold text-black underline hover:text-brand-orange"
          >
            Contact our support team
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
