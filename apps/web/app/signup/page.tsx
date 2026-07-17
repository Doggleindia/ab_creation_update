"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login, signup } from "@/lib/auth";

const inputCls =
  "h-11 w-full rounded-[8px] border border-[#c4c7c7] bg-white px-4 text-[15px] text-black placeholder:text-[#6b7280] focus:border-brand-orange focus:outline-none";

function SignupForm() {
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
    const name = String(fd.get("name"));
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    try {
      await signup(name, email, password);
      // Signup doesn't return a token — log straight in.
      await login(email, password);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
            Create your account
          </h1>
          <p className="mt-1 text-[14px] text-[#444748]">
            Design, order and track custom apparel.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[14px] font-medium text-black">Full Name</span>
            <input
              name="name"
              required
              placeholder="Enter your full name"
              className={inputCls}
            />
          </label>
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
              minLength={8}
              placeholder="At least 8 characters"
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
            {busy ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-[14px] text-[#444748]">
          Already have an account?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-black underline hover:text-brand-orange"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-white" />}>
      <SignupForm />
    </Suspense>
  );
}
