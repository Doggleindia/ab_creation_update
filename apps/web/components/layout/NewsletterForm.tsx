"use client";

import { useState } from "react";

const BACKEND = (process.env.NEXT_PUBLIC_MAIN_BACKEND ?? "").replace(/\/$/, "");

export default function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle",
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    setStatus("sending");
    try {
      const res = await fetch(`${BACKEND}/api/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter subscriber",
          email,
          subject: "Newsletter signup",
          message: `Please add ${email} to the newsletter list.`,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  }

  if (status === "ok") {
    return (
      <p className="text-[14px] font-medium text-[#f3f0ee]">
        ✓ You&apos;re on the list — watch your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          aria-label="Email address"
          className="w-[179px] rounded-md border border-[#e2bfb0] bg-[#eae8e6]/10 px-4 py-2 text-[15px] text-white placeholder:text-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-orange"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-md bg-brand-rust px-4 py-2 text-[16px] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "sending" ? "…" : "Join"}
        </button>
      </div>
      {status === "err" && (
        <p className="text-[12px] text-[#fca5a5]">
          Couldn&apos;t subscribe right now — try again later.
        </p>
      )}
    </form>
  );
}
