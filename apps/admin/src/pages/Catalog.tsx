import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCopy,
  FiGrid,
  FiList,
  FiSearch,
} from "react-icons/fi";
import Shell, { Card } from "../components/Shell";
import { api, apiForm, inr, type AdminProduct } from "../lib/api";

const COLOR_HEX: Record<string, string> = {
  black: "#1f2224",
  white: "#ffffff",
  navy: "#1e3a8a",
  blue: "#2563eb",
  red: "#dc2626",
  green: "#14532d",
  grey: "#9ca3af",
  gray: "#9ca3af",
  beige: "#d6c7a1",
  brown: "#7c4a03",
  pink: "#f9a8d4",
  yellow: "#facc15",
  orange: "#f97316",
  purple: "#7c3aed",
};

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const METHODS = ["DTF", "Screen", "Embroidery", "Heat Transfer"];
const FITS = ["Regular Fit", "Oversized Fit", "Slim Fit", "Relaxed Fit"];
const NECKS = ["Round Neck", "V-Neck", "Polo Collar", "Hooded", "Crew Neck", "None"];
const PAGE_SIZE = 8;

type Category = { _id: string; name: string };
type ColorRow = { color: string; stock: string; files: File[] };
type ZoneRow = { name: string; side: "front" | "back"; widthIn: string; heightIn: string; dpi: string };
type MeasureRow = { size: string; chest: string; length: string; shoulder: string; sleeve: string };
type Flash = { kind: "ok" | "err"; text: string } | null;

const DEFAULT_ZONES: ZoneRow[] = [
  { name: "Full Front", side: "front", widthIn: "12", heightIn: "16", dpi: "300" },
  { name: "Left Chest", side: "front", widthIn: "4", heightIn: "4", dpi: "300" },
];

const zonesToPayload = (rows: ZoneRow[]) =>
  rows
    .filter((z) => z.name.trim())
    .map((z) => ({
      name: z.name.trim(),
      side: z.side,
      widthIn: Number(z.widthIn) || undefined,
      heightIn: Number(z.heightIn) || undefined,
      dpi: Number(z.dpi) || 300,
    }));

const measuresToPayload = (rows: MeasureRow[]) =>
  rows
    .filter((m) => m.chest || m.length || m.shoulder || m.sleeve)
    .map((m) => ({
      size: m.size,
      chest: Number(m.chest) || undefined,
      length: Number(m.length) || undefined,
      shoulder: Number(m.shoulder) || undefined,
      sleeve: Number(m.sleeve) || undefined,
    }));

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const catName = (p: AdminProduct) =>
  typeof p.categoryId === "object" ? (p.categoryId?.name ?? "Other") : "Other";

const cardImg = (p: AdminProduct) =>
  p.variants?.find((v) => v.media?.images?.[0])?.media?.images?.[0];

const specLine = (p: AdminProduct) =>
  [
    p.specifications?.fabric,
    p.specifications?.gsm ? `${p.specifications.gsm} GSM` : null,
  ]
    .filter(Boolean)
    .join(" · ") || (p.sizes?.length ? `${p.sizes.length} sizes` : "—");

const EMPTY_FORM = {
  title: "",
  categoryId: "",
  basePrice: "",
  discount: "",
  description: "",
  tags: "",
  material: "",
  gsm: "",
  fit: "",
  neck: "",
  care: "",
  sizes: ["S", "M", "L", "XL"] as string[],
  methods: ["DTF"] as string[],
};

export default function Catalog() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cats, setCats] = useState<Category[]>([]);
  const [catFilter, setCatFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [flash, setFlash] = useState<Flash>(null);

  // Add form
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [colorRows, setColorRows] = useState<ColorRow[]>([
    { color: "White", stock: "100", files: [] },
  ]);
  const [zoneRows, setZoneRows] = useState<ZoneRow[]>(
    DEFAULT_ZONES.map((z) => ({ ...z })),
  );
  const [measureRows, setMeasureRows] = useState<MeasureRow[]>([]);

  // Keep the measurement table rows in sync with the selected sizes
  useEffect(() => {
    setMeasureRows((prev) =>
      form.sizes.map(
        (s) =>
          prev.find((m) => m.size === s) ?? {
            size: s,
            chest: "",
            length: "",
            shoulder: "",
            sleeve: "",
          },
      ),
    );
  }, [form.sizes]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [formFlash, setFormFlash] = useState<Flash>(null);

  // Edit modal
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    basePrice: "",
    description: "",
    fabric: "",
    gsm: "",
    status: "published",
  });
  const [editZones, setEditZones] = useState<ZoneRow[]>([]);
  const [editBusy, setEditBusy] = useState(false);
  const [editFlash, setEditFlash] = useState<Flash>(null);

  const load = useCallback(() => {
    api<{ data: AdminProduct[] }>("/api/products/admin?limit=100")
      .then((j) => setProducts(Array.isArray(j.data) ? j.data : []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);
  useEffect(load, [load]);

  useEffect(() => {
    api<{ data: { categories: Category[] } }>("/api/categories/admin?limit=100")
      .then((j) => {
        const list = j.data?.categories ?? [];
        setCats(list);
        setForm((f) => (f.categoryId ? f : { ...f, categoryId: list[0]?._id ?? "" }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => setPage(1), [catFilter, search]);

  const catChips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const n = catName(p);
      counts.set(n, (counts.get(n) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [products]);

  const rows = products.filter(
    (p) =>
      (catFilter === "all" || catName(p) === catFilter) &&
      (!search || p.title.toLowerCase().includes(search.toLowerCase())),
  );
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggle = (key: "sizes" | "methods", value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value)
        ? f[key].filter((v) => v !== value)
        : [...f[key], value],
    }));

  function nextProdCode(extraUsed: string[] = []) {
    const used = new Set([
      ...products.map((p) => p.id).filter(Boolean),
      ...extraUsed,
    ]);
    for (let n = 1; n < 1000; n++) {
      const code = `PROD${String(n).padStart(3, "0")}`;
      if (!used.has(code)) return code;
    }
    return "PROD999";
  }

  function uniqueSlug(title: string) {
    const base = slugify(title) || "garment";
    const taken = new Set(products.map((p) => p.slug));
    if (!taken.has(base)) return base;
    for (let n = 2; n < 100; n++) {
      if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
    }
    return `${base}-${Date.now() % 10000}`;
  }

  const splitList = (s: string) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  async function submit(publish: boolean) {
    setFormFlash(null);
    const cRows = colorRows.filter((r) => r.color.trim());
    if (cRows.length === 0) {
      setFormFlash({ kind: "err", text: "Add at least one colour." });
      return;
    }
    if (form.methods.length === 0 || form.sizes.length === 0) {
      setFormFlash({ kind: "err", text: "Pick at least one size and one print method." });
      return;
    }
    if (!form.title || !form.categoryId || !form.basePrice || !form.description) {
      setFormFlash({ kind: "err", text: "Title, category, base price and description are required." });
      return;
    }
    setBusy(true);
    try {
      const code = nextProdCode();
      setProgress("Creating product…");
      const created = await api<{ data: { _id: string } }>("/api/products/admin", {
        method: "POST",
        body: JSON.stringify({
          id: code,
          title: form.title,
          categoryId: form.categoryId,
          basePrice: Number(form.basePrice),
          customizationTypes: form.methods,
          discountPercentage: Number(form.discount) || 0,
          description: form.description,
          slug: uniqueSlug(form.title),
          sizes: form.sizes,
          colors: cRows.map((r) => r.color.trim()),
          status: "draft",
          seo: form.tags ? { metaKeywords: splitList(form.tags) } : undefined,
          specifications: {
            fabric: form.material || undefined,
            gsm: form.gsm || undefined,
            fit: form.fit || undefined,
            neck: form.neck || undefined,
          },
          materialAndCare:
            form.material || form.care
              ? {
                  material: form.material || undefined,
                  careInstructions: form.care ? splitList(form.care) : undefined,
                }
              : undefined,
          printZones: zonesToPayload(zoneRows),
          measurements: measuresToPayload(measureRows),
        }),
      });
      const pid = created.data._id;

      for (let i = 0; i < cRows.length; i++) {
        const r = cRows[i];
        setProgress(`Adding ${r.color} variant (${i + 1}/${cRows.length})…`);
        const fd = new FormData();
        fd.append("id", `VAR${String(i + 1).padStart(3, "0")}`);
        fd.append("color", r.color.trim());
        fd.append(
          "sku",
          `AB-${code}-${r.color.trim().slice(0, 3).toUpperCase()}${Math.floor(
            1000 + Math.random() * 9000,
          )}`,
        );
        for (const file of r.files) fd.append("images", file);
        const vj = await apiForm<{ data: { variant: { _id: string } } }>(
          `/api/variants/products/${pid}/variants`,
          fd,
        );
        const stock = Math.max(0, Number(r.stock) || 0);
        if (stock > 0) {
          await api(
            `/api/inventory/products/${pid}/variants/${vj.data.variant._id}/inventory`,
            { method: "PUT", body: JSON.stringify({ stock, reservedStock: 0 }) },
          );
        }
      }

      if (publish) {
        setProgress("Publishing…");
        await api(`/api/products/admin/${pid}`, {
          method: "PUT",
          body: JSON.stringify({ status: "published" }),
        });
      }

      setFormFlash({
        kind: "ok",
        text: publish
          ? `${form.title} is live in the catalog as ${code}.`
          : `${form.title} saved as a draft (${code}).`,
      });
      setForm({ ...EMPTY_FORM, categoryId: cats[0]?._id ?? "" });
      setColorRows([{ color: "White", stock: "100", files: [] }]);
      setZoneRows(DEFAULT_ZONES.map((z) => ({ ...z })));
      load();
    } catch (err) {
      setFormFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not create garment",
      });
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  async function duplicate(p: AdminProduct) {
    if (!window.confirm(`Duplicate "${p.title}" as a new draft garment?`)) return;
    setFlash(null);
    try {
      const code = nextProdCode();
      const created = await api<{ data: { _id: string } }>("/api/products/admin", {
        method: "POST",
        body: JSON.stringify({
          id: code,
          title: `${p.title} (Copy)`,
          categoryId: typeof p.categoryId === "object" ? p.categoryId?._id : p.categoryId,
          basePrice: p.basePrice,
          customizationTypes: p.customizationTypes?.length ? p.customizationTypes : ["DTF"],
          discountPercentage: p.discountPercentage ?? 0,
          description: p.description || p.title,
          slug: uniqueSlug(`${p.title}-copy`),
          sizes: p.sizes ?? [],
          colors: p.colors ?? [],
          status: "draft",
          specifications: p.specifications,
          printZones: p.printZones ?? [],
          measurements: p.measurements ?? [],
        }),
      });
      const pid = created.data._id;
      for (const [i, v] of (p.variants ?? []).entries()) {
        await api(`/api/variants/products/${pid}/variants`, {
          method: "POST",
          body: JSON.stringify({
            id: `VAR${String(i + 1).padStart(3, "0")}`,
            color: v.color ?? "Default",
            sku: `AB-${code}-${(v.color ?? "DEF").slice(0, 3).toUpperCase()}${Math.floor(
              1000 + Math.random() * 9000,
            )}`,
            media: v.media,
          }),
        });
      }
      setFlash({
        kind: "ok",
        text: `Duplicated as ${code} (draft). Edit it to adjust details, then publish.`,
      });
      load();
    } catch (err) {
      setFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not duplicate garment",
      });
    }
  }

  function openEdit(p: AdminProduct) {
    setEditing(p);
    setEditFlash(null);
    setEditForm({
      title: p.title,
      basePrice: String(p.basePrice ?? ""),
      description: p.description ?? "",
      fabric: p.specifications?.fabric ?? "",
      gsm: p.specifications?.gsm ?? "",
      status: p.status === "draft" ? "draft" : "published",
    });
    setEditZones(
      (p.printZones ?? []).map((z) => ({
        name: z.name ?? "",
        side: z.side === "back" ? "back" : "front",
        widthIn: z.widthIn != null ? String(z.widthIn) : "",
        heightIn: z.heightIn != null ? String(z.heightIn) : "",
        dpi: z.dpi != null ? String(z.dpi) : "300",
      })),
    );
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setEditBusy(true);
    setEditFlash(null);
    try {
      await api(`/api/products/admin/${editing._id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editForm.title,
          basePrice: Number(editForm.basePrice),
          description: editForm.description || undefined,
          status: editForm.status,
          specifications: {
            ...(editing.specifications ?? {}),
            fabric: editForm.fabric || undefined,
            gsm: editForm.gsm || undefined,
          },
          printZones: zonesToPayload(editZones),
        }),
      });
      setEditing(null);
      setFlash({ kind: "ok", text: `${editForm.title} updated.` });
      load();
    } catch (err) {
      setEditFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not save changes",
      });
    } finally {
      setEditBusy(false);
    }
  }

  const inputCls =
    "h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";
  const labelCls = "text-[11.5px] font-semibold text-[#374151]";

  const StatusBadge = ({ p }: { p: AdminProduct }) => {
    const active = p.isActive !== false && p.status !== "draft";
    return (
      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.5px] ${
          active ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#f3f4f6] text-[#6b7280]"
        }`}
      >
        {active ? "Active" : "Draft"}
      </span>
    );
  };

  const CardActions = ({ p }: { p: AdminProduct }) => (
    <span className="flex items-center gap-3 text-[#6b7280]">
      <button aria-label={`Edit ${p.title}`} onClick={() => openEdit(p)} className="hover:text-black">
        <FiEdit2 className="h-4 w-4" />
      </button>
      <button
        aria-label={`Duplicate ${p.title}`}
        onClick={() => void duplicate(p)}
        className="hover:text-black"
      >
        <FiCopy className="h-4 w-4" />
      </button>
    </span>
  );

  return (
    <Shell
      title="Garment Catalog"
      subtitle={`${products.length} base products`}
      actions={
        <button
          onClick={() => {
            setOpen(true);
            setFormFlash(null);
          }}
          className="rounded-lg bg-black px-4 py-2.5 text-[13px] font-bold text-white hover:opacity-85"
        >
          + Add New Garment
        </button>
      }
    >
      {/* Filter bar */}
      <Card className="flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCatFilter("all")}
            className={`rounded-lg px-4 py-2 text-[13px] font-semibold ${
              catFilter === "all"
                ? "bg-black text-white"
                : "bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb]"
            }`}
          >
            All ({products.length})
          </button>
          {catChips.map(([name, count]) => (
            <button
              key={name}
              onClick={() => setCatFilter(name)}
              className={`rounded-lg px-4 py-2 text-[13px] font-semibold ${
                catFilter === name
                  ? "bg-black text-white"
                  : "bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb]"
              }`}
            >
              {name} ({count})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="relative">
            <FiSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog..."
              className="h-9 w-[190px] rounded-lg border border-[#e5e7eb] bg-white pl-8 pr-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
            />
          </span>
          <span className="flex overflow-hidden rounded-lg border border-[#e5e7eb]">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                aria-label={`${v} view`}
                onClick={() => setView(v)}
                className={`flex h-9 w-9 items-center justify-center ${
                  view === v ? "bg-[#e5e7eb] text-black" : "bg-white text-[#6b7280]"
                }`}
              >
                {v === "grid" ? <FiGrid className="h-4 w-4" /> : <FiList className="h-4 w-4" />}
              </button>
            ))}
          </span>
        </div>
      </Card>

      {flash && (
        <p
          className={`mt-4 w-fit rounded-lg px-3.5 py-2.5 text-[13px] font-medium ${
            flash.kind === "ok"
              ? "bg-[#dcfce7] text-[#166534]"
              : "bg-[#fee2e2] text-[#ba1a1a]"
          }`}
        >
          {flash.text}
        </p>
      )}

      {!loaded && (
        <p className="py-10 text-center text-[13px] text-[#9ca3af]">Loading catalog…</p>
      )}
      {loaded && rows.length === 0 && (
        <p className="py-10 text-center text-[13px] text-[#9ca3af]">No products match.</p>
      )}

      {/* Grid view */}
      {view === "grid" && (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {pageRows.map((p) => {
            const img = cardImg(p);
            return (
              <Card key={p._id} className="overflow-hidden">
                <div className="relative flex h-[170px] items-center justify-center bg-[#f8f9fb]">
                  <span className="absolute right-3 top-3">
                    <StatusBadge p={p} />
                  </span>
                  {img ? (
                    <img src={img} alt={p.title} className="h-full w-full object-contain p-4" />
                  ) : (
                    <span className="text-[12px] text-[#c4c7c7]">No image</span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[14.5px] font-bold leading-snug text-black">{p.title}</p>
                    <p className="text-[14.5px] font-bold text-black">{inr(p.basePrice)}</p>
                  </div>
                  <p className="pt-1 text-[12px] text-[#6b7280]">{specLine(p)}</p>
                  <div className="flex items-center gap-2 border-b border-[#f3f4f6] pb-3 pt-3">
                    <span className="flex -space-x-1.5">
                      {(p.colors ?? []).slice(0, 4).map((c) => (
                        <span
                          key={c}
                          title={c}
                          className="h-4 w-4 rounded-full border border-[#d1d5db]"
                          style={{ background: COLOR_HEX[c.toLowerCase()] ?? "#e5e7eb" }}
                        />
                      ))}
                    </span>
                    <span className="text-[12px] text-[#6b7280]">
                      {(p.colors ?? []).length} colors available
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <p
                      className={`text-[12px] font-bold ${
                        (p.variants?.length ?? 0) > 0 && (p.printZones?.length ?? 0) > 0
                          ? "text-[#16a34a]"
                          : "text-[#d97706]"
                      }`}
                    >
                      {(p.variants?.length ?? 0) === 0
                        ? "⚠ No variants defined"
                        : (p.printZones?.length ?? 0) > 0
                          ? `✓ ${p.printZones!.length} zone${p.printZones!.length > 1 ? "s" : ""} defined`
                          : "⚠ No print zones defined"}
                    </p>
                    <CardActions p={p} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <Card className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="bg-[#f8f9fb] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
                <th className="px-6 py-3">Product</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Colors</th>
                <th className="px-3 py-3">Variants</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((p) => {
                const img = cardImg(p);
                return (
                  <tr key={p._id} className="border-t border-[#f3f4f6] text-[13.5px]">
                    <td className="px-6 py-3.5">
                      <span className="flex items-center gap-3">
                        <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f8f9fb]">
                          {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-black">{p.title}</span>
                          <span className="block text-[12px] text-[#6b7280]">{specLine(p)}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-[#374151]">{catName(p)}</td>
                    <td className="px-3 py-3.5 font-bold text-black">{inr(p.basePrice)}</td>
                    <td className="px-3 py-3.5 text-[#374151]">{(p.colors ?? []).length}</td>
                    <td className="px-3 py-3.5 text-[#374151]">{p.variants?.length ?? 0}</td>
                    <td className="px-3 py-3.5">
                      <StatusBadge p={p} />
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="flex justify-end">
                        <CardActions p={p} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Pagination */}
      {rows.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e7eb] pt-4">
          <p className="text-[13px] text-[#6b7280]">
            Showing <b className="text-black">{(page - 1) * PAGE_SIZE + 1}-
            {(page - 1) * PAGE_SIZE + pageRows.length}</b> of {rows.length} products
          </p>
          {pages > 1 && (
            <span className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#374151] hover:border-black disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-9 w-9 rounded-lg text-[13px] font-bold ${
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
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#374151] hover:border-black disabled:opacity-40"
              >
                ›
              </button>
            </span>
          )}
        </div>
      )}

      {/* Add Garment drawer */}
      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => !busy && setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-[600px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-5">
              <div>
                <h2 className="text-[18px] font-bold text-black">Add New Garment</h2>
                <p className="text-[12.5px] text-[#6b7280]">
                  Creates a base product with colour variants and stock.
                </p>
              </div>
              <button
                aria-label="Close"
                onClick={() => !busy && setOpen(false)}
                className="text-[#6b7280] hover:text-black"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
              {/* Basic information */}
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4 pt-3">
                  <label className="col-span-2 flex flex-col gap-1.5">
                    <span className={labelCls}>Product Name</span>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Round Neck Classic T-Shirt"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Category</span>
                    <select
                      required
                      value={form.categoryId}
                      onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                      className={inputCls}
                    >
                      {cats.length === 0 && <option value="">Loading…</option>}
                      {cats.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Tags (comma separated)</span>
                    <input
                      value={form.tags}
                      onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                      placeholder="Cotton, Premium"
                      className={inputCls}
                    />
                  </label>
                  <label className="col-span-2 flex flex-col gap-1.5">
                    <span className={labelCls}>Short Description</span>
                    <textarea
                      required
                      rows={2}
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Brief overview of the garment for the catalog…"
                      className="w-full rounded-lg border border-[#e5e7eb] p-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
                    />
                  </label>
                </div>
              </section>

              {/* Fabric & specifications */}
              <section className="border-t border-[#f3f4f6] pt-5">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                  Fabric &amp; Specifications
                </h3>
                <div className="grid grid-cols-2 gap-4 pt-3">
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Material</span>
                    <input
                      value={form.material}
                      onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
                      placeholder="e.g. 100% Combed Cotton"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>GSM Weight</span>
                    <input
                      value={form.gsm}
                      onChange={(e) => setForm((f) => ({ ...f, gsm: e.target.value }))}
                      placeholder="e.g. 180"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Fit Type</span>
                    <select
                      value={form.fit}
                      onChange={(e) => setForm((f) => ({ ...f, fit: e.target.value }))}
                      className={inputCls}
                    >
                      <option value="">Select fit…</option>
                      {FITS.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Neck Type</span>
                    <select
                      value={form.neck}
                      onChange={(e) => setForm((f) => ({ ...f, neck: e.target.value }))}
                      className={inputCls}
                    >
                      <option value="">Select neck…</option>
                      {NECKS.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label className="col-span-2 flex flex-col gap-1.5">
                    <span className={labelCls}>Care Instructions (comma separated)</span>
                    <input
                      value={form.care}
                      onChange={(e) => setForm((f) => ({ ...f, care: e.target.value }))}
                      placeholder="Machine wash cold, Tumble dry low"
                      className={inputCls}
                    />
                  </label>
                </div>
              </section>

              {/* Sizing */}
              <section className="border-t border-[#f3f4f6] pt-5">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                  Sizing
                </h3>
                <div className="flex flex-wrap gap-2 pt-3">
                  {SIZES.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggle("sizes", s)}
                      className={`rounded-md border px-3.5 py-1.5 text-[12.5px] font-bold ${
                        form.sizes.includes(s)
                          ? "border-black bg-black text-white"
                          : "border-[#e5e7eb] text-[#374151] hover:border-black"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              {/* Measurements */}
              {measureRows.length > 0 && (
                <section className="border-t border-[#f3f4f6] pt-5">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                    Sizing &amp; Measurement (inches, optional)
                  </h3>
                  <div className="mt-3 overflow-x-auto rounded-lg border border-[#f3f4f6]">
                    <table className="w-full min-w-[420px] text-left text-[12.5px]">
                      <thead>
                        <tr className="bg-[#f8f9fb] text-[10.5px] font-bold uppercase tracking-[0.5px] text-[#6b7280]">
                          <th className="px-3 py-2">Size</th>
                          <th className="px-2 py-2">Chest</th>
                          <th className="px-2 py-2">Length</th>
                          <th className="px-2 py-2">Shoulder</th>
                          <th className="px-2 py-2">Sleeve</th>
                        </tr>
                      </thead>
                      <tbody>
                        {measureRows.map((m, i) => (
                          <tr key={m.size} className="border-t border-[#f3f4f6]">
                            <td className="px-3 py-1.5 font-bold text-black">{m.size}</td>
                            {(["chest", "length", "shoulder", "sleeve"] as const).map((k) => (
                              <td key={k} className="px-2 py-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  step="0.5"
                                  value={m[k]}
                                  onChange={(e) =>
                                    setMeasureRows((rows) =>
                                      rows.map((r, j) =>
                                        j === i ? { ...r, [k]: e.target.value } : r,
                                      ),
                                    )
                                  }
                                  className="h-8 w-16 rounded border border-[#e5e7eb] px-2 text-[12.5px] text-black focus:border-black focus:outline-none"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="pt-2 text-[11.5px] text-[#9ca3af]">
                    Shown as the size chart on the product page when filled in.
                  </p>
                </section>
              )}

              {/* Print zones */}
              <section className="border-t border-[#f3f4f6] pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                    Print Zones
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setZoneRows((r) => [
                        ...r,
                        { name: "", side: "front", widthIn: "", heightIn: "", dpi: "300" },
                      ])
                    }
                    className="flex items-center gap-1 text-[12.5px] font-bold text-black hover:underline"
                  >
                    <FiPlus className="h-3.5 w-3.5" /> Add zone
                  </button>
                </div>
                <div className="flex flex-col gap-2 pt-3">
                  {zoneRows.map((z, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_86px_64px_64px_64px_26px] items-center gap-2 rounded-lg border border-[#f3f4f6] bg-[#f8f9fb] p-2.5"
                    >
                      <input
                        value={z.name}
                        onChange={(e) =>
                          setZoneRows((rows) =>
                            rows.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)),
                          )
                        }
                        placeholder="Zone name"
                        className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-2.5 text-[12.5px] text-black focus:border-black focus:outline-none"
                      />
                      <select
                        value={z.side}
                        onChange={(e) =>
                          setZoneRows((rows) =>
                            rows.map((r, j) =>
                              j === i ? { ...r, side: e.target.value as "front" | "back" } : r,
                            ),
                          )
                        }
                        className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-2 text-[12.5px] text-black focus:border-black focus:outline-none"
                      >
                        <option value="front">Front</option>
                        <option value="back">Back</option>
                      </select>
                      {(["widthIn", "heightIn", "dpi"] as const).map((k) => (
                        <input
                          key={k}
                          type="number"
                          min={0}
                          value={z[k]}
                          onChange={(e) =>
                            setZoneRows((rows) =>
                              rows.map((r, j) => (j === i ? { ...r, [k]: e.target.value } : r)),
                            )
                          }
                          placeholder={k === "widthIn" ? "W″" : k === "heightIn" ? "H″" : "DPI"}
                          title={k === "widthIn" ? "Width (inches)" : k === "heightIn" ? "Height (inches)" : "DPI"}
                          className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-2 text-[12.5px] text-black focus:border-black focus:outline-none"
                        />
                      ))}
                      <button
                        type="button"
                        aria-label="Remove zone"
                        onClick={() => setZoneRows((rows) => rows.filter((_, j) => j !== i))}
                        className="text-[#dc2626] hover:opacity-70"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="pt-2 text-[11.5px] text-[#9ca3af]">
                  Zone name · side · width″ · height″ · DPI. Used for print production specs.
                </p>
              </section>

              {/* Pricing */}
              <section className="border-t border-[#f3f4f6] pt-5">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                  Pricing Structure
                </h3>
                <div className="grid grid-cols-2 gap-4 pt-3">
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Base Price (₹)</span>
                    <input
                      required
                      type="number"
                      min={1}
                      value={form.basePrice}
                      onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                      placeholder="299"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Discount (%)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.discount}
                      onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                      placeholder="0"
                      className={inputCls}
                    />
                  </label>
                </div>
              </section>

              {/* Methods */}
              <section className="border-t border-[#f3f4f6] pt-5">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                  Supported Methods
                </h3>
                <div className="flex flex-wrap gap-2 pt-3">
                  {METHODS.map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => toggle("methods", m)}
                      className={`rounded-md border px-3.5 py-1.5 text-[12.5px] font-bold ${
                        form.methods.includes(m)
                          ? "border-black bg-black text-white"
                          : "border-[#e5e7eb] text-[#374151] hover:border-black"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </section>

              {/* Colours */}
              <section className="border-t border-[#f3f4f6] pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#6b7280]">
                    Colour Variants
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setColorRows((r) => [...r, { color: "", stock: "100", files: [] }])
                    }
                    className="flex items-center gap-1 text-[12.5px] font-bold text-black hover:underline"
                  >
                    <FiPlus className="h-3.5 w-3.5" /> Add colour
                  </button>
                </div>
                <div className="flex flex-col gap-3 pt-3">
                  {colorRows.map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[24px_1fr_84px_1fr_26px] items-center gap-2 rounded-lg border border-[#f3f4f6] bg-[#f8f9fb] p-3"
                    >
                      <span
                        title={row.color}
                        className="h-5 w-5 rounded-full border border-[#d1d5db]"
                        style={{
                          background: COLOR_HEX[row.color.trim().toLowerCase()] ?? "#e5e7eb",
                        }}
                      />
                      <input
                        value={row.color}
                        onChange={(e) =>
                          setColorRows((rows) =>
                            rows.map((r, j) => (j === i ? { ...r, color: e.target.value } : r)),
                          )
                        }
                        placeholder="Colour"
                        className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-2.5 text-[12.5px] text-black focus:border-black focus:outline-none"
                      />
                      <input
                        type="number"
                        min={0}
                        value={row.stock}
                        onChange={(e) =>
                          setColorRows((rows) =>
                            rows.map((r, j) => (j === i ? { ...r, stock: e.target.value } : r)),
                          )
                        }
                        placeholder="Stock"
                        title="Opening stock"
                        className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-2.5 text-[12.5px] text-black focus:border-black focus:outline-none"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          setColorRows((rows) =>
                            rows.map((r, j) =>
                              j === i
                                ? { ...r, files: Array.from(e.target.files ?? []) }
                                : r,
                            ),
                          )
                        }
                        className="text-[11px] text-[#6b7280] file:mr-2 file:rounded file:border file:border-[#e5e7eb] file:bg-white file:px-2 file:py-1 file:text-[11px] file:font-bold file:text-black"
                      />
                      <button
                        type="button"
                        aria-label="Remove colour"
                        onClick={() => setColorRows((rows) => rows.filter((_, j) => j !== i))}
                        disabled={colorRows.length === 1}
                        className="text-[#dc2626] hover:opacity-70 disabled:opacity-30"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="pt-2 text-[11.5px] text-[#9ca3af]">
                  Up to 10 images per colour. Stock is the opening inventory.
                </p>
              </section>

              {formFlash && (
                <p
                  className={`w-fit rounded-lg px-3 py-2 text-[12.5px] font-medium ${
                    formFlash.kind === "ok"
                      ? "bg-[#dcfce7] text-[#166534]"
                      : "bg-[#fee2e2] text-[#ba1a1a]"
                  }`}
                >
                  {formFlash.text}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-[#e5e7eb] px-6 py-4">
              <button
                onClick={() => void submit(false)}
                disabled={busy}
                className="rounded-lg border border-[#c4c7c7] px-5 py-2.5 text-[13.5px] font-bold text-black hover:border-black disabled:opacity-40"
              >
                Save as Draft
              </button>
              <button
                onClick={() => void submit(true)}
                disabled={busy}
                className="rounded-lg bg-black px-6 py-2.5 text-[13.5px] font-bold text-white hover:opacity-85 disabled:opacity-40"
              >
                {busy ? progress || "Working…" : "Publish Garment 🚀"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditing(null)} />
          <form
            onSubmit={(e) => void saveEdit(e)}
            className="relative z-10 max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-bold text-black">Edit Garment</h2>
                <p className="text-[12.5px] text-[#6b7280]">{editing.id}</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setEditing(null)}
                className="text-[#6b7280] hover:text-black"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3.5 pt-4">
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Product Name</span>
                <input
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputCls}
                />
              </label>
              <div className="grid grid-cols-2 gap-3.5">
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Base Price (₹)</span>
                  <input
                    required
                    type="number"
                    min={1}
                    value={editForm.basePrice}
                    onChange={(e) => setEditForm((f) => ({ ...f, basePrice: e.target.value }))}
                    className={inputCls}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Status</span>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="published">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Material</span>
                  <input
                    value={editForm.fabric}
                    onChange={(e) => setEditForm((f) => ({ ...f, fabric: e.target.value }))}
                    placeholder="e.g. 100% Cotton"
                    className={inputCls}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>GSM Weight</span>
                  <input
                    value={editForm.gsm}
                    onChange={(e) => setEditForm((f) => ({ ...f, gsm: e.target.value }))}
                    placeholder="e.g. 180"
                    className={inputCls}
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Description</span>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-lg border border-[#e5e7eb] p-3 text-[13px] text-black focus:border-black focus:outline-none"
                />
              </label>

              <div className="flex items-center justify-between pt-1">
                <span className={labelCls}>Print Zones</span>
                <button
                  type="button"
                  onClick={() =>
                    setEditZones((r) => [
                      ...r,
                      { name: "", side: "front", widthIn: "", heightIn: "", dpi: "300" },
                    ])
                  }
                  className="flex items-center gap-1 text-[12px] font-bold text-black hover:underline"
                >
                  <FiPlus className="h-3 w-3" /> Add zone
                </button>
              </div>
              {editZones.length === 0 && (
                <p className="text-[12px] text-[#d97706]">
                  ⚠ No print zones defined yet.
                </p>
              )}
              {editZones.map((z, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_80px_58px_58px_58px_24px] items-center gap-2 rounded-lg border border-[#f3f4f6] bg-[#f8f9fb] p-2"
                >
                  <input
                    value={z.name}
                    onChange={(e) =>
                      setEditZones((rows) =>
                        rows.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)),
                      )
                    }
                    placeholder="Zone name"
                    className="h-8 rounded border border-[#e5e7eb] bg-white px-2 text-[12px] text-black focus:border-black focus:outline-none"
                  />
                  <select
                    value={z.side}
                    onChange={(e) =>
                      setEditZones((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, side: e.target.value as "front" | "back" } : r,
                        ),
                      )
                    }
                    className="h-8 rounded border border-[#e5e7eb] bg-white px-1.5 text-[12px] text-black focus:border-black focus:outline-none"
                  >
                    <option value="front">Front</option>
                    <option value="back">Back</option>
                  </select>
                  {(["widthIn", "heightIn", "dpi"] as const).map((k) => (
                    <input
                      key={k}
                      type="number"
                      min={0}
                      value={z[k]}
                      onChange={(e) =>
                        setEditZones((rows) =>
                          rows.map((r, j) => (j === i ? { ...r, [k]: e.target.value } : r)),
                        )
                      }
                      placeholder={k === "widthIn" ? "W″" : k === "heightIn" ? "H″" : "DPI"}
                      className="h-8 rounded border border-[#e5e7eb] bg-white px-1.5 text-[12px] text-black focus:border-black focus:outline-none"
                    />
                  ))}
                  <button
                    type="button"
                    aria-label="Remove zone"
                    onClick={() => setEditZones((rows) => rows.filter((_, j) => j !== i))}
                    className="text-[#dc2626] hover:opacity-70"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {editFlash && (
                <p className="w-fit rounded-lg bg-[#fee2e2] px-3 py-2 text-[12.5px] font-medium text-[#ba1a1a]">
                  {editFlash.text}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-[#e5e7eb] px-5 py-2 text-[13px] font-bold text-[#374151] hover:border-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editBusy}
                  className="rounded-lg bg-black px-6 py-2 text-[13px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                >
                  {editBusy ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </Shell>
  );
}
