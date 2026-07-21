import { useEffect, useState } from "react";
import { FiTrash2, FiCheck, FiEye, FiMail } from "react-icons/fi";
import Shell, { Card } from "../components/Shell";
import { api, type ContactMsg } from "../lib/api";

const STATUS_CHIP: Record<string, string> = {
  new: "bg-[#fee2e2] text-[#dc2626]",
  reviewed: "bg-[#fdecc8] text-[#b45309]",
  resolved: "bg-[#dcfce7] text-[#16a34a]",
};

const TABS = ["all", "new", "reviewed", "resolved"] as const;

export default function Messages() {
  const [msgs, setMsgs] = useState<ContactMsg[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    api<{ data: { contacts: ContactMsg[] } }>("/api/contacts")
      .then((j) => setMsgs(j.data?.contacts ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }
  useEffect(load, []);

  async function setStatus(id: string, status: "reviewed" | "resolved") {
    setBusyId(id);
    try {
      await api(`/api/contacts/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(m: ContactMsg) {
    if (
      !window.confirm(
        `Delete the message from ${m.name || m.email}? This cannot be undone.`,
      )
    )
      return;
    setBusyId(m._id);
    try {
      await api(`/api/contacts/${m._id}`, { method: "DELETE" });
      load();
    } finally {
      setBusyId(null);
    }
  }

  const rows = msgs.filter((m) => tab === "all" || m.status === tab);
  const count = (s: string) =>
    s === "all" ? msgs.length : msgs.filter((m) => m.status === s).length;

  return (
    <Shell
      title="Messages"
      subtitle={`${msgs.length} contact & newsletter submissions · ${count("new")} new`}
    >
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

      <div className="mt-6 flex flex-col gap-4">
        {!loaded && (
          <Card className="p-8 text-center text-[13px] text-[#9ca3af]">
            Loading messages…
          </Card>
        )}
        {loaded && rows.length === 0 && (
          <Card className="p-8 text-center text-[13px] text-[#9ca3af]">
            No {tab === "all" ? "" : tab} messages.
          </Card>
        )}
        {rows.map((m) => (
          <Card key={m._id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-3">
                  <span className="text-[15px] font-bold text-black">
                    {m.name}
                  </span>
                  <span className="text-[13px] text-[#6b7280]">{m.email}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                      STATUS_CHIP[m.status] ?? "bg-[#f3f4f6] text-[#6b7280]"
                    }`}
                  >
                    {m.status}
                  </span>
                </p>
                {m.subject && (
                  <p className="pt-2 text-[14px] font-semibold text-[#374151]">
                    {m.subject}
                  </p>
                )}
                <p className="whitespace-pre-wrap pt-2 text-[14px] leading-6 text-[#4b5563]">
                  {m.message}
                </p>
                <p className="pt-2 text-[12px] text-[#9ca3af]">
                  {m.createdAt
                    ? new Date(m.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent(
                    `Re: ${m.subject || "your message to AB Creation"}`,
                  )}`}
                  className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-3 py-2 text-[12.5px] font-bold text-[#374151] hover:border-black"
                >
                  <FiMail className="h-3.5 w-3.5" /> Reply
                </a>
                {m.status === "new" && (
                  <button
                    onClick={() => void setStatus(m._id, "reviewed")}
                    disabled={busyId === m._id}
                    className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-3 py-2 text-[12.5px] font-bold text-[#374151] hover:border-black disabled:opacity-50"
                  >
                    <FiEye className="h-3.5 w-3.5" /> Mark Reviewed
                  </button>
                )}
                {m.status !== "resolved" && (
                  <button
                    onClick={() => void setStatus(m._id, "resolved")}
                    disabled={busyId === m._id}
                    className="flex items-center gap-1.5 rounded-lg bg-[#22c55e] px-3 py-2 text-[12.5px] font-bold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    <FiCheck className="h-3.5 w-3.5" /> Resolve
                  </button>
                )}
                <button
                  onClick={() => void remove(m)}
                  disabled={busyId === m._id}
                  aria-label="Delete message"
                  className="flex items-center rounded-lg border border-[#fca5a5] px-3 py-2 text-[#dc2626] hover:bg-[#fef2f2] disabled:opacity-50"
                >
                  <FiTrash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
