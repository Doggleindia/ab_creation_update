import { useCallback, useEffect, useState } from "react";
import Shell, { Card } from "../components/Shell";
import { api, inr, type SellerProductSub } from "../lib/api";

const TABS = ["pending", "changes", "approved", "rejected"] as const;

const CHECKLIST = ["No copyright issues", "Design within print bounds"];

const PAGE_SIZE = 10;
const PRINT_WIDTH_IN = 12; // print area width used for the DPI estimate

const METHOD_LABEL: Record<string, string> = {
  DTF: "DTF (Direct to Film)",
  Screen: "Screen Print",
  Embroidery: "Embroidery",
  "Heat Transfer": "Heat Transfer",
};

function fullDate(d?: string) {
  return d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";
}

export default function ProductApprovals() {
  const [subs, setSubs] = useState<SellerProductSub[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");
  const [selected, setSelected] = useState<SellerProductSub | null>(null);
  const [image, setImage] = useState(0);
  const [notes, setNotes] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [dpi, setDpi] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    api<{ data: { sellerProducts: SellerProductSub[] } }>(
      "/api/seller-products/admin",
    )
      .then((j) => {
        const list = j.data?.sellerProducts ?? [];
        setSubs(list);
        setSelected(
          (prev) =>
            list.find((s) => s._id === prev?._id) ??
            list.find((s) => s.status === "pending") ??
            list[0] ??
            null,
        );
      })
      .catch(() => {});
  }, []);
  useEffect(load, [load]);

  useEffect(() => {
    if (!selected) return;
    setImage(0);
    setNotes(selected.adminNotes ?? "");
    setChecks(
      Object.fromEntries(
        CHECKLIST.map((l) => [l, (selected.checklist ?? []).includes(l)]),
      ),
    );
    // Computed check: estimate print DPI from the artwork's pixel width
    setDpi(null);
    if (selected.images[0]) {
      const img = new Image();
      img.onload = () =>
        setDpi(Math.round(img.naturalWidth / PRINT_WIDTH_IN));
      img.src = selected.images[0];
    }
  }, [selected?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setPage(1), [tab]);

  const count = (s: string) => subs.filter((x) => x.status === s).length;
  const rows = subs.filter((s) => s.status === tab);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function saveReview() {
    if (!selected) return;
    await api(`/api/seller-products/admin/${selected._id}/review`, {
      method: "PATCH",
      body: JSON.stringify({
        adminNotes: notes,
        checklist: CHECKLIST.filter((l) => checks[l]),
      }),
    }).catch(() => {});
  }

  async function act(action: "approve" | "reject" | "changes") {
    if (!selected) return;
    setBusy(true);
    setFlash(null);
    try {
      await saveReview();
      const j = await api<{ message: string }>(
        `/api/seller-products/admin/${selected._id}/${action}`,
        {
          method: "PATCH",
          body: JSON.stringify(action === "approve" ? {} : { reason: notes }),
        },
      );
      setFlash({ kind: "ok", text: j.message });
      load();
    } catch (err) {
      setFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Action failed",
      });
    } finally {
      setBusy(false);
    }
  }

  const base =
    selected?.baseProductId && typeof selected.baseProductId === "object"
      ? selected.baseProductId
      : null;
  const margin =
    selected && base?.basePrice ? selected.retailPrice - base.basePrice : null;

  return (
    <Shell
      title="Product Approvals"
      subtitle={`${count("pending")} products pending review`}
    >
      {/* Segmented tabs */}
      <div className="flex w-fit overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6] p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-2 text-[13px] font-semibold capitalize ${
              tab === t ? "bg-white text-black shadow-sm" : "text-[#6b7280]"
            }`}
          >
            {t === "changes" ? "Changes" : t} ({count(t)})
          </button>
        ))}
      </div>

      {/* Featured review card */}
      {selected ? (
        <Card className="mt-6 grid grid-cols-1 overflow-hidden lg:grid-cols-[380px_1fr_320px]">
          {/* Gallery */}
          <div className="border-b border-[#f3f4f6] p-6 lg:border-b-0 lg:border-r">
            <div className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-xl bg-[#f8f9fb]">
              {selected.images[image] ? (
                <img
                  src={selected.images[image]}
                  alt={selected.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-[12px] text-[#c4c7c7]">No image</span>
              )}
              <span className="absolute right-3 top-3 rounded-md border border-[#e5e7eb] bg-white px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.5px] text-black">
                {image === 0 ? "Front View" : `View ${image + 1}`}
              </span>
            </div>
            {selected.images.length > 1 && (
              <div className="flex gap-2 pt-3">
                {selected.images.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setImage(i)}
                    className={`h-16 w-16 overflow-hidden rounded-lg border ${
                      image === i ? "border-2 border-black" : "border-[#e5e7eb]"
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="border-b border-[#f3f4f6] p-7 lg:border-b-0">
            <h2 className="text-[24px] font-bold tracking-[-0.5px] text-black">
              {selected.title}
            </h2>
            <p className="pt-1 text-[14px] text-[#374151]">
              by{" "}
              <a
                href={`mailto:${selected.sellerId?.email ?? ""}?subject=${encodeURIComponent(
                  `About your submission "${selected.title}"`,
                )}`}
                className="font-semibold text-[#2563eb] hover:underline"
              >
                {selected.sellerId?.name ?? "Seller"}
              </a>
            </p>

            <div className="grid grid-cols-2 gap-x-6 gap-y-5 pt-6 text-[14px]">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                  Base Product
                </p>
                <p className="pt-1 font-semibold text-black">
                  {selected.baseProductName ?? base?.title ?? "—"}
                  {selected.color ? `, ${selected.color}` : ""}
                </p>
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                  Method
                </p>
                <p className="pt-1 font-semibold text-black">
                  {METHOD_LABEL[selected.method] ?? selected.method}
                </p>
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                  Retail Price
                </p>
                <p className="pt-1 text-[18px] font-bold text-black">
                  {inr(selected.retailPrice)}
                </p>
                {margin !== null && (
                  <p className="text-[12px] text-[#6b7280]">
                    {inr(base!.basePrice!)} base + {inr(margin)} margin
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                  Submitted
                </p>
                <p className="pt-1 font-semibold text-black">
                  {fullDate(selected.createdAt)}
                </p>
              </div>
            </div>

            {selected.sizes.length > 0 && (
              <>
                <p className="pt-6 text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                  Available Sizes
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {selected.sizes.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-[#e5e7eb] px-3 py-1.5 text-[12.5px] font-bold text-black"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}

            {selected.tags.length > 0 && (
              <>
                <p className="pt-5 text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {selected.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[#f3f4f6] px-3 py-1 text-[12px] font-medium text-[#374151]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </>
            )}

            {selected.rejectionReason && (
              <p className="pt-5 text-[13px] text-[#ba1a1a]">
                {selected.status === "changes" ? "Changes requested" : "Rejected"}:{" "}
                {selected.rejectionReason}
              </p>
            )}
            {selected.status === "approved" &&
              typeof selected.publishedProductId === "object" &&
              selected.publishedProductId?.slug && (
                <p className="pt-5 text-[13px] font-semibold text-[#16a34a]">
                  Published to the storefront as /product/
                  {selected.publishedProductId.slug}
                </p>
              )}
          </div>

          {/* Review rail */}
          <div className="bg-[#f8f9fb] p-6 lg:border-l lg:border-[#f3f4f6]">
            <h3 className="text-[11px] font-bold uppercase tracking-[1px] text-[#374151]">
              Review Checklist
            </h3>
            {dpi !== null && (
              <p
                className={`flex items-center gap-2 pt-3 text-[13.5px] font-semibold ${
                  dpi >= 200 ? "text-[#16a34a]" : "text-[#dc2626]"
                }`}
              >
                {dpi >= 200 ? "✓" : "⚠"} ~{dpi} DPI at {PRINT_WIDTH_IN}&quot; print
                width
              </p>
            )}
            <div className="flex flex-col gap-2.5 pt-3">
              {CHECKLIST.map((label) => (
                <label
                  key={label}
                  className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-[#374151]"
                >
                  <input
                    type="checkbox"
                    checked={checks[label] ?? false}
                    onChange={(e) =>
                      setChecks((c) => ({ ...c, [label]: e.target.checked }))
                    }
                    className="h-4 w-4 rounded accent-black"
                  />
                  {label}
                </label>
              ))}
            </div>

            <p className="pt-5 text-[11px] font-bold uppercase tracking-[1px] text-[#374151]">
              Admin Notes
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => void saveReview()}
              rows={4}
              placeholder="Add private review notes..."
              className="mt-2 w-full rounded-lg border border-[#e5e7eb] bg-white p-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
            />

            {flash && (
              <p
                className={`mt-3 rounded-lg px-3 py-2.5 text-[12.5px] font-medium ${
                  flash.kind === "ok"
                    ? "bg-[#dcfce7] text-[#166534]"
                    : "bg-[#fee2e2] text-[#ba1a1a]"
                }`}
              >
                {flash.text}
              </p>
            )}

            {(selected.status === "pending" || selected.status === "changes") && (
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={() => void act("approve")}
                  disabled={busy}
                  className="h-12 rounded-lg bg-[#22c55e] text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  Approve &amp; Publish
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => void act("reject")}
                    disabled={busy}
                    className="h-10 flex-1 rounded-lg border border-[#fca5a5] bg-white text-[13.5px] font-bold text-[#dc2626] hover:bg-[#fef2f2] disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => void act("changes")}
                    disabled={busy}
                    className="h-10 flex-1 rounded-lg border border-[#f0c96b] bg-white text-[13.5px] font-bold text-[#b45309] hover:bg-[#fdf9ef] disabled:opacity-50"
                  >
                    Changes
                  </button>
                </div>
                <p className="text-center text-[11.5px] text-[#9ca3af]">
                  Approval publishes a purchasable product to the storefront.
                </p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="mt-6 p-10 text-center text-[13px] text-[#9ca3af]">
          No submissions yet — sellers submit designs for review here.
        </Card>
      )}

      {/* Queue history */}
      <Card className="mt-8 overflow-x-auto">
        <div className="border-b border-[#f3f4f6] px-6 py-4">
          <h2 className="text-[12px] font-bold uppercase tracking-[1px] text-[#374151]">
            Queue History
          </h2>
        </div>
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="bg-[#f8f9fb] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
              <th className="px-6 py-3">Preview</th>
              <th className="px-3 py-3">Product &amp; Seller</th>
              <th className="px-3 py-3">Submitted</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-[#9ca3af]">
                  No {tab} submissions.
                </td>
              </tr>
            )}
            {pageRows.map((s) => (
              <tr key={s._id} className="border-t border-[#f3f4f6] text-[13.5px]">
                <td className="px-6 py-3.5">
                  <span className="block h-12 w-12 overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6]">
                    {s.images[0] && (
                      <img src={s.images[0]} alt="" className="h-full w-full object-cover" />
                    )}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <p className="font-bold text-black">{s.title}</p>
                  <p className="text-[12.5px] text-[#6b7280]">
                    {s.sellerId?.name ?? "Seller"}
                  </p>
                </td>
                <td className="px-3 py-3.5 text-[#374151]">
                  {fullDate(s.createdAt)}
                </td>
                <td className="px-3 py-3.5">
                  <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-[12px] font-semibold text-[#374151]">
                    {s.baseProductName ?? s.method}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <button
                    onClick={() => {
                      setSelected(s);
                      setFlash(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="rounded-lg border border-[#e5e7eb] px-4 py-1.5 text-[13px] font-bold text-black hover:border-black"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-[#f3f4f6] px-6 py-4">
          <p className="text-[12.5px] text-[#6b7280]">
            Showing {pageRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
            {(page - 1) * PAGE_SIZE + pageRows.length} of {rows.length} {tab}{" "}
            entries
          </p>
          {pages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[12.5px] font-semibold text-[#374151] hover:border-black disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-8 w-8 rounded-lg text-[12.5px] font-bold ${
                    page === i + 1
                      ? "bg-black text-white"
                      : "border border-[#e5e7eb] text-[#374151] hover:border-black"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[12.5px] font-semibold text-[#374151] hover:border-black disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </Card>
    </Shell>
  );
}
