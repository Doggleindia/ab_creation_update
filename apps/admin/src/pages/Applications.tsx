import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiBriefcase,
  FiLayers,
  FiMail,
  FiPhone,
  FiFilter,
  FiDownload,
  FiFileText,
  FiImage,
  FiStar,
  FiSave,
} from "react-icons/fi";
import Shell, { Card, StatusChip } from "../components/Shell";
import { api, type Application } from "../lib/api";

const TABS = ["all", "pending", "approved", "rejected"] as const;

const CHECKLIST: Record<"seller" | "bulk", string[]> = {
  seller: [
    "Design Quality Match",
    "Samples Verified",
    "Business Details Check",
    "Copyright Declaration",
  ],
  bulk: [
    "Quantities Feasible",
    "Timeline Feasible",
    "Budget Aligned",
    "Artwork Received",
  ],
};

function ago(d?: string) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return hrs <= 0 ? "just now" : `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// The public forms pack extra fields into `message` as "Label: value | …"
function parseMessage(message?: string) {
  const parts = (message ?? "").split(" | ");
  const get = (prefix: string) =>
    parts.find((p) => p.startsWith(prefix))?.slice(prefix.length).trim();
  const portfolioRaw = get("Portfolio: ");
  const files =
    portfolioRaw?.match(/\(([^)]*)\)/)?.[1]?.split(",").map((f) => f.trim()) ??
    [];
  return {
    businessType: get("Business type: "),
    pan: get("PAN: "),
    portfolioFiles: files.filter(Boolean),
    rest: parts.filter(
      (p) =>
        !p.startsWith("Business type: ") &&
        !p.startsWith("PAN: ") &&
        !p.startsWith("Portfolio: "),
    ),
  };
}

function Avatar({ name, type }: { name: string; type: "seller" | "bulk" }) {
  const initial = (name || "?").charAt(0).toUpperCase();
  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] text-[20px] font-bold text-[#374151]">
      {type === "bulk" ? <FiLayers className="h-6 w-6" /> : initial}
    </span>
  );
}

export default function Applications({ type }: { type: "seller" | "bulk" }) {
  const [apps, setApps] = useState<Application[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(() => {
    api<{ data: { applications: Application[] } }>(
      `/api/applications?type=${type}`,
    )
      .then((j) => {
        const list = j.data?.applications ?? [];
        setApps(list);
        setSelected(
          (prev) =>
            list.find((a) => a._id === prev?._id) ??
            list.find((a) => a.status === "pending") ??
            list[0] ??
            null,
        );
      })
      .catch(() => {});
  }, [type]);
  useEffect(load, [load]);

  // Hydrate persisted review aids whenever the selected application changes
  useEffect(() => {
    if (!selected) return;
    setNotes(selected.internalNotes ?? "");
    setChecks(
      Object.fromEntries(
        CHECKLIST[type].map((l) => [
          `${selected._id}:${l}`,
          (selected.checklist ?? []).includes(l),
        ]),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?._id]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(apps.flatMap((a) => a.categories ?? [])),
      ).sort(),
    [apps],
  );

  const rows = apps.filter(
    (a) =>
      (tab === "all" || a.status === tab) &&
      (category === "all" || (a.categories ?? []).includes(category)),
  );

  // Keep the featured card within the active tab/category
  useEffect(() => {
    setSelected((prev) =>
      rows.length === 0 || rows.some((a) => a._id === prev?._id)
        ? prev
        : rows[0],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, category, apps]);
  const others = rows.filter((a) => a._id !== selected?._id);
  const count = (s: string) =>
    s === "all" ? apps.length : apps.filter((a) => a.status === s).length;

  async function act(action: "approve" | "reject") {
    if (!selected) return;
    setBusy(true);
    setFlash(null);
    try {
      const j = await api<{
        message: string;
        data?: { tempPassword?: string; emailSent?: boolean };
      }>(`/api/applications/${selected._id}/${action}`, {
        method: "PATCH",
        body: JSON.stringify(action === "reject" ? { reason: notes } : {}),
      });
      setFlash({
        kind: "ok",
        text:
          j.data?.tempPassword && !j.data.emailSent
            ? `${j.message} Temporary password: ${j.data.tempPassword}`
            : j.message,
      });
      setNotes("");
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

  async function saveReview(extra?: { priority?: boolean }) {
    if (!selected) return;
    setSavingReview(true);
    try {
      const checked = CHECKLIST[type].filter(
        (l) => checks[`${selected._id}:${l}`],
      );
      await api(`/api/applications/${selected._id}/review`, {
        method: "PATCH",
        body: JSON.stringify({
          internalNotes: notes,
          checklist: checked,
          ...(extra ?? {}),
        }),
      });
      setFlash({ kind: "ok", text: "Review saved." });
      load();
    } catch (err) {
      setFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not save review",
      });
    } finally {
      setSavingReview(false);
    }
  }

  function exportCsv() {
    const header = ["Name", "Business", "Email", "Phone", "Status", "Categories", "Volume", "Applied"];
    const lines = rows.map((a) =>
      [
        a.contactName,
        a.businessName,
        a.email,
        a.phone ?? "",
        a.status,
        (a.categories ?? []).join(";"),
        a.expectedVolume ?? "",
        a.createdAt ? new Date(a.createdAt).toISOString().slice(0, 10) : "",
      ]
        .map((v) => String(v).replace(/,/g, " "))
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join(String.fromCharCode(10))], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${type}-applications.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const title = type === "seller" ? "Seller Applications" : "Bulk Quote Requests";
  const parsed = parseMessage(selected?.message);
  const checklist = CHECKLIST[type];
  const checkKey = (label: string) => `${selected?._id}:${label}`;

  return (
    <Shell
      title={title}
      subtitle={`${apps.length} total · ${count("pending")} pending review`}
    >
      {/* Tabs + actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 border-b-2 pb-3 text-[14px] font-semibold capitalize ${
                tab === t
                  ? "border-black text-black"
                  : "border-transparent text-[#6b7280] hover:text-black"
              }`}
            >
              {t}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  tab === t ? "bg-black text-white" : "bg-[#f3f4f6] text-[#6b7280]"
                }`}
              >
                {count(t)}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 pb-3">
          {categories.length > 0 && (
            <span className="relative flex items-center">
              <FiFilter className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[#6b7280]" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 appearance-none rounded-lg border border-[#e5e7eb] bg-white pl-9 pr-8 text-[13px] font-semibold text-[#374151] focus:border-black focus:outline-none"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </span>
          )}
          <button
            onClick={exportCsv}
            className="flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-[13px] font-bold text-black hover:border-black"
          >
            <FiDownload className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Featured review card */}
      {selected ? (
        <Card className="mt-6 grid grid-cols-1 overflow-hidden lg:grid-cols-[1fr_320px]">
          <div className="p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#f3f4f6] pb-6">
              <div className="flex items-center gap-5">
                <Avatar name={selected.contactName} type={type} />
                <div>
                  <h2 className="text-[26px] font-bold tracking-[-0.5px] text-black">
                    {selected.contactName}
                  </h2>
                  <p className="flex flex-wrap items-center gap-4 pt-1 text-[13.5px] text-[#374151]">
                    <span className="flex items-center gap-1.5">
                      <FiMail className="h-3.5 w-3.5" /> {selected.email}
                    </span>
                    {selected.phone && (
                      <span className="flex items-center gap-1.5">
                        <FiPhone className="h-3.5 w-3.5" /> +91 {selected.phone}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="flex items-center justify-end gap-2">
                  {selected.priority && (
                    <span className="rounded-md bg-[#f0c96b] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.5px] text-black">
                      Priority Review
                    </span>
                  )}
                  <StatusChip status={selected.status} />
                </span>
                <p className="pt-2 text-[13px] text-[#6b7280]">
                  Applied {ago(selected.createdAt)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 pt-6 md:grid-cols-2">
              {/* Business details */}
              <div>
                <h3 className="flex items-center gap-2 text-[13px] font-bold text-black">
                  <FiBriefcase /> Business Details
                </h3>
                <dl className="flex flex-col gap-4 pt-4 text-[14px]">
                  <div>
                    <dt className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                      Business Name
                    </dt>
                    <dd className="pt-0.5 text-[15px] font-bold text-black">
                      {selected.businessName}
                    </dd>
                  </div>
                  {parsed.businessType && (
                    <div>
                      <dt className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                        Legal Entity Type
                      </dt>
                      <dd className="pt-0.5 text-[#374151]">
                        {parsed.businessType}
                      </dd>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {selected.gstNumber && (
                      <div>
                        <dt className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                          GST Number
                        </dt>
                        <dd className="pt-0.5 text-[#374151]">
                          {selected.gstNumber}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                        Location
                      </dt>
                      <dd className="pt-0.5 text-[#374151]">
                        {[selected.address?.city, selected.address?.state]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </dd>
                    </div>
                  </div>
                  {parsed.pan && (
                    <div>
                      <dt className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                        PAN Number
                      </dt>
                      <dd className="pt-0.5 text-[#374151]">{parsed.pan}</dd>
                    </div>
                  )}
                  {selected.expectedVolume && (
                    <div>
                      <dt className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                        Expected Volume
                      </dt>
                      <dd className="pt-0.5 text-[#374151]">
                        {selected.expectedVolume}
                      </dd>
                    </div>
                  )}
                  {selected.payout?.accountLast4 && (
                    <div>
                      <dt className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                        Payout Account
                      </dt>
                      <dd className="pt-0.5 text-[#374151]">
                        ****{selected.payout.accountLast4}
                        {selected.payout.ifsc ? ` · ${selected.payout.ifsc}` : ""}
                        {selected.payout.accountHolder
                          ? ` · ${selected.payout.accountHolder}`
                          : ""}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Portfolio + style */}
              <div>
                <h3 className="flex items-center gap-2 text-[13px] font-bold text-black">
                  <FiImage />{" "}
                  {type === "seller" ? "Design Portfolio" : "Request Details"}
                </h3>
                {(selected.portfolioFiles?.length ?? 0) > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-4">
                    {selected.portfolioFiles!.slice(0, 4).map((url, i) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative block h-20 w-20 overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6]"
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        {i === 3 && selected.portfolioFiles!.length > 4 && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[13px] font-bold text-white">
                            +{selected.portfolioFiles!.length - 4}
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                ) : parsed.portfolioFiles.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-4">
                    {parsed.portfolioFiles.map((f) => (
                      <span
                        key={f}
                        className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-[12.5px] font-medium text-[#374151]"
                      >
                        <FiFileText className="h-3.5 w-3.5" /> {f}
                      </span>
                    ))}
                  </div>
                ) : (
                  type === "seller" && (
                    <p className="pt-4 text-[13px] text-[#9ca3af]">
                      No portfolio files listed.
                    </p>
                  )
                )}
                {selected.productsToSell && (
                  <>
                    <p className="pt-5 text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">
                      {type === "seller"
                        ? "Brand Style Description"
                        : "Products Requested"}
                    </p>
                    <p className="pt-2 text-[14px] italic leading-6 text-[#374151]">
                      &quot;{selected.productsToSell}&quot;
                    </p>
                  </>
                )}
                {parsed.rest.length > 0 && (
                  <p className="whitespace-pre-wrap pt-4 text-[13px] leading-6 text-[#6b7280]">
                    {parsed.rest.join("\n")}
                  </p>
                )}
                {selected.rejectionReason && (
                  <p className="pt-3 text-[13px] text-[#ba1a1a]">
                    Rejected: {selected.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Review rail */}
          <div className="border-t border-[#f3f4f6] bg-[#f8f9fb] p-6 lg:border-l lg:border-t-0">
            <h3 className="text-[14px] font-bold text-black">Internal Review</h3>
            <label className="block pt-4">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
                Application Notes
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add internal observations..."
                className="mt-2 w-full rounded-lg border border-[#e5e7eb] bg-white p-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
              />
            </label>

            <p className="pt-4 text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
              Compliance Checklist
            </p>
            <div className="flex flex-col gap-2.5 pt-3">
              {checklist.map((label) => (
                <label
                  key={label}
                  className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-[#374151]"
                >
                  <input
                    type="checkbox"
                    checked={checks[checkKey(label)] ?? false}
                    onChange={(e) =>
                      setChecks((c) => ({
                        ...c,
                        [checkKey(label)]: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded accent-black"
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => void saveReview()}
                disabled={savingReview}
                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white text-[12.5px] font-bold text-black hover:border-black disabled:opacity-50"
              >
                <FiSave className="h-3.5 w-3.5" />
                {savingReview ? "Saving…" : "Save Review"}
              </button>
              <button
                onClick={() => void saveReview({ priority: !selected.priority })}
                disabled={savingReview}
                title={selected.priority ? "Remove priority flag" : "Flag for priority review"}
                className={`flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-[12.5px] font-bold disabled:opacity-50 ${
                  selected.priority
                    ? "bg-[#f0c96b] text-black"
                    : "border border-[#e5e7eb] bg-white text-[#374151] hover:border-black"
                }`}
              >
                <FiStar className="h-3.5 w-3.5" />
                Priority
              </button>
            </div>

            {flash && (
              <p
                className={`mt-4 rounded-lg px-3 py-2.5 text-[12.5px] font-medium ${
                  flash.kind === "ok"
                    ? "bg-[#dcfce7] text-[#166534]"
                    : "bg-[#fee2e2] text-[#ba1a1a]"
                }`}
              >
                {flash.text}
              </p>
            )}

            {selected.status === "pending" ? (
              <div className="flex flex-col gap-3 pt-5">
                <button
                  onClick={() => void act("approve")}
                  disabled={busy}
                  className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#22c55e] text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <FiCheckCircle />
                  {type === "seller" ? "Approve Seller" : "Approve Request"}
                </button>
                <button
                  onClick={() => void act("reject")}
                  disabled={busy}
                  className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#fca5a5] bg-white text-[14px] font-bold text-[#dc2626] transition-colors hover:bg-[#fef2f2] disabled:opacity-50"
                >
                  <FiXCircle /> Reject with Feedback
                </button>
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(
                    `Your AB Creation ${type === "seller" ? "seller" : "bulk order"} application`,
                  )}&body=${encodeURIComponent(
                    `Hi ${selected.contactName},\n\nThanks for applying to AB Creation. Could you share a little more information about `,
                  )}`}
                  className="pt-1 text-center text-[13px] font-semibold text-black underline hover:text-[#b45309]"
                >
                  Request More Info
                </a>
                <p className="text-center text-[11.5px] text-[#9ca3af]">
                  Approval creates a {type} account and emails credentials.
                </p>
              </div>
            ) : (
              <p className="pt-5 text-[13px] text-[#6b7280]">
                This application has been {selected.status}.
              </p>
            )}
          </div>
        </Card>
      ) : (
        <Card className="mt-6 p-10 text-center text-[13px] text-[#9ca3af]">
          No applications yet.
        </Card>
      )}

      {/* Other applications */}
      {others.length > 0 && (
        <>
          <h3 className="pt-8 text-[14px] font-bold text-black">
            Other {tab === "all" ? "" : tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
            Applications
          </h3>
          <div className="mt-4 flex flex-col gap-3">
            {others.map((a) => (
              <Card
                key={a._id}
                className="flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <Avatar name={a.contactName} type={type} />
                  <div className="min-w-0">
                    <p className="truncate text-[15.5px] font-bold text-black">
                      {a.contactName}
                    </p>
                    <p className="truncate text-[13px] text-[#6b7280]">
                      Applied: {ago(a.createdAt)} • {a.businessName}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {a.address?.city && (
                    <span className="rounded-md bg-[#f3f4f6] px-2.5 py-1 text-[12px] font-semibold text-[#374151]">
                      {a.address.city}
                    </span>
                  )}
                  {(a.categories ?? []).slice(0, 1).map((c) => (
                    <span
                      key={c}
                      className="rounded-md bg-[#f3f4f6] px-2.5 py-1 text-[12px] font-semibold text-[#374151]"
                    >
                      {c}
                    </span>
                  ))}
                  {a.priority && (
                    <span className="rounded-md bg-[#f0c96b] px-2 py-1 text-[10px] font-bold uppercase text-black">
                      Priority
                    </span>
                  )}
                  {tab === "all" && <StatusChip status={a.status} />}
                  <button
                    onClick={() => {
                      setSelected(a);
                      setFlash(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-[14px] font-bold text-black hover:underline"
                  >
                    Review →
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}
