"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND = (process.env.NEXT_PUBLIC_MAIN_BACKEND ?? "").replace(/\/$/, "");

const inputCls =
  "h-12 w-full rounded-[6px] border border-[#c4c7c7] bg-white px-4 text-[15px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"request" | "reset" | "done">("request");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function post(path: string, body: object) {
    const res = await fetch(`${BACKEND}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.message || "Something went wrong.");
    return j;
  }

  async function requestCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post("/api/users/forgot-password", { email });
      setPhase("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await post("/api/users/reset-password", {
        email,
        otp: fd.get("otp"),
        newPassword: fd.get("newPassword"),
      });
      setPhase("done");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not reset the password.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-[75vh] w-full items-start justify-center bg-[#f8f9fb] px-4 py-16">
      <div className="relative w-full max-w-[540px]">
        <Button
          aria-label="Close"
          onClick={() => router.push("/login")}
          className="absolute -top-10 right-0 flex items-center gap-2 text-[14px] text-[#6b7280] hover:text-black"
        >
          <X className="h-5 w-5" /> Close
        </Button>

        <div className="rounded-[12px] bg-white p-8 shadow-[0px_4px_16px_rgba(0,0,0,0.06)] sm:p-[60px] sm:pb-10">
          {phase === "done" ? (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0fdf4]">
                <Check className="h-7 w-7 text-[#22c55e]" strokeWidth={3} />
              </div>
              <h1 className="pt-5 font-poppins text-[26px] font-bold text-black">
                Password Updated
              </h1>
              <p className="pt-3 text-[15px] leading-6 text-[#6b7280]">
                Your password has been reset successfully. Log in with your new
                password to continue.
              </p>
              <Link
                href="/login"
                className="mt-8 flex h-12 w-full items-center justify-center rounded-[6px] bg-brand-orange text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-poppins text-[30px] font-bold text-black">
                Password Reset
              </h1>
              <p className="pt-3 text-[15px] leading-6 text-[#6b7280]">
                {phase === "request"
                  ? "We will help you reset your password. Enter the email linked to your account and we'll send a one-time code."
                  : `Enter the code we sent to ${email} along with your new password.`}
              </p>

              {phase === "request" ? (
                <form onSubmit={requestCode} className="pt-8">
                  <label className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-[#374151]">
                      Email Address
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </label>
                  {error && (
                    <p className="mt-4 rounded-[6px] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#ba1a1a]">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={busy}
                    className="mt-6 h-12 w-full rounded-[6px] bg-brand-orange text-[15px] font-semibold text-white hover:bg-brand-orange/90"
                  >
                    {busy ? "Sending…" : "Send Reset Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={resetPassword} className="flex flex-col gap-5 pt-8">
                  <label className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-[#374151]">
                      One-Time Code
                    </span>
                    <input
                      name="otp"
                      required
                      inputMode="numeric"
                      placeholder="6-digit code"
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
                  {error && (
                    <p className="rounded-[6px] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#ba1a1a]">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={busy}
                    className="h-12 w-full rounded-[6px] bg-brand-orange text-[15px] font-semibold text-white hover:bg-brand-orange/90"
                  >
                    {busy ? "Resetting…" : "Reset Password"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setPhase("request")}
                    className="text-[13px] font-semibold text-[#6b7280] hover:text-black"
                  >
                    Didn&apos;t get a code? Send again
                  </Button>
                </form>
              )}

              <div className="mt-8 border-t border-[#e5e7eb] pt-6 text-center">
                <p className="text-[14px] text-[#6b7280]">
                  Remembered your Password?
                </p>
                <Link
                  href="/login"
                  className="mt-4 flex h-12 w-full items-center justify-center rounded-[6px] border border-[#c4c7c7] bg-white text-[15px] font-semibold text-black transition-colors hover:bg-[#f3f4f6]"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
