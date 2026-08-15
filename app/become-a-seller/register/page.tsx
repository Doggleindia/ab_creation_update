"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  Banknote,
  Check,
  ChevronDown,
  ChevronRight,
  CloudUpload,
  Eye,
  EyeOff,
  HelpCircle,
  Plus,
  Truck,
  Wallet,
  X,
} from "lucide-react";

const BACKEND = (process.env.NEXT_PUBLIC_MAIN_BACKEND ?? "").replace(/\/$/, "");

const BUSINESS_TYPES = [
  "Individual Creator",
  "Registered Business",
  "Design Studio",
  "Other",
];

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Goa", "Gujarat", "Haryana",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
];

const STEPS = ["Basic Info", "Business Details", "Portfolio"];

const labelCls =
  "text-[11px] font-bold uppercase tracking-[0.5px] text-[#444748]";
const inputCls =
  "h-11 w-full rounded-[8px] border border-[#c4c7c7] bg-white px-4 text-[15px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none";

type PortfolioFile = { name: string; preview: string; file: File };

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-3 py-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {i < current ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcfce7]">
                <Check className="h-4 w-4 text-[#16a34a]" strokeWidth={3} />
              </span>
            ) : (
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-bold ${
                  i === current
                    ? "bg-brand-orange text-white"
                    : "bg-[#f3f4f6] text-[#9ca3af]"
                }`}
              >
                {i + 1}
              </span>
            )}
            <span
              className={`hidden text-[12px] font-bold sm:block ${
                i === current
                  ? "text-brand-orange"
                  : i < current
                    ? "text-black"
                    : "text-[#9ca3af]"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <span className="h-px w-10 bg-[#d1d5db] sm:w-16" />
          )}
        </div>
      ))}
    </div>
  );
}

function BenefitRow({
  icon: Icon,
  title,
  sub,
}: {
  icon: typeof Banknote;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[12px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
        <Icon className="h-4 w-4 text-black" />
      </span>
      <span>
        <span className="block text-[15px] font-semibold text-black">
          {title}
        </span>
        {sub && <span className="block text-[13px] text-[#6b7280]">{sub}</span>}
      </span>
    </div>
  );
}

export default function SellerRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [files, setFiles] = useState<PortfolioFile[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Collected across steps
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    brandName: "",
    businessType: "",
    gstNumber: "",
    panNumber: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    accountNumber: "",
    ifsc: "",
    accountHolder: "",
    style: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // Approved sellers don't need to apply again — send them to their studio.
  useEffect(() => {
    if (getUser()?.accountType === "seller") router.replace("/seller");
  }, [router]);

  function set(field: keyof typeof form) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next: PortfolioFile[] = [];
    for (const file of Array.from(list).slice(0, 5 - files.length)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue;
      next.push({ name: file.name, preview: URL.createObjectURL(file), file });
    }
    setFiles((f) => [...f, ...next].slice(0, 5));
  }

  async function submit() {
    setBusy(true);
    setError("");

    // Upload portfolio images so reviewers see the real artwork.
    let portfolioFiles: string[] = [];
    if (files.length > 0) {
      try {
        const fd = new FormData();
        files.forEach((f) => fd.append("designs", f.file, f.name));
        const up = await fetch(`${BACKEND}/api/applications/upload-portfolio`, {
          method: "POST",
          body: fd,
        });
        if (up.ok) {
          const j = await up.json();
          portfolioFiles = j.data?.urls ?? [];
        }
      } catch {
        // uploads are best-effort; the application still goes through
      }
    }

    const messageParts = [
      form.businessType && `Business type: ${form.businessType}`,
      form.panNumber && `PAN: ${form.panNumber}`,
      files.length > 0 &&
        `Portfolio: ${files.length} design${files.length > 1 ? "s" : ""} ready to share (${files.map((f) => f.name).join(", ")})`,
      form.style && `About their style: ${form.style}`,
    ].filter(Boolean);

    try {
      const res = await fetch(`${BACKEND}/api/applications/seller`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.brandName,
          brandName: form.brandName,
          contactName: form.fullName,
          email: form.email,
          // Model validates a bare 10-digit number (no +91 prefix)
          phone: form.phone.replace(/\D/g, "").slice(-10) || undefined,
          address: {
            street: form.street,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            country: "India",
          },
          gstNumber: form.gstNumber || undefined,
          portfolioFiles: portfolioFiles.length > 0 ? portfolioFiles : undefined,
          productsToSell: form.style || undefined,
          message: messageParts.join(" | "),
          password: form.password,
          payout: {
            accountNumber: form.accountNumber,
            ifsc: form.ifsc,
            accountHolder: form.accountHolder,
          },
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Could not submit the application.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not submit the application.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-[70vh] w-full items-center justify-center bg-white px-4 py-16">
        <div className="flex w-full max-w-[520px] flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#bbf7d0] bg-[#f0fdf4]">
            <Check className="h-8 w-8 text-[#22c55e]" strokeWidth={3} />
          </div>
          <h1 className="pt-5 text-[24px] font-bold tracking-[-0.48px] text-black">
            Application Submitted!
          </h1>
          <p className="pt-2 text-[15px] leading-6 text-[#444748]">
            Thanks, {form.fullName.split(" ")[0] || "creator"}! Our curation
            team reviews applications within 24–48 hours. We&apos;ll email{" "}
            <span className="font-semibold text-black">{form.email}</span> once
            you&apos;re approved — then log in with the password you just chose
            to open your Seller Studio.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/"
              className="rounded-full bg-brand-orange px-8 py-3 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
            >
              Back to Home
            </Link>
            <Link
              href="/collection"
              className="rounded-full border border-[#c4c7c7] px-8 py-3 text-[15px] font-bold text-black transition-colors hover:bg-[#f3f3f4]"
            >
              Browse Collection
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full bg-white px-4 py-8 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1152px]">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-[13px]">
          <Link href="/" className="text-[#6b7280] hover:text-brand-orange">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <Link
            href="/become-a-seller"
            className="text-[#6b7280] hover:text-brand-orange"
          >
            Join as Seller
          </Link>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <span className="font-semibold text-black">Registration</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_440px]">
          {/* LEFT: header + stepper + form card */}
          <div>
            <span className="flex w-fit items-center gap-2 rounded-full border border-[#ecd9a8] bg-[#fdf9ef] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[1px] text-[#b07d1a]">
              <BadgeCheck className="h-3.5 w-3.5" /> Partner Program
            </span>
            <h1 className="pt-4 text-[32px] font-bold leading-tight tracking-[-0.64px] text-black sm:text-[40px]">
              {step === 1 ? "Business Details" : "Start Selling with AB Creation"}
            </h1>
            <p className="max-w-[520px] pt-3 text-[15px] leading-6 text-[#444748]">
              {step === 0 &&
                "Set up your seller account in 3 minutes. You bring the designs — we handle printing, fulfilment, and payouts."}
              {step === 1 &&
                "Tell us more about your business setup for smooth fulfilment and payouts."}
              {step === 2 &&
                "Set up your seller account in 3 minutes. Our curated marketplace connects premium designers with discerning global customers."}
            </p>

            <Stepper current={step} />

            <div className="rounded-[12px] border border-[#c4c7c7] bg-white p-6 sm:p-8">
              {/* STEP 1: Basic info */}
              {step === 0 && (
                <form
                  className="flex flex-col gap-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (form.password.length < 8) {
                      setError("Password must be at least 8 characters.");
                      return;
                    }
                    if (form.password !== form.confirmPassword) {
                      setError("Passwords do not match.");
                      return;
                    }
                    setError("");
                    setStep(1);
                  }}
                >
                  <label className="flex flex-col gap-2">
                    <span className={labelCls}>Full Name</span>
                    <input
                      required
                      value={form.fullName}
                      onChange={set("fullName")}
                      placeholder="Enter your full name"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className={labelCls}>Email Address</span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="example@brand.com"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className={labelCls}>Phone Number</span>
                    <div className="flex h-11 overflow-hidden rounded-[8px] border border-[#c4c7c7] focus-within:border-brand-orange">
                      <span className="flex items-center border-r border-[#c4c7c7] bg-[#f9f9f9] px-3 text-[15px] text-[#444748]">
                        +91
                      </span>
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={set("phone")}
                        placeholder="99999 00000"
                        className="min-w-0 flex-1 px-4 text-[15px] text-black placeholder:text-[#9ca3af] focus:outline-none"
                      />
                    </div>
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className={labelCls}>Password</span>
                      <div className="relative">
                        <input
                          required
                          type={showPw ? "text" : "password"}
                          minLength={8}
                          value={form.password}
                          onChange={set("password")}
                          placeholder="Min. 8 characters"
                          className={`${inputCls} pr-11`}
                        />
                        <Button
                          type="button"
                          aria-label={showPw ? "Hide password" : "Show password"}
                          onClick={() => setShowPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-black"
                        >
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className={labelCls}>Confirm Password</span>
                      <div className="relative">
                        <input
                          required
                          type={showPw2 ? "text" : "password"}
                          minLength={8}
                          value={form.confirmPassword}
                          onChange={set("confirmPassword")}
                          placeholder="Repeat password"
                          className={`${inputCls} pr-11`}
                        />
                        <Button
                          type="button"
                          aria-label={showPw2 ? "Hide password" : "Show password"}
                          onClick={() => setShowPw2((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-black"
                        >
                          {showPw2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </label>
                  </div>
                  <p className="text-[12.5px] leading-5 text-[#6b7280]">
                    You&apos;ll use this password to log in to your Seller Studio
                    once your application is approved.
                  </p>
                  {error && (
                    <p className="rounded-[8px] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#ba1a1a]">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="mt-2 rounded-full bg-brand-orange py-3.5 text-[16px] font-bold text-white transition-opacity hover:opacity-90"
                  >
                    Continue
                  </Button>
                  <p className="text-center text-[14px] text-[#444748]">
                    Already have an account?{" "}
                    <Link
                      href="/login?next=/become-a-seller/register"
                      className="font-semibold text-black underline hover:text-brand-orange"
                    >
                      Log in
                    </Link>
                  </p>
                </form>
              )}

              {/* STEP 2: Business details */}
              {step === 1 && (
                <form
                  className="flex flex-col gap-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep(2);
                  }}
                >
                  <label className="flex flex-col gap-2">
                    <span className={labelCls}>Business / Brand Name</span>
                    <input
                      required
                      value={form.brandName}
                      onChange={set("brandName")}
                      placeholder="e.g. Studio Aesthetic"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className={labelCls}>Business Type</span>
                    <div className="relative">
                      <select
                        required
                        value={form.businessType}
                        onChange={set("businessType")}
                        className={`${inputCls} appearance-none`}
                      >
                        <option value="" disabled>
                          Select Type
                        </option>
                        {BUSINESS_TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#444748]" />
                    </div>
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className={labelCls}>GST Number (Optional)</span>
                      <input
                        value={form.gstNumber}
                        onChange={set("gstNumber")}
                        placeholder="22AAAAA0000A1Z5"
                        className={inputCls}
                      />
                      <span className="text-[12px] text-[#6b7280]">
                        Required for B2B invoicing. Can be added later.
                      </span>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className={labelCls}>PAN Number (Optional)</span>
                      <input
                        value={form.panNumber}
                        onChange={set("panNumber")}
                        placeholder="ABCDE1234F"
                        className={inputCls}
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className={labelCls}>Business Address</span>
                    <textarea
                      required
                      value={form.street}
                      onChange={set("street")}
                      rows={3}
                      placeholder="Enter full office or studio address"
                      className="w-full rounded-[8px] border border-[#c4c7c7] bg-white px-4 py-3 text-[15px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className={labelCls}>City</span>
                      <input
                        required
                        value={form.city}
                        onChange={set("city")}
                        placeholder="Mumbai"
                        className={inputCls}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className={labelCls}>State</span>
                      <div className="relative">
                        <select
                          required
                          value={form.state}
                          onChange={set("state")}
                          className={`${inputCls} appearance-none`}
                        >
                          <option value="" disabled>
                            Select State
                          </option>
                          {STATES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#444748]" />
                      </div>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className={labelCls}>PIN Code</span>
                      <input
                        required
                        pattern="\d{6}"
                        value={form.pincode}
                        onChange={set("pincode")}
                        placeholder="400001"
                        className={inputCls}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className={labelCls}>Country</span>
                      <input
                        value="India"
                        readOnly
                        className={`${inputCls} bg-[#eeeeee] text-[#444748]`}
                      />
                    </label>
                  </div>
                  <div className="pt-2">
                    <p className="text-[12px] font-bold uppercase tracking-[0.8px] text-black">
                      Payout Details
                    </p>
                    <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className={labelCls}>Bank Account Number</span>
                        <input
                          required
                          inputMode="numeric"
                          minLength={6}
                          value={form.accountNumber}
                          onChange={set("accountNumber")}
                          placeholder="Enter account number"
                          className={inputCls}
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className={labelCls}>IFSC Code</span>
                        <input
                          required
                          value={form.ifsc}
                          onChange={set("ifsc")}
                          placeholder="HDFC0001234"
                          className={`${inputCls} uppercase`}
                        />
                      </label>
                    </div>
                    <label className="flex flex-col gap-2 pt-4">
                      <span className={labelCls}>Account Holder Name</span>
                      <input
                        required
                        value={form.accountHolder}
                        onChange={set("accountHolder")}
                        placeholder="As it appears on your passbook"
                        className={inputCls}
                      />
                    </label>
                    <p className="pt-3 text-[12px] leading-5 text-[#6b7280]">
                      For your security we store only the last 4 digits of the
                      account number — full details are re-verified before your
                      first payout.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      type="button"
                      onClick={() => setStep(0)}
                      className="rounded-[8px] border border-[#c4c7c7] px-8 py-3 text-[15px] font-semibold text-black transition-colors hover:bg-[#f3f3f4]"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-full bg-brand-orange px-10 py-3 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
                    >
                      Continue
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 3: Portfolio */}
              {step === 2 && (
                <form
                  className="flex flex-col gap-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submit();
                  }}
                >
                  <div>
                    <h2 className="text-[18px] font-bold text-black">
                      Show us your work
                    </h2>
                    <p className="pt-1 text-[13px] leading-5 text-[#6b7280]">
                      Upload 3-5 sample designs you&apos;d like to sell.
                      We&apos;ll review your portfolio and get back within 48
                      hours.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      addFiles(e.dataTransfer.files);
                    }}
                    className="flex flex-col items-center gap-1 rounded-[8px] border-2 border-dashed border-[#c4c7c7] px-6 py-9 text-center transition-colors hover:border-brand-orange"
                  >
                    <CloudUpload className="h-6 w-6 text-[#6b7280]" />
                    <span className="pt-2 text-[14px] text-[#374151]">
                      Drag &amp; drop your designs here
                    </span>
                    <span className="text-[13px] text-[#9ca3af]">or</span>
                    <span className="text-[14px] font-semibold text-black underline">
                      Browse Files
                    </span>
                    <span className="pt-1 text-[12px] text-[#9ca3af]">
                      PNG, JPG, SVG — max 10MB each
                    </span>
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => addFiles(e.target.files)}
                  />

                  <div className="flex flex-wrap gap-4">
                    {files.map((f, i) => (
                      <div
                        key={f.preview}
                        className="relative h-20 w-20 overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-[#f3f4f6]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={f.preview}
                          alt={f.name}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          aria-label={`Remove ${f.name}`}
                          onClick={() =>
                            setFiles((fs) => fs.filter((_, j) => j !== i))
                          }
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, 5 - files.length) }).map(
                      (_, i) => (
                        <Button
                          key={i}
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="flex h-20 w-20 items-center justify-center rounded-[8px] bg-[#f3f4f6] text-[#9ca3af] transition-colors hover:bg-[#e5e7eb]"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      ),
                    )}
                  </div>
                  <p className="text-[12px] text-[#9ca3af]">
                    Your designs are uploaded securely with the application for
                    our curation team to review.
                  </p>

                  <label className="flex flex-col gap-2">
                    <span className={labelCls}>About Your Style</span>
                    <textarea
                      required
                      value={form.style}
                      onChange={set("style")}
                      rows={4}
                      placeholder="Tell us about your design style and what products you'd like to sell..."
                      className="w-full rounded-[8px] border border-[#c4c7c7] bg-white px-4 py-3 text-[15px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                    />
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 text-[14px] text-[#374151]">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-black"
                    />
                    <span>
                      I agree to AB Creation&apos;s{" "}
                      <Link href="/terms-and-conditions" className="underline">
                        Seller Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/terms-and-conditions" className="underline">
                        Commission Policy
                      </Link>
                      .
                    </span>
                  </label>

                  {error && (
                    <p className="rounded-[8px] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#ba1a1a]">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={!agreed || busy}
                    className="rounded-full bg-brand-orange py-3.5 text-[16px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? "Submitting…" : "Submit Application"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-[8px] border border-[#c4c7c7] py-3 text-[15px] font-semibold text-black transition-colors hover:bg-[#f3f3f4]"
                  >
                    Back
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT: photo + info rail */}
          <aside className="flex flex-col gap-4 lg:pt-[140px]">
            <div className="relative overflow-hidden rounded-[12px]">
              <Image
                src={`/images/seller/reg-step${step + 1}.jpg`}
                alt="AB Creation seller community"
                width={880}
                height={520}
                className="h-[300px] w-full object-cover sm:h-[380px]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-16">
                {step === 1 ? (
                  <>
                    <p className="text-[20px] font-bold italic leading-snug text-white">
                      &quot;Switching to AB Creation&apos;s fulfilment model
                      saved us 40% on operational overheads.&quot;
                    </p>
                    <p className="pt-2 text-[14px] text-white/80">
                      — Elena Rossi, Creative Director
                    </p>
                  </>
                ) : step === 2 ? (
                  <>
                    <p className="text-[11px] font-bold uppercase tracking-[2px] text-white/70">
                      Your Future Store
                    </p>
                    <p className="text-[22px] font-bold text-white">
                      Premium Quality, Global Reach.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[18px] font-bold text-white">
                      Join 500+ Top Creators
                    </p>
                    <p className="text-[14px] text-white/80">
                      Building the next big apparel brand.
                    </p>
                  </>
                )}
              </div>
            </div>

            {step < 2 ? (
              <>
                <BenefitRow
                  icon={Banknote}
                  title="No upfront cost — start free"
                  sub={
                    step === 1
                      ? "Scale your brand without inventory risk."
                      : undefined
                  }
                />
                <BenefitRow
                  icon={Truck}
                  title="Pan-India fulfilment included"
                  sub={
                    step === 1
                      ? "We handle printing, packing, and shipping."
                      : undefined
                  }
                />
                <BenefitRow
                  icon={Wallet}
                  title="Wallet-based payouts"
                  sub={
                    step === 1
                      ? "Instant transparency on your earnings."
                      : undefined
                  }
                />
              </>
            ) : (
              <>
                <div className="rounded-[12px] border border-[#c4c7c7] bg-white p-6">
                  <h3 className="text-[18px] font-bold text-black">
                    What happens next?
                  </h3>
                  <ol className="mt-5 flex flex-col gap-5">
                    {[
                      [
                        "Portfolio Review",
                        "Our curation team reviews your designs within 24-48 hours to ensure brand alignment.",
                      ],
                      [
                        "Dashboard Access",
                        "Once approved, log in with the password you chose to open your personalized Seller Studio.",
                      ],
                      [
                        "Start Selling",
                        "Upload your catalog, set your pricing, and start reaching thousands of customers.",
                      ],
                    ].map(([title, copy], i) => (
                      <li key={title} className="flex gap-4">
                        <span className="text-[24px] font-bold leading-none text-[#e5e7eb]">
                          0{i + 1}
                        </span>
                        <span>
                          <span className="block text-[14px] font-bold text-black">
                            {title}
                          </span>
                          <span className="block pt-1 text-[13px] leading-5 text-[#6b7280]">
                            {copy}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="flex gap-3 rounded-[8px] border border-[#e8dfc9] bg-[#faf6ec] p-5">
                  <HelpCircle className="h-4 w-4 shrink-0 text-[#b07d1a]" />
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-[0.5px] text-[#b07d1a]">
                      Need assistance?
                    </p>
                    <p className="pt-1 text-[13px] leading-5 text-[#6b7280]">
                      Our support team is available 10AM - 8PM to help with
                      your application.
                    </p>
                    <Link
                      href="/contact-us"
                      className="mt-1 inline-block text-[13px] font-semibold text-black underline"
                    >
                      Chat with us
                    </Link>
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
