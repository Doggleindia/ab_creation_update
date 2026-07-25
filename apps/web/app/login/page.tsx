"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/auth";

const underlineInput =
  "w-full border-b border-[#9ca3af] bg-transparent pb-3 text-[16px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none";

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
      const user = await login(String(fd.get("email")), String(fd.get("password")));
      if (user.mustChangePassword) {
        // Temporary credentials must be replaced before doing anything else
        router.push(`/set-password?next=${encodeURIComponent(next)}`);
      } else if (
        user.accountType === "seller" &&
        (next === "/" || next.startsWith("/become-a-seller"))
      ) {
        // Sellers land on their studio — never back on the apply pages
        // (the registration page links here with next=/become-a-seller/register)
        router.push("/seller");
      } else {
        router.push(next);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  }

  return (
    <main className="w-full bg-white px-6 py-14 sm:px-12 lg:px-24">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_550px]">
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

          <h1 className="pt-10 font-poppins text-[36px] font-bold text-black">
            Log In
          </h1>
          <p className="max-w-[700px] pt-5 text-[16px] leading-[30px] text-[#374151]">
            Log in to be part of the Creative world, discover our new
            collections and receive news at the earliest.
          </p>

          <form onSubmit={onSubmit} className="pt-10">
            <label className="block">
              <span className="block pb-4 text-[18px] font-medium text-black">
                Email/Phone number
              </span>
              <input
                name="email"
                type="email"
                required
                placeholder="Enter email"
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
                placeholder="Password"
                className={underlineInput}
              />
            </label>

            <div className="flex items-center justify-between pt-5">
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-black">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-4 w-4 rounded border-[#9ca3af] accent-black"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-[14px] font-semibold text-black hover:text-brand-orange"
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <p className="mt-5 rounded-[8px] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#ba1a1a]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-9 h-[62px] w-full max-w-[277px] rounded-[6px] bg-brand-orange text-[15px] font-semibold uppercase tracking-[1px] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Logging in…" : "Log In"}
            </button>

            <p className="pt-9 text-[14px] text-[#6b7280]">
              Don&apos;t have an account?{" "}
              <Link
                href={`/signup?next=${encodeURIComponent(next)}`}
                className="font-bold text-black underline hover:text-brand-orange"
              >
                create one
              </Link>
            </p>
          </form>
        </div>

        {/* Right: photo */}
        <div className="relative hidden h-[555px] w-full overflow-hidden lg:block">
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-white" />}>
      <LoginForm />
    </Suspense>
  );
}
