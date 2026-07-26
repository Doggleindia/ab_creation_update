import { getSiteContent } from "@/lib/api";
import { Phone } from "lucide-react";

export default async function TopBar() {
  const content = await getSiteContent();
  const announcement = content.announcement ?? {};
  if (announcement.visible === false) return null;
  return (
    <div className="w-full bg-black text-white">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[12px] font-medium leading-4 sm:px-8">
        <p className="truncate text-[13px] text-white">
          {announcement.text ||
            "If you order today estimate delivery time is 12 September."}
        </p>
        <div className="flex shrink-0 items-center gap-5 text-[12px] text-gray-200">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white" />
            {announcement.hours || "9:00 AM - 5:30 PM"}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 fill-current text-white" />
            Call us: (912) 112 12 12
          </span>
        </div>
      </div>
    </div>
  );
}

