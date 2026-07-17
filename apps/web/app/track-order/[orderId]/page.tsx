import Link from "next/link";
import { Check, Bell } from "lucide-react";

const STEPS = [
  { label: "Order Placed", desc: "We've received your order", date: "17 Jul, 10:24 AM", done: true },
  { label: "Confirmed", desc: "Payment confirmed & in production", date: "17 Jul, 11:02 AM", done: true },
  { label: "Shipped", desc: "Your order is on the way", date: "Expected 19 Jul", done: false },
  { label: "Out for Delivery", desc: "Arriving today", date: "—", done: false },
  { label: "Delivered", desc: "Order completed", date: "—", done: false },
];

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <main className="min-h-[60vh] w-full bg-[#f9fafb] px-4 py-8 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1152px]">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-[13px] text-[#6b7280]">
          <Link href="/" className="hover:text-brand-orange">Home</Link>
          <span>/</span>
          <Link href="/dashboard/orders" className="hover:text-brand-orange">Orders</Link>
          <span>/</span>
          <span className="text-[#111827]">Track</span>
        </nav>

        <h1 className="mb-6 font-poppins text-2xl font-bold text-[#111827]">
          Order #{orderId}
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
          {/* LEFT: timeline */}
          <div className="flex flex-col gap-6">
            <section className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
              <h2 className="mb-6 text-[16px] font-bold text-[#111827]">
                Journey Status
              </h2>
              <ol className="relative flex flex-col gap-8">
                {STEPS.map((step, i) => (
                  <li key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          step.done ? "bg-green-500 text-white" : "border-2 border-[#e8e6e3] bg-white text-[#9ca3af]"
                        }`}
                      >
                        {step.done ? <Check className="h-4 w-4" /> : <span className="text-[12px]">{i + 1}</span>}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`mt-1 w-0.5 flex-1 ${step.done ? "bg-green-500" : "bg-[#e8e6e3]"}`} style={{ minHeight: 32 }} />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className={`text-[15px] font-semibold ${step.done ? "text-[#111827]" : "text-[#9ca3af]"}`}>
                        {step.label}
                      </p>
                      <p className="text-[13px] text-[#6b7280]">{step.desc}</p>
                      <p className="mt-0.5 text-[12px] text-[#9ca3af]">{step.date}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Notification opt-in */}
            <section className="flex items-center justify-between rounded-2xl border border-[#e8e6e3] bg-white p-5">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-brand-orange" />
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">Get delivery updates</p>
                  <p className="text-[13px] text-[#6b7280]">We&apos;ll notify you at every step via email & SMS.</p>
                </div>
              </div>
              <button className="rounded-full bg-brand-orange px-5 py-2 text-[13px] font-semibold text-white">
                Notify me
              </button>
            </section>
          </div>

          {/* RIGHT: order details */}
          <aside className="h-fit rounded-2xl border border-[#e8e6e3] bg-white p-6">
            <h2 className="text-[16px] font-bold text-[#111827]">Order Details</h2>
            <div className="mt-4 border-b border-[#e8e6e3] pb-4">
              <p className="text-[14px] font-semibold text-[#111827]">
                Round Neck T-Shirt — Custom Design
              </p>
              <p className="mt-0.5 text-[13px] text-[#6b7280]">
                White · Size L · DTF Print · Qty: 1
              </p>
            </div>
            <div className="pt-4">
              <p className="text-[12px] font-bold uppercase tracking-wide text-[#9ca3af]">
                Shipping Address
              </p>
              <p className="mt-2 text-[14px] font-semibold text-[#111827]">Rahul Sharma</p>
              <p className="text-[13px] leading-5 text-[#6b7280]">
                Flat 402, Green Meadows, 12th Main Road, Indiranagar,
                Bengaluru, Karnataka 560038
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
