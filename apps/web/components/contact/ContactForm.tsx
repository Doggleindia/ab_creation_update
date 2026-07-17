"use client";

import { useState } from "react";

const BACKEND = (process.env.NEXT_PUBLIC_MAIN_BACKEND ?? "").replace(/\/$/, "");
const inputCls =
  "rounded-lg border border-[#e8e6e3] px-4 py-3 text-[14px] focus:border-brand-orange focus:outline-none";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(`${BACKEND}/api/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Something went wrong. Please try again.");
      }
      setStatus("ok");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send message.");
    }
  }

  if (status === "ok") {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-[#e8e6e3] bg-white p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
          ✅
        </div>
        <h3 className="mt-4 text-[18px] font-bold text-[#111827]">
          Message sent!
        </h3>
        <p className="mt-1 text-[14px] text-[#6b7280]">
          Thanks for reaching out. Our team will get back to you shortly.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-[14px] font-semibold text-brand-orange underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-[#e8e6e3] bg-white p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Your Name" className={inputCls} />
        <input name="email" type="email" required placeholder="Your Email" className={inputCls} />
      </div>
      <input name="subject" required placeholder="Subject" className={inputCls} />
      <textarea
        name="message"
        required
        rows={5}
        placeholder="Your Message"
        className={`${inputCls} resize-none`}
      />
      {status === "error" && (
        <p className="text-[13px] text-red-500">{error}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="self-start rounded-full bg-brand-orange px-8 py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
