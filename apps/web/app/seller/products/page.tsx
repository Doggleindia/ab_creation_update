"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SellerShell from "@/components/seller/SellerShell";
import { apiFetch, getToken } from "@/lib/auth";

type Submission = {
  _id: string;
  title: string;
  method: string;
  color?: string;
  retailPrice: number;
  images: string[];
  status: "pending" | "approved" | "rejected" | "changes";
  rejectionReason?: string;
  createdAt?: string;
  publishedProductId?: { slug?: string } | string | null;
};

const CHIP: Record<string, { label: string; cls: string }> = {
  pending: { label: "In Review", cls: "bg-[#fdecc8] text-[#b45309]" },
  approved: { label: "Live", cls: "bg-[#dcfce7] text-[#16a34a]" },
  rejected: { label: "Rejected", cls: "bg-[#fee2e2] text-[#ba1a1a]" },
  changes: { label: "Changes Requested", cls: "bg-[#fdf3dd] text-[#b07d1a]" },
};

export default function SellerProductsPage() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!getToken()) return;
    apiFetch<{ data: { sellerProducts: Submission[] } }>(
      "/api/seller-products/mine",
    )
      .then((j) => setSubs(j.data?.sellerProducts ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <SellerShell
      title="My Products"
      subtitle={`${subs.length} submission${subs.length === 1 ? "" : "s"} · ${subs.filter((s) => s.status === "approved").length} live on the storefront`}
    >
      {!loaded ? (
        <p className="py-16 text-center text-[14px] text-[#9ca3af]">
          Loading your submissions…
        </p>
      ) : subs.length === 0 ? (
        <div className="flex flex-col items-center rounded-[12px] border border-[#e5e7eb] py-20 text-center">
          <p className="text-[16px] font-bold text-black">
            No designs submitted yet
          </p>
          <p className="pt-2 text-[14px] text-[#6b7280]">
            Submit your first design and we&apos;ll review it within 48 hours.
          </p>
          <Link
            href="/seller/new"
            className="mt-6 rounded-full bg-brand-orange px-8 py-3 text-[15px] font-bold text-white hover:opacity-90"
          >
            Submit a Design
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subs.map((s) => {
            const chip = CHIP[s.status];
            const slug =
              typeof s.publishedProductId === "object"
                ? s.publishedProductId?.slug
                : undefined;
            return (
              <div
                key={s._id}
                className="overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-white"
              >
                <div className="relative flex h-[180px] items-center justify-center bg-[#f8f9fb]">
                  {s.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.images[0]}
                      alt={s.title}
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <span className="text-[12px] text-[#c4c7c7]">No image</span>
                  )}
                  <span
                    className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.4px] ${chip.cls}`}
                  >
                    {chip.label}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[15px] font-bold leading-snug text-black">
                      {s.title}
                    </p>
                    <p className="text-[15px] font-bold text-black">
                      ₹{s.retailPrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <p className="pt-1 text-[12.5px] text-[#6b7280]">
                    {s.method}
                    {s.color ? ` · ${s.color}` : ""}
                    {s.createdAt
                      ? ` · ${new Date(s.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`
                      : ""}
                  </p>
                  {s.rejectionReason && (
                    <p className="pt-2 text-[12.5px] leading-5 text-[#ba1a1a]">
                      Feedback: {s.rejectionReason}
                    </p>
                  )}
                  <div className="flex gap-2 pt-4">
                    {s.status === "approved" && slug && (
                      <Link
                        href={`/product/${slug}`}
                        className="flex-1 rounded-[6px] bg-black py-2 text-center text-[12.5px] font-bold text-white hover:opacity-85"
                      >
                        View Listing
                      </Link>
                    )}
                    {(s.status === "rejected" || s.status === "changes") && (
                      <Link
                        href={`/seller/new?edit=${s._id}`}
                        className="flex-1 rounded-[6px] bg-brand-orange py-2 text-center text-[12.5px] font-bold text-white hover:opacity-90"
                      >
                        Edit &amp; Resubmit
                      </Link>
                    )}
                    {s.status === "pending" && (
                      <span className="flex-1 rounded-[6px] border border-[#e5e7eb] py-2 text-center text-[12.5px] font-semibold text-[#6b7280]">
                        Awaiting review
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SellerShell>
  );
}
