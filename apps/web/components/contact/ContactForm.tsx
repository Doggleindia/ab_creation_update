"use client";

import { useState } from "react";

const BACKEND = (process.env.NEXT_PUBLIC_MAIN_BACKEND ?? "").replace(/\/$/, "");
const inputCls =
  "h-[60px] w-full rounded-[10px] border border-[#9f9f9f] bg-white px-6 font-poppins text-[16px] text-black placeholder:text-[#9f9f9f] focus:border-brand-orange focus:outline-none";
const labelCls = "font-poppins text-[16px] font-medium text-black";

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
      <div className="flex h-full flex-col items-center justify-center rounded-[12px] border border-[#c4c7c7] bg-white p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
          ✅
        </div>
        <h3 className="mt-4 text-[18px] font-bold text-black">
          Message sent!
        </h3>
        <p className="mt-1 text-[14px] text-[#444748]">
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
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <label className="flex flex-col gap-3">
        <span className={labelCls}>Your name</span>
        <input name="name" required placeholder="Abc" className={inputCls} />
      </label>
      <label className="flex flex-col gap-3">
        <span className={labelCls}>Email address</span>
        <input
          name="email"
          type="email"
          required
          placeholder="Abc@def.com"
          className={inputCls}
        />
      </label>
      <label className="flex flex-col gap-3">
        <span className={labelCls}>Subject</span>
        <input
          name="subject"
          placeholder="This is an optional"
          className={inputCls}
        />
      </label>
      <label className="flex flex-col gap-3">
        <span className={labelCls}>Message</span>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="Hi! i'd like to ask about"
          className={`${inputCls} h-[120px] resize-none py-5`}
        />
      </label>
      {status === "error" && (
        <p className="font-poppins text-[13px] text-red-500">{error}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 h-[55px] w-full max-w-[284px] rounded-[28px] bg-brand-orange font-poppins text-[16px] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}
