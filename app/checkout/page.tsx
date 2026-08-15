"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Lock, RotateCcw, Zap } from "lucide-react";
import {
  type CartItem,
  getCart,
  cartSubtotal,
  clearCart,
} from "@/lib/cart";
import { apiFetch, getToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const SHIPPING = [
  { id: "standard", label: "Standard", time: "5-7 days", price: 0, days: 7 },
  { id: "express", label: "Express", time: "2-3 days", price: 149, days: 3 },
  { id: "rush", label: "Super Rush", time: "24-48 hrs", price: 299, days: 2 },
];



const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal",
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[14px] font-medium text-black">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "h-11 w-full rounded-[8px] border border-[#c4c7c7] bg-white px-4 text-[15px] text-black placeholder:text-[#6b7280] focus:border-brand-orange focus:outline-none";

/* Custom radio dot matching the Figma states: selected = black disc with
   white inner dot, unselected = white circle with light border. */
function RadioDot({ selected, size = 18 }: { selected: boolean; size?: number }) {
  return selected ? (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-black"
      style={{ width: size, height: size }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white" />
    </span>
  ) : (
    <span
      className="shrink-0 rounded-full border border-[#e2e2e2] bg-white"
      style={{ width: size, height: size }}
    />
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items] = useState<CartItem[]>(() =>
    typeof window !== "undefined" ? getCart() : []
  );
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [shipping, setShipping] = useState("standard");
  const [payment, setPayment] = useState<"razorpay" | "cod">("razorpay");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [prefill, setPrefill] = useState<{
    email?: string;
    phone?: string;
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  } | null>(null);

  useEffect(() => {
    // Purchases require login (wallet payment) — send guests to log in first.
    if (!getToken()) {
      router.replace("/login?next=/checkout");
      return;
    }
    // Pre-fill contact + shipping from the saved profile/default address.
    apiFetch<{
      data: {
        user: {
          name?: string;
          email?: string;
          phone?: string | null;
          address?: {
            street?: string | null;
            city?: string | null;
            state?: string | null;
            pincode?: string | null;
          } | null;
        };
      };
    }>("/api/users/profile")
      .then((j) => {
        const u = j.data.user;
        setPrefill({
          email: u.email ?? undefined,
          phone: u.phone ?? undefined,
          name: u.name ?? undefined,
          street: u.address?.street ?? undefined,
          city: u.address?.city ?? undefined,
          state: u.address?.state ?? undefined,
          pincode: u.address?.pincode ?? undefined,
        });
      })
      .catch(() => setPrefill({}));
  }, [router]);

  const subtotal = cartSubtotal(items);
  const method = SHIPPING.find((s) => s.id === shipping) ?? SHIPPING[0];
  const codFee = 0; // COD not offered yet — orders are wallet-paid
  const total = subtotal + method.price + codFee;

  const eta = new Date();
  eta.setDate(eta.getDate() + method.days);
  const etaLabel = eta.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Upload a custom item's artwork (data URL) and return the hosted URLs.
  async function uploadArtwork(artwork: string): Promise<string[]> {
    const blob = await (await fetch(artwork)).blob();
    const fd = new FormData();
    fd.append("designs", blob, "custom-design.png");
    const j = await apiFetch<{ data: { urls: string[] } }>(
      "/api/orders/upload-designs",
      { method: "POST", body: fd },
    );
    return j.data?.urls ?? [];
  }

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const missingProduct = items.filter((i) => !i.productId);
    if (missingProduct.length > 0) {
      setError(
        `${missingProduct.map((i) => `"${i.title}"`).join(", ")} isn't linked to a catalog product. ` +
          "Please re-add it from the product page (or open the design studio from a product).",
      );
      return;
    }

    setPlacing(true);
    const fd = new FormData(e.currentTarget);

    try {
      const orderItems = await Promise.all(
        items.map(async (i) => ({
          productId: i.productId,
          productType: i.productType ?? "ready",
          variantId: i.variantId || undefined,
          color: i.color || undefined,
          size: i.size || undefined,
          quantity: i.quantity,
          customDesign: i.customDesign || undefined,
          // Reorders carry already-hosted files; fresh studio items upload now
          designFiles:
            i.designFiles?.length
              ? i.designFiles
              : i.artwork
                ? await uploadArtwork(i.artwork)
                : undefined,
        })),
      );

      const street = [fd.get("addr1"), fd.get("addr2")]
        .filter(Boolean)
        .join(", ");
      const res = await apiFetch<{
        data: { orders: unknown[]; grandTotal: number; orderId?: string };
      }>("/api/orders/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: {
            street,
            city: fd.get("city"),
            state: fd.get("state"),
            pincode: fd.get("pin"),
            country: "India",
          },
          phoneNumber: `+91${String(fd.get("phone")).replace(/\D/g, "")}`,
          shippingMethod: method.id,
        }),
      });

      const orderId = res.data?.orderId ?? "";
      const addressParts = [
        [fd.get("fullName"), street].filter(Boolean).join(", "),
        `${fd.get("city")}, ${fd.get("state")} ${fd.get("pin")}`,
      ];
      try {
        sessionStorage.setItem(
          "ab:lastOrder",
          JSON.stringify({
            orderId,
            email: fd.get("email"),
            address: addressParts,
            items: items.map(({ title, variant, image, price, quantity }) => ({
              title,
              variant,
              image,
              price,
              quantity,
            })),
            subtotal,
            shipping: method,
            payment,
            codFee,
            total: res.data?.grandTotal ?? total,
            etaLabel,
          }),
        );
      } catch {
        // snapshot is a nicety; the order itself is placed
      }
      // Optionally persist the shipping address to the profile (best-effort;
      // never blocks the order that was already placed).
      if (fd.get("saveAddr")) {
        try {
          await apiFetch("/api/users/profile", {
            method: "PUT",
            body: JSON.stringify({
              address: {
                street,
                city: fd.get("city"),
                state: fd.get("state"),
                pincode: fd.get("pin"),
                country: "India",
              },
            }),
          });
        } catch {
          // saved-address is a nicety; the order itself is placed
        }
      }
      clearCart();
      router.push(`/order-confirmed?orderId=${encodeURIComponent(orderId)}`);
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      if (status === 401) {
        router.push("/login?next=/checkout");
        return;
      }
      setError(
        status === 402
          ? "Insufficient wallet balance. Recharge your wallet from My Account → Wallet, then try again."
          : err instanceof Error
            ? err.message
            : "Could not place the order. Please try again.",
      );
      setPlacing(false);
    }
  }

  if (!mounted) return <div className="min-h-[60vh] bg-white" />;

  return (
    <main className="min-h-[60vh] w-full bg-white px-4 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1152px]">
        <form
          key={prefill ? "prefilled" : "blank"}
          onSubmit={placeOrder}
          className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_420px]"
        >
          {/* LEFT: form */}
          <div className="flex flex-col gap-12">
            {/* Contact */}
            <section>
              <h2 className="mb-6 text-[18px] font-semibold text-black">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email Address">
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={prefill?.email}
                    placeholder="email@example.com"
                    className={inputCls}
                  />
                </Field>
                <Field label="Phone Number">
                  <div className="flex h-11 overflow-hidden rounded-[8px] border border-[#c4c7c7] focus-within:border-brand-orange">
                    <span className="flex items-center border-r border-[#c4c7c7] bg-[#f9f9f9] px-3 text-[15px] text-[#444748]">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      required
                      defaultValue={prefill?.phone}
                      placeholder="00000 00000"
                      className="min-w-0 flex-1 px-4 text-[15px] text-black placeholder:text-[#6b7280] focus:outline-none"
                    />
                  </div>
                </Field>
              </div>
            </section>

            {/* Shipping address */}
            <section>
              <h2 className="mb-6 text-[18px] font-semibold text-black">
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Full Name">
                    <input name="fullName" required defaultValue={prefill?.name} placeholder="Enter your full name" className={inputCls} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Address Line 1">
                    <input name="addr1" required defaultValue={prefill?.street} placeholder="House no., Building, Street" className={inputCls} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Address Line 2 (Optional)">
                    <input name="addr2" placeholder="Landmark, Area, Colony" className={inputCls} />
                  </Field>
                </div>
                <Field label="City">
                  <input name="city" required defaultValue={prefill?.city} placeholder="City" className={inputCls} />
                </Field>
                <Field label="State">
                  <select name="state" required defaultValue={prefill?.state ?? ""} className={inputCls}>
                    <option value="" disabled>Select State</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="PIN Code">
                  <input name="pin" required pattern="\d{6}" defaultValue={prefill?.pincode} placeholder="6-digit PIN" className={inputCls} />
                </Field>
                <Field label="Country">
                  <input
                    value="India"
                    readOnly
                    className={`${inputCls} bg-[#eeeeee] text-[#444748]`}
                  />
                </Field>
              </div>
              <label className="mt-5 flex cursor-pointer items-center gap-3 text-[14px] text-black">
                <input
                  type="checkbox"
                  name="saveAddr"
                  className="h-4 w-4 rounded border-[#c4c7c7] accent-black"
                />
                Save this address for future orders
              </label>
            </section>

            {/* Shipping method */}
            <section>
              <h2 className="mb-6 text-[18px] font-semibold text-black">
                Shipping Method
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {SHIPPING.map((s) => {
                  const selected = shipping === s.id;
                  return (
                    <label
                      key={s.id}
                      className={`relative cursor-pointer rounded-[12px] bg-white p-[17px] ${
                        selected
                          ? "border-2 border-black"
                          : "border border-[#c4c7c7]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        checked={selected}
                        onChange={() => setShipping(s.id)}
                        className="sr-only"
                      />
                      <span className="absolute right-4 top-4">
                        <RadioDot selected={selected} size={selected ? 18 : 16} />
                      </span>
                      <p className="flex items-center gap-1 text-[16px] font-semibold text-black">
                        {s.label}
                        {s.id === "rush" && (
                          <Zap className="h-3 w-3 fill-[#7B5804] text-[#7B5804]" />
                        )}
                      </p>
                      <p className="mt-1 text-[14px] text-[#444748]">{s.time}</p>
                      <p className="mt-4 text-[16px] font-bold text-[#1a1c1c]">
                        {s.price === 0 ? "Free" : `₹${s.price}`}
                      </p>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="mb-6 text-[18px] font-semibold text-black">
                Payment Method
              </h2>
              <div className="flex flex-col gap-4">
                <label
                  className={`cursor-pointer rounded-[12px] border border-[#c4c7c7] p-[25px] ${
                    payment === "razorpay" ? "bg-[#f3f3f4]" : "bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === "razorpay"}
                    onChange={() => setPayment("razorpay")}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <RadioDot selected={payment === "razorpay"} size={16} />
                      <span className="text-[16px] font-semibold text-[#1a1c1c]">
                        Wallet Payment (via Razorpay)
                      </span>
                    </span>
                    <span className="flex gap-2">
                      {["UPI", "VISA", "CARD"].map((chip) => (
                        <span
                          key={chip}
                          className="flex h-5 w-8 items-center justify-center rounded-[4px] border border-[#c4c7c7] bg-white text-[8px] font-bold text-[#1a1c1c]"
                        >
                          {chip}
                        </span>
                      ))}
                    </span>
                  </div>
                  <p className="mt-4 text-[14px] leading-[19.6px] text-[#444748]">
                    Paid instantly from your AB Creation wallet. Top up the wallet
                    via Razorpay (UPI, cards, net banking) from My Account →
                    Wallet.
                  </p>
                </label>

                <label
                  title="Cash on Delivery is coming soon"
                  className="flex cursor-not-allowed items-center justify-between rounded-[12px] border border-[#e5e7eb] bg-white p-[25px] opacity-50"
                >
                  <input type="radio" name="payment" disabled className="sr-only" />
                  <span className="flex items-center gap-3">
                    <RadioDot selected={payment === "cod"} size={20} />
                    <span>
                      <span className="block text-[16px] font-semibold text-[#1a1c1c]">
                        Cash on Delivery
                      </span>
                      <span className="block text-[14px] text-[#444748]">
                        Pay when you receive the product
                      </span>
                    </span>
                  </span>
                  <span className="text-[12px] font-bold uppercase tracking-[0.5px] text-[#9ca3af]">
                    Coming soon
                  </span>
                </label>
              </div>
            </section>

            {/* CTA */}
            <div>
              {error && (
                <p className="mb-4 rounded-[8px] bg-[#fef2f2] px-4 py-3 text-[14px] text-[#ba1a1a]">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={items.length === 0 || placing}
                className="w-full rounded-full bg-brand-orange py-4 text-[18px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placing ? "Placing order…" : "Place Order"}
              </Button>
              <p className="mt-6 text-center text-[14px] text-[#444748]">
                By placing an order, you agree to our{" "}
                <Link href="/terms-and-conditions" className="underline hover:text-black">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="underline hover:text-black">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          {/* RIGHT: order review */}
          <aside className="h-fit rounded-[12px] border border-[#c4c7c7] bg-white p-[33px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] lg:sticky lg:top-24">
            <h2 className="text-[18px] font-semibold text-black">
              Order Review
            </h2>

            <div className="mt-8 flex flex-col gap-6">
              {items.length === 0 ? (
                <p className="text-[14px] text-[#444748]">
                  Your cart is empty.{" "}
                  <Link href="/collection" className="text-brand-orange underline">
                    Shop now
                  </Link>
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[8px] border border-[#c4c7c7] bg-[#eeeeee]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                      <p className="truncate text-[16px] font-medium text-black">
                        {item.title}
                      </p>
                      <div className="flex items-end justify-between">
                        <span className="text-[14px] text-[#444748]">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-[16px] font-semibold text-[#1a1c1c]">
                          {item.quantity > 1
                            ? `₹${item.price.toLocaleString("en-IN")} × ${item.quantity}`
                            : `₹${item.price.toLocaleString("en-IN")}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="my-8 h-px w-full bg-[#c4c7c7]" />

            <div className="flex flex-col gap-4 text-[16px] text-[#444748]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping ({method.label})</span>
                <span>{method.price === 0 ? "Free" : `₹${method.price}`}</span>
              </div>
              {codFee > 0 && (
                <div className="flex justify-between">
                  <span>COD Fee</span>
                  <span>₹{codFee}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[16px] font-semibold text-black">
                  Total
                </span>
                <span className="text-[24px] font-bold text-black">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-[8px] bg-[#ecfdf5] p-4">
              <BadgeCheck className="h-5 w-5 shrink-0 text-[#22c55e]" />
              <span className="text-[14px] font-semibold text-[#22c55e]">
                Expected delivery: {etaLabel}
              </span>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-[12px] text-[#444748]">
                <Lock className="h-3 w-3" /> Secure SSL Payment
              </span>
              <span className="flex items-center gap-2 text-[12px] text-[#444748]">
                <RotateCcw className="h-3 w-3" /> Easy Returns
              </span>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
