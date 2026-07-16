"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";

export type FilterOption = { label: string; value: string };

export default function FilterDropdown({
  label,
  paramKey,
  options,
}: {
  label: string;
  paramKey: string;
  options: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = searchParams.get(paramKey);
  const activeLabel = options.find((o) => o.value === current)?.label;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === current) {
      params.delete(paramKey);
    } else {
      params.set(paramKey, value);
    }
    params.delete("page"); // any filter change resets to page 1
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex h-[38px] items-center gap-1.5 rounded-full border px-4 font-poppins text-[14px] tracking-[0.14px] transition-colors ${
          current
            ? "border-[#a04100] bg-[#a04100] text-white"
            : "border-[#262626] bg-[#f0edeb] text-[#1b1c1b] hover:bg-[#e6e1dd]"
        }`}
      >
        {activeLabel ?? label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-11 z-50 min-w-[180px] rounded-lg border border-[#e9e9e9] bg-white py-1 shadow-lg">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => select(o.value)}
              className="flex w-full items-center justify-between px-4 py-2 text-left text-[14px] text-[#1b1c1b] hover:bg-[#f5f1ea]"
            >
              {o.label}
              {current === o.value && (
                <Check className="h-4 w-4 text-[#a04100]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
