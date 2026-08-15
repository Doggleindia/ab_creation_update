import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";

const SERVICES: Record<
  string,
  {
    title: string;
    tagline: string;
    img: string;
    intro: string;
    bestFor: string[];
    points: { label: string; value: string }[];
  }
> = {
  "dtg-printing": {
    title: "DTG Printing",
    tagline: "Photorealistic direct-to-garment prints",
    img: "/images/home/service-dtg.png",
    intro:
      "Direct-to-Garment printing sprays water-based ink straight into the fabric, so gradients, photographs, and fine detail come out exactly as designed. The print becomes part of the garment — soft, flexible, and breathable.",
    bestFor: [
      "Photographic and multi-colour artwork",
      "Small runs and one-off custom designs",
      "Soft prints on 100% cotton",
    ],
    points: [
      { label: "Minimum order", value: "1 piece" },
      { label: "Colours", value: "Unlimited (full CMYK)" },
      { label: "Best fabric", value: "100% cotton, 180+ GSM" },
      { label: "Durability", value: "50+ washes with care" },
    ],
  },
  embroidery: {
    title: "Embroidery",
    tagline: "Premium stitched branding that lasts",
    img: "/images/home/service-embroidery.png",
    intro:
      "Embroidery stitches your logo or monogram directly into the garment with high-density thread. It's the most premium, durable finish we offer — ideal for polos, caps, and corporate wear that needs to look sharp for years.",
    bestFor: [
      "Logos, monograms and crests",
      "Polos, caps, jackets and workwear",
      "Corporate and uniform programs",
    ],
    points: [
      { label: "Minimum order", value: "10 pieces" },
      { label: "Colours", value: "Up to 9 thread colours" },
      { label: "Best placement", value: "Left chest, sleeve, cap front" },
      { label: "Durability", value: "Lifetime of the garment" },
    ],
  },
  "screen-printing": {
    title: "Screen Printing",
    tagline: "Bold, vibrant prints at scale",
    img: "/images/home/service-screen.png",
    intro:
      "Screen printing pushes thick plastisol ink through a mesh stencil, one screen per colour. It delivers the boldest, most opaque colours of any method and gets more economical the larger your run — the workhorse of bulk merch.",
    bestFor: [
      "Bulk orders of 50+ pieces",
      "Bold spot-colour designs",
      "Event, team and campaign merchandise",
    ],
    points: [
      { label: "Minimum order", value: "50 pieces" },
      { label: "Colours", value: "Up to 6 spot colours" },
      { label: "Best fabric", value: "Cotton and blends" },
      { label: "Durability", value: "100+ washes" },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(SERVICES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES[slug];
  return { title: s ? `${s.title} | AB Creation` : "Service | AB Creation" };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = SERVICES[slug];
  if (!s) notFound();

  return (
    <main className="w-full bg-white px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-[1000px]">
        <nav className="flex items-center gap-2 pb-8 text-[13px]">
          <Link href="/" className="text-[#6b7280] hover:text-brand-orange">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <span className="text-[#6b7280]">Services</span>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <span className="font-semibold text-black">{s.title}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
          <div className="relative h-[300px] overflow-hidden rounded-[12px] bg-[#f3f4f6] sm:h-[380px]">
            <Image
              src={s.img}
              alt={s.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 500px"
            />
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-orange">
              Printing Service
            </p>
            <h1 className="pt-2 font-poppins text-[34px] font-bold leading-tight text-black">
              {s.title}
            </h1>
            <p className="pt-1 text-[16px] font-medium text-[#6b7280]">
              {s.tagline}
            </p>
            <p className="pt-5 text-[15px] leading-7 text-[#374151]">
              {s.intro}
            </p>
            <ul className="flex flex-col gap-2.5 pt-5">
              {s.bestFor.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-2.5 text-[14.5px] text-[#374151]"
                >
                  <Check className="h-4 w-4 shrink-0 text-[#16a34a]" /> {b}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 pt-7">
              <Link
                href="/design-studio"
                className="rounded-full bg-brand-orange px-7 py-3 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
              >
                Start a Design
              </Link>
              <Link
                href="/bulk-order/quote"
                className="rounded-full border border-black px-7 py-3 text-[15px] font-bold text-black transition-colors hover:bg-black hover:text-white"
              >
                Get a Bulk Quote
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {s.points.map((p) => (
            <div
              key={p.label}
              className="rounded-[12px] border border-[#e5e7eb] p-5"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                {p.label}
              </p>
              <p className="pt-2 text-[15px] font-bold text-black">{p.value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
