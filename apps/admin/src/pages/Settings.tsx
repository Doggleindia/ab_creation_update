import { useCallback, useEffect, useState } from "react";
import { FiKey, FiTrash2, FiUserPlus, FiShield } from "react-icons/fi";
import Shell, { Card } from "../components/Shell";
import { api, getSession, type AdminUser } from "../lib/api";

type AdminRow = { _id: string; name: string; email: string; createdAt?: string };

export default function Settings() {
  const me: AdminUser | null = getSession()?.admin ?? null;
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwFlash, setPwFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [invite, setInvite] = useState({ name: "", email: "", password: "" });
  const [inviteBusy, setInviteBusy] = useState(false);
  const [teamFlash, setTeamFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    api<{ data: { admins: AdminRow[] } }>("/api/admin")
      .then((j) => setAdmins(j.data?.admins ?? []))
      .catch(() => {});
  }, []);
  useEffect(load, [load]);

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
        body: JSON.stringify({
          currentPassword: pw.current,
          newPassword: pw.next,
        }),
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
      load();
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
    if (!window.confirm(`Remove admin access for ${a.name} (${a.email})? They will no longer be able to log in to this console.`)) return;
    setBusyId(a._id);
    setTeamFlash(null);
    try {
      await api(`/api/admin/${a._id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setTeamFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not remove admin",
      });
    } finally {
      setBusyId(null);
    }
  }

  const inputCls =
    "h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";
  const labelCls = "text-[11.5px] font-semibold text-[#374151]";

  return (
    <Shell title="Settings" subtitle="Your account and console access.">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Profile + password */}
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
              {pwFlash && (
                <p
                  className={`w-fit rounded-lg px-3 py-2 text-[12.5px] font-medium ${
                    pwFlash.kind === "ok"
                      ? "bg-[#dcfce7] text-[#166534]"
                      : "bg-[#fee2e2] text-[#ba1a1a]"
                  }`}
                >
                  {pwFlash.text}
                </p>
              )}
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

        {/* Team */}
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
            {teamFlash && (
              <p
                className={`w-fit rounded-lg px-3 py-2 text-[12.5px] font-medium ${
                  teamFlash.kind === "ok"
                    ? "bg-[#dcfce7] text-[#166534]"
                    : "bg-[#fee2e2] text-[#ba1a1a]"
                }`}
              >
                {teamFlash.text}
              </p>
            )}
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
    </Shell>
  );
}
