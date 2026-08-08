"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, Landmark, UserRound } from "lucide-react";
import SellerShell from "@/components/seller/SellerShell";
import { apiFetch, updateCachedUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

type Flash = { kind: "ok" | "err"; text: string } | null;

const inputCls =
  "h-11 w-full rounded-[8px] border border-[#e5e7eb] px-3.5 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";
const labelCls = "text-[12px] font-bold text-[#444748]";

export default function SellerSettingsPage() {
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [email, setEmail] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFlash, setProfileFlash] = useState<Flash>(null);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwFlash, setPwFlash] = useState<Flash>(null);

  const [bankLast4, setBankLast4] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: { user: { name?: string; email?: string; phone?: string | null } } }>(
      "/api/users/profile",
    )
      .then((j) => {
        const u = j.data.user;
        setProfile({ name: u.name ?? "", phone: u.phone ?? "" });
        setEmail(u.email ?? "");
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
    // Bank last4 surfaces on past payout requests (snapshot of the account on file)
    apiFetch<{ data: { requests: { bank?: { accountLast4?: string } }[] } }>(
      "/api/wallet/payout-requests",
    )
      .then((j) => {
        const last4 = (j.data?.requests ?? []).find((r) => r.bank?.accountLast4)?.bank
          ?.accountLast4;
        setBankLast4(last4 ?? null);
      })
      .catch(() => {});
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileFlash(null);
    const phone = profile.phone.replace(/\D/g, "");
    if (phone && phone.length !== 10) {
      setProfileFlash({ kind: "err", text: "Phone must be a 10-digit number." });
      return;
    }
    setSavingProfile(true);
    try {
      await apiFetch("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({ name: profile.name.trim(), ...(phone ? { phone } : {}) }),
      });
      updateCachedUser({ name: profile.name.trim() });
      setProfileFlash({ kind: "ok", text: "Profile updated." });
    } catch (err) {
      setProfileFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not save profile",
      });
    } finally {
      setSavingProfile(false);
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
    } catch (err) {
      setPwFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not change password",
      });
    } finally {
      setSavingPw(false);
    }
  }

  // Rendered via function call — inline components lose focus per keystroke
  const renderFlash = (flash: Flash) =>
    flash ? (
      <p
        className={`w-fit rounded-[8px] px-3 py-2 text-[13px] font-medium ${
          flash.kind === "ok" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#ba1a1a]"
        }`}
      >
        {flash.text}
      </p>
    ) : null;

  return (
    <SellerShell title="Settings" subtitle="Your seller account details.">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Profile */}
        <section className="h-fit rounded-xl border border-[#e5e7eb] bg-white p-6">
          <h2 className="flex items-center gap-2 text-[16px] font-bold text-black">
            <UserRound className="h-4 w-4" /> Profile
          </h2>
          <p className="pt-1 text-[12.5px] text-[#6b7280]">
            Your name appears as the store owner and in &quot;by …&quot; product
            attribution on the storefront.
          </p>
          <form onSubmit={(e) => void saveProfile(e)} className="flex flex-col gap-4 pt-5">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Full Name</span>
              <input
                required
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                disabled={loadingProfile}
                className={inputCls}
              />
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Email</span>
                <input value={email} disabled className={`${inputCls} bg-[#f3f4f6] text-[#6b7280]`} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Phone</span>
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="10-digit mobile number"
                  disabled={loadingProfile}
                  className={inputCls}
                />
              </label>
            </div>
            {renderFlash(profileFlash)}
            <Button
              type="submit"
              disabled={savingProfile || loadingProfile}
              className="h-11 w-fit rounded-full bg-black px-8 text-[14px] font-bold text-white hover:opacity-85 disabled:opacity-40"
            >
              {savingProfile ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </section>

        <div className="flex flex-col gap-6">
          {/* Password */}
          <section className="rounded-xl border border-[#e5e7eb] bg-white p-6">
            <h2 className="flex items-center gap-2 text-[16px] font-bold text-black">
              <KeyRound className="h-4 w-4" /> Change Password
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              {renderFlash(pwFlash)}
              <Button
                type="submit"
                disabled={savingPw}
                className="h-11 w-fit rounded-full border border-black px-8 text-[14px] font-bold text-black hover:bg-[#f3f4f6] disabled:opacity-40"
              >
                {savingPw ? "Updating…" : "Update Password"}
              </Button>
            </form>
          </section>

          {/* Payout details */}
          <section className="rounded-xl border border-[#e5e7eb] bg-white p-6">
            <h2 className="flex items-center gap-2 text-[16px] font-bold text-black">
              <Landmark className="h-4 w-4" /> Payout Bank Account
            </h2>
            <p className="pt-3 text-[13.5px] leading-6 text-[#374151]">
              {bankLast4 ? (
                <>
                  Payouts go to the account ending in{" "}
                  <span className="font-bold text-black">****{bankLast4}</span> from your
                  seller application. We only ever store the last 4 digits.
                </>
              ) : (
                <>Payouts use the bank account from your seller application.</>
              )}
            </p>
            <p className="pt-2 text-[13px] leading-5 text-[#6b7280]">
              Withdraw your balance from{" "}
              <Link href="/seller/earnings" className="font-bold text-black underline">
                Earnings
              </Link>
              . To change bank details, contact{" "}
              <Link href="/contact-us" className="font-bold text-black underline">
                seller support
              </Link>{" "}
              — we re-verify account changes manually for your security.
            </p>
          </section>
        </div>
      </div>
    </SellerShell>
  );
}
