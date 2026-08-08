"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login, signup } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const underlineInput =
  "w-full border-b border-[#9ca3af] bg-transparent pb-3 text-[16px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";

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
    const name = `${fd.get("firstName")} ${fd.get("lastName")}`.trim();
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
    <main className="w-full bg-white px-6 py-14 sm:px-12 lg:px-24">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-16 lg:grid-cols-[1fr_550px]">
        {/* Left: form */}
        <div className="max-w-[700px]">
          <Link href="/" className="flex w-fit items-center gap-2">
            <Image
              src="/ab-creation-logo.png"
              alt="AB Creation logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span className="text-[20px] font-extrabold tracking-tight text-black">
              AB CREATION
            </span>
          </Link>

          <h1 className="pt-9 font-poppins text-[36px] font-bold text-black">
            Create Account
          </h1>
          <p className="max-w-[700px] pt-5 text-[16px] leading-[30px] text-[#374151]">
            Create your account to be part of the Creative world, discover our
            new collections and receive news at the earliest.
          </p>

          <form onSubmit={onSubmit} className="pt-8">
            <label className="block">
              <span className="block pb-4 text-[18px] font-medium text-black">
                First name
              </span>
              <input
                name="firstName"
                required
                placeholder="Name"
                className={underlineInput}
              />
            </label>
            <label className="block pt-8">
              <span className="block pb-4 text-[18px] font-medium text-black">
                Last Name
              </span>
              <input
                name="lastName"
                required
                placeholder="Surname"
                className={underlineInput}
              />
            </label>
            <label className="block pt-8">
              <span className="block pb-4 text-[18px] font-medium text-black">
                Email/ Phone number
              </span>
              <input
                name="email"
                type="email"
                required
                placeholder="Insert your email"
                className={underlineInput}
              />
            </label>
            <label className="block pt-8">
              <span className="block pb-4 text-[18px] font-medium text-black">
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Insert your password"
                className={underlineInput}
              />
            </label>

            <label className="flex cursor-pointer items-start gap-3 pt-8 text-[13px] leading-[25px] text-black">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-[#9ca3af] accent-black"
              />
              Having read and understood the Privacy Information Notice, I
              declare that I am over 16 years of age and agree to the Terms of
              Service.
            </label>

            {error && (
              <p className="mt-5 rounded-[8px] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#ba1a1a]">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={busy}
              className="mt-9 h-[62px] w-full max-w-[277px] bg-brand-orange text-[15px] font-semibold uppercase tracking-[1px] text-white hover:bg-brand-orange/90 rounded-[6px]"
            >
              {busy ? "Creating…" : "Create account"}
            </Button>

            <p className="pt-9 text-[14px] text-[#6b7280]">
              Already have an account?{" "}
              <Link
                href={`/login?next=${encodeURIComponent(next)}`}
                className="font-bold text-black underline hover:text-brand-orange"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>

        {/* Right: photo */}
        <div className="relative hidden h-[555px] w-full overflow-hidden pt-0 lg:block">
          <Image
            src="/images/auth/login-side.png"
            alt="Screen printing a custom t-shirt"
            fill
            className="object-cover"
            sizes="550px"
          />
        </div>
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
