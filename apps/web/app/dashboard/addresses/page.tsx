"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Pencil, Plus, Trash2, X } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import { apiFetch, getUser } from "@/lib/auth";

type Address = {
  _id: string;
  label: string;
  name?: string;
  phone?: string;
  street: string;
  line2?: string;
  city: string;
  state?: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
};

type FormState = Omit<Address, "_id" | "isDefault"> & { isDefault: boolean };

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Goa", "Gujarat", "Haryana",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
];

const LABELS = ["Home", "Office", "Other"] as const;

const EMPTY: FormState = {
  label: "Home",
  name: "",
  phone: "",
  street: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
};

const inputCls =
  "h-11 w-full rounded-[8px] border border-[#e5e7eb] px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";
const labelCls = "text-[13px] font-bold text-[#374151]";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    apiFetch<{ data: { addresses: Address[] } }>("/api/users/addresses")
      .then((j) => setAddresses(j.data?.addresses ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  function openNew() {
    setForm({ ...EMPTY, name: getUser()?.name ?? "" });
    setFormError("");
    setEditing("new");
  }

  function openEdit(a: Address) {
    setForm({
      label: a.label,
      name: a.name ?? "",
      phone: a.phone ?? "",
      street: a.street,
      line2: a.line2 ?? "",
      city: a.city,
      state: a.state ?? "",
      pincode: a.pincode,
      country: a.country ?? "India",
      isDefault: !!a.isDefault,
    });
    setFormError("");
    setEditing(a._id);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError("");
    try {
      const j = await apiFetch<{ message: string; data: { addresses: Address[] } }>(
        editing === "new" ? "/api/users/addresses" : `/api/users/addresses/${editing}`,
        { method: editing === "new" ? "POST" : "PUT", body: JSON.stringify(form) },
      );
      setAddresses(j.data?.addresses ?? []);
      setEditing(null);
      setFlash({ kind: "ok", text: j.message ?? "Saved." });
      setTimeout(() => setFlash(null), 3000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function remove(a: Address) {
    if (!window.confirm(`Delete the ${a.label} address? This cannot be undone.`)) return;
    try {
      const j = await apiFetch<{ message: string; data: { addresses: Address[] } }>(
        `/api/users/addresses/${a._id}`,
        { method: "DELETE" },
      );
      setAddresses(j.data?.addresses ?? []);
      setFlash({ kind: "ok", text: j.message });
      setTimeout(() => setFlash(null), 3000);
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Could not delete" });
    }
  }

  async function makeDefault(a: Address) {
    try {
      const j = await apiFetch<{ message: string; data: { addresses: Address[] } }>(
        `/api/users/addresses/${a._id}/default`,
        { method: "PATCH" },
      );
      setAddresses(j.data?.addresses ?? []);
      setFlash({ kind: "ok", text: j.message });
      setTimeout(() => setFlash(null), 3000);
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Could not update" });
    }
  }

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const knownLabel = (LABELS as readonly string[]).includes(form.label);

  // Modal rendered via function call — inline components lose input focus
  const renderModal = () => (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-10"
      onClick={() => setEditing(null)}
    >
      <form
        onSubmit={(e) => void submit(e)}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] rounded-[16px] bg-white p-7"
      >
        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
          <h3 className="text-[22px] font-bold text-black">
            {editing === "new" ? "Add new address" : "Edit address"}
          </h3>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setEditing(null)}
            className="p-1 text-[#6b7280] hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="pt-5 text-[14px] font-semibold text-[#374151]">Save address as</p>
        <div className="flex flex-wrap items-center gap-2.5 pt-2.5">
          {LABELS.map((l) => {
            const active = l === "Other" ? !knownLabel || form.label === "Other" : form.label === l;
            return (
              <button
                key={l}
                type="button"
                onClick={() => setForm((f) => ({ ...f, label: l }))}
                className={`rounded-[8px] px-5 py-2.5 text-[14px] font-bold ${
                  active ? "bg-black text-white" : "bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb]"
                }`}
              >
                {l}
              </button>
            );
          })}
          {(!knownLabel || form.label === "Other") && (
            <input
              value={form.label === "Other" ? "" : form.label}
              onChange={set("label")}
              placeholder="Custom label"
              className="h-11 w-[150px] rounded-[8px] border border-[#e5e7eb] px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
            />
          )}
        </div>

        <div className="flex flex-col gap-4 pt-5">
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Full Name</span>
            <input required value={form.name} onChange={set("name")} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Phone Number</span>
            <div className="flex h-11 overflow-hidden rounded-[8px] border border-[#e5e7eb] focus-within:border-black">
              <span className="flex items-center border-r border-[#e5e7eb] bg-[#f8f9fb] px-3.5 text-[14px] font-semibold text-black">
                +91
              </span>
              <input
                value={form.phone}
                onChange={set("phone")}
                placeholder="98765 43210"
                className="min-w-0 flex-1 px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:outline-none"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Address Line 1</span>
            <input
              required
              value={form.street}
              onChange={set("street")}
              placeholder="House no., building, street, area"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="flex items-baseline justify-between">
              <span className={labelCls}>Address Line 2</span>
              <span className="text-[12px] text-[#9ca3af]">(Optional)</span>
            </span>
            <input
              value={form.line2}
              onChange={set("line2")}
              placeholder="Landmark, colony"
              className={inputCls}
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>City</span>
              <input required value={form.city} onChange={set("city")} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>State</span>
              <div className="relative">
                <select
                  value={form.state}
                  onChange={set("state")}
                  className={`${inputCls} appearance-none`}
                >
                  <option value="">Select state</option>
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
              </div>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>PIN Code</span>
              <input
                required
                pattern="\d{6}"
                title="6-digit PIN code"
                value={form.pincode}
                onChange={set("pincode")}
                placeholder="302021"
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Country</span>
              <input
                value={form.country}
                readOnly
                className={`${inputCls} bg-[#f8f9fb] text-[#6b7280]`}
              />
            </label>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-[14px] font-semibold text-black">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="h-4 w-4 rounded accent-black"
            />
            Make this my default address
          </label>
          {formError && (
            <p className="rounded-[8px] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#ba1a1a]">
              {formError}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 w-full rounded-[10px] bg-black py-4 text-[15px] font-bold uppercase tracking-[1px] text-white hover:opacity-85 disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save Address"}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <AccountShell>
      {editing !== null && renderModal()}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[32px] font-bold tracking-[-0.6px] text-black">Saved Addresses</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-[10px] bg-black px-5 py-3 text-[14px] font-bold text-white hover:opacity-85"
        >
          <Plus className="h-4 w-4" /> Add New Address
        </button>
      </div>

      {flash && (
        <p
          className={`mt-4 w-fit rounded-[8px] px-3.5 py-2.5 text-[13px] font-medium ${
            flash.kind === "ok" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#ba1a1a]"
          }`}
        >
          {flash.text}
        </p>
      )}

      <div className="mt-6 rounded-[12px] border border-[#e5e7eb] bg-white p-6">
        {!loaded ? (
          <p className="py-10 text-center text-[14px] text-[#6b7280]">Loading addresses…</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {addresses.map((a) => (
              <div key={a._id} className="rounded-[10px] border border-dashed border-[#c4c7c7] p-5">
                <div className="flex items-start justify-between">
                  <p className="flex items-center gap-3 text-[17px] font-bold text-black">
                    {a.label}
                    {a.isDefault && (
                      <span className="text-[11px] font-bold uppercase tracking-[1px] text-[#16a34a]">
                        Default
                      </span>
                    )}
                  </p>
                  <span className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(a)}
                      aria-label={`Edit ${a.label} address`}
                      className="p-1.5 text-[#6b7280] hover:text-black"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => void remove(a)}
                      aria-label={`Delete ${a.label} address`}
                      className="p-1.5 text-[#6b7280] hover:text-[#dc2626]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </span>
                </div>
                <div className="pt-3 text-[15px] leading-7">
                  {a.name && <p className="font-bold text-black">{a.name}</p>}
                  <p className="text-[#6b7280]">
                    {[a.street, a.line2].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-[#6b7280]">
                    {[a.city, a.state].filter(Boolean).join(", ")} {a.pincode}
                  </p>
                  <p className="text-[#6b7280]">{a.country ?? "India"}</p>
                  {a.phone && (
                    <p className="pt-2 text-black">
                      Phone: <span className="text-[#374151]">+91 {a.phone}</span>
                    </p>
                  )}
                </div>
                {!a.isDefault && (
                  <button
                    onClick={() => void makeDefault(a)}
                    className="mt-3 border-t border-dashed border-[#e5e7eb] pt-3 text-[14px] font-bold text-black underline underline-offset-4 hover:text-brand-orange"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={openNew}
              className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-[#c4c7c7] text-[#9ca3af] hover:border-black hover:text-black"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f4f6]">
                <Plus className="h-5 w-5" />
              </span>
              <span className="text-[15px] font-semibold">Add New Address</span>
            </button>
          </div>
        )}
      </div>
      <p className="pt-4 text-[12.5px] text-[#9ca3af]">
        Your default address pre-fills checkout automatically.
      </p>
    </AccountShell>
  );
}
