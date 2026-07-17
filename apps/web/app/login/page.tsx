"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/auth";

const inputCls =
  "h-11 w-full rounded-[8px] border border-[#c4c7c7] bg-white px-4 text-[15px] text-black placeholder:text-[#6b7280] focus:border-brand-orange focus:outline-none";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await login(String(fd.get("email")), String(fd.get("password")));
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-[70vh] w-full items-center justify-center bg-white px-4 py-16">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/ab-creation-logo.png"
            alt="AB Creation logo"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
          />
          <h1 className="mt-4 text-[24px] font-bold tracking-[-0.48px] text-black">
            Welcome back
          </h1>
          <p className="mt-1 text-[14px] text-[#444748]">
            Log in to order and track your custom apparel.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[14px] font-medium text-black">
              Email Address
            </span>
            <input
              name="email"
              type="email"
              required
              placeholder="email@example.com"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] font-medium text-black">Password</span>
            <input
              name="password"
              type="password"
              required
              placeholder="Your password"
              className={inputCls}
            />
          </label>

          {error && (
            <p className="rounded-[8px] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#ba1a1a]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-full bg-brand-orange py-3.5 text-[16px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Logging in…" : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-[14px] text-[#444748]">
          New to AB Creation?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="font-semibold text-black underline hover:text-brand-orange"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-white" />}>
      <LoginForm />
    </Suspense>
  );
}
