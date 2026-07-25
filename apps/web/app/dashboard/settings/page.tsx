"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Pencil, X } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import { apiFetch, logout, updateCachedUser } from "@/lib/auth";

type Prefs = {
  orderUpdates: boolean;
  promotionalEmails: boolean;
  designReminders: boolean;
  smsUpdates: boolean;
};

type Profile = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string | null;
  avatar: string | null;
  notificationPrefs: Prefs;
};

type Flash = { kind: "ok" | "err"; text: string } | null;

const inputCls =
  "h-11 w-full rounded-[8px] border border-[#e5e7eb] px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";
const viewLabel = "text-[11px] font-bold uppercase tracking-[1.5px] text-[#9ca3af]";

const GENDERS = [
  { value: "", label: "Prefer not to say" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function AccountSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", gender: "", dob: "" });
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);

  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwFlash, setPwFlash] = useState<Flash>(null);

  const [deleting, setDeleting] = useState(false);
  const [delPw, setDelPw] = useState("");
  const [delBusy, setDelBusy] = useState(false);
  const [delError, setDelError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    apiFetch<{ data: { user: Profile & { dateOfBirth?: string | null } } }>(
      "/api/users/profile",
    )
      .then((j) => {
        const u = j.data.user;
        setProfile({
          id: u.id,
          name: u.name ?? "",
          email: u.email ?? "",
          phone: u.phone ?? "",
          gender: u.gender ?? "",
          dateOfBirth: u.dateOfBirth ?? null,
          avatar: u.avatar ?? null,
          notificationPrefs: u.notificationPrefs ?? {
            orderUpdates: true,
            promotionalEmails: false,
            designReminders: true,
            smsUpdates: true,
          },
        });
        if (u.avatar) updateCachedUser({ avatar: u.avatar });
      })
      .catch(() => {});
  }, []);

  const ok = (text: string) => {
    setFlash({ kind: "ok", text });
    setTimeout(() => setFlash(null), 3000);
  };

  function startEdit() {
    if (!profile) return;
    setForm({
      name: profile.name,
      phone: profile.phone ?? "",
      gender: profile.gender ?? "",
      dob: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
    });
    setEditing(true);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const phone = form.phone.replace(/\D/g, "");
    if (phone && phone.length !== 10) {
      setFlash({ kind: "err", text: "Phone must be a 10-digit number." });
      return;
    }
    setSaving(true);
    setFlash(null);
    try {
      const j = await apiFetch<{ data: { user: Profile } }>("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: form.name.trim(),
          phone: phone || undefined,
          gender: form.gender,
          dateOfBirth: form.dob || null,
        }),
      });
      const u = j.data.user;
      setProfile((p) => (p ? { ...p, ...u, phone: u.phone ?? "" } : p));
      updateCachedUser({ name: form.name.trim() });
      setEditing(false);
      ok("Profile updated.");
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Could not save" });
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    setFlash(null);
    try {
      const fd = new FormData();
      fd.append("avatar", file, file.name);
      const j = await apiFetch<{ data: { avatar: string } }>("/api/users/avatar", {
        method: "POST",
        body: fd,
      });
      setProfile((p) => (p ? { ...p, avatar: j.data.avatar } : p));
      updateCachedUser({ avatar: j.data.avatar });
      ok("Profile photo updated.");
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  async function savePref(key: keyof Prefs, value: boolean) {
    if (!profile) return;
    const prev = profile.notificationPrefs;
    setProfile({ ...profile, notificationPrefs: { ...prev, [key]: value } });
    try {
      await apiFetch("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({ notificationPrefs: { [key]: value } }),
      });
    } catch {
      setProfile((p) => (p ? { ...p, notificationPrefs: prev } : p));
      setFlash({ kind: "err", text: "Could not save the preference — try again." });
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwFlash(null);
    if (pw.next !== pw.confirm) {
      setPwFlash({ kind: "err", text: "New passwords do not match." });
      return;
    }
    setSavingPw(true);
    try {
      const j = await apiFetch<{ message: string }>("/api/users/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      setPwFlash({ kind: "ok", text: j.message ?? "Password changed." });
      setPw({ current: "", next: "", confirm: "" });
      setPwOpen(false);
    } catch (err) {
      setPwFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not change password",
      });
    } finally {
      setSavingPw(false);
    }
  }

  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDelBusy(true);
    setDelError("");
    try {
      await apiFetch("/api/users/account", {
        method: "DELETE",
        body: JSON.stringify({ password: delPw }),
      });
      await logout();
      router.push("/");
    } catch (err) {
      setDelError(err instanceof Error ? err.message : "Could not delete the account");
      setDelBusy(false);
    }
  }

  const renderFlash = (f: Flash) =>
    f ? (
      <p
        className={`w-fit rounded-[8px] px-3.5 py-2.5 text-[13px] font-medium ${
          f.kind === "ok" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#ba1a1a]"
        }`}
      >
        {f.text}
      </p>
    ) : null;

  const dobDisplay = profile?.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const TOGGLES: {
    key: keyof Prefs;
    title: string;
    sub: string;
    available: boolean;
  }[] = [
    {
      key: "orderUpdates",
      title: "Order Updates",
      sub: "Email when your order ships and when it's delivered.",
      available: true,
    },
    {
      key: "promotionalEmails",
      title: "Promotional Emails",
      sub: "Offers, discounts, and new product launches.",
      available: true,
    },
    {
      key: "designReminders",
      title: "Design Reminders",
      sub: "Reminders about saved designs you haven't ordered — coming soon.",
      available: false,
    },
    {
      key: "smsUpdates",
      title: "SMS Notifications",
      sub: "Order updates via SMS — coming soon.",
      available: false,
    },
  ];

  return (
    <AccountShell>
      <h1 className="text-[32px] font-bold tracking-[-0.6px] text-black">
        Account Settings
      </h1>

      {/* Profile information */}
      <section className="mt-6 rounded-[12px] border border-[#e5e7eb] bg-white p-7">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-black">Profile Information</h2>
          {!editing && (
            <button
              onClick={startEdit}
              disabled={!profile}
              className="flex items-center gap-1.5 text-[14px] font-bold text-black hover:text-brand-orange disabled:opacity-40"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>

        <div className="flex items-center gap-5 pt-6">
          {profile?.avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element -- user avatar on S3 */
            <img
              src={profile.avatar}
              alt=""
              className="h-[72px] w-[72px] rounded-full border border-[#e5e7eb] object-cover"
            />
          ) : (
            <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-brand-ink text-[26px] font-bold text-white">
              {(profile?.name || "?").charAt(0).toUpperCase()}
            </span>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-[15px] font-bold text-black hover:text-brand-orange disabled:opacity-40"
          >
            {uploading ? "Uploading…" : "Change Photo"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadPhoto(f);
              e.target.value = "";
            }}
          />
        </div>

        {editing ? (
          <form onSubmit={(e) => void saveProfile(e)} className="pt-7">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={viewLabel}>Full Name</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={viewLabel}>Email</span>
                <input
                  value={profile?.email ?? ""}
                  disabled
                  className={`${inputCls} bg-[#f8f9fb] text-[#6b7280]`}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={viewLabel}>Phone</span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="10-digit mobile number"
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={viewLabel}>Gender</span>
                <select
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  className={inputCls}
                >
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={viewLabel}>Date of Birth</span>
                <input
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={form.dob}
                  onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                  className={inputCls}
                />
              </label>
            </div>
            <div className="pt-4">{renderFlash(flash)}</div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-[8px] bg-black px-7 py-2.5 text-[13.5px] font-bold text-white hover:opacity-85 disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-[8px] border border-[#c4c7c7] px-7 py-2.5 text-[13.5px] font-bold text-black hover:bg-[#f3f4f6]"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-x-10 gap-y-6 pt-7 sm:grid-cols-2">
              <div>
                <p className={viewLabel}>Full Name</p>
                <p className="pt-1 text-[16px] font-semibold text-black">
                  {profile?.name ?? "…"}
                </p>
              </div>
              <div>
                <p className={viewLabel}>Email</p>
                <p className="pt-1 text-[16px] font-semibold text-black">
                  {profile?.email ?? "…"}
                </p>
              </div>
              <div>
                <p className={viewLabel}>Phone</p>
                <p className="pt-1 text-[16px] font-semibold text-black">
                  {profile?.phone ? `+91 ${profile.phone}` : "—"}
                </p>
              </div>
              <div>
                <p className={viewLabel}>Gender</p>
                <p className="pt-1 text-[16px] font-semibold capitalize text-black">
                  {profile?.gender || "—"}
                </p>
              </div>
              <div>
                <p className={viewLabel}>Date of Birth</p>
                <p className="pt-1 text-[16px] font-semibold text-black">{dobDisplay}</p>
              </div>
            </div>
            <div className="pt-4">{renderFlash(flash)}</div>
          </>
        )}
      </section>

      {/* Password & security */}
      <section className="mt-6 rounded-[12px] border border-[#e5e7eb] bg-white p-7">
        <h2 className="text-[20px] font-bold text-black">Password &amp; Security</h2>
        <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-4 pt-5">
          <div>
            <p className={viewLabel}>Password</p>
            <p className="pt-1 text-[18px] font-bold tracking-[3px] text-black">
              ••••••••••
            </p>
          </div>
          <button
            onClick={() => setPwOpen((v) => !v)}
            className="text-[14.5px] font-bold text-black hover:text-brand-orange"
          >
            {pwOpen ? "Close" : "Change Password"}
          </button>
        </div>

        {pwOpen && (
          <form onSubmit={(e) => void changePassword(e)} className="pt-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className={viewLabel}>Current Password</span>
                <input
                  type="password"
                  required
                  value={pw.current}
                  onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={viewLabel}>New Password</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={pw.next}
                  onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={viewLabel}>Confirm New Password</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={pw.confirm}
                  onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                  className={inputCls}
                />
              </label>
            </div>
            <div className="pt-4">{renderFlash(pwFlash)}</div>
            <button
              type="submit"
              disabled={savingPw}
              className="mt-2 rounded-[8px] bg-black px-7 py-2.5 text-[13.5px] font-bold text-white hover:opacity-85 disabled:opacity-40"
            >
              {savingPw ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
        {!pwOpen && renderFlash(pwFlash)}

        <div className="mt-5 flex gap-3 rounded-[10px] bg-[#f3f4f6] p-4">
          <Info className="h-4 w-4 shrink-0 text-[#6b7280]" />
          <p className="text-[13.5px] leading-6 text-[#374151]">
            <span className="font-bold text-black">Security Hint:</span> At least 8
            characters, one uppercase, one number. We recommend changing your
            password every 6 months for better security.
          </p>
        </div>
      </section>

      {/* Notification preferences */}
      <section className="mt-6 rounded-[12px] border border-[#e5e7eb] bg-white p-7">
        <h2 className="text-[20px] font-bold text-black">Notification Preferences</h2>
        <div className="flex flex-col divide-y divide-[#f3f4f6] pt-3">
          {TOGGLES.map((t) => {
            const on = profile?.notificationPrefs[t.key] ?? false;
            return (
              <div key={t.key} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p
                    className={`text-[15.5px] font-bold ${t.available ? "text-black" : "text-[#9ca3af]"}`}
                  >
                    {t.title}
                  </p>
                  <p className="text-[13.5px] text-[#6b7280]">{t.sub}</p>
                </div>
                <button
                  role="switch"
                  aria-checked={on && t.available}
                  aria-label={t.title}
                  disabled={!profile || !t.available}
                  onClick={() => void savePref(t.key, !on)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed ${
                    t.available && on ? "bg-[#22c55e]" : "bg-[#d1d5db]"
                  } ${!t.available ? "opacity-50" : ""}`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                      t.available && on ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Danger zone */}
      <section className="mt-6 rounded-[12px] border border-[#fecaca] bg-[#fef2f2] p-7">
        <h2 className="text-[20px] font-bold text-[#dc2626]">Danger Zone</h2>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
          <p className="max-w-[560px] text-[14px] leading-6 text-[#b91c1c]">
            Permanently delete your account. Your login, profile, wallet and
            addresses are removed; order records are retained for compliance.
            This action cannot be undone.
          </p>
          <button
            onClick={() => {
              setDeleting(true);
              setDelPw("");
              setDelError("");
            }}
            className="rounded-[8px] border-2 border-[#dc2626] px-6 py-2.5 text-[14px] font-bold text-[#dc2626] hover:bg-[#dc2626] hover:text-white"
          >
            Delete My Account
          </button>
        </div>
      </section>

      {/* Delete confirmation modal */}
      {deleting && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-16"
          onClick={() => !delBusy && setDeleting(false)}
        >
          <form
            onSubmit={(e) => void deleteAccount(e)}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] rounded-[16px] bg-white p-7"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] font-bold text-[#dc2626]">Delete Account</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setDeleting(false)}
                className="p-1 text-[#6b7280] hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="pt-3 text-[14px] leading-6 text-[#374151]">
              This permanently deletes your account
              {profile?.email ? ` (${profile.email})` : ""}. Enter your password to
              confirm. If your wallet still has a balance, deletion is blocked until
              you spend or withdraw it.
            </p>
            <label className="flex flex-col gap-1.5 pt-5">
              <span className={viewLabel}>Password</span>
              <input
                type="password"
                required
                autoFocus
                value={delPw}
                onChange={(e) => setDelPw(e.target.value)}
                className={inputCls}
              />
            </label>
            {delError && (
              <p className="mt-4 rounded-[8px] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#ba1a1a]">
                {delError}
              </p>
            )}
            <button
              type="submit"
              disabled={delBusy || !delPw}
              className="mt-5 w-full rounded-[10px] bg-[#dc2626] py-3.5 text-[14.5px] font-bold text-white hover:opacity-90 disabled:opacity-40"
            >
              {delBusy ? "Deleting…" : "Permanently Delete My Account"}
            </button>
          </form>
        </div>
      )}

      <p className="pt-8 text-center text-[13px] text-[#9ca3af]">
        Logged in as {profile?.email ?? "…"}
        {profile?.id ? ` · ID: ${profile.id.slice(-6).toUpperCase()}` : ""}
      </p>
    </AccountShell>
  );
}
