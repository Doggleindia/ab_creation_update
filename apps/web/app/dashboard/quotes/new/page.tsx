"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CloudUpload, Plus, Trash2, X } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import { BACKEND, apiFetch, getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

type Line = { item: string; qty: string; sizes: string };

const inputCls =
  "h-11 w-full rounded-[8px] border border-[#e5e7eb] px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";
const labelCls = "text-[13px] font-bold text-[#374151]";

export default function NewBulkRequestPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    phone: "",
    deadline: "",
    notes: "",
  });
  const [lines, setLines] = useState<Line[]>([{ item: "", qty: "", sizes: "" }]);
  const [files, setFiles] = useState<{ file: File; preview: string; name: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const u = getUser();
    setEmail(u?.email ?? "");
    setForm((f) => ({ ...f, contactName: u?.name ?? "" }));
    apiFetch<{ data: { user: { phone?: string | null } } }>("/api/users/profile")
      .then((j) => setForm((f) => ({ ...f, phone: j.data.user.phone ?? "" })))
      .catch(() => {});
  }, []);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next: typeof files = [];
    for (const file of Array.from(list).slice(0, 5 - files.length)) {
      if (!/^image\/|application\/pdf|application\/postscript/.test(file.type)) continue;
      if (file.size > 25 * 1024 * 1024) continue;
      next.push({ file, preview: URL.createObjectURL(file), name: file.name });
    }
    setFiles((f) => [...f, ...next].slice(0, 5));
  }

  const totalQty = lines.reduce((s, l) => s + (Number(l.qty) || 0), 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const valid = lines.filter((l) => l.item.trim() && Number(l.qty) > 0);
    if (valid.length === 0) {
      setError("Add at least one product line with a quantity.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      // Upload artwork first so reviewers see the real files
      let portfolioFiles: string[] = [];
      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append("designs", f.file, f.name));
        const up = await fetch(`${BACKEND}/api/applications/upload-portfolio`, {
          method: "POST",
          body: fd,
        });
        if (up.ok) portfolioFiles = (await up.json()).data?.urls ?? [];
      }

      const productsToSell = valid
        .map((l) => `${l.qty}× ${l.item.trim()}${l.sizes.trim() ? ` — ${l.sizes.trim()}` : ""}`)
        .join(" | ");

      const res = await fetch(`${BACKEND}/api/applications/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName || form.contactName,
          contactName: form.contactName,
          email, // account email — the request auto-links to this dashboard
          phone: form.phone.replace(/\D/g, "").slice(-10) || undefined,
          expectedVolume: `${totalQty} pieces`,
          productsToSell,
          message: [
            form.deadline && `Target delivery: ${form.deadline}`,
            form.notes && `Notes: ${form.notes}`,
            "Submitted from the bulk dashboard",
          ]
            .filter(Boolean)
            .join(" | "),
          portfolioFiles: portfolioFiles.length ? portfolioFiles : undefined,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.message || "Could not submit the request");
      router.push("/dashboard/quotes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the request");
      setBusy(false);
    }
  }

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <AccountShell>
      <h1 className="text-[32px] font-bold tracking-[-0.6px] text-black">
        New Bulk Order Request
      </h1>
      <p className="pt-1 text-[14px] text-[#6b7280]">
        Tell us what you need — our team reviews it and sends an itemized
        proposal to your{" "}
        <Link href="/dashboard/quotes" className="font-bold text-black underline">
          Bulk Quotes
        </Link>{" "}
        page.
      </p>

      <form onSubmit={(e) => void submit(e)} className="mt-6 max-w-[760px]">
        <section className="rounded-[12px] border border-[#e5e7eb] bg-white p-6">
          <h2 className="text-[17px] font-bold text-black">Business Details</h2>
          <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Business / Brand Name</span>
              <input
                required
                value={form.businessName}
                onChange={set("businessName")}
                placeholder="e.g. Demo Bulk Co"
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Contact Name</span>
              <input required value={form.contactName} onChange={set("contactName")} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Email</span>
              <input value={email} disabled className={`${inputCls} bg-[#f8f9fb] text-[#6b7280]`} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Phone</span>
              <input
                value={form.phone}
                onChange={set("phone")}
                placeholder="10-digit mobile number"
                className={inputCls}
              />
            </label>
          </div>
        </section>

        <section className="mt-5 rounded-[12px] border border-[#e5e7eb] bg-white p-6">
          <h2 className="text-[17px] font-bold text-black">What do you need?</h2>
          <div className="flex flex-col gap-3 pt-4">
            {lines.map((l, i) => (
              <div key={i} className="rounded-[10px] border border-[#f3f4f6] p-3">
                <div className="grid grid-cols-[1fr_90px_32px] items-center gap-2.5">
                  <input
                    value={l.item}
                    onChange={(e) =>
                      setLines((r) => r.map((x, j) => (j === i ? { ...x, item: e.target.value } : x)))
                    }
                    placeholder="Product, e.g. White Essential T-shirt with front logo"
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min={1}
                    value={l.qty}
                    onChange={(e) =>
                      setLines((r) => r.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)))
                    }
                    placeholder="Qty"
                    className={inputCls}
                  />
                  <Button
                    type="button"
                    aria-label="Remove line"
                    onClick={() => setLines((r) => r.filter((_, j) => j !== i))}
                    disabled={lines.length === 1}
                    className="flex justify-center text-[#dc2626] hover:opacity-70 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  value={l.sizes}
                  onChange={(e) =>
                    setLines((r) => r.map((x, j) => (j === i ? { ...x, sizes: e.target.value } : x)))
                  }
                  placeholder="Size breakdown (optional), e.g. S:50 M:80 L:70"
                  className={`${inputCls} mt-2.5 h-10 text-[13px]`}
                />
              </div>
            ))}
            <Button
              type="button"
              onClick={() => setLines((r) => [...r, { item: "", qty: "", sizes: "" }])}
              className="flex w-fit items-center gap-1.5 text-[13.5px] font-bold text-black hover:underline"
            >
              <Plus className="h-4 w-4" /> Add another product
            </Button>
            {totalQty > 0 && (
              <p className="text-[13px] text-[#6b7280]">
                Total quantity: <span className="font-bold text-black">{totalQty} pieces</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Target Delivery Date (optional)</span>
              <input type="date" value={form.deadline} onChange={set("deadline")} className={inputCls} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 pt-4">
            <span className={labelCls}>Notes (optional)</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={set("notes")}
              placeholder="Print method preferences, fabric, packaging, event date…"
              className="w-full rounded-[8px] border border-[#e5e7eb] p-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
            />
          </label>
        </section>

        <section className="mt-5 rounded-[12px] border border-[#e5e7eb] bg-white p-6">
          <h2 className="text-[17px] font-bold text-black">Artwork (optional)</h2>
          <Button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
            className="mt-4 flex w-full flex-col items-center rounded-[10px] border border-dashed border-[#c4c7c7] bg-[#f8f9fb] px-6 py-8 hover:border-black"
          >
            <CloudUpload className="h-6 w-6 text-[#6b7280]" />
            <span className="pt-2 text-[14px] font-semibold text-black">
              Drag &amp; drop your designs, or click to browse
            </span>
            <span className="pt-1 text-[12px] text-[#9ca3af]">
              PNG, JPG, SVG or PDF · up to 5 files · 25MB each
            </span>
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf,.ai,.eps"
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {files.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-4">
              {files.map((f, i) => (
                <span key={f.preview} className="relative h-20 w-20 overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-[#f3f4f6]">
                  {f.file.type.startsWith("image/") ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={f.preview} alt={f.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-[#6b7280]">
                      {f.name.split(".").pop()?.toUpperCase()}
                    </span>
                  )}
                  <Button
                    type="button"
                    aria-label={`Remove ${f.name}`}
                    onClick={() => setFiles((xs) => xs.filter((_, jj) => jj !== i))}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </span>
              ))}
            </div>
          )}
        </section>

        {error && (
          <p className="mt-4 rounded-[8px] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#ba1a1a]">
            {error}
          </p>
        )}
        <div className="flex items-center gap-3 pt-5">
          <Button
            type="submit"
            disabled={busy}
            className="rounded-[10px] bg-black px-8 py-3.5 text-[14.5px] font-bold text-white hover:opacity-85 disabled:opacity-40"
          >
            {busy ? "Submitting…" : "Submit Request"}
          </Button>
          <Link
            href="/dashboard/quotes"
            className="rounded-[10px] border border-[#c4c7c7] px-8 py-3.5 text-[14.5px] font-bold text-black hover:bg-[#f3f4f6]"
          >
            Cancel
          </Link>
        </div>
        <p className="pt-4 text-[12.5px] text-[#9ca3af]">
          The request lands with our production team — you&apos;ll get an itemized
          proposal here and by email, typically within 24 hours.
        </p>
      </form>
    </AccountShell>
  );
}
