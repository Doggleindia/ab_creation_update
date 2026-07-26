import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiUploadCloud,
  FiTrash2,
  FiArrowUp,
  FiArrowDown,
  FiEdit2,
  FiCheck,
  FiFilm,
  FiChevronDown,
  FiChevronRight,
  FiExternalLink,
  FiPlus,
} from "react-icons/fi";
import Shell, { Card } from "../components/Shell";
import { api, apiForm } from "../lib/api";

const STOREFRONT =
  (import.meta.env.VITE_STOREFRONT_URL as string | undefined) ??
  "http://localhost:3000";

type Testimonial = { title?: string; body: string; name: string; role?: string };
type TrustItem = { icon?: string; label: string };

type SiteContent = {
  hero: {
    visible: boolean;
    badge: string;
    heading1: string;
    heading2: string;
    subheading: string;
    cta1: string;
    cta2: string;
    image: string;
  };
  trustBadges: { visible: boolean; items: TrustItem[] };
  topCategories: { visible: boolean };
  orderingProcess: { visible: boolean };
  printingServices: { visible: boolean };
  testimonials: { visible: boolean; items: Testimonial[] };
  collectionCarousel: { visible: boolean };
  sellerBanner: { visible: boolean };
  announcement: { visible: boolean; text: string; hours: string };
};

const DEFAULTS: SiteContent = {
  hero: {
    visible: true,
    badge: "",
    heading1: "Printed for You.",
    heading2: "Built for Your Brand.",
    subheading:
      "Shop ready-made printed tees or bring your own design. We print it exactly the way you want it.",
    cta1: "Customize Product",
    cta2: "Explore Collection",
    image: "",
  },
  trustBadges: {
    visible: true,
    items: [
      { icon: "💰", label: "Lowest Price Guaranteed" },
      { icon: "🚚", label: "Pan India Delivery" },
      { icon: "⚡", label: "Super Rush Delivery" },
    ],
  },
  topCategories: { visible: true },
  orderingProcess: { visible: true },
  printingServices: { visible: true },
  testimonials: {
    visible: true,
    items: [
      {
        title: "Exactly what our team wanted",
        body: "We ordered custom tees for our startup and the print quality blew us away. The design studio made it so easy to get everything just right.",
        name: "Aarav M.",
        role: "Founder, Northline Labs",
      },
      {
        title: "Perfect for our bulk order",
        body: "Needed 200 hoodies for a college fest on a tight deadline. AB Creation delivered on time with consistent quality across every single piece.",
        name: "Sneha R.",
        role: "Event Lead",
      },
      {
        title: "Our go-to printing partner",
        body: "From design help to doorstep delivery, the whole process was smooth. We keep coming back for every new drop we launch.",
        name: "Rohan K.",
        role: "Store Owner",
      },
    ],
  },
  collectionCarousel: { visible: true },
  sellerBanner: { visible: true },
  announcement: {
    visible: true,
    text: "Made-to-order apparel — standard production 7-10 business days.",
    hours: "Mon–Sat, 9:00 AM – 5:30 PM",
  },
};

function mergeContent(server: Partial<SiteContent> | null | undefined): SiteContent {
  const s = server ?? {};
  return {
    hero: { ...DEFAULTS.hero, ...(s.hero ?? {}) },
    trustBadges: {
      visible: s.trustBadges?.visible ?? true,
      items: s.trustBadges?.items?.length ? s.trustBadges.items : DEFAULTS.trustBadges.items,
    },
    topCategories: { ...DEFAULTS.topCategories, ...(s.topCategories ?? {}) },
    orderingProcess: { ...DEFAULTS.orderingProcess, ...(s.orderingProcess ?? {}) },
    printingServices: { ...DEFAULTS.printingServices, ...(s.printingServices ?? {}) },
    testimonials: {
      visible: s.testimonials?.visible ?? true,
      items: s.testimonials?.items?.length ? s.testimonials.items : DEFAULTS.testimonials.items,
    },
    collectionCarousel: { ...DEFAULTS.collectionCarousel, ...(s.collectionCarousel ?? {}) },
    sellerBanner: { ...DEFAULTS.sellerBanner, ...(s.sellerBanner ?? {}) },
    announcement: { ...DEFAULTS.announcement, ...(s.announcement ?? {}) },
  };
}

type LookbookItem = {
  _id: string;
  title?: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  position: number;
};

type Flash = { kind: "ok" | "err"; text: string } | null;

const toggleCls = (on: boolean) =>
  `relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-[#22c55e]" : "bg-[#d1d5db]"}`;
const knobCls = (on: boolean) =>
  `absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`;

const inputCls =
  "h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";
const labelCls = "text-[11.5px] font-semibold text-[#374151]";

export default function Content() {
  const [draft, setDraft] = useState<SiteContent>(DEFAULTS);
  const [published, setPublished] = useState<SiteContent>(DEFAULTS);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({ hero: true, testimonials: true });
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [catSummary, setCatSummary] = useState("");
  const heroFileRef = useRef<HTMLInputElement>(null);

  // Lookbook manager (embedded section)
  const [items, setItems] = useState<LookbookItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [lbFlash, setLbFlash] = useState<Flash>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const dirty = loaded && JSON.stringify(draft) !== JSON.stringify(published);

  const load = useCallback(() => {
    api<{ data: { draft: Partial<SiteContent>; published: Partial<SiteContent>; publishedAt: string | null } }>(
      "/api/site-content/admin",
    )
      .then((j) => {
        setDraft(mergeContent(j.data.draft));
        setPublished(mergeContent(j.data.published));
        setPublishedAt(j.data.publishedAt);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);
  useEffect(load, [load]);

  useEffect(() => {
    api<{ data: { categories: { name: string }[] } }>("/api/categories/admin?limit=100")
      .then((j) => {
        const names = (j.data?.categories ?? []).map((c) => c.name);
        setCatSummary(`${names.length} categories: ${names.slice(0, 4).join(", ")}${names.length > 4 ? "…" : ""}`);
      })
      .catch(() => {});
  }, []);

  const loadLookbook = useCallback(() => {
    api<{ data: { lookbookItems: LookbookItem[] } }>("/api/lookbook/all")
      .then((j) => setItems(j.data?.lookbookItems ?? []))
      .catch(() => {});
  }, []);
  useEffect(loadLookbook, [loadLookbook]);

  async function saveDraft(next?: SiteContent) {
    const content = next ?? draft;
    setBusy(true);
    setFlash(null);
    try {
      await api("/api/site-content/admin/draft", {
        method: "PUT",
        body: JSON.stringify({ content }),
      });
      setFlash({ kind: "ok", text: "Draft saved — publish to make it live." });
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Could not save draft" });
    } finally {
      setBusy(false);
    }
  }

  function setSection<K extends keyof SiteContent>(key: K, patch: Partial<SiteContent[K]>, persist = false) {
    // Compute outside the updater — state updaters must stay pure.
    const next = { ...draft, [key]: { ...draft[key], ...patch } };
    setDraft(next);
    if (persist) void saveDraft(next);
  }

  async function publishAll() {
    setBusy(true);
    setFlash(null);
    try {
      await api("/api/site-content/admin/draft", {
        method: "PUT",
        body: JSON.stringify({ content: draft }),
      });
      const j = await api<{ message: string; data: { publishedAt: string } }>(
        "/api/site-content/admin/publish",
        { method: "POST" },
      );
      setPublished(draft);
      setPublishedAt(j.data.publishedAt);
      setFlash({ kind: "ok", text: j.message });
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Publish failed" });
    } finally {
      setBusy(false);
    }
  }

  async function discardAll() {
    if (!window.confirm("Discard all pending changes and return to the last published content?")) return;
    setBusy(true);
    setFlash(null);
    try {
      await api("/api/site-content/admin/discard", { method: "POST" });
      setDraft(published);
      setFlash({ kind: "ok", text: "Draft changes discarded." });
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Discard failed" });
    } finally {
      setBusy(false);
    }
  }

  async function uploadHeroImage(file: File) {
    setUploadingHero(true);
    setFlash(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const j = await apiForm<{ data: { url: string } }>("/api/site-content/admin/upload", fd);
      setSection("hero", { image: j.data.url });
      setFlash({ kind: "ok", text: "Image uploaded — save and publish to make it live." });
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploadingHero(false);
    }
  }

  // ---- Lookbook actions (unchanged manager, embedded) ----
  async function lbUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setLbFlash({ kind: "err", text: "Choose an image or video first." });
      return;
    }
    setUploading(true);
    setLbFlash(null);
    try {
      const form = new FormData();
      form.append("media", file);
      const title = titleRef.current?.value?.trim();
      if (title) form.append("title", title);
      await apiForm("/api/lookbook/upload", form);
      if (fileRef.current) fileRef.current.value = "";
      if (titleRef.current) titleRef.current.value = "";
      setLbFlash({ kind: "ok", text: "Uploaded — now live on the Lookbook page." });
      loadLookbook();
    } catch (err) {
      setLbFlash({ kind: "err", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  async function lbMove(idx: number, dir: -1 | 1) {
    const to = idx + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[idx], next[to]] = [next[to], next[idx]];
    const payload = next.map((it, i) => ({ _id: it._id, position: i + 1 }));
    setItems(next.map((it, i) => ({ ...it, position: i + 1 })));
    try {
      await api("/api/lookbook/position", { method: "PATCH", body: JSON.stringify(payload) });
    } catch {
      loadLookbook();
    }
  }

  async function lbSaveTitle(id: string) {
    setBusyId(id);
    try {
      await api(`/api/lookbook/${id}/details`, {
        method: "PATCH",
        body: JSON.stringify({ title: editTitle }),
      });
      setEditId(null);
      loadLookbook();
    } finally {
      setBusyId(null);
    }
  }

  async function lbRemove(item: LookbookItem) {
    if (!window.confirm(`Delete "${item.title || "this media"}" from the lookbook?`)) return;
    setBusyId(item._id);
    try {
      await api(`/api/lookbook/${item._id}`, { method: "DELETE" });
      loadLookbook();
    } finally {
      setBusyId(null);
    }
  }

  // ---- Section chrome helpers ----
  const sectionHeader = (
    key: string,
    title: string,
    summary: string | null,
    visible: boolean | null,
    onToggle: (() => void) | null,
  ) => (
    // div, not <button>: the visibility switch nests inside this header and
    // interactive elements must not nest inside a button.
    <div
      role="button"
      tabIndex={0}
      onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
      onKeyDown={(e) => {
        if (e.key === "Enter") setOpen((o) => ({ ...o, [key]: !o[key] }));
      }}
      className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="text-[#c4c7c7]">⠿</span>
        <span className="min-w-0">
          <span className="block text-[15px] font-bold text-black">{title}</span>
          {summary && (
            <span className="block truncate text-[12.5px] text-[#6b7280]">{summary}</span>
          )}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-3">
        {visible !== null && onToggle && (
          <span
            role="switch"
            aria-checked={visible}
            aria-label={`${title} visible`}
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onToggle();
              }
            }}
            className={`${toggleCls(visible)} cursor-pointer`}
          >
            <span className={knobCls(visible)} />
          </span>
        )}
        {open[key] ? (
          <FiChevronDown className="h-4 w-4 text-[#6b7280]" />
        ) : (
          <FiChevronRight className="h-4 w-4 text-[#6b7280]" />
        )}
      </span>
    </div>
  );

  const visToggle = (key: keyof SiteContent) => () =>
    setSection(key, { visible: !(draft[key] as { visible: boolean }).visible } as never, true);

  const hero = draft.hero;

  return (
    <Shell
      title="Content Management"
      subtitle="Edit the storefront homepage — save drafts, then publish."
      actions={
        <a
          href={STOREFRONT}
          target="_blank"
          rel="noreferrer"
          className="flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-[13px] font-bold text-black hover:border-black"
        >
          Preview Site <FiExternalLink className="h-3.5 w-3.5" />
        </a>
      }
    >
      {flash && (
        <p
          className={`mb-4 w-fit rounded-lg px-3.5 py-2.5 text-[13px] font-medium ${
            flash.kind === "ok" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#ba1a1a]"
          }`}
        >
          {flash.text}
        </p>
      )}

      <div className="flex flex-col gap-4 pb-24">
        {/* ---- Homepage Hero ---- */}
        <Card>
          {sectionHeader("hero", "Homepage Hero", null, hero.visible, visToggle("hero"))}
          {open.hero && (
            <div className="grid grid-cols-1 gap-8 border-t border-[#f3f4f6] p-5 xl:grid-cols-[1fr_320px]">
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Badge Text</span>
                  <div className="relative">
                    <input
                      value={hero.badge}
                      maxLength={50}
                      onChange={(e) => setSection("hero", { badge: e.target.value })}
                      placeholder="e.g. ✦ Premium Custom Printing (empty = hidden)"
                      className={`${inputCls} pr-14`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9ca3af]">
                      {hero.badge.length}/50
                    </span>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Heading Line 1</span>
                    <input
                      value={hero.heading1}
                      onChange={(e) => setSection("hero", { heading1: e.target.value })}
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Heading Line 2</span>
                    <input
                      value={hero.heading2}
                      onChange={(e) => setSection("hero", { heading2: e.target.value })}
                      className={inputCls}
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Subheading</span>
                  <textarea
                    rows={2}
                    value={hero.subheading}
                    onChange={(e) => setSection("hero", { subheading: e.target.value })}
                    className="w-full rounded-lg border border-[#e5e7eb] p-3 text-[13px] text-black focus:border-black focus:outline-none"
                  />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>CTA 1 Label</span>
                    <input
                      value={hero.cta1}
                      onChange={(e) => setSection("hero", { cta1: e.target.value })}
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>CTA 2 Label</span>
                    <input
                      value={hero.cta2}
                      onChange={(e) => setSection("hero", { cta2: e.target.value })}
                      className={inputCls}
                    />
                  </label>
                </div>
                <div>
                  <span className={labelCls}>Hero Media</span>
                  <div className="flex items-center gap-4 pt-2">
                    <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f8f9fb]">
                      {hero.image ? (
                        <img src={hero.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="px-2 text-center text-[10px] text-[#9ca3af]">Default collage</span>
                      )}
                    </span>
                    <div>
                      <input
                        ref={heroFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void uploadHeroImage(f);
                        }}
                      />
                      <button
                        onClick={() => heroFileRef.current?.click()}
                        disabled={uploadingHero}
                        className="rounded-lg bg-black px-5 py-2.5 text-[13px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                      >
                        {uploadingHero ? "Uploading…" : "Replace Image"}
                      </button>
                      {hero.image && (
                        <button
                          onClick={() => setSection("hero", { image: "" })}
                          className="ml-3 text-[12.5px] font-bold text-[#dc2626] hover:underline"
                        >
                          Remove
                        </button>
                      )}
                      <p className="pt-1.5 text-[11.5px] text-[#9ca3af]">
                        Replaces the tee tile in the hero collage. Square works best.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live preview + actions */}
              <div>
                <p className="text-center text-[10.5px] font-bold uppercase tracking-[1px] text-[#6b7280]">
                  Live Desktop Preview
                </p>
                <div className="mt-3 overflow-hidden rounded-xl border border-[#e5e7eb] shadow-sm">
                  <div className="flex items-center gap-1 border-b border-[#f3f4f6] bg-[#f8f9fb] px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                    <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                    <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                  </div>
                  <div className="p-4">
                    {hero.badge && (
                      <p className="text-[8px] font-bold uppercase tracking-[1px] text-[#374151]">
                        {hero.badge}
                      </p>
                    )}
                    <p className="pt-1 text-[15px] font-bold leading-tight text-black">
                      {hero.heading1}
                      <br />
                      {hero.heading2}
                    </p>
                    <p className="pt-1.5 text-[8.5px] leading-3 text-[#6b7280]">{hero.subheading}</p>
                    <div className="flex gap-1.5 pt-2.5">
                      <span className="rounded bg-black px-2 py-1 text-[7.5px] font-bold text-white">
                        {hero.cta1}
                      </span>
                      <span className="rounded border border-black px-2 py-1 text-[7.5px] font-bold text-black">
                        {hero.cta2}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-4 pt-4">
                  <button
                    onClick={() => setSection("hero", { ...published.hero })}
                    className="text-[12.5px] font-bold text-[#dc2626] hover:underline"
                  >
                    Revert to last published
                  </button>
                  <button
                    onClick={() => void saveDraft()}
                    disabled={busy}
                    className="rounded-lg bg-black px-5 py-2.5 text-[13px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* ---- Trust badges ---- */}
        <Card>
          {sectionHeader(
            "trust",
            "Trust Badges",
            `${draft.trustBadges.items.length} badges active: ${draft.trustBadges.items.map((i) => i.label.replace(" Guaranteed", "").replace(" Delivery", "")).join(", ")}`,
            draft.trustBadges.visible,
            visToggle("trustBadges"),
          )}
          {open.trust && (
            <div className="border-t border-[#f3f4f6] p-5">
              <div className="flex flex-col gap-2.5">
                {draft.trustBadges.items.map((it, i) => (
                  <div key={i} className="grid grid-cols-[56px_1fr_24px] items-center gap-2">
                    <input
                      value={it.icon ?? ""}
                      onChange={(e) =>
                        setSection("trustBadges", {
                          items: draft.trustBadges.items.map((x, j) =>
                            j === i ? { ...x, icon: e.target.value } : x,
                          ),
                        })
                      }
                      placeholder="🏷"
                      className="h-10 rounded-lg border border-[#e5e7eb] text-center text-[16px] focus:border-black focus:outline-none"
                    />
                    <input
                      value={it.label}
                      onChange={(e) =>
                        setSection("trustBadges", {
                          items: draft.trustBadges.items.map((x, j) =>
                            j === i ? { ...x, label: e.target.value } : x,
                          ),
                        })
                      }
                      className={inputCls}
                    />
                    <button
                      aria-label="Remove badge"
                      onClick={() =>
                        setSection("trustBadges", {
                          items: draft.trustBadges.items.filter((_, j) => j !== i),
                        })
                      }
                      disabled={draft.trustBadges.items.length === 1}
                      className="text-[#dc2626] hover:opacity-70 disabled:opacity-30"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3">
                <button
                  onClick={() =>
                    setSection("trustBadges", {
                      items: [...draft.trustBadges.items, { icon: "✨", label: "" }],
                    })
                  }
                  className="flex items-center gap-1 text-[12.5px] font-bold text-black hover:underline"
                >
                  <FiPlus className="h-3.5 w-3.5" /> Add badge
                </button>
                <button
                  onClick={() => void saveDraft()}
                  disabled={busy}
                  className="rounded-lg bg-black px-5 py-2 text-[13px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* ---- Simple visibility sections ---- */}
        <Card>
          {sectionHeader(
            "cats",
            "Top Categories",
            catSummary || "Category tiles from the garment catalog",
            draft.topCategories.visible,
            visToggle("topCategories"),
          )}
          {open.cats && (
            <p className="border-t border-[#f3f4f6] px-5 py-4 text-[13px] text-[#6b7280]">
              Category tiles are driven by the real catalog — manage them in{" "}
              <a href="/catalog" className="font-bold text-black underline">Garment Catalog</a>.
              The toggle controls whether the section appears on the homepage.
            </p>
          )}
        </Card>
        <Card>
          {sectionHeader(
            "steps",
            "Ordering Process",
            "4 steps",
            draft.orderingProcess.visible,
            visToggle("orderingProcess"),
          )}
          {open.steps && (
            <p className="border-t border-[#f3f4f6] px-5 py-4 text-[13px] text-[#6b7280]">
              The 4-step how-it-works strip from the design. The toggle controls its visibility.
            </p>
          )}
        </Card>
        <Card>
          {sectionHeader(
            "services",
            "Printing Services",
            "3 services: Embroidery, Screen, DTG",
            draft.printingServices.visible,
            visToggle("printingServices"),
          )}
          {open.services && (
            <p className="border-t border-[#f3f4f6] px-5 py-4 text-[13px] text-[#6b7280]">
              Links to the three service pages. The toggle controls visibility on the homepage.
            </p>
          )}
        </Card>

        {/* ---- Testimonials ---- */}
        <Card>
          {sectionHeader(
            "testimonials",
            "Testimonials",
            `${draft.testimonials.items.length} testimonial${draft.testimonials.items.length === 1 ? "" : "s"}`,
            draft.testimonials.visible,
            visToggle("testimonials"),
          )}
          {open.testimonials && (
            <div className="border-t border-[#f3f4f6] p-5">
              <div className="flex flex-col gap-3">
                {draft.testimonials.items.map((t, i) => (
                  <div key={i} className="rounded-xl border border-[#e5e7eb] p-4">
                    <div className="grid grid-cols-[1fr_1fr_24px] items-center gap-3">
                      <input
                        value={t.name}
                        onChange={(e) =>
                          setSection("testimonials", {
                            items: draft.testimonials.items.map((x, j) =>
                              j === i ? { ...x, name: e.target.value } : x,
                            ),
                          })
                        }
                        placeholder="Name"
                        className={inputCls}
                      />
                      <input
                        value={t.role ?? ""}
                        onChange={(e) =>
                          setSection("testimonials", {
                            items: draft.testimonials.items.map((x, j) =>
                              j === i ? { ...x, role: e.target.value } : x,
                            ),
                          })
                        }
                        placeholder="Company / role"
                        className={inputCls}
                      />
                      <button
                        aria-label="Delete testimonial"
                        onClick={() =>
                          setSection("testimonials", {
                            items: draft.testimonials.items.filter((_, j) => j !== i),
                          })
                        }
                        className="text-[#dc2626] hover:opacity-70"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={t.body}
                      onChange={(e) =>
                        setSection("testimonials", {
                          items: draft.testimonials.items.map((x, j) =>
                            j === i ? { ...x, body: e.target.value } : x,
                          ),
                        })
                      }
                      placeholder="Quote…"
                      className="mt-3 w-full rounded-lg border border-[#e5e7eb] p-3 text-[13px] text-black focus:border-black focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3">
                <button
                  onClick={() =>
                    setSection("testimonials", {
                      items: [...draft.testimonials.items, { name: "", role: "", body: "" }],
                    })
                  }
                  className="flex items-center gap-1 text-[13px] font-bold text-black hover:underline"
                >
                  <FiPlus className="h-3.5 w-3.5" /> Add Testimonial
                </button>
                <button
                  onClick={() => void saveDraft()}
                  disabled={busy}
                  className="rounded-lg bg-black px-5 py-2 text-[13px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </Card>

        <Card>
          {sectionHeader(
            "carousel",
            "Collection Carousel",
            "Explore-our-collection tile grid",
            draft.collectionCarousel.visible,
            visToggle("collectionCarousel"),
          )}
        </Card>
        <Card>
          {sectionHeader(
            "seller",
            "Seller Partner Banner",
            "Become-a-seller call to action",
            draft.sellerBanner.visible,
            visToggle("sellerBanner"),
          )}
        </Card>

        {/* ---- Announcement bar ---- */}
        <Card>
          {sectionHeader(
            "announce",
            "Announcement Bar",
            `“${draft.announcement.text.slice(0, 60)}${draft.announcement.text.length > 60 ? "…" : ""}”`,
            draft.announcement.visible,
            visToggle("announcement"),
          )}
          {open.announce && (
            <div className="flex flex-col gap-4 border-t border-[#f3f4f6] p-5">
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Announcement Text</span>
                <input
                  value={draft.announcement.text}
                  onChange={(e) => setSection("announcement", { text: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Business Hours</span>
                <input
                  value={draft.announcement.hours}
                  onChange={(e) => setSection("announcement", { hours: e.target.value })}
                  className={inputCls}
                />
              </label>
              <button
                onClick={() => void saveDraft()}
                disabled={busy}
                className="w-fit rounded-lg bg-black px-5 py-2 text-[13px] font-bold text-white hover:opacity-85 disabled:opacity-40"
              >
                Save Changes
              </button>
            </div>
          )}
        </Card>

        {/* ---- Lookbook gallery (live manager) ---- */}
        <Card>
          {sectionHeader(
            "lookbook",
            "Look Book Gallery",
            `${items.length} media item${items.length === 1 ? "" : "s"} on the public /lookbook page`,
            null,
            null,
          )}
          {open.lookbook && (
            <div className="border-t border-[#f3f4f6] p-5">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  className="text-[13px] text-[#374151] file:mr-3 file:rounded-lg file:border file:border-[#e5e7eb] file:bg-white file:px-4 file:py-2 file:text-[13px] file:font-bold file:text-black"
                />
                <input
                  ref={titleRef}
                  placeholder="Caption (optional)"
                  className="h-10 w-[200px] rounded-lg border border-[#e5e7eb] px-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
                />
                <button
                  onClick={() => void lbUpload()}
                  disabled={uploading}
                  className="flex h-10 items-center gap-2 rounded-lg bg-black px-5 text-[13px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                >
                  <FiUploadCloud className="h-4 w-4" />
                  {uploading ? "Uploading…" : "Upload"}
                </button>
                {lbFlash && (
                  <p
                    className={`rounded-lg px-3 py-2 text-[12.5px] font-medium ${
                      lbFlash.kind === "ok" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#ba1a1a]"
                    }`}
                  >
                    {lbFlash.text}
                  </p>
                )}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                {items.map((item, idx) => (
                  <div key={item._id} className="overflow-hidden rounded-xl border border-[#e5e7eb]">
                    <div className="relative flex h-[110px] items-center justify-center bg-[#f3f4f6]">
                      {item.mediaType === "video" ? (
                        <video src={item.mediaUrl} className="h-full w-full object-cover" muted playsInline />
                      ) : (
                        <img src={item.mediaUrl} alt={item.title ?? ""} className="h-full w-full object-cover" />
                      )}
                      <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[9.5px] font-bold text-white">
                        #{idx + 1}
                      </span>
                      {item.mediaType === "video" && (
                        <span className="absolute right-2 top-2 rounded bg-black/70 p-1 text-white">
                          <FiFilm className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 p-2.5">
                      {editId === item._id ? (
                        <span className="flex flex-1 items-center gap-1.5">
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            autoFocus
                            className="h-7 w-full rounded border border-[#e5e7eb] px-1.5 text-[11.5px] text-black focus:border-black focus:outline-none"
                          />
                          <button
                            aria-label="Save caption"
                            onClick={() => void lbSaveTitle(item._id)}
                            disabled={busyId === item._id}
                            className="text-[#16a34a] disabled:opacity-40"
                          >
                            <FiCheck className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ) : (
                        <>
                          <p className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-black">
                            {item.title || <span className="text-[#9ca3af]">No caption</span>}
                          </p>
                          <span className="flex shrink-0 items-center gap-1.5 text-[#6b7280]">
                            <button aria-label="Move up" onClick={() => void lbMove(idx, -1)} disabled={idx === 0} className="hover:text-black disabled:opacity-30">
                              <FiArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button aria-label="Move down" onClick={() => void lbMove(idx, 1)} disabled={idx === items.length - 1} className="hover:text-black disabled:opacity-30">
                              <FiArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              aria-label="Edit caption"
                              onClick={() => {
                                setEditId(item._id);
                                setEditTitle(item.title ?? "");
                              }}
                              className="hover:text-black"
                            >
                              <FiEdit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              aria-label="Delete"
                              onClick={() => void lbRemove(item)}
                              disabled={busyId === item._id}
                              className="text-[#dc2626] hover:opacity-70 disabled:opacity-40"
                            >
                              <FiTrash2 className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="pt-3 text-[11.5px] text-[#9ca3af]">
                Lookbook media goes live immediately — it isn&apos;t part of draft/publish.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* ---- Publish bar ---- */}
      <div className="fixed bottom-0 left-[240px] right-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e7eb] bg-white px-8 py-3.5">
        <p className="text-[13px] text-[#6b7280]">
          Last published:{" "}
          <b className="text-black">
            {publishedAt
              ? new Date(publishedAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
              : "never"}
          </b>
          {dirty && <span className="pl-3 font-bold text-[#d97706]">⊖ Changes pending…</span>}
        </p>
        <span className="flex items-center gap-3">
          <button
            onClick={() => void discardAll()}
            disabled={busy || !dirty}
            className="rounded-lg px-4 py-2.5 text-[13.5px] font-bold text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-40"
          >
            Discard All
          </button>
          <button
            onClick={() => void publishAll()}
            disabled={busy}
            className="rounded-lg bg-black px-6 py-2.5 text-[13.5px] font-bold text-white hover:opacity-85 disabled:opacity-40"
          >
            {busy ? "Working…" : "Publish All Changes 🚀"}
          </button>
        </span>
      </div>
    </Shell>
  );
}
