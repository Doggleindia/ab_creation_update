"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BACKEND } from "@/lib/auth";

type LookbookItem = {
  _id: string;
  title?: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  position: number;
};

export default function LookbookPage() {
  const [items, setItems] = useState<LookbookItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND}/api/lookbook`)
      .then((r) => r.json())
      .then((j) => setItems(j?.data?.lookbookItems ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <main className="w-full bg-white px-4 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1152px]">
        <nav className="flex items-center gap-2 pb-8 text-[13px]">
          <Link href="/" className="text-[#6b7280] hover:text-brand-orange">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <span className="font-semibold text-black">Lookbook</span>
        </nav>

        <h1 className="text-[32px] font-bold tracking-[-0.5px] text-black">
          Lookbook
        </h1>
        <p className="max-w-[560px] pt-2 text-[15px] leading-6 text-[#444748]">
          Real prints, real people — a running gallery of custom apparel made
          in our studio.
        </p>

        {loaded && items.length === 0 && (
          <div className="mt-10 rounded-[12px] border border-[#e5e7eb] p-16 text-center">
            <p className="text-[15px] font-semibold text-black">
              The gallery is being curated
            </p>
            <p className="pt-1 text-[13px] text-[#6b7280]">
              Check back soon — new work is added regularly.
            </p>
          </div>
        )}

        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {items.map((item) => (
            <figure
              key={item._id}
              className="break-inside-avoid overflow-hidden rounded-[12px] border border-[#e5e7eb]"
            >
              {item.mediaType === "video" ? (
                <video
                  src={item.mediaUrl}
                  className="w-full"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element -- S3 host not in next.config images */
                <img
                  src={item.mediaUrl}
                  alt={item.title ?? "Lookbook"}
                  className="w-full"
                  loading="lazy"
                />
              )}
              {item.title && (
                <figcaption className="px-4 py-3 text-[13px] font-semibold text-black">
                  {item.title}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </main>
  );
}
