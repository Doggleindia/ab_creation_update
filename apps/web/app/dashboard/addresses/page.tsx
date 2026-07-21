"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import { apiFetch } from "@/lib/auth";

type Address = {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

const EMPTY: Address = {
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

const inputCls =
  "h-11 w-full rounded-[8px] border border-[#c4c7c7] px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";
const labelCls = "text-[12px] font-bold text-[#444748]";

export default function AddressesPage() {
  const [addr, setAddr] = useState<Address>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    apiFetch<{ data: { user: { address?: Partial<Address> | null } } }>(
      "/api/users/profile",
    )
      .then((j) => {
        const a = j.data.user.address;
        if (a?.street || a?.city || a?.pincode) {
          setAddr({
            street: a.street ?? "",
            city: a.city ?? "",
            state: a.state ?? "",
            pincode: a.pincode ?? "",
            country: a.country ?? "India",
          });
          setHasSaved(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setFlash(null);
    setSaving(true);
    try {
      await apiFetch("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({ address: addr }),
      });
      setHasSaved(true);
      setFlash({
        kind: "ok",
        text: "Address saved — checkout will pre-fill it for your next order.",
      });
    } catch (err) {
      setFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not save address",
      });
    } finally {
      setSaving(false);
    }
  }

  const set = (key: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddr((a) => ({ ...a, [key]: e.target.value }));

  return (
    <AccountShell>
      <nav className="flex items-center gap-2 pb-8 text-[13px]">
        <Link href="/" className="text-[#6b7280] hover:text-brand-orange">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
        <Link href="/dashboard" className="text-[#6b7280] hover:text-brand-orange">
          My Account
        </Link>
        <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
        <span className="font-semibold text-black">Addresses</span>
      </nav>

      <h1 className="pb-2 text-[28px] font-bold tracking-[-0.5px] text-black">
        Addresses
      </h1>
      <p className="pb-6 text-[14px] text-[#6b7280]">
        Your default shipping address. It pre-fills checkout and can be changed
        any time.
      </p>

      <section className="max-w-[560px] rounded-[12px] border border-[#e5e7eb] p-6">
        <h2 className="flex items-center gap-2 text-[16px] font-bold text-black">
          <MapPin className="h-4 w-4" />
          {hasSaved ? "Default Shipping Address" : "Add Shipping Address"}
        </h2>
        <form onSubmit={(e) => void save(e)} className="flex flex-col gap-4 pt-5">
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Street Address</span>
            <input
              required
              value={addr.street}
              onChange={set("street")}
              placeholder="House no., building, street, area"
              disabled={loading}
              className={inputCls}
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>City</span>
              <input
                required
                value={addr.city}
                onChange={set("city")}
                disabled={loading}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>State</span>
              <input
                required
                value={addr.state}
                onChange={set("state")}
                disabled={loading}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>PIN Code</span>
              <input
                required
                pattern="\d{6}"
                title="6-digit PIN code"
                value={addr.pincode}
                onChange={set("pincode")}
                disabled={loading}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Country</span>
              <input
                required
                value={addr.country}
                onChange={set("country")}
                disabled={loading}
                className={inputCls}
              />
            </label>
          </div>
          {flash && (
            <p
              className={`w-fit rounded-[8px] px-3 py-2 text-[13px] font-medium ${
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
            disabled={saving || loading}
            className="h-11 w-fit rounded-full bg-black px-8 text-[14px] font-bold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            {saving ? "Saving…" : hasSaved ? "Update Address" : "Save Address"}
          </button>
        </form>
      </section>
    </AccountShell>
  );
}
