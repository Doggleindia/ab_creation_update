import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiKey,
  FiTrash2,
  FiUserPlus,
  FiShield,
  FiSettings,
  FiBell,
  FiGlobe,
  FiInstagram,
  FiFacebook,
  FiAtSign,
  FiLinkedin,
} from "react-icons/fi";
import Shell, { Card } from "../components/Shell";
import { api, apiForm, getSession, type AdminUser } from "../lib/api";

type AdminRow = { _id: string; name: string; email: string; createdAt?: string };
type Flash = { kind: "ok" | "err"; text: string } | null;

type Settings = {
  business: {
    businessName: string;
    legalName: string;
    email: string;
    phone: string;
    address: string;
    cityState: string;
    pin: string;
    country: string;
    gstin: string;
    pan: string;
  };
  branding: { logoUrl: string; faviconUrl: string; primaryColor: string };
  social: { instagram: string; facebook: string; twitter: string; linkedin: string };
  notifications: {
    applicationDecisions: boolean;
    productDecisions: boolean;
    quoteEmails: boolean;
  };
  language: string;
};

const DEFAULTS: Settings = {
  business: {
    businessName: "AB Creation",
    legalName: "",
    email: "",
    phone: "",
    address: "",
    cityState: "",
    pin: "",
    country: "India",
    gstin: "",
    pan: "",
  },
  branding: { logoUrl: "", faviconUrl: "", primaryColor: "#ff5c00" },
  social: { instagram: "", facebook: "", twitter: "", linkedin: "" },
  notifications: {
    applicationDecisions: true,
    productDecisions: true,
    quoteEmails: true,
  },
  language: "en-IN",
};

function merge(server: Partial<Settings> | null | undefined): Settings {
  const s = server ?? {};
  return {
    business: { ...DEFAULTS.business, ...(s.business ?? {}) },
    branding: { ...DEFAULTS.branding, ...(s.branding ?? {}) },
    social: { ...DEFAULTS.social, ...(s.social ?? {}) },
    notifications: { ...DEFAULTS.notifications, ...(s.notifications ?? {}) },
    language: s.language ?? DEFAULTS.language,
  };
}

const NOTIFICATION_ROWS: {
  key: keyof Settings["notifications"];
  title: string;
  desc: string;
}[] = [
  {
    key: "applicationDecisions",
    title: "Application approval emails",
    desc: "Email approved sellers/bulk buyers their login credentials. When off, the temporary password is shown to you for manual sharing.",
  },
  {
    key: "productDecisions",
    title: "Product review decision emails",
    desc: "Notify sellers when their submission is approved, rejected, or needs changes.",
  },
  {
    key: "quoteEmails",
    title: "Bulk quote emails",
    desc: "Email bulk applicants their quote review link. When off, share the link from the Bulk Orders page manually.",
  },
];

const TABS = [
  { key: "general", label: "General", icon: FiSettings },
  { key: "notifications", label: "Notifications", icon: FiBell },
  { key: "language", label: "Language", icon: FiGlobe },
  { key: "account", label: "Account & Team", icon: FiShield },
] as const;

const inputCls =
  "h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";
const labelCls = "text-[11.5px] font-semibold text-[#374151]";

export default function SettingsPage() {
  const me: AdminUser | null = getSession()?.admin ?? null;
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("general");

  // Business settings
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [saved, setSaved] = useState<Settings>(DEFAULTS);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const favRef = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);

  // Account & team
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwFlash, setPwFlash] = useState<Flash>(null);
  const [invite, setInvite] = useState({ name: "", email: "", password: "" });
  const [inviteBusy, setInviteBusy] = useState(false);
  const [teamFlash, setTeamFlash] = useState<Flash>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    api<{ data: { settings: Partial<Settings>; settingsSavedAt: string | null } }>(
      "/api/site-content/admin",
    )
      .then((j) => {
        setSettings(merge(j.data.settings));
        setSaved(merge(j.data.settings));
        setSavedAt(j.data.settingsSavedAt);
      })
      .catch(() => {});
  }, []);

  const loadAdmins = useCallback(() => {
    api<{ data: { admins: AdminRow[] } }>("/api/admin")
      .then((j) => setAdmins(j.data?.admins ?? []))
      .catch(() => {});
  }, []);
  useEffect(loadAdmins, [loadAdmins]);

  const patch = <K extends keyof Settings>(key: K, value: Partial<Settings[K]> | string) =>
    setSettings((s) => ({
      ...s,
      [key]: typeof value === "string" ? value : { ...(s[key] as object), ...value },
    }));

  async function saveSettings() {
    setBusy(true);
    setFlash(null);
    try {
      const j = await api<{ message: string; data: { settingsSavedAt: string } }>(
        "/api/site-content/admin/settings",
        { method: "PATCH", body: JSON.stringify({ settings }) },
      );
      setSaved(settings);
      setSavedAt(j.data.settingsSavedAt);
      setFlash({ kind: "ok", text: "Settings saved — the storefront refreshes within a minute." });
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Could not save settings" });
    } finally {
      setBusy(false);
    }
  }

  async function uploadBrand(kind: "logo" | "favicon", file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setFlash({ kind: "err", text: "Max file size is 2MB." });
      return;
    }
    setUploading(kind);
    setFlash(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const j = await apiForm<{ data: { url: string } }>("/api/site-content/admin/upload", fd);
      patch("branding", kind === "logo" ? { logoUrl: j.data.url } : { faviconUrl: j.data.url });
      setFlash({ kind: "ok", text: "Uploaded — save changes to apply it to the storefront." });
    } catch (err) {
      setFlash({ kind: "err", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploading(null);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwFlash(null);
    if (pw.next !== pw.confirm) {
      setPwFlash({ kind: "err", text: "New passwords do not match." });
      return;
    }
    setPwBusy(true);
    try {
      const j = await api<{ message: string }>("/api/admin/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      setPwFlash({ kind: "ok", text: j.message });
      setPw({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not change password",
      });
    } finally {
      setPwBusy(false);
    }
  }

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault();
    setTeamFlash(null);
    setInviteBusy(true);
    try {
      const j = await api<{ message: string }>("/api/admin/signup", {
        method: "POST",
        body: JSON.stringify(invite),
      });
      setTeamFlash({
        kind: "ok",
        text: `${j.message} Share the credentials with ${invite.name} securely.`,
      });
      setInvite({ name: "", email: "", password: "" });
      loadAdmins();
    } catch (err) {
      setTeamFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not add admin",
      });
    } finally {
      setInviteBusy(false);
    }
  }

  async function removeAdmin(a: AdminRow) {
    if (!window.confirm(`Remove admin access for ${a.name} (${a.email})?`)) return;
    setBusyId(a._id);
    setTeamFlash(null);
    try {
      await api(`/api/admin/${a._id}`, { method: "DELETE" });
      loadAdmins();
    } catch (err) {
      setTeamFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not remove admin",
      });
    } finally {
      setBusyId(null);
    }
  }

  const FlashMsg = (f: Flash) =>
    f ? (
      <p
        className={`w-fit rounded-lg px-3 py-2 text-[12.5px] font-medium ${
          f.kind === "ok" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#ba1a1a]"
        }`}
      >
        {f.text}
      </p>
    ) : null;

  const socialRows = [
    { key: "instagram" as const, icon: FiInstagram, placeholder: "Instagram URL" },
    { key: "facebook" as const, icon: FiFacebook, placeholder: "Facebook URL" },
    { key: "twitter" as const, icon: FiAtSign, placeholder: "Twitter (X) URL" },
    { key: "linkedin" as const, icon: FiLinkedin, placeholder: "LinkedIn URL" },
  ];

  return (
    <Shell
      title="Settings"
      subtitle={
        savedAt
          ? `Last saved: ${new Date(savedAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}`
          : "Business, branding and console configuration."
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[210px_1fr]">
        {/* Sub-nav */}
        <div className="flex h-fit flex-row gap-1 lg:flex-col">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-[13.5px] font-semibold ${
                tab === key
                  ? "bg-[#e9eaec] text-black"
                  : "text-[#6b7280] hover:bg-[#f3f4f6] hover:text-black"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* ---- General ---- */}
        {tab === "general" && (
          <div className="flex flex-col gap-6">
            <Card className="p-6">
              <h2 className="text-[17px] font-bold text-black">Business Information</h2>
              <div className="grid grid-cols-1 gap-4 pt-5 md:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Business Name</span>
                  <input
                    value={settings.business.businessName}
                    onChange={(e) => patch("business", { businessName: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Legal Name</span>
                  <input
                    value={settings.business.legalName}
                    onChange={(e) => patch("business", { legalName: e.target.value })}
                    placeholder="Enter legal business name"
                    className={inputCls}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Email</span>
                  <input
                    type="email"
                    value={settings.business.email}
                    onChange={(e) => patch("business", { email: e.target.value })}
                    placeholder="hello@abcreation.com"
                    className={inputCls}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Phone</span>
                  <input
                    value={settings.business.phone}
                    onChange={(e) => patch("business", { phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className={inputCls}
                  />
                </label>
                <label className="flex flex-col gap-1.5 md:col-span-2">
                  <span className={labelCls}>Address</span>
                  <textarea
                    rows={2}
                    value={settings.business.address}
                    onChange={(e) => patch("business", { address: e.target.value })}
                    placeholder="Street, building, area"
                    className="w-full rounded-lg border border-[#e5e7eb] p-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>City / State</span>
                  <input
                    value={settings.business.cityState}
                    onChange={(e) => patch("business", { cityState: e.target.value })}
                    placeholder="Hyderabad, Telangana"
                    className={inputCls}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>PIN</span>
                    <input
                      value={settings.business.pin}
                      onChange={(e) => patch("business", { pin: e.target.value })}
                      placeholder="500033"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Country</span>
                    <input
                      value={settings.business.country}
                      readOnly
                      className={`${inputCls} bg-[#f3f4f6] text-[#6b7280]`}
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>GSTIN</span>
                  <input
                    value={settings.business.gstin}
                    onChange={(e) => patch("business", { gstin: e.target.value })}
                    placeholder="36AAAAA0000A1Z5"
                    className={inputCls}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>PAN Number</span>
                  <input
                    value={settings.business.pan}
                    onChange={(e) => patch("business", { pan: e.target.value })}
                    placeholder="AAAAA0000A"
                    className={inputCls}
                  />
                </label>
              </div>
              <p className="pt-4 text-[12px] text-[#9ca3af]">
                Email, phone and address appear on the storefront footer and Contact page.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-[17px] font-bold text-black">Branding</h2>
              <div className="grid grid-cols-1 gap-8 pt-5 md:grid-cols-2">
                <div>
                  <p className={labelCls}>Site Logo</p>
                  <div className="flex items-center gap-4 pt-2.5">
                    <span className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f8f9fb] p-2">
                      {settings.branding.logoUrl ? (
                        <img src={settings.branding.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[11px] font-bold text-black">AB CREATION</span>
                      )}
                    </span>
                    <div>
                      <input
                        ref={logoRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void uploadBrand("logo", f);
                        }}
                      />
                      <button
                        onClick={() => logoRef.current?.click()}
                        disabled={uploading === "logo"}
                        className="rounded-lg bg-black px-5 py-2.5 text-[13px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                      >
                        {uploading === "logo" ? "Uploading…" : "Change Logo"}
                      </button>
                      <p className="pt-1.5 text-[11.5px] text-[#9ca3af]">
                        SVG or high-res PNG. Max file size: 2MB.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  <div>
                    <p className={labelCls}>Favicon</p>
                    <div className="flex items-center gap-3 pt-2.5">
                      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f8f9fb]">
                        {settings.branding.faviconUrl ? (
                          <img src={settings.branding.faviconUrl} alt="Favicon" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[10px] font-bold text-black">AB</span>
                        )}
                      </span>
                      <input
                        ref={favRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void uploadBrand("favicon", f);
                        }}
                      />
                      <button
                        onClick={() => favRef.current?.click()}
                        disabled={uploading === "favicon"}
                        className="text-[13px] font-bold text-black underline hover:text-[#b45309] disabled:opacity-40"
                      >
                        {uploading === "favicon" ? "Uploading…" : "Upload New"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className={labelCls}>Primary Brand Color</p>
                    <div className="flex items-center gap-3 pt-2.5">
                      <input
                        type="color"
                        value={settings.branding.primaryColor}
                        onChange={(e) => patch("branding", { primaryColor: e.target.value })}
                        aria-label="Primary brand color"
                        className="h-10 w-10 cursor-pointer rounded-lg border border-[#e5e7eb]"
                      />
                      <input
                        value={settings.branding.primaryColor}
                        onChange={(e) => patch("branding", { primaryColor: e.target.value })}
                        className="h-10 w-[110px] rounded-lg border border-[#e5e7eb] px-3 font-mono text-[13px] text-black focus:border-black focus:outline-none"
                      />
                    </div>
                    <p className="pt-1.5 text-[11.5px] text-[#9ca3af]">
                      Drives the storefront&apos;s CTA colour (default #ff5c00).
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-[17px] font-bold text-black">Social Links</h2>
              <div className="flex flex-col gap-3 pt-5">
                {socialRows.map(({ key, icon: Icon, placeholder }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#374151]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      value={settings.social[key]}
                      onChange={(e) => patch("social", { [key]: e.target.value })}
                      placeholder={placeholder}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
              <p className="pt-4 text-[12px] text-[#9ca3af]">
                Icons appear in the storefront footer — only links you fill in are shown.
              </p>
            </Card>
          </div>
        )}

        {/* ---- Notifications ---- */}
        {tab === "notifications" && (
          <Card className="h-fit p-6">
            <h2 className="text-[17px] font-bold text-black">Email Notifications</h2>
            <p className="pt-1 text-[13px] text-[#6b7280]">
              These control the automated emails the platform actually sends.
            </p>
            <div className="flex flex-col divide-y divide-[#f3f4f6] pt-3">
              {NOTIFICATION_ROWS.map(({ key, title, desc }) => {
                const on = settings.notifications[key];
                return (
                  <div key={key} className="flex items-start justify-between gap-6 py-4">
                    <div>
                      <p className="text-[14px] font-bold text-black">{title}</p>
                      <p className="pt-1 max-w-[520px] text-[12.5px] leading-5 text-[#6b7280]">{desc}</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={on}
                      aria-label={title}
                      onClick={() => patch("notifications", { [key]: !on })}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                        on ? "bg-[#22c55e]" : "bg-[#d1d5db]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                          on ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* ---- Language ---- */}
        {tab === "language" && (
          <Card className="h-fit p-6">
            <h2 className="text-[17px] font-bold text-black">Language</h2>
            <label className="mt-5 flex max-w-[320px] flex-col gap-1.5">
              <span className={labelCls}>Storefront Language</span>
              <select
                value={settings.language}
                onChange={(e) => patch("language", e.target.value)}
                className={inputCls}
              >
                <option value="en-IN">English (India)</option>
              </select>
            </label>
            <p className="pt-3 max-w-[480px] text-[12.5px] leading-5 text-[#6b7280]">
              The storefront currently ships in English only — additional languages
              need translated content before they can be offered here, so no other
              options are listed yet.
            </p>
          </Card>
        )}

        {/* ---- Account & Team ---- */}
        {tab === "account" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="flex flex-col gap-6">
              <Card className="p-6">
                <h2 className="flex items-center gap-2 text-[15px] font-bold text-black">
                  <FiShield /> My Account
                </h2>
                <div className="flex items-center gap-4 pt-5">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-[20px] font-bold text-white">
                    {(me?.name || "A").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-[16px] font-bold text-black">{me?.name}</p>
                    <p className="text-[13px] text-[#6b7280]">{me?.email}</p>
                    <p className="pt-1 text-[11px] font-bold uppercase tracking-[0.6px] text-[#b45309]">
                      Administrator
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="flex items-center gap-2 text-[15px] font-bold text-black">
                  <FiKey /> Change Password
                </h2>
                <form onSubmit={(e) => void changePassword(e)} className="flex flex-col gap-4 pt-5">
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Current Password</span>
                    <input
                      type="password"
                      required
                      value={pw.current}
                      onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
                      className={inputCls}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5">
                      <span className={labelCls}>New Password</span>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={pw.next}
                        onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                        className={inputCls}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelCls}>Confirm New Password</span>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={pw.confirm}
                        onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                        className={inputCls}
                      />
                    </label>
                  </div>
                  {FlashMsg(pwFlash)}
                  <button
                    type="submit"
                    disabled={pwBusy}
                    className="h-10 w-fit rounded-lg bg-black px-6 text-[13px] font-bold text-white hover:opacity-85 disabled:opacity-40"
                  >
                    {pwBusy ? "Saving…" : "Update Password"}
                  </button>
                </form>
              </Card>
            </div>

            <Card className="h-fit p-6">
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-black">
                <FiUserPlus /> Console Admins
              </h2>
              <div className="flex flex-col divide-y divide-[#f3f4f6] pt-3">
                {admins.map((a) => (
                  <div key={a._id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] text-[13px] font-bold text-black">
                        {(a.name || "A").charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13.5px] font-bold text-black">
                          {a.name}
                          {me?.id === a._id && (
                            <span className="pl-2 text-[11px] font-bold text-[#b45309]">(you)</span>
                          )}
                        </span>
                        <span className="block truncate text-[12px] text-[#6b7280]">{a.email}</span>
                      </span>
                    </div>
                    {me?.id !== a._id && (
                      <button
                        aria-label={`Remove ${a.name}`}
                        onClick={() => void removeAdmin(a)}
                        disabled={busyId === a._id}
                        className="text-[#dc2626] hover:opacity-70 disabled:opacity-40"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <h3 className="border-t border-[#f3f4f6] pt-5 text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7280]">
                Add Admin
              </h3>
              <form onSubmit={(e) => void addAdmin(e)} className="flex flex-col gap-3 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Full name"
                    value={invite.name}
                    onChange={(e) => setInvite((v) => ({ ...v, name: e.target.value }))}
                    className={inputCls}
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email"
                    value={invite.email}
                    onChange={(e) => setInvite((v) => ({ ...v, email: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <input
                  required
                  type="password"
                  minLength={6}
                  placeholder="Temporary password (share securely)"
                  value={invite.password}
                  onChange={(e) => setInvite((v) => ({ ...v, password: e.target.value }))}
                  className={inputCls}
                />
                {FlashMsg(teamFlash)}
                <button
                  type="submit"
                  disabled={inviteBusy}
                  className="h-10 w-fit rounded-lg border border-black px-6 text-[13px] font-bold text-black hover:bg-[#f3f4f6] disabled:opacity-40"
                >
                  {inviteBusy ? "Adding…" : "Add Admin"}
                </button>
              </form>
            </Card>
          </div>
        )}
      </div>

      {/* Save bar for settings tabs */}
      {tab !== "account" && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e7eb] pt-5">
          <span>{FlashMsg(flash)}</span>
          <span className="flex items-center gap-3">
            <button
              onClick={() => setSettings(saved)}
              disabled={busy || !dirty}
              className="rounded-lg px-4 py-2.5 text-[13.5px] font-bold text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-40"
            >
              Discard all changes
            </button>
            <button
              onClick={() => void saveSettings()}
              disabled={busy || !dirty}
              className="rounded-lg bg-black px-6 py-2.5 text-[13.5px] font-bold text-white hover:opacity-85 disabled:opacity-40"
            >
              {busy ? "Saving…" : "Save Changes"}
            </button>
          </span>
        </div>
      )}
    </Shell>
  );
}
