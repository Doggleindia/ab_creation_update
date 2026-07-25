"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import { apiFetch } from "@/lib/auth";

type Address = {
  _id: string;
  label: string;
  name?: string;
  phone?: string;
  street: string;
  city: string;
  state?: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
};

type FormState = Omit<Address, "_id" | "isDefault">;

const EMPTY: FormState = {
  label: "Home",
  name: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

const inputCls =
  "h-11 w-full rounded-[8px] border border-[#e5e7eb] px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";
const labelCls = "text-[12px] font-bold text-[#444748]";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = () =>
    apiFetch<{ data: { addresses: Address[] } }>("/api/users/addresses")
      .then((j) => setAddresses(j.data?.addresses ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));

  useEffect(() => {
    void load();
  }, []);

  function openNew() {
    setForm(EMPTY);
    setEditing("new");
    setFlash(null);
  }

  function openEdit(a: Address) {
    setForm({
      label: a.label,
      name: a.name ?? "",
      phone: a.phone ?? "",
      street: a.street,
      city: a.city,
      state: a.state ?? "",
      pincode: a.pincode,
      country: a.country ?? "India",
    });
    setEditing(a._id);
    setFlash(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFlash(null);
    try {
      const j = await apiFetch<{ message: string; data: { addresses: Address[] } }>(
        editing === "new" ? "/api/users/addresses" : `/api/users/addresses/${editing}`,
        {
          method: editing === "new" ? "POST" : "PUT",
          body: JSON.stringify(form),
        },
      );
      setAddresses(j.data?.addresses ?? []);
      setEditing(null);
      setFlash({ kind: "ok", text: j.message ?? "Saved." });
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Could not save" });
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
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Could not update" });
    }
  }

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // Rendered via function call — inline components lose input focus
  const renderForm = () => (
    <form
      onSubmit={(e) => void submit(e)}
      className="rounded-[12px] border-2 border-black bg-white p-6"
    >
      <h2 className="text-[17px] font-bold text-black">
        {editing === "new" ? "Add New Address" : "Edit Address"}
      </h2>
      <div className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Label</span>
          <input
            required
            value={form.label}
            onChange={set("label")}
            placeholder="Home / Office"
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Full Name</span>
          <input value={form.name} onChange={set("name")} className={inputCls} />
        </label>
        <label className="col-span-full flex flex-col gap-1.5">
          <span className={labelCls}>Street Address</span>
          <input
            required
            value={form.street}
            onChange={set("street")}
            placeholder="House no., building, street, area"
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>City</span>
          <input required value={form.city} onChange={set("city")} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>State</span>
          <input value={form.state} onChange={set("state")} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>PIN Code</span>
          <input
            required
            pattern="\d{6}"
            title="6-digit PIN code"
            value={form.pincode}
            onChange={set("pincode")}
            className={inputCls}
          />
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
      <div className="flex gap-3 pt-5">
        <button
          type="submit"
          disabled={busy}
          className="rounded-[8px] bg-black px-7 py-2.5 text-[13px] font-bold text-white hover:opacity-85 disabled:opacity-40"
        >
          {busy ? "Saving…" : "Save Address"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="rounded-[8px] border border-[#c4c7c7] px-7 py-2.5 text-[13px] font-bold text-black hover:bg-[#f3f4f6]"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <AccountShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[32px] font-bold tracking-[-0.6px] text-black">
          Saved Addresses
        </h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-[10px] border border-[#c4c7c7] bg-white px-5 py-3 text-[14px] font-bold text-black hover:border-black"
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
            {addresses.map((a) =>
              editing === a._id ? (
                <div key={a._id} className="lg:col-span-2">
                  {renderForm()}
                </div>
              ) : (
                <div
                  key={a._id}
                  className="rounded-[10px] border border-dashed border-[#c4c7c7] p-5"
                >
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
                    <p className="text-[#6b7280]">{a.street}</p>
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
              ),
            )}

            {editing === "new" ? (
              <div className="lg:col-span-2">{renderForm()}</div>
            ) : (
              <button
                onClick={openNew}
                className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-[#c4c7c7] text-[#9ca3af] hover:border-black hover:text-black"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f4f6]">
                  <Plus className="h-5 w-5" />
                </span>
                <span className="text-[15px] font-semibold">Add New Address</span>
              </button>
            )}
          </div>
        )}
      </div>
      <p className="pt-4 text-[12.5px] text-[#9ca3af]">
        Your default address pre-fills checkout automatically.
      </p>
    </AccountShell>
  );
}
