"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronRight,
  CloudUpload,
  ClipboardList,
  Handshake,
  Info,
  ShieldCheck,
  Timer,
  X,
} from "lucide-react";

const BACKEND = (process.env.NEXT_PUBLIC_MAIN_BACKEND ?? "").replace(/\/$/, "");

const STEPS = ["Contact Info", "Select Products", "Upload Design", "Timeline & Submit"];

const PURPOSES = [
  "Corporate / Team Merchandise",
  "Event or Conference",
  "College / University",
  "Reselling / Brand Merch",
  "Other",
];

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;

// Tiered unit prices follow the landing page pricing table (50-99 / 100-249 / 250+)
const GARMENTS = [
  { id: "tshirt", label: "T-Shirt", panel: "Round Neck T-Shirt", popular: true, img: "/images/home/cat-men.png", prices: [249, 219, 199] },
  { id: "vneck", label: "V-Neck", panel: "V-Neck T-Shirt", img: "/images/home/cat-men.png", prices: [269, 239, 219] },
  { id: "polo", label: "Polo", panel: "Classic Polo T-Shirt", img: "/images/home/cat-polo.png", prices: [399, 349, 319] },
  { id: "hoodie", label: "Hoodie", panel: "Premium Cotton Hoodie", img: "/images/home/cat-hoodie.png", prices: [549, 499, 449] },
  { id: "sweatshirt", label: "Sweatshirt", panel: "Crewneck Sweatshirt", img: "/images/home/cat-sweatshirt.png", prices: [499, 459, 419] },
  { id: "tote", label: "Tote Bag", panel: "Canvas Tote Bag", img: "/images/home/explore-tote.png", prices: [149, 129, 119] },
];

const COLORS = [
  { name: "Black", hex: "#1f2224" },
  { name: "White", hex: "#ffffff" },
  { name: "Navy", hex: "#1e3a8a" },
  { name: "Red", hex: "#dc2626" },
  { name: "Steel", hex: "#94a3b8" },
  { name: "Green", hex: "#14532d" },
];

const PRINT_METHODS = [
  "Direct to Film (DTF)",
  "Screen Print",
  "DTG Printing",
  "Embroidery",
];

const POSITIONS = ["Front", "Back", "Sleeves"];

const BUDGETS = [
  "Under ₹25,000",
  "₹25,000 – ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000+",
];

const MIN_QTY = 50;

const labelCls =
  "text-[11px] font-bold uppercase tracking-[0.5px] text-[#444748]";
const inputCls =
  "h-11 w-full rounded-[8px] border border-[#c4c7c7] bg-white px-4 text-[15px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none";

type ArtworkFile = { name: string; preview: string | null };

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-start justify-center gap-4 py-10 sm:gap-10">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-start gap-4 sm:gap-10">
          <div className="flex w-[72px] flex-col items-center gap-2 sm:w-auto">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-bold ${
                i < current
                  ? "bg-black text-white"
                  : i === current
                    ? "bg-black text-white"
                    : "bg-[#e5e7eb] text-[#9ca3af]"
              }`}
            >
              {i < current ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={`text-center text-[12px] ${
                i === current
                  ? "font-bold text-black"
                  : i < current
                    ? "font-medium text-black"
                    : "text-[#9ca3af]"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <span className="mt-4 hidden h-px w-14 bg-[#d1d5db] sm:block" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function BulkQuotePage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 1
  const [contact, setContact] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    purpose: "",
  });
  // Step 2
  const [garmentId, setGarmentId] = useState("tshirt");
  const [color, setColor] = useState("Black");
  const [sizeCounts, setSizeCounts] = useState<Record<string, string>>({});
  // Step 3
  const [files, setFiles] = useState<ArtworkFile[]>([]);
  const [printMethod, setPrintMethod] = useState(PRINT_METHODS[0]);
  const [positions, setPositions] = useState<string[]>(["Front"]);
  const [notes, setNotes] = useState("");
  // Step 4
  const [delivery, setDelivery] = useState({
    date: "",
    budget: "",
    street: "",
    city: "",
    state: "",
    pin: "",
  });
  const [sample, setSample] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const garment = GARMENTS.find((g) => g.id === garmentId) ?? GARMENTS[0];
  const totalQty = SIZES.reduce(
    (s, sz) => s + (parseInt(sizeCounts[sz] || "0", 10) || 0),
    0,
  );
  const tier = totalQty >= 250 ? 2 : totalQty >= 100 ? 1 : 0;
  const unitPrice = garment.prices[tier];
  const estLow = totalQty * unitPrice;
  const estHigh = Math.round(estLow * 1.2);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next: ArtworkFile[] = [];
    for (const file of Array.from(list).slice(0, 5 - files.length)) {
      if (file.size > 50 * 1024 * 1024) continue;
      next.push({
        name: file.name,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      });
    }
    setFiles((f) => [...f, ...next].slice(0, 5));
  }

  async function submit() {
    setBusy(true);
    setError("");
    const sizesSummary = SIZES.filter((s) => parseInt(sizeCounts[s] || "0", 10) > 0)
      .map((s) => `${s}:${sizeCounts[s]}`)
      .join(" ");
    const messageParts = [
      contact.purpose && `Purpose: ${contact.purpose}`,
      `Print method: ${printMethod}`,
      positions.length > 0 && `Print positions: ${positions.join(", ")}`,
      delivery.date && `Required delivery date: ${delivery.date}`,
      delivery.budget && `Budget range: ${delivery.budget}`,
      `Sample requested: ${sample ? "Yes" : "No"}`,
      files.length > 0 &&
        `Artwork: ${files.length} file${files.length > 1 ? "s" : ""} ready to share (${files.map((f) => f.name).join(", ")})`,
      notes && `Notes: ${notes}`,
    ].filter(Boolean);

    try {
      const res = await fetch(`${BACKEND}/api/applications/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: contact.company,
          contactName: contact.name,
          email: contact.email,
          // Model validates a bare 10-digit number
          phone: contact.phone.replace(/\D/g, "").slice(-10) || undefined,
          address: {
            street: delivery.street,
            city: delivery.city,
            state: delivery.state,
            pincode: delivery.pin,
            country: "India",
          },
          expectedVolume: `${totalQty} pieces`,
          productsToSell: `${totalQty}× ${garment.panel} (${color}) — ${sizesSummary}`,
          categories: [garment.label],
          message: messageParts.join(" | "),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Could not submit the quote request.");
      }
      const now = new Date();
      const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      setRequestId(
        `BLK-${ymd}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      );
      setSubmitted(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not submit the quote request.",
      );
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setSubmitted(false);
    setStep(0);
    setSizeCounts({});
    setFiles([]);
    setAgreed(false);
    setSample(false);
  }

  /* ---------- Confirmation ---------- */
  if (submitted) {
    return (
      <main className="w-full bg-[#f8f9fb] px-4 py-16">
        <div className="mx-auto flex max-w-[600px] flex-col items-center text-center">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#22c55e]">
            <Check className="h-9 w-9 text-white" strokeWidth={3.5} />
          </div>
          <h1 className="pt-6 text-[26px] font-bold tracking-[-0.5px] text-black">
            Quote Request Submitted!
          </h1>
          <p className="pt-2 text-[15px] font-medium text-[#6b7280]">
            Request #{requestId}
          </p>
          <p className="max-w-[440px] pt-3 text-[14px] leading-6 text-[#6b7280]">
            Our team will review your request and send a detailed proposal
            within 24 hours. You&apos;ll receive it via email at{" "}
            <span className="font-semibold text-black">{contact.email}</span>
          </p>

          <section className="mt-10 w-full rounded-[12px] border border-[#e5e7eb] bg-white p-6 text-left shadow-sm">
            <h2 className="flex items-center gap-2 text-[16px] font-bold text-black">
              <ClipboardList className="h-4 w-4" /> Request Summary
            </h2>
            <div className="mt-5 flex gap-4 border-b border-[#f3f4f6] pb-5">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[8px] bg-[#f3f4f6]">
                <Image
                  src={garment.img}
                  alt={garment.panel}
                  fill
                  className="object-contain"
                  sizes="56px"
                />
              </div>
              <div>
                <p className="text-[15px] font-bold text-black">
                  {totalQty}× {garment.panel} ({color})
                </p>
                <p className="pt-1 text-[13px] text-[#6b7280]">
                  Print method: {printMethod.replace("Direct to Film (DTF)", "DTF")} ·{" "}
                  {positions.join(" + ") || "Positions TBD"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 pt-5 sm:grid-cols-2">
              <div>
                <p className={labelCls}>Delivery By</p>
                <p className="pt-1 text-[15px] font-bold text-black">
                  {delivery.date
                    ? new Date(delivery.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Flexible"}
                </p>
              </div>
              <div>
                <p className={labelCls}>Sample Requested</p>
                <p className="flex items-center gap-1.5 pt-1 text-[15px] font-bold text-black">
                  {sample ? (
                    <>
                      <Check className="h-4 w-4 text-[#22c55e]" /> Yes
                    </>
                  ) : (
                    "No"
                  )}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className={labelCls}>Contact Information</p>
                <p className="pt-1 text-[15px] font-bold text-black">
                  {contact.name}
                </p>
                <p className="text-[13px] text-[#6b7280]">
                  {contact.email} · +91 {contact.phone}
                </p>
              </div>
            </div>
          </section>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="rounded-[8px] bg-brand-orange px-8 py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
            >
              Back to Home
            </Link>
            <button
              onClick={reset}
              className="rounded-[8px] border border-[#c4c7c7] bg-white px-8 py-3.5 text-[15px] font-bold text-black transition-colors hover:bg-[#f3f4f6]"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ---------- Wizard ---------- */
  return (
    <main className="w-full bg-[#f8f9fb] px-4 pb-16 sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 pt-8 text-[13px]">
          <Link href="/" className="text-[#6b7280] hover:text-brand-orange">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <Link
            href="/bulk-order"
            className="text-[#6b7280] hover:text-brand-orange"
          >
            Bulk Orders
          </Link>
          <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          <span className="font-semibold text-black">Request a Quote</span>
        </nav>

        <Stepper current={step} />

        <div
          className={`mx-auto grid grid-cols-1 gap-8 ${
            step === 1 || step === 3 ? "lg:grid-cols-[1fr_360px]" : "max-w-[700px]"
          }`}
        >
          <div>
            {/* STEP 1: Contact info */}
            {step === 0 && (
              <form
                className="rounded-[12px] border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-12"
                onSubmit={(e) => {
                  e.preventDefault();
                  setStep(1);
                }}
              >
                <h1 className="text-[26px] font-bold tracking-[-0.5px] text-black">
                  Tell us about your organization
                </h1>
                <p className="pt-2 text-[15px] leading-6 text-[#6b7280]">
                  We&apos;ll use this to prepare your custom quote and ensure
                  the best pricing for your volume.
                </p>
                <div className="grid grid-cols-1 gap-5 pt-8 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-[14px] font-medium text-black">
                      Company / Organization Name
                    </span>
                    <input
                      required
                      value={contact.company}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, company: e.target.value }))
                      }
                      placeholder="e.g. Acme Corp"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[14px] font-medium text-black">
                      Contact Name
                    </span>
                    <input
                      required
                      value={contact.name}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, name: e.target.value }))
                      }
                      placeholder="Full name"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[14px] font-medium text-black">
                      Work Email
                    </span>
                    <input
                      required
                      type="email"
                      value={contact.email}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, email: e.target.value }))
                      }
                      placeholder="name@company.com"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[14px] font-medium text-black">
                      Phone Number
                    </span>
                    <div className="flex h-11 overflow-hidden rounded-[8px] border border-[#c4c7c7] focus-within:border-brand-orange">
                      <span className="flex items-center border-r border-[#c4c7c7] bg-[#f9f9f9] px-3 text-[15px] text-[#444748]">
                        +91
                      </span>
                      <input
                        required
                        type="tel"
                        value={contact.phone}
                        onChange={(e) =>
                          setContact((c) => ({ ...c, phone: e.target.value }))
                        }
                        placeholder="98765 43210"
                        className="min-w-0 flex-1 px-4 text-[15px] text-black placeholder:text-[#9ca3af] focus:outline-none"
                      />
                    </div>
                  </label>
                  <label className="flex flex-col gap-2 sm:col-span-2">
                    <span className="text-[14px] font-medium text-black">
                      Purpose of Bulk Order
                    </span>
                    <div className="relative">
                      <select
                        required
                        value={contact.purpose}
                        onChange={(e) =>
                          setContact((c) => ({ ...c, purpose: e.target.value }))
                        }
                        className={`${inputCls} appearance-none`}
                      >
                        <option value="" disabled>
                          Select an option
                        </option>
                        {PURPOSES.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#444748]" />
                    </div>
                  </label>
                </div>
                <div className="flex justify-end pt-10">
                  <button
                    type="submit"
                    className="rounded-full bg-brand-orange px-10 py-3 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
                  >
                    Continue
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Select products */}
            {step === 1 && (
              <div className="rounded-[12px] border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-8">
                <h1 className="text-[26px] font-bold tracking-[-0.5px] text-black">
                  What do you need printed?
                </h1>
                <div className="grid grid-cols-3 gap-3 pt-6 sm:grid-cols-6">
                  {GARMENTS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGarmentId(g.id)}
                      className={`flex flex-col items-center gap-2 rounded-[8px] px-2 py-4 text-[13px] font-medium ${
                        garmentId === g.id
                          ? "border-2 border-black bg-[#f3f4f6] text-black"
                          : "border border-[#e5e7eb] text-[#374151] hover:border-black"
                      }`}
                    >
                      <span className="relative h-8 w-8">
                        <Image
                          src={g.img}
                          alt={g.label}
                          fill
                          className="object-contain"
                          sizes="32px"
                        />
                      </span>
                      {g.label}
                    </button>
                  ))}
                </div>

                {/* Product panel */}
                <div className="mt-6 rounded-[12px] border border-[#e5e7eb]">
                  <div className="flex items-center justify-between rounded-t-[12px] border-b border-[#e5e7eb] bg-[#f9fafb] px-6 py-4">
                    <h2 className="text-[18px] font-bold text-black">
                      {garment.panel}
                    </h2>
                    {garment.popular && (
                      <span className="rounded-[4px] bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.5px] text-white">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-8 p-6 md:flex-row">
                    <div className="flex flex-col gap-4">
                      <div className="relative h-[200px] w-[200px] shrink-0 overflow-hidden rounded-[8px] bg-[#f3f4f6]">
                        <Image
                          src={garment.img}
                          alt={garment.panel}
                          fill
                          className="object-contain p-4"
                          sizes="200px"
                        />
                      </div>
                      <div>
                        <p className={labelCls}>Select Color</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {COLORS.map((c) => (
                            <button
                              key={c.name}
                              title={c.name}
                              onClick={() => setColor(c.name)}
                              className={`h-9 w-9 rounded-full border ${
                                color === c.name
                                  ? "border-2 border-black ring-2 ring-inset ring-white"
                                  : "border-[#d1d5db]"
                              }`}
                              style={{ background: c.hex }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={labelCls}>Size Breakdown</p>
                      <div className="grid grid-cols-4 gap-3 pt-2">
                        {SIZES.map((s) => (
                          <label key={s} className="flex flex-col gap-1">
                            <span className="text-[11px] font-bold uppercase text-[#6b7280]">
                              {s}
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={sizeCounts[s] ?? ""}
                              onChange={(e) =>
                                setSizeCounts((sc) => ({
                                  ...sc,
                                  [s]: e.target.value,
                                }))
                              }
                              placeholder="0"
                              className="h-11 w-full rounded-[8px] border border-[#c4c7c7] px-3 text-center text-[15px] text-black focus:border-brand-orange focus:outline-none"
                            />
                          </label>
                        ))}
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold uppercase text-[#6b7280]">
                            Total
                          </span>
                          <span className="flex h-11 items-center justify-center rounded-[8px] bg-[#f3f4f6] text-[15px] font-bold text-black">
                            {totalQty}
                          </span>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center justify-between border-t border-[#e5e7eb] pt-4">
                        <span className="text-[15px] text-[#374151]">
                          Unit Price Est.
                        </span>
                        <span className="text-[20px] font-bold text-black">
                          ₹{unitPrice} / pc
                        </span>
                      </div>
                      <p className="pt-3 text-[13px] text-[#6b7280]">
                        <span className="font-bold text-black">
                          Minimum required -
                        </span>{" "}
                        Your order should be minimum {MIN_QTY} pieces.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8">
                  <button
                    onClick={() => setStep(0)}
                    className="rounded-[8px] border border-black px-8 py-3 text-[15px] font-semibold text-black transition-colors hover:bg-[#f3f4f6]"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => totalQty >= MIN_QTY && setStep(2)}
                    disabled={totalQty < MIN_QTY}
                    className="rounded-full bg-brand-orange px-10 py-3 text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Upload design */}
            {step === 2 && (
              <div>
                <div className="rounded-[12px] border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-10">
                  <h1 className="text-[26px] font-bold tracking-[-0.5px] text-black">
                    Share your design
                  </h1>
                  <p className="pt-2 text-[15px] text-[#6b7280]">
                    Upload your high-resolution artwork files and let us know
                    where they should be placed.
                  </p>

                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      addFiles(e.dataTransfer.files);
                    }}
                    className="mt-8 flex w-full flex-col items-center gap-3 rounded-[8px] border border-[#9ca3af] px-6 py-16 transition-colors hover:border-brand-orange"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f3f4f6]">
                      <CloudUpload className="h-6 w-6 text-[#374151]" />
                    </span>
                    <span className="text-[18px] font-bold text-black">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-[14px] text-[#6b7280]">
                      PDF, AI, PNG or JPG (Max 50MB)
                    </span>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,.pdf,.ai,.eps"
                    multiple
                    hidden
                    onChange={(e) => addFiles(e.target.files)}
                  />
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-4">
                      {files.map((f, i) => (
                        <span
                          key={`${f.name}-${i}`}
                          className="flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-[#f9fafb] py-1.5 pl-2 pr-3 text-[13px] text-[#374151]"
                        >
                          {f.preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={f.preview}
                              alt=""
                              className="h-6 w-6 rounded object-cover"
                            />
                          ) : (
                            <ClipboardList className="h-4 w-4" />
                          )}
                          {f.name}
                          <button
                            aria-label={`Remove ${f.name}`}
                            onClick={() =>
                              setFiles((fs) => fs.filter((_, j) => j !== i))
                            }
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="flex items-center gap-2 border-b border-[#e5e7eb] pb-4 pt-10 text-[18px] font-bold text-black">
                    Print Preferences
                  </h2>
                  <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-[14px] font-medium text-black">
                        Print Method
                      </span>
                      <div className="relative">
                        <select
                          value={printMethod}
                          onChange={(e) => setPrintMethod(e.target.value)}
                          className={`${inputCls} appearance-none`}
                        >
                          {PRINT_METHODS.map((m) => (
                            <option key={m}>{m}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#444748]" />
                      </div>
                    </label>
                    <div className="flex flex-col gap-2">
                      <span className="text-[14px] font-medium text-black">
                        Print Positions
                      </span>
                      <div className="flex h-11 items-center gap-6">
                        {POSITIONS.map((p) => (
                          <label
                            key={p}
                            className="flex cursor-pointer items-center gap-2 text-[14px] text-[#374151]"
                          >
                            <input
                              type="checkbox"
                              checked={positions.includes(p)}
                              onChange={(e) =>
                                setPositions((ps) =>
                                  e.target.checked
                                    ? [...ps, p]
                                    : ps.filter((x) => x !== p),
                                )
                              }
                              className="h-4 w-4 accent-black"
                            />
                            {p}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <label className="flex flex-col gap-2 pt-6">
                    <span className="text-[14px] font-medium text-black">
                      Additional Notes
                    </span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Mention specific hex codes, placement measurements, or any special requirements..."
                      className="w-full rounded-[8px] border border-[#c4c7c7] px-4 py-3 text-[15px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                    />
                  </label>

                  <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-8 mt-8">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 rounded-[8px] border border-black px-8 py-3 text-[15px] font-semibold text-black transition-colors hover:bg-[#f3f4f6]"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="rounded-full bg-brand-orange px-10 py-3 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
                    >
                      Continue
                    </button>
                  </div>
                </div>
                <div className="mt-6 flex gap-3 rounded-[12px] bg-[#eef2f7] p-5">
                  <Info className="h-4 w-4 shrink-0 text-[#374151]" />
                  <p className="text-[13px] leading-5 text-[#6b7280]">
                    <span className="font-bold text-[#374151]">
                      Vector files preferred
                    </span>
                    <br />
                    For the best print quality, please provide your artwork in
                    vector format (.AI, .EPS, or .PDF). If you only have
                    high-res raster files (.PNG or .JPG), ensure they are at
                    least 300 DPI.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4: Timeline & submit */}
            {step === 3 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void submit();
                }}
              >
                <h1 className="text-[30px] font-bold tracking-[-0.6px] text-black">
                  Almost done!
                </h1>
                <p className="pt-2 text-[15px] text-[#6b7280]">
                  A few final details to ensure your order arrives perfectly
                  and on time.
                </p>
                <div className="grid grid-cols-1 gap-5 pt-8 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className={labelCls}>Required Delivery Date *</span>
                    <input
                      required
                      type="date"
                      value={delivery.date}
                      onChange={(e) =>
                        setDelivery((d) => ({ ...d, date: e.target.value }))
                      }
                      className={`${inputCls} bg-[#f3f4f6]`}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className={labelCls}>Budget Range (Optional)</span>
                    <div className="relative">
                      <select
                        value={delivery.budget}
                        onChange={(e) =>
                          setDelivery((d) => ({ ...d, budget: e.target.value }))
                        }
                        className={`${inputCls} appearance-none bg-[#f3f4f6]`}
                      >
                        <option value="">Select range</option>
                        {BUDGETS.map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#444748]" />
                    </div>
                  </label>
                  <label className="flex flex-col gap-2 sm:col-span-2">
                    <span className={labelCls}>Delivery Address *</span>
                    <textarea
                      required
                      value={delivery.street}
                      onChange={(e) =>
                        setDelivery((d) => ({ ...d, street: e.target.value }))
                      }
                      rows={3}
                      placeholder="Street address, apartment, suite, etc."
                      className="w-full rounded-[8px] border border-[#c4c7c7] bg-[#f3f4f6] px-4 py-3 text-[15px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className={labelCls}>City *</span>
                    <input
                      required
                      value={delivery.city}
                      onChange={(e) =>
                        setDelivery((d) => ({ ...d, city: e.target.value }))
                      }
                      placeholder="e.g. Jaipur"
                      className={`${inputCls} bg-[#f3f4f6]`}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-5">
                    <label className="flex flex-col gap-2">
                      <span className={labelCls}>State *</span>
                      <input
                        required
                        value={delivery.state}
                        onChange={(e) =>
                          setDelivery((d) => ({ ...d, state: e.target.value }))
                        }
                        placeholder="e.g. Rajasthan"
                        className={`${inputCls} bg-[#f3f4f6]`}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className={labelCls}>PIN Code *</span>
                      <input
                        required
                        pattern="\d{6}"
                        value={delivery.pin}
                        onChange={(e) =>
                          setDelivery((d) => ({ ...d, pin: e.target.value }))
                        }
                        placeholder="e.g. 302021"
                        className={`${inputCls} bg-[#f3f4f6]`}
                      />
                    </label>
                  </div>
                </div>

                <label className="mt-6 flex cursor-pointer items-center justify-between rounded-[8px] bg-[#f3f4f6] p-5">
                  <span>
                    <span className="block text-[15px] font-bold text-black">
                      Need a sample first?
                    </span>
                    <span className="block pt-0.5 text-[13px] text-[#6b7280]">
                      We&apos;ll ship a prototype of your custom product for
                      approval.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={sample}
                    onChange={(e) => setSample(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="relative h-7 w-12 shrink-0 rounded-full bg-[#d1d5db] transition-colors peer-checked:bg-black after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
                </label>

                <label className="flex cursor-pointer items-start gap-3 pt-6 text-[14px] text-[#374151]">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-black"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms-and-conditions" className="font-semibold underline">
                      Terms of Service
                    </Link>{" "}
                    and confirm that all design rights provided belong to me or
                    my organization.
                  </span>
                </label>

                {error && (
                  <p className="mt-4 rounded-[8px] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#ba1a1a]">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!agreed || busy}
                  className="mt-6 w-full rounded-[8px] bg-black py-4 text-[17px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Submitting…" : "Submit Quote Request →"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-3 w-full py-2 text-center text-[14px] font-semibold text-[#6b7280] hover:text-black"
                >
                  Back
                </button>
              </form>
            )}
          </div>

          {/* RIGHT rail on steps 2 & 4 */}
          {step === 1 && (
            <aside className="h-fit rounded-[12px] border border-[#e5e7eb] bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-[20px] font-bold tracking-[-0.4px] text-black">
                Quote Summary
              </h2>
              <div className="flex items-start justify-between border-b border-[#e5e7eb] pb-5 pt-5">
                <div>
                  <p className="text-[15px] font-bold text-black">
                    {garment.panel}
                  </p>
                  <p className="pt-0.5 text-[13px] text-[#6b7280]">
                    {color} •{" "}
                    {SIZES.filter((s) => parseInt(sizeCounts[s] || "0", 10) > 0)
                      .join("-") || "Sizes TBD"}
                  </p>
                </div>
                <span className="text-[15px] font-bold text-black">
                  {totalQty} pcs
                </span>
              </div>
              <div className="flex flex-col gap-3 pt-5">
                <div className="flex justify-between text-[15px]">
                  <span className="text-[#374151]">Total Quantity</span>
                  <span className="font-bold text-black">
                    {totalQty} pieces
                  </span>
                </div>
                <div className="flex justify-between text-[15px]">
                  <span className="text-[#374151]">Selected Styles</span>
                  <span className="font-bold text-black">1</span>
                </div>
              </div>
              <div className="flex items-end justify-between pt-8">
                <span className="text-[15px] text-[#374151]">
                  Est. Quote
                  <br />
                  Range
                </span>
                <span className="text-right">
                  <span className="block text-[26px] font-bold leading-tight text-black">
                    ₹{estLow.toLocaleString("en-IN")} –<br />₹
                    {estHigh.toLocaleString("en-IN")}
                  </span>
                  <span className="block pt-1 text-[10px] font-bold uppercase tracking-[0.5px] text-[#9ca3af]">
                    Tax &amp; shipping calculated at step 3
                  </span>
                </span>
              </div>
              <div className="mt-6 flex gap-3 rounded-[8px] bg-[#171d29] p-4">
                <Info className="h-4 w-4 shrink-0 text-white/70" />
                <p className="text-[13px] leading-5 text-white/70">
                  <span className="font-bold text-white">
                    Bulk Discount applied.
                  </span>{" "}
                  Your order of {MIN_QTY}+ pieces qualifies for a reduction in
                  unit price.
                </p>
              </div>
            </aside>
          )}

          {step === 3 && (
            <aside className="h-fit rounded-[12px] border border-[#e5e7eb] bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="flex items-center gap-2 text-[18px] font-bold text-black">
                <ClipboardList className="h-4 w-4" /> Your Request Summary
              </h2>
              <div className="flex gap-4 border-b border-[#e5e7eb] pb-5 pt-5">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[8px] bg-[#f3f4f6]">
                  <Image
                    src={garment.img}
                    alt={garment.panel}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-black">
                    {garment.panel}
                  </p>
                  <p className="pt-1 text-[13px] text-[#6b7280]">
                    Color: {color}
                  </p>
                  <p className="text-[13px] text-[#6b7280]">
                    Qty: {totalQty} Units
                  </p>
                </div>
              </div>
              <div className="pt-5">
                <p className={labelCls}>Applied Design</p>
                <div className="relative mt-3 flex h-[140px] items-center justify-center overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-[#f9fafb]">
                  {files[0]?.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={files[0].preview}
                      alt="Applied design"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Image
                      src="/ab-creation-logo.png"
                      alt="Design placeholder"
                      width={80}
                      height={80}
                      className="opacity-50"
                    />
                  )}
                  {positions[0] && (
                    <span className="absolute bottom-2 right-2 rounded-[4px] bg-black px-2 py-1 text-[10px] font-bold uppercase text-white">
                      {positions[0]} print
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3 border-t border-[#e5e7eb] pt-5 mt-5 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Production Time</span>
                  <span className="font-bold text-black">
                    Standard (10-14 days)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Shipping Estimate</span>
                  <span className="font-bold text-black">Included in quote</span>
                </div>
              </div>
              <div className="mt-5 flex gap-3 rounded-[8px] bg-[#f3f4f6] p-4">
                <Info className="h-4 w-4 shrink-0 text-[#6b7280]" />
                <p className="text-[13px] leading-5 text-[#6b7280]">
                  Quotes are typically processed within 4-6 business hours.
                </p>
              </div>
            </aside>
          )}
        </div>

        {/* Trust row under step 1 */}
        {step === 0 && (
          <div className="flex flex-wrap items-center justify-center gap-10 pt-10">
            <span className="flex items-center gap-2 text-[13px] text-[#6b7280]">
              <ShieldCheck className="h-4 w-4" /> Secure Request
            </span>
            <span className="flex items-center gap-2 text-[13px] text-[#6b7280]">
              <Timer className="h-4 w-4" /> 24h Response Guarantee
            </span>
            <span className="flex items-center gap-2 text-[13px] text-[#6b7280]">
              <Handshake className="h-4 w-4" /> Dedicated Manager
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
