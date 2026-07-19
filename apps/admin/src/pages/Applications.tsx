import { useCallback, useEffect, useState } from "react";
import { FiCheckCircle, FiXCircle, FiBriefcase, FiLayers } from "react-icons/fi";
import Shell, { Card, StatusChip } from "../components/Shell";
import { api, type Application } from "../lib/api";

const TABS = ["pending", "approved", "rejected", "all"] as const;

function ago(d?: string) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    const hrs = Math.floor(diff / 3600000);
    return hrs <= 0 ? "just now" : `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  }
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Applications({ type }: { type: "seller" | "bulk" }) {
  const [apps, setApps] = useState<Application[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");
  const [selected, setSelected] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
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

  const rows = apps.filter((a) => tab === "all" || a.status === tab);
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

  const title = type === "seller" ? "Seller Applications" : "Bulk Quote Requests";

  return (
    <Shell
      title={title}
      subtitle={`${apps.length} total · ${count("pending")} pending review`}
    >
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#e5e7eb]">
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

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        {/* List */}
        <div className="flex flex-col gap-3">
          {rows.length === 0 && (
            <Card className="p-8 text-center text-[13px] text-[#9ca3af]">
              No {tab === "all" ? "" : tab} applications.
            </Card>
          )}
          {rows.map((a) => (
            <button
              key={a._id}
              onClick={() => {
                setSelected(a);
                setFlash(null);
              }}
              className={`rounded-xl border bg-white p-4 text-left ${
                selected?._id === a._id
                  ? "border-black shadow-sm"
                  : "border-[#e5e7eb] hover:border-black"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] text-[#374151]">
                    {type === "seller" ? <FiBriefcase /> : <FiLayers />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14.5px] font-bold text-black">
                      {a.contactName}
                    </span>
                    <span className="block truncate text-[12.5px] text-[#6b7280]">
                      {a.businessName}
                    </span>
                  </span>
                </span>
                <StatusChip status={a.status} />
              </div>
              <p className="pt-2 text-[12px] text-[#9ca3af]">
                Applied: {ago(a.createdAt)}
                {a.expectedVolume ? ` · ${a.expectedVolume}` : ""}
              </p>
            </button>
          ))}
        </div>

        {/* Detail */}
        {selected ? (
          <Card className="grid grid-cols-1 overflow-hidden lg:grid-cols-[1fr_300px]">
            <div className="p-7">
              <div className="flex items-start justify-between gap-4 border-b border-[#f3f4f6] pb-5">
                <div>
                  <h2 className="text-[24px] font-bold tracking-[-0.4px] text-black">
                    {selected.contactName}
                  </h2>
                  <p className="pt-1 text-[13.5px] text-[#374151]">
                    {selected.email}
                    {selected.phone ? ` · +91 ${selected.phone}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <StatusChip status={selected.status} />
                  <p className="pt-2 text-[12.5px] text-[#6b7280]">
                    Applied {ago(selected.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                    Business Details
                  </h3>
                  <dl className="flex flex-col gap-3 pt-3 text-[13.5px]">
                    <div>
                      <dt className="text-[11.5px] uppercase text-[#9ca3af]">
                        Business Name
                      </dt>
                      <dd className="font-bold text-black">
                        {selected.businessName}
                      </dd>
                    </div>
                    {selected.gstNumber && (
                      <div>
                        <dt className="text-[11.5px] uppercase text-[#9ca3af]">
                          GST Number
                        </dt>
                        <dd className="text-[#374151]">{selected.gstNumber}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-[11.5px] uppercase text-[#9ca3af]">
                        Location
                      </dt>
                      <dd className="text-[#374151]">
                        {[selected.address?.city, selected.address?.state]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </dd>
                    </div>
                    {selected.expectedVolume && (
                      <div>
                        <dt className="text-[11.5px] uppercase text-[#9ca3af]">
                          Expected Volume
                        </dt>
                        <dd className="text-[#374151]">{selected.expectedVolume}</dd>
                      </div>
                    )}
                    {(selected.categories?.length ?? 0) > 0 && (
                      <div>
                        <dt className="text-[11.5px] uppercase text-[#9ca3af]">
                          Categories
                        </dt>
                        <dd className="flex flex-wrap gap-1.5 pt-1">
                          {selected.categories!.map((c) => (
                            <span
                              key={c}
                              className="rounded-full bg-[#f3f4f6] px-2.5 py-0.5 text-[11.5px] font-semibold text-[#374151]"
                            >
                              {c}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                    {type === "seller" ? "About Their Work" : "Request Details"}
                  </h3>
                  {selected.productsToSell && (
                    <p className="pt-3 text-[13.5px] italic leading-6 text-[#374151]">
                      &quot;{selected.productsToSell}&quot;
                    </p>
                  )}
                  {selected.message && (
                    <p className="whitespace-pre-wrap pt-3 text-[13px] leading-6 text-[#6b7280]">
                      {selected.message.split(" | ").join("\n")}
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
                <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                  {selected.status === "pending"
                    ? "Notes / Rejection Reason"
                    : "Notes"}
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Add internal observations..."
                  className="mt-2 w-full rounded-lg border border-[#e5e7eb] bg-white p-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
                />
              </label>

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
                  <p className="pt-1 text-center text-[11.5px] text-[#9ca3af]">
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
          <Card className="p-10 text-center text-[13px] text-[#9ca3af]">
            Select an application to review.
          </Card>
        )}
      </div>
    </Shell>
  );
}
