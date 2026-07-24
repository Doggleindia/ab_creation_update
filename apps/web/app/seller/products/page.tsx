"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";
import SellerShell from "@/components/seller/SellerShell";
import { apiFetch } from "@/lib/auth";
import {
  STATUS_CHIP,
  type SellerOrder,
  type SellerSubmission,
  getSellerOrders,
  getSubmissions,
  inr,
  publishedId,
  soldByProduct,
} from "@/lib/seller";

const TABS = [
  { key: "all", label: "All" },
  { key: "approved", label: "Live" },
  { key: "pending", label: "Under Review" },
  { key: "changes", label: "Changes" },
  { key: "rejected", label: "Rejected" },
] as const;

const PAGE_SIZE = 6;

export default function SellerProductsPage() {
  const [subs, setSubs] = useState<SellerSubmission[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(() => {
    Promise.allSettled([
      getSubmissions().then(setSubs),
      getSellerOrders().then(setOrders),
    ]).finally(() => setLoaded(true));
  }, []);
  useEffect(load, [load]);
  useEffect(() => setPage(1), [tab]);

  const sold = soldByProduct(orders);
  const count = (k: string) =>
    k === "all" ? subs.length : subs.filter((s) => s.status === k).length;
  const rows = subs.filter((s) => tab === "all" || s.status === tab);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function duplicate(s: SellerSubmission) {
    if (!window.confirm(`Duplicate "${s.title}"? The copy is submitted for review as a new design.`)) return;
    setBusyId(s._id);
    setFlash(null);
    try {
      await apiFetch("/api/seller-products", {
        method: "POST",
        body: JSON.stringify({
          title: `${s.title} (Copy)`,
          description: s.description,
          baseProductId:
            typeof s.baseProductId === "object" ? s.baseProductId?._id : s.baseProductId,
          method: s.method,
          color: s.color,
          retailPrice: s.retailPrice,
          sizes: s.sizes,
          tags: s.tags,
          images: s.images,
        }),
      });
      setFlash({ kind: "ok", text: `"${s.title} (Copy)" submitted for review.` });
      load();
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Could not duplicate" });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(s: SellerSubmission) {
    if (!window.confirm(`Delete "${s.title}"? This cannot be undone.`)) return;
    setBusyId(s._id);
    setFlash(null);
    try {
      await apiFetch(`/api/seller-products/${s._id}`, { method: "DELETE" });
      setFlash({ kind: "ok", text: "Submission deleted." });
      load();
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Could not delete" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SellerShell
      title="My Products"
      subtitle={`${subs.length} product${subs.length === 1 ? "" : "s"}`}
    >
      {/* Tabs */}
      <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-[#eeeff1] p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold ${
              tab === t.key ? "bg-black text-white" : "text-[#6b7280] hover:text-black"
            }`}
          >
            {t.label} ({count(t.key)})
          </button>
        ))}
      </div>

      {flash && (
        <p
          className={`mt-4 w-fit rounded-lg px-3.5 py-2.5 text-[13px] font-medium ${
            flash.kind === "ok" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#ba1a1a]"
          }`}
        >
          {flash.text}
        </p>
      )}

      {loaded && rows.length === 0 && (
        <div className="mt-6 rounded-xl border border-[#e5e7eb] bg-white p-14 text-center">
          <p className="text-[15px] font-semibold text-black">
            {tab === "all"
              ? "No designs yet"
              : `No ${TABS.find((t) => t.key === tab)?.label.toLowerCase()} designs`}
          </p>
          <Link
            href="/seller/new"
            className="mt-5 inline-block rounded-full bg-brand-orange px-7 py-2.5 text-[14px] font-bold text-white hover:opacity-90"
          >
            Create New Product
          </Link>
        </div>
      )}

      {/* Cards */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {pageRows.map((s) => {
          const chip = STATUS_CHIP[s.status] ?? STATUS_CHIP.pending;
          const base = typeof s.baseProductId === "object" ? s.baseProductId : null;
          const pub =
            typeof s.publishedProductId === "object" ? s.publishedProductId : null;
          const soldCount = sold.get(publishedId(s) ?? "") ?? 0;
          const editable = s.status === "rejected" || s.status === "changes";
          const busy = busyId === s._id;
          return (
            <div key={s._id} className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
              <div className="relative flex h-[190px] items-center justify-center bg-[#f8f9fb]">
                {s.images[0] ? (
                  /* eslint-disable-next-line @next/next/no-img-element -- seller artwork on S3 */
                  <img src={s.images[0]} alt={s.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[12px] text-[#c4c7c7]">No image</span>
                )}
                <span
                  className={`absolute right-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.5px] ${chip.cls}`}
                >
                  {chip.label}
                </span>
              </div>
              <div className="p-4">
                <p className="truncate text-[15px] font-bold text-black">{s.title}</p>
                <p className="pt-0.5 text-[12.5px] text-[#6b7280]">
                  {[s.baseProductName ?? base?.title, s.method].filter(Boolean).join(" · ")}
                </p>
                <div className="flex items-end justify-between pt-3">
                  <span>
                    <span className="text-[17px] font-bold text-black">{inr(s.retailPrice)}</span>
                    {base?.basePrice != null && (
                      <span className="block text-[11.5px] text-[#9ca3af]">
                        Base cost {inr(base.basePrice)}
                      </span>
                    )}
                  </span>
                  <span className="text-right text-[11.5px] text-[#6b7280]">
                    {s.status === "approved" ? (
                      <>
                        {soldCount} sold · {pub?.views ?? 0} views
                      </>
                    ) : s.status === "pending" ? (
                      "Pending approval"
                    ) : s.status === "changes" ? (
                      "Changes requested"
                    ) : (
                      "Not published"
                    )}
                  </span>
                </div>
                {s.rejectionReason && s.status !== "approved" && (
                  <p className="pt-2 text-[11.5px] leading-4 text-[#ba1a1a]">
                    {s.rejectionReason.slice(0, 90)}
                  </p>
                )}
                <div className="mt-3.5 flex items-center justify-between border-t border-[#f3f4f6] pt-3">
                  <span className="flex items-center gap-2">
                    {editable ? (
                      <Link
                        href={`/seller/new?edit=${s._id}`}
                        aria-label={`Edit ${s.title}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#374151] hover:border-black"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    ) : pub?.slug ? (
                      <a
                        href={`/product/${pub.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View ${s.title} on the storefront`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#374151] hover:border-black"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                    <button
                      onClick={() => void duplicate(s)}
                      disabled={busy}
                      aria-label={`Duplicate ${s.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#374151] hover:border-black disabled:opacity-40"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </span>
                  {s.status !== "approved" && (
                    <button
                      onClick={() => void remove(s)}
                      disabled={busy}
                      aria-label={`Delete ${s.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#dc2626] hover:border-[#dc2626] disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e7eb] text-[#374151] hover:border-black disabled:opacity-40"
          >
            ‹
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-9 w-9 rounded-full text-[13px] font-bold ${
                page === n ? "bg-black text-white" : "text-[#374151] hover:bg-[#f3f4f6]"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e7eb] text-[#374151] hover:border-black disabled:opacity-40"
          >
            ›
          </button>
        </div>
      )}
    </SellerShell>
  );
}
