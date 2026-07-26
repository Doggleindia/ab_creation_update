"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, PackageCheck, Truck, ShieldCheck, ChevronRight } from "lucide-react";

export default function TrackOrderSearchPage() {
  const router = useRouter();
  const [orderIdInput, setOrderIdInput] = useState("");

  function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!orderIdInput.trim()) return;
    const cleanId = orderIdInput.trim().replace(/^#/, "");
    router.push(`/track-order/${encodeURIComponent(cleanId)}`);
  }

  return (
    <main className="min-h-[70vh] w-full bg-white px-4 py-12 sm:px-8 lg:px-16 font-poppins">
      <div className="mx-auto max-w-[800px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-[13px] text-[#6b7280]">
          <Link href="/" className="hover:text-brand-orange">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#9ca3af]" />
          <span className="font-semibold text-black">Track Order</span>
        </nav>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#ff6b00]">
            <Truck className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-[32px] font-bold tracking-tight text-black sm:text-[36px]">
            Track Your Order
          </h1>
          <p className="mt-2 text-[15px] text-[#6b7280]">
            Enter your Order ID and contact details to check the real-time status of your custom order.
          </p>
        </div>

        {/* Search Card */}
        <div className="mt-8 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleTrack} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-[#1b1c1b]">
                Order ID*
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC-20260710-0047"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#d1d5db] bg-white pl-4 pr-10 text-[14px] text-black placeholder:text-[#9ca3af] focus:border-brand-orange focus:outline-none"
                />
                <Search className="absolute right-3.5 h-4 w-4 text-gray-400" />
              </div>
            </div>


            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#ff6b00] to-[#ff4500] py-4 font-poppins text-[16px] font-bold text-white shadow-md transition-opacity hover:opacity-95"
            >
              Track Order Status
            </button>
          </form>
        </div>

        {/* Info Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-[#f3f4f6] bg-[#fafafa] p-5">
            <PackageCheck className="h-6 w-6 text-brand-orange" />
            <h3 className="font-bold text-[14px] text-black">Live Printing Updates</h3>
            <p className="text-[12px] text-[#6b7280]">
              Track design verification, print production, and quality checks.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-xl border border-[#f3f4f6] bg-[#fafafa] p-5">
            <Truck className="h-6 w-6 text-brand-orange" />
            <h3 className="font-bold text-[14px] text-black">Courier Tracking</h3>
            <p className="text-[12px] text-[#6b7280]">
              Get real-time tracking number once shipped via BlueDart or Delhivery.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-xl border border-[#f3f4f6] bg-[#fafafa] p-5">
            <ShieldCheck className="h-6 w-6 text-brand-orange" />
            <h3 className="font-bold text-[14px] text-black">Delivery Guarantee</h3>
            <p className="text-[12px] text-[#6b7280]">
              We guarantee safe and timely delivery for all custom orders.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
