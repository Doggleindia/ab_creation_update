"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { apiFetch, getUser, getToken, updateCachedUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const inputCls =
  "h-12 w-full rounded-[6px] border border-[#c4c7c7] bg-white px-4 text-[15px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none";

function SetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const newPassword = String(fd.get("newPassword"));
    if (newPassword !== String(fd.get("confirmPassword"))) {
      setError("New passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/api/users/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: String(fd.get("currentPassword")),
          newPassword,
        }),
      });
      updateCachedUser({ mustChangePassword: false });
      const user = getUser();
      router.push(
        user?.accountType === "seller" && next === "/"
          ? "/seller"
          : user?.accountType === "bulk" && next === "/"
            ? "/dashboard"
            : next,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update the password.",
      );
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-[75vh] w-full items-start justify-center bg-[#f8f9fb] px-4 py-16">
      <div className="w-full max-w-[520px] rounded-[12px] bg-white p-8 shadow-[0px_4px_16px_rgba(0,0,0,0.06)] sm:p-[52px]">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fdf3dd]">
          <KeyRound className="h-5 w-5 text-[#b07d1a]" />
        </span>
        <h1 className="pt-5 font-poppins text-[28px] font-bold text-black">
          Set Your Password
        </h1>
        <p className="pt-2 text-[14.5px] leading-6 text-[#6b7280]">
          You&apos;re signed in with a temporary password. Choose your own
          password to secure your account before continuing.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 pt-7">
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-[#374151]">
              Temporary Password
            </span>
            <input
              name="currentPassword"
              type="password"
              required
              placeholder="The password from your approval email"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-[#374151]">
              New Password
            </span>
            <input
              name="newPassword"
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-[#374151]">
              Confirm New Password
            </span>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              placeholder="Repeat the new password"
              className={inputCls}
            />
          </label>
          {error && (
            <p className="rounded-[6px] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#ba1a1a]">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={busy}
            className="mt-1 h-12 w-full rounded-[6px] bg-brand-orange text-[15px] font-semibold text-white hover:bg-brand-orange/90"
          >
            {busy ? "Saving…" : "Save & Continue"}
          </Button>
          <p className="text-center text-[13px] text-[#9ca3af]">
            Forgot the temporary password?{" "}
            <Link href="/forgot-password" className="font-semibold text-black underline">
              Reset it here
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-white" />}>
      <SetPasswordForm />
    </Suspense>
  );
}
