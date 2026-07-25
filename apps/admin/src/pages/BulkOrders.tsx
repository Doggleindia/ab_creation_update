import { Fragment, useCallback, useEffect, useState } from "react";
import { FiDownload, FiImage, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import Shell, { Card } from "../components/Shell";
import { api, inr, type AdminProduct, type Application } from "../lib/api";

const PAGE_SIZE = 5;

// Pipeline stage derived from application + quote state
type Stage = "new" | "sent" | "accepted" | "in_production" | "completed" | "declined";

const STAGES: { key: Stage; label: string }[] = [
  { key: "new", label: "New Requests" },
  { key: "sent", label: "Proposal Sent" },
  { key: "accepted", label: "Accepted" },
  { key: "in_production", label: "In Production" },
  { key: "completed", label: "Completed" },
  { key: "declined", label: "Declined" },
];

const STAGE_CHIP: Record<Stage, { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-[#e0e7ff] text-[#4f46e5]" },
  sent: { label: "Proposal Sent", cls: "bg-[#fef9c3] text-[#a16207]" },
  accepted: { label: "Accepted", cls: "bg-[#dcfce7] text-[#16a34a]" },
  in_production: { label: "In Production", cls: "bg-[#f3e8ff] text-[#7c3aed]" },
  completed: { label: "Completed", cls: "bg-[#f3f4f6] text-[#374151]" },
  declined: { label: "Declined", cls: "bg-[#fee2e2] text-[#ba1a1a]" },
};

const stageOf = (a: Application): Stage => {
  if (a.status === "rejected" || a.quote?.status === "declined") return "declined";
  const q = a.quote?.status;
  if (q === "sent") return "sent";
  if (q === "accepted") return "accepted";
  if (q === "in_production") return "in_production";
  if (q === "completed") return "completed";
  return "new";
};

const reqId = (a: Application) => `BLK-${a._id.slice(-4).toUpperCase()}`;

// The public wizard packs details into message as "Label: value | …"
function parseMsg(a: Application) {
  const parts = (a.message ?? "").split(" | ");
  const get = (p: string) => parts.find((x) => x.startsWith(p))?.slice(p.length).trim();
  return {
    purpose: get("Purpose: "),
    printMethod: get("Print method: "),
    positions: get("Print positions: "),
    delivery: get("Required delivery date: "),
    budget: get("Budget range: "),
    sample: get("Sample requested: "),
    artwork: get("Artwork: "),
    notes: get("Notes: "),
  };
}

// productsToSell looks like "250× Round Neck T-Shirt (White) — S:20 M:50 L:80"
function parseProducts(a: Application) {
  const raw = a.productsToSell ?? "";
  if (!raw) return null;
  const m = raw.match(/^(\d+)×\s*(.+?)(?:\s*\((.+?)\))?\s*(?:—\s*(.*))?$/);
  if (!m) return { qty: null, name: raw, color: null, sizes: [] as [string, string][] };
  const sizes = (m[4] ?? "")
    .split(/\s+/)
    .map((s) => s.split(":"))
    .filter((p): p is [string, string] => p.length === 2);
  return { qty: m[1], name: m[2], color: m[3] ?? null, sizes };
}

type LineItem = { label: string; qty: string; price: string; sizes: string };
type Flash = { kind: "ok" | "err"; text: string } | null;

const TIMELINES = ["7 days", "10 days", "14 days", "21 days", "30 days"];
const TERMS = ["50/50 Advance", "100% Advance", "On Delivery"];
// Advance share of the total the client pays from their wallet on acceptance
const ADVANCE_PCT: Record<string, number> = {
  "50/50 Advance": 50,
  "100% Advance": 100,
  "On Delivery": 0,
};

const dateInput = (daysFromNow: number) =>
  new Date(Date.now() + daysFromNow * 86400000).toISOString().slice(0, 10);

export default function BulkOrders() {
  const [apps, setApps] = useState<Application[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [tab, setTab] = useState<Stage | "all">("new");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [items, setItems] = useState<LineItem[]>([]);
  const [timeline, setTimeline] = useState(TIMELINES[1]);
  const [terms, setTerms] = useState(TERMS[0]);
  const [printing, setPrinting] = useState("");
  const [shipping, setShipping] = useState("");
  const [validUntil, setValidUntil] = useState(dateInput(7));
  const [estDelivery, setEstDelivery] = useState(dateInput(14));
  const [notes, setNotes] = useState("");
  const [assignee, setAssignee] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);
  const [revisingId, setRevisingId] = useState<string | null>(null);

  const load = useCallback(() => {
    api<{ data: { applications: Application[] } }>("/api/applications?type=bulk")
      .then((j) => setApps(j.data?.applications ?? []))
      .catch(() => {});
  }, []);
  useEffect(load, [load]);
  useEffect(() => {
    api<{ data: { admins: { name: string }[] } }>("/api/admin")
      .then((j) => setAdmins((j.data?.admins ?? []).map((a) => a.name).filter(Boolean)))
      .catch(() => {});
    // Garment images used as the base layer for mockup previews
    api<{ data: AdminProduct[] }>("/api/products/admin?limit=100")
      .then((j) => setProducts(Array.isArray(j.data) ? j.data : []))
      .catch(() => {});
  }, []);
  useEffect(() => setPage(1), [tab, search]);

  const selected = apps.find((a) => a._id === openId) ?? null;

  // Hydrate the proposal builder when a request is opened
  useEffect(() => {
    if (!selected) return;
    // Revising a structured quote starts from what was actually sent;
    // fresh requests seed from the applicant's own product description.
    if (selected.quote?.items?.length) {
      setItems(
        selected.quote.items.map((it) => ({
          label: it.name ?? "",
          qty: String(it.qty ?? ""),
          price: String(it.unitPrice ?? ""),
          sizes: it.sizeBreakdown ?? "",
        })),
      );
      setPrinting(String(selected.quote.printingCost || ""));
      setShipping(String(selected.quote.shippingCost || ""));
      setValidUntil(selected.quote.validUntil?.slice(0, 10) ?? dateInput(7));
      setEstDelivery(selected.quote.estimatedDelivery?.slice(0, 10) ?? dateInput(14));
      setNotes((selected.quote.notes ?? "").replace(/\nProduction timeline: .*$/, ""));
    } else {
      const prod = parseProducts(selected);
      setItems([
        {
          label: prod?.name?.trim() || selected.categories?.[0] || "Garments",
          qty: prod?.qty ?? String(parseInt(selected.expectedVolume ?? "", 10) || ""),
          price: "",
          sizes: (prod?.sizes ?? []).map(([s, n]) => `${s}:${n}`).join(" "),
        },
      ]);
      setPrinting("");
      setShipping("");
      setValidUntil(dateInput(7));
      setEstDelivery(dateInput(14));
      setNotes("");
    }
    setAssignee(selected.assignee ?? "");
    setFlash(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?._id]);

  const count = (s: Stage) => apps.filter((a) => stageOf(a) === s).length;
  const rows = apps.filter(
    (a) =>
      (tab === "all" || stageOf(a) === tab) &&
      (!search ||
        [reqId(a), a.businessName, a.contactName, a.email]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const itemsSubtotal = items.reduce(
    (s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0),
    0,
  );
  const total = itemsSubtotal + (Number(printing) || 0) + (Number(shipping) || 0);
  const advancePct = ADVANCE_PCT[terms] ?? 50;
  const advanceDue = Math.round((total * advancePct) / 100);

  async function sendProposal() {
    if (!selected) return;
    if (itemsSubtotal <= 0) {
      setFlash({ kind: "err", text: "Add at least one line with quantity and price." });
      return;
    }
    setBusy(true);
    setFlash(null);
    try {
      if (assignee !== (selected.assignee ?? "")) {
        await api(`/api/applications/${selected._id}/review`, {
          method: "PATCH",
          body: JSON.stringify({ assignee }),
        });
      }
      const j = await api<{ message: string }>(`/api/applications/${selected._id}/quote`, {
        method: "PATCH",
        body: JSON.stringify({
          items: items
            .filter((it) => Number(it.qty) > 0 && Number(it.price) > 0)
            .map((it) => ({
              name: it.label || "Item",
              qty: Number(it.qty),
              unitPrice: Number(it.price),
              sizeBreakdown: it.sizes,
            })),
          printingCost: Number(printing) || 0,
          shippingCost: Number(shipping) || 0,
          advancePct,
          validUntil,
          estimatedDelivery: estDelivery,
          notes: [notes, `Production timeline: ${timeline}`].filter(Boolean).join("\n"),
        }),
      });
      setFlash({ kind: "ok", text: j.message });
      load();
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Could not send proposal" });
    } finally {
      setBusy(false);
    }
  }

  async function decline() {
    if (!selected) return;
    const reason = window.prompt(
      "Decline this bulk request? Add a short reason for the applicant (optional):",
      "",
    );
    if (reason === null) return;
    setBusy(true);
    setFlash(null);
    try {
      await api(`/api/applications/${selected._id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      setFlash({ kind: "ok", text: "Request declined." });
      load();
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Could not decline" });
    } finally {
      setBusy(false);
    }
  }

  async function advance(stage: "in_production" | "completed") {
    if (!selected) return;
    setBusy(true);
    setFlash(null);
    try {
      const j = await api<{ message: string }>(
        `/api/applications/${selected._id}/quote/stage`,
        { method: "PATCH", body: JSON.stringify({ stage }) },
      );
      setFlash({ kind: "ok", text: j.message });
      load();
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Could not update stage" });
    } finally {
      setBusy(false);
    }
  }

  // Composite the client's design assets over a matching catalog garment
  // image in a printable preview window. Pure presentation — no fake output.
  function generateMockups(a: Application) {
    const designs = (a.portfolioFiles ?? []).filter((f) =>
      /\.(png|jpe?g|webp|svg)(\?|$)/i.test(f),
    );
    const category = (a.categories?.[0] ?? "").toLowerCase();
    const garment =
      products.find(
        (p) =>
          p.variants?.some((v) => v.media?.images?.[0]) &&
          (p.title.toLowerCase().includes(category) ||
            category.includes(p.title.toLowerCase().split(" ")[0] ?? "")),
      ) ?? products.find((p) => p.variants?.some((v) => v.media?.images?.[0]));
    const garmentImg = garment?.variants?.find((v) => v.media?.images?.[0])?.media
      ?.images?.[0];
    const w = window.open("", "_blank", "width=560,height=760");
    if (!w) return;
    const msg = parseMsg(a);
    const blocks = designs.length
      ? designs
          .map(
            (d, i) => `
        <div class="mock">
          <p class="cap">Mockup ${i + 1} — ${garment?.title ?? "Garment"} · Front${msg.positions ? ` (${msg.positions})` : ""}</p>
          <div class="stage">
            ${garmentImg ? `<img class="garment" src="${garmentImg}" alt="" />` : '<div class="blank"></div>'}
            <img class="design" src="${d}" alt="" />
          </div>
        </div>`,
          )
          .join("")
      : `<p class="cap">No image design assets on this request — ask the client for artwork to build mockups.</p>`;
    w.document.write(`<html><head><title>Mockups — ${reqId(a)} ${a.businessName}</title>
      <style>
        body{font-family:system-ui;padding:24px;color:#111}
        h1{font-size:17px;margin:0 0 2px}
        .sub{font-size:12px;color:#666;margin:0 0 16px}
        .mock{margin-bottom:24px;page-break-inside:avoid}
        .cap{font-size:12.5px;font-weight:700;margin:0 0 8px}
        .stage{position:relative;width:440px;height:480px;border:1px solid #e5e7eb;border-radius:12px;background:#f8f9fb;overflow:hidden}
        .garment{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:16px;box-sizing:border-box}
        .blank{position:absolute;inset:0;background:#eee}
        .design{position:absolute;left:50%;top:30%;width:38%;transform:translateX(-50%);object-fit:contain;max-height:38%}
        .note{font-size:11px;color:#888;margin-top:8px}
        button{margin:0 0 16px;padding:8px 18px;font-weight:700;border:1px solid #111;background:#fff;border-radius:8px;cursor:pointer}
        @media print{button{display:none}}
      </style></head><body>
      <h1>Mockup Preview — ${a.businessName}</h1>
      <p class="sub">${reqId(a)} · generated ${new Date().toLocaleString("en-IN")}</p>
      <button onclick="window.print()">Print / Save as PDF</button>
      ${blocks}
      <p class="note">Preview composite for proposal discussions — final print placement is confirmed during production setup.</p>
      </body></html>`);
    w.document.close();
  }

  function exportCsv() {
    const header = ["Request", "Company", "Contact", "Email", "Qty", "Est Value", "Stage", "Date"];
    const lines = apps.map((a) =>
      [
        reqId(a),
        a.businessName,
        a.contactName,
        a.email,
        a.expectedVolume ?? "",
        a.quote?.amount ?? parseMsg(a).budget ?? "",
        stageOf(a),
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
    a.download = "bulk-requests.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const shortDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—";
  const fullDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
      : "—";

  const estValue = (a: Application) => {
    if (a.quote?.amount) return inr(a.quote.amount);
    const budget = parseMsg(a).budget;
    return budget ? `~${budget}` : "—";
  };

  const actionLabel = (s: Stage) =>
    s === "new" ? "Review" : s === "in_production" ? "Track" : "View";

  const inputCls =
    "h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";

  // Rendered via function call (not <Detail/>) so the subtree keeps its
  // identity across re-renders — an inline component here would remount on
  // every keystroke and drop focus from the proposal inputs.
  const renderDetail = (a: Application) => {
    const msg = parseMsg(a);
    const prod = parseProducts(a);
    const stage = stageOf(a);
    return (
      <tr>
        <td colSpan={8} className="bg-[#fbfbfc] px-6 py-6">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_360px]">
            {/* Request detail */}
            <div>
              <h2 className="text-[19px] font-bold text-black">
                Request {reqId(a)} — {a.businessName}
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 pt-5 text-[13.5px] md:grid-cols-3">
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">Contact</p>
                  <p className="pt-1 font-semibold text-black">{a.contactName}</p>
                  <p className="text-[#374151]">{a.email}</p>
                  {a.phone && <p className="text-[#374151]">+91 {a.phone}</p>}
                </div>
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">Purpose</p>
                  <p className="pt-1 text-[#374151]">{msg.purpose ?? "—"}</p>
                  <p className="pt-3 text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">Submitted</p>
                  <p className="pt-1 text-[#374151]">{fullDate(a.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">Required Delivery</p>
                  <p className="pt-1 font-bold text-[#dc2626]">{msg.delivery ?? "—"}</p>
                  <p className="pt-3 text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#9ca3af]">Budget · Sample</p>
                  <p className="pt-1 text-[#374151]">
                    {msg.budget ?? "—"} · Sample: {msg.sample ?? "—"}
                  </p>
                </div>
              </div>

              <p className="pt-6 text-[10.5px] font-bold uppercase tracking-[1px] text-[#6b7280]">
                Products Requested
              </p>
              {prod ? (
                <div className="mt-3 max-w-[560px] rounded-xl border border-[#e5e7eb] bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[14.5px] font-bold text-black">{prod.name}</p>
                    {prod.qty && <p className="text-[14.5px] font-bold text-black">{prod.qty} pcs</p>}
                  </div>
                  <p className="pt-0.5 text-[12.5px] text-[#6b7280]">
                    {[prod.color, msg.printMethod].filter(Boolean).join(" · ")}
                  </p>
                  {prod.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3">
                      {prod.sizes.map(([sz, n]) => (
                        <span
                          key={sz}
                          className="flex min-w-[52px] flex-col items-center rounded-lg border border-[#e5e7eb] px-3 py-1.5"
                        >
                          <span className="text-[10px] font-bold uppercase text-[#9ca3af]">{sz}</span>
                          <span className="text-[13.5px] font-bold text-black">{n}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="pt-2 text-[13px] text-[#9ca3af]">No structured product list.</p>
              )}

              <div className="grid grid-cols-1 gap-6 pt-6 md:grid-cols-2">
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#6b7280]">Design Assets</p>
                  {(a.portfolioFiles?.length ?? 0) > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {a.portfolioFiles!.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="block h-20 w-20 overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6]"
                        >
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="pt-2 text-[13px] text-[#6b7280]">{msg.artwork ?? "No files shared yet."}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#6b7280]">
                    Notes &amp; Preferences
                  </p>
                  {msg.positions && (
                    <p className="pt-2 text-[13.5px] text-[#374151]">
                      <b>Print locations:</b> {msg.positions}
                    </p>
                  )}
                  {msg.notes ? (
                    <p className="pt-2 text-[13.5px] italic leading-6 text-[#374151]">
                      &quot;{msg.notes}&quot;
                    </p>
                  ) : (
                    !msg.positions && <p className="pt-2 text-[13px] text-[#9ca3af]">No notes.</p>
                  )}
                  {a.rejectionReason && (
                    <p className="pt-2 text-[13px] text-[#ba1a1a]">Declined: {a.rejectionReason}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Proposal / status rail */}
            <div className="h-fit rounded-2xl border border-[#e5e7eb] bg-white p-5">
              {a.quote?.changeRequest?.note && a.quote?.status === "sent" && (
                <p className="mb-4 rounded-lg bg-[#fef9c3] px-3 py-2.5 text-[12.5px] leading-5 text-[#854d0e]">
                  <b>Client requested changes:</b> “{a.quote.changeRequest.note}”
                  — revise below and re-send.
                </p>
              )}
              {stage === "new" || stage === "declined" || (stage === "sent" && revisingId === a._id) ? (
                <>
                  <h3 className="text-[16px] font-bold text-black">
                    {stage === "sent" ? "Revise Proposal" : "Create Proposal"}
                  </h3>
                  <div className="flex flex-col gap-2.5 pt-4">
                    {items.map((it, i) => (
                      <div key={i} className="rounded-lg border border-[#f3f4f6] p-2">
                        <div className="grid grid-cols-[1fr_58px_74px_24px] items-center gap-2">
                          <input
                            value={it.label}
                            onChange={(e) =>
                              setItems((r) => r.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                            }
                            placeholder="Item"
                            className="h-9 rounded-lg border border-[#e5e7eb] px-2.5 text-[12.5px] text-black focus:border-black focus:outline-none"
                          />
                          <input
                            type="number"
                            min={1}
                            value={it.qty}
                            onChange={(e) =>
                              setItems((r) => r.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)))
                            }
                            placeholder="Qty"
                            className="h-9 rounded-lg border border-[#e5e7eb] px-2 text-[12.5px] text-black focus:border-black focus:outline-none"
                          />
                          <input
                            type="number"
                            min={1}
                            value={it.price}
                            onChange={(e) =>
                              setItems((r) => r.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))
                            }
                            placeholder="₹/pc"
                            className="h-9 rounded-lg border border-[#e5e7eb] px-2 text-[12.5px] text-black focus:border-black focus:outline-none"
                          />
                          <button
                            type="button"
                            aria-label="Remove line"
                            onClick={() => setItems((r) => r.filter((_, j) => j !== i))}
                            disabled={items.length === 1}
                            className="text-[#dc2626] hover:opacity-70 disabled:opacity-30"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <input
                          value={it.sizes}
                          onChange={(e) =>
                            setItems((r) => r.map((x, j) => (j === i ? { ...x, sizes: e.target.value } : x)))
                          }
                          placeholder="Size breakdown, e.g. S:50 M:80 L:70"
                          className="mt-2 h-8 w-full rounded-lg border border-[#e5e7eb] px-2.5 text-[12px] text-black focus:border-black focus:outline-none"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setItems((r) => [...r, { label: "", qty: "", price: "", sizes: "" }])}
                      className="flex w-fit items-center gap-1 text-[12.5px] font-bold text-black hover:underline"
                    >
                      <FiPlus className="h-3.5 w-3.5" /> Add line
                    </button>
                    <div className="grid grid-cols-2 gap-2.5">
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-[#374151]">Custom Printing (₹)</span>
                        <input
                          type="number"
                          min={0}
                          value={printing}
                          onChange={(e) => setPrinting(e.target.value)}
                          placeholder="0"
                          className="h-9 rounded-lg border border-[#e5e7eb] px-2.5 text-[12.5px] text-black focus:border-black focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-[#374151]">Shipping (₹, 0 = free)</span>
                        <input
                          type="number"
                          min={0}
                          value={shipping}
                          onChange={(e) => setShipping(e.target.value)}
                          placeholder="0"
                          className="h-9 rounded-lg border border-[#e5e7eb] px-2.5 text-[12.5px] text-black focus:border-black focus:outline-none"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-[#f8f9fb] p-4 text-[13px]">
                    {items
                      .filter((it) => Number(it.qty) > 0 && Number(it.price) > 0)
                      .map((it, i) => (
                        <div key={i} className="flex justify-between py-0.5 text-[#374151]">
                          <span>
                            {it.label || "Item"} ({it.qty} × ₹{it.price})
                          </span>
                          <span className="font-semibold text-black">
                            {inr(Number(it.qty) * Number(it.price))}
                          </span>
                        </div>
                      ))}
                    {Number(printing) > 0 && (
                      <div className="flex justify-between py-0.5 text-[#374151]">
                        <span>Custom Printing</span>
                        <span className="font-semibold text-black">{inr(Number(printing))}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-0.5 text-[#374151]">
                      <span>Shipping</span>
                      {Number(shipping) > 0 ? (
                        <span className="font-semibold text-black">{inr(Number(shipping))}</span>
                      ) : (
                        <span className="font-bold text-[#16a34a]">FREE</span>
                      )}
                    </div>
                    <div className="mt-2 flex justify-between border-t border-[#e5e7eb] pt-2.5 text-[15px] font-bold text-black">
                      <span>Total</span>
                      <span>{inr(total)}</span>
                    </div>
                    {advancePct > 0 && (
                      <div className="flex justify-between pt-1 text-[12px] text-[#6b7280]">
                        <span>Advance on acceptance ({advancePct}%)</span>
                        <span className="font-semibold">{inr(advanceDue)}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold text-[#374151]">Quote Valid Until</span>
                      <input
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        className={inputCls}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold text-[#374151]">Estimated Delivery</span>
                      <input
                        type="date"
                        value={estDelivery}
                        onChange={(e) => setEstDelivery(e.target.value)}
                        className={inputCls}
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1.5 pt-3">
                    <span className="text-[11px] font-semibold text-[#374151]">Notes to Client</span>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Printing method, sizing advice, sample instructions…"
                      className="rounded-lg border border-[#e5e7eb] p-2.5 text-[12.5px] text-black focus:border-black focus:outline-none"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold text-[#374151]">Timeline</span>
                      <select value={timeline} onChange={(e) => setTimeline(e.target.value)} className={inputCls}>
                        {TIMELINES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold text-[#374151]">Payment Terms</span>
                      <select value={terms} onChange={(e) => setTerms(e.target.value)} className={inputCls}>
                        {TERMS.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="flex flex-col gap-1.5 pt-3">
                    <span className="text-[11px] font-semibold text-[#374151]">Assign to Team Member</span>
                    <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={inputCls}>
                      <option value="">Unassigned</option>
                      {admins.map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </label>

                  {flash && (
                    <p
                      className={`mt-3 rounded-lg px-3 py-2 text-[12.5px] font-medium ${
                        flash.kind === "ok" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#ba1a1a]"
                      }`}
                    >
                      {flash.text}
                    </p>
                  )}

                  <button
                    onClick={() => generateMockups(a)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-black py-3 text-[14px] font-bold text-black hover:bg-[#f3f4f6]"
                  >
                    <FiImage className="h-4 w-4" /> Generate Mockups
                  </button>
                  <button
                    onClick={() => void sendProposal()}
                    disabled={busy}
                    className="mt-2.5 w-full rounded-xl bg-black py-3 text-[14px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                  >
                    {busy ? "Sending…" : "Send Proposal"}
                  </button>
                  {stage === "new" && (
                    <button
                      onClick={() => void decline()}
                      disabled={busy}
                      className="mt-2 w-full py-1.5 text-center text-[13px] font-bold text-[#dc2626] hover:underline disabled:opacity-40"
                    >
                      Decline Request
                    </button>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-[16px] font-bold text-black">Proposal</h3>
                  <div className="mt-4 rounded-xl bg-[#f8f9fb] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                      Quoted Amount
                    </p>
                    <p className="pt-1 text-[28px] font-bold leading-none text-black">
                      {inr(a.quote?.amount ?? 0)}
                    </p>
                    <span
                      className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${STAGE_CHIP[stage].cls}`}
                    >
                      {STAGE_CHIP[stage].label}
                    </span>
                    {(a.quote?.items?.length ?? 0) > 0 && (
                      <div className="mt-3 border-t border-[#e5e7eb] pt-3">
                        {a.quote!.items!.map((it, i) => (
                          <div key={i} className="flex justify-between py-0.5 text-[12.5px] text-[#374151]">
                            <span>
                              {it.name} × {it.qty}
                              {it.sizeBreakdown ? ` (${it.sizeBreakdown})` : ""}
                            </span>
                            <span className="font-semibold text-black">{inr(it.total ?? 0)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {a.quote?.advancePaid?.amount ? (
                      <p className="mt-3 rounded-lg bg-[#dcfce7] px-3 py-2 text-[12px] font-semibold text-[#166534]">
                        Advance {inr(a.quote.advancePaid.amount)} paid from wallet
                      </p>
                    ) : null}
                    {a.quote?.notes && (
                      <p className="mt-3 whitespace-pre-line border-t border-[#e5e7eb] pt-3 text-[12.5px] leading-5 text-[#374151]">
                        {a.quote.notes}
                      </p>
                    )}
                  </div>
                  {a.assignee && (
                    <p className="pt-3 text-[13px] text-[#374151]">
                      Assigned to: <b>{a.assignee}</b>
                    </p>
                  )}
                  {flash && (
                    <p
                      className={`mt-3 rounded-lg px-3 py-2 text-[12.5px] font-medium ${
                        flash.kind === "ok" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#ba1a1a]"
                      }`}
                    >
                      {flash.text}
                    </p>
                  )}
                  {stage === "sent" && (
                    <>
                      <p className="pt-3 text-[12.5px] leading-5 text-[#6b7280]">
                        Waiting for the client to accept or decline via their quote link.
                      </p>
                      <button
                        onClick={() => setRevisingId(a._id)}
                        className="mt-3 w-full rounded-xl border border-black py-2.5 text-[13px] font-bold text-black hover:bg-[#f3f4f6]"
                      >
                        Revise &amp; Re-send Proposal
                      </button>
                    </>
                  )}
                  {stage === "accepted" && (
                    <button
                      onClick={() => void advance("in_production")}
                      disabled={busy}
                      className="mt-4 w-full rounded-xl bg-black py-3 text-[14px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                    >
                      {busy ? "Updating…" : "Start Production"}
                    </button>
                  )}
                  {stage === "in_production" && (
                    <button
                      onClick={() => void advance("completed")}
                      disabled={busy}
                      className="mt-4 w-full rounded-xl bg-[#22c55e] py-3 text-[14px] font-bold text-white hover:opacity-90 disabled:opacity-40"
                    >
                      {busy ? "Updating…" : "Mark Completed"}
                    </button>
                  )}
                  {stage === "completed" && (
                    <p className="pt-3 text-[13.5px] font-bold text-[#16a34a]">
                      ✓ This bulk order is complete.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <Shell
      title="Bulk Orders"
      subtitle={`${apps.length} total inquiries`}
      actions={
        <>
          <span className="relative hidden md:block">
            <FiSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bulk requests..."
              className="h-10 w-[210px] rounded-lg border border-[#e5e7eb] bg-white pl-8 pr-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
            />
          </span>
          <button
            onClick={exportCsv}
            className="flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-[13px] font-bold text-black hover:border-black"
          >
            <FiDownload className="h-3.5 w-3.5" /> Export All
          </button>
        </>
      }
    >
      {/* Pipeline tabs */}
      <div className="flex flex-wrap items-center gap-2.5">
        {STAGES.map((s) => (
          <button
            key={s.key}
            onClick={() => setTab(s.key)}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
              tab === s.key
                ? "bg-black text-white"
                : "border border-[#e5e7eb] bg-white text-[#374151] hover:border-black"
            }`}
          >
            {s.label} ({count(s.key)})
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="bg-[#f8f9fb] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
              <th className="px-6 py-3.5">Request ID</th>
              <th className="px-3 py-3.5">Company</th>
              <th className="px-3 py-3.5">Products</th>
              <th className="px-3 py-3.5">Total Qty</th>
              <th className="px-3 py-3.5">Est. Value</th>
              <th className="px-3 py-3.5">Status</th>
              <th className="px-3 py-3.5">Date</th>
              <th className="px-6 py-3.5">Action</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-[13px] text-[#9ca3af]">
                  No {tab === "all" ? "" : STAGES.find((s) => s.key === tab)?.label.toLowerCase()} requests.
                </td>
              </tr>
            )}
            {pageRows.map((a) => {
              const stage = stageOf(a);
              return (
                <Fragment key={a._id}>
                  <tr className="border-t border-[#f3f4f6] text-[13.5px]">
                    <td className="px-6 py-4 font-bold text-black">{reqId(a)}</td>
                    <td className="px-3 py-4 text-[#374151]">{a.businessName}</td>
                    <td className="px-3 py-4 text-[#374151]">
                      {(a.categories?.length ?? 0) || 1} product{(a.categories?.length ?? 1) > 1 ? "s" : ""}
                    </td>
                    <td className="px-3 py-4 text-[#374151]">{a.expectedVolume ?? "—"}</td>
                    <td className="px-3 py-4 font-semibold text-black">{estValue(a)}</td>
                    <td className="px-3 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STAGE_CHIP[stage].cls}`}>
                        {STAGE_CHIP[stage].label}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-[#6b7280]">{shortDate(a.createdAt)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setOpenId((id) => (id === a._id ? null : a._id))}
                        className="text-[13px] font-bold text-black hover:underline"
                      >
                        {openId === a._id ? "Close" : actionLabel(stage)}
                      </button>
                    </td>
                  </tr>
                  {openId === a._id && renderDetail(a)}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f3f4f6] px-6 py-4">
          <p className="text-[12.5px] text-[#6b7280]">
            Showing {rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
            {(page - 1) * PAGE_SIZE + pageRows.length} of {rows.length} requests
          </p>
          {pages > 1 && (
            <span className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[12.5px] font-semibold text-[#374151] hover:border-black disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-8 w-8 rounded-lg text-[12.5px] font-bold ${
                    page === n
                      ? "bg-black text-white"
                      : "border border-[#e5e7eb] text-[#374151] hover:border-black"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[12.5px] font-semibold text-[#374151] hover:border-black disabled:opacity-40"
              >
                Next
              </button>
            </span>
          )}
        </div>
      </Card>
    </Shell>
  );
}
