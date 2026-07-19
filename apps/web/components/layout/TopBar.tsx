export default function TopBar() {
  return (
    <div className="w-full bg-black text-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-2 text-[12px] leading-4 sm:px-8">
        <p className="truncate">
          Made-to-order apparel — standard production 7-10 business days.
        </p>
        <div className="hidden shrink-0 items-center gap-4 sm:flex">
          <span>🕒 Mon–Sat, 9:00 AM – 5:30 PM</span>
        </div>
      </div>
    </div>
  );
}
