import { useCallback, useEffect, useState } from "react";
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";
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
};

const SIZES = ["S", "M", "L", "XL", "XXL"];
const METHODS = ["DTF", "Screen", "Embroidery", "Heat Transfer"];

type Category = { _id: string; name: string };

type ColorRow = { color: string; stock: string; file: File | null };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function Catalog() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: "",
    categoryId: "",
    basePrice: "",
    description: "",
    fabric: "",
    sizes: ["S", "M", "L", "XL"] as string[],
    methods: ["DTF"] as string[],
  });
  const [colorRows, setColorRows] = useState<ColorRow[]>([
    { color: "White", stock: "100", file: null },
  ]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(() => {
    api<{ data: AdminProduct[] }>("/api/products/admin")
      .then((j) => setProducts(Array.isArray(j.data) ? j.data : []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);
  useEffect(load, [load]);

  useEffect(() => {
    if (!open) return;
    api<{ data: { categories: Category[] } }>("/api/categories/admin?limit=100")
      .then((j) => {
        const list = j.data?.categories ?? [];
        setCats(list);
        setForm((f) => (f.categoryId ? f : { ...f, categoryId: list[0]?._id ?? "" }));
      })
      .catch(() => {});
  }, [open]);

  const toggle = (key: "sizes" | "methods", value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value)
        ? f[key].filter((v) => v !== value)
        : [...f[key], value],
    }));

  function nextProdCode() {
    const used = new Set(products.map((p) => p.id).filter(Boolean));
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFlash(null);
    const rows = colorRows.filter((r) => r.color.trim());
    if (rows.length === 0) {
      setFlash({ kind: "err", text: "Add at least one colour." });
      return;
    }
    if (form.methods.length === 0 || form.sizes.length === 0) {
      setFlash({ kind: "err", text: "Pick at least one size and one print method." });
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
          description: form.description,
          slug: uniqueSlug(form.title),
          sizes: form.sizes,
          colors: rows.map((r) => r.color.trim()),
          status: "draft",
          specifications: form.fabric ? { fabric: form.fabric } : undefined,
        }),
      });
      const pid = created.data._id;

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        setProgress(`Adding ${r.color} variant (${i + 1}/${rows.length})…`);
        const fd = new FormData();
        fd.append("id", `VAR${String(i + 1).padStart(3, "0")}`);
        fd.append("color", r.color.trim());
        fd.append(
          "sku",
          `AB-${code}-${r.color.trim().slice(0, 3).toUpperCase()}${Math.floor(
            1000 + Math.random() * 9000,
          )}`,
        );
        if (r.file) fd.append("images", r.file);
        const vj = await apiForm<{ data: { variant: { _id: string } } }>(
          `/api/variants/products/${pid}/variants`,
          fd,
        );
        const stock = Math.max(0, Number(r.stock) || 0);
        if (stock > 0) {
          await api(
            `/api/inventory/products/${pid}/variants/${vj.data.variant._id}/inventory`,
            {
              method: "PUT",
              body: JSON.stringify({ stock, reservedStock: 0 }),
            },
          );
        }
      }

      setProgress("Publishing…");
      await api(`/api/products/admin/${pid}`, {
        method: "PUT",
        body: JSON.stringify({ status: "published" }),
      });

      setFlash({ kind: "ok", text: `${form.title} is live in the catalog as ${code}.` });
      setForm({
        title: "",
        categoryId: cats[0]?._id ?? "",
        basePrice: "",
        description: "",
        fabric: "",
        sizes: ["S", "M", "L", "XL"],
        methods: ["DTF"],
      });
      setColorRows([{ color: "White", stock: "100", file: null }]);
      load();
    } catch (err) {
      setFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not create garment",
      });
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  const inputCls =
    "h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";
  const labelCls = "text-[11.5px] font-semibold text-[#374151]";

  return (
    <Shell
      title="Garment Catalog"
      subtitle={`${products.length} base products`}
      actions={
        <button
          onClick={() => {
            setOpen(true);
            setFlash(null);
          }}
          className="rounded-lg bg-black px-4 py-2.5 text-[13px] font-bold text-white hover:opacity-85"
        >
          + Add New Garment
        </button>
      }
    >
      {!loaded && (
        <p className="py-10 text-center text-[13px] text-[#9ca3af]">
          Loading catalog…
        </p>
      )}
      {loaded && products.length === 0 && (
        <p className="py-10 text-center text-[13px] text-[#9ca3af]">
          No products yet.
        </p>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((p) => {
          const img = p.variants?.find((v) => v.media?.images?.[0])?.media
            ?.images?.[0];
          const active = p.isActive !== false && p.status !== "draft";
          return (
            <Card key={p._id} className="overflow-hidden">
              <div className="relative flex h-[170px] items-center justify-center bg-[#f8f9fb]">
                <span
                  className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.5px] ${
                    active
                      ? "bg-[#dcfce7] text-[#16a34a]"
                      : "bg-[#f3f4f6] text-[#6b7280]"
                  }`}
                >
                  {active ? "Active" : "Draft"}
                </span>
                {img ? (
                  <img
                    src={img}
                    alt={p.title}
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <span className="text-[12px] text-[#c4c7c7]">No image</span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[14.5px] font-bold leading-snug text-black">
                    {p.title}
                  </p>
                  <p className="text-[14.5px] font-bold text-black">
                    {inr(p.basePrice)}
                  </p>
                </div>
                <p className="pt-1 text-[12px] text-[#6b7280]">
                  {[
                    p.specifications?.fabric,
                    p.sizes?.length ? `${p.sizes.length} sizes` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
                <div className="flex items-center gap-2 border-b border-[#f3f4f6] pb-3 pt-3">
                  <span className="flex -space-x-1.5">
                    {(p.colors ?? []).slice(0, 4).map((c) => (
                      <span
                        key={c}
                        title={c}
                        className="h-4 w-4 rounded-full border border-[#d1d5db]"
                        style={{
                          background: COLOR_HEX[c.toLowerCase()] ?? "#e5e7eb",
                        }}
                      />
                    ))}
                  </span>
                  <span className="text-[12px] text-[#6b7280]">
                    {(p.colors ?? []).length} colors available
                  </span>
                </div>
                <p
                  className={`pt-3 text-[12px] font-bold ${
                    (p.variants?.length ?? 0) > 0
                      ? "text-[#16a34a]"
                      : "text-[#d97706]"
                  }`}
                >
                  {(p.variants?.length ?? 0) > 0
                    ? `✓ ${p.variants!.length} variant${p.variants!.length > 1 ? "s" : ""} defined`
                    : "⚠ No variants defined"}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Garment modal */}
      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => !busy && setOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-[560px] overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e7eb] bg-white px-6 py-5">
              <div>
                <h2 className="text-[18px] font-bold text-black">Add New Garment</h2>
                <p className="text-[12.5px] text-[#6b7280]">
                  Publishes a purchasable base product with variants and stock.
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

            <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-5 px-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <label className="col-span-2 flex flex-col gap-1.5">
                  <span className={labelCls}>Garment Title</span>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Premium Oversized Tee"
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
                  <span className={labelCls}>Base Price (₹)</span>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.basePrice}
                    onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                    placeholder="449"
                    className={inputCls}
                  />
                </label>
                <label className="col-span-2 flex flex-col gap-1.5">
                  <span className={labelCls}>Description</span>
                  <textarea
                    required
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Fabric feel, fit, print surface…"
                    className="w-full rounded-lg border border-[#e5e7eb] p-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
                  />
                </label>
                <label className="col-span-2 flex flex-col gap-1.5">
                  <span className={labelCls}>Fabric (optional)</span>
                  <input
                    value={form.fabric}
                    onChange={(e) => setForm((f) => ({ ...f, fabric: e.target.value }))}
                    placeholder="e.g. 240 GSM Cotton"
                    className={inputCls}
                  />
                </label>
              </div>

              <div>
                <p className={labelCls}>Sizes</p>
                <div className="flex flex-wrap gap-2 pt-2">
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
              </div>

              <div>
                <p className={labelCls}>Print Methods</p>
                <div className="flex flex-wrap gap-2 pt-2">
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
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className={labelCls}>Colour Variants</p>
                  <button
                    type="button"
                    onClick={() =>
                      setColorRows((r) => [...r, { color: "", stock: "100", file: null }])
                    }
                    className="flex items-center gap-1 text-[12.5px] font-bold text-black hover:underline"
                  >
                    <FiPlus className="h-3.5 w-3.5" /> Add colour
                  </button>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  {colorRows.map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_90px_1fr_28px] items-center gap-2 rounded-lg border border-[#f3f4f6] bg-[#f8f9fb] p-3"
                    >
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
                        onChange={(e) =>
                          setColorRows((rows) =>
                            rows.map((r, j) =>
                              j === i ? { ...r, file: e.target.files?.[0] ?? null } : r,
                            ),
                          )
                        }
                        className="text-[11.5px] text-[#6b7280] file:mr-2 file:rounded file:border file:border-[#e5e7eb] file:bg-white file:px-2 file:py-1 file:text-[11.5px] file:font-bold file:text-black"
                      />
                      <button
                        type="button"
                        aria-label="Remove colour"
                        onClick={() =>
                          setColorRows((rows) => rows.filter((_, j) => j !== i))
                        }
                        disabled={colorRows.length === 1}
                        className="text-[#dc2626] hover:opacity-70 disabled:opacity-30"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {flash && (
                <p
                  className={`w-fit rounded-lg px-3 py-2 text-[12.5px] font-medium ${
                    flash.kind === "ok"
                      ? "bg-[#dcfce7] text-[#166534]"
                      : "bg-[#fee2e2] text-[#ba1a1a]"
                  }`}
                >
                  {flash.text}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="h-12 rounded-lg bg-black text-[14.5px] font-bold text-white hover:opacity-85 disabled:opacity-40"
              >
                {busy ? progress || "Working…" : "Create & Publish Garment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
