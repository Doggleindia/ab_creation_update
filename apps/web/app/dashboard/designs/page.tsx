"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import {
  type DesignDraft,
  activateDesign,
  getDesigns,
  removeDesign,
  renameDesign,
  subscribeDesigns,
} from "@/lib/designs";

const PAGE_SIZE = 8;

const dt = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

export default function SavedDesignsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DesignDraft[]>([]);
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const sync = () => setDrafts(getDesigns());
    sync();
    setMounted(true);
    return subscribeDesigns(sync);
  }, []);

  const pages = Math.max(1, Math.ceil(drafts.length / PAGE_SIZE));
  const pageRows = drafts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function order(d: DesignDraft) {
    activateDesign(d);
    router.push("/design-studio/preview");
  }

  function rename(d: DesignDraft) {
    const name = window.prompt("Design name", d.name);
    if (name !== null) renameDesign(d.id, name);
  }

  function remove(d: DesignDraft) {
    if (window.confirm(`Delete "${d.name}"? This cannot be undone.`)) {
      removeDesign(d.id);
    }
  }

  const subtitle = (d: DesignDraft) =>
    [
      d.state.product?.title ?? "Round Neck T-Shirt",
      d.state.colorDisplay ?? d.state.colorName,
      d.state.printMethod,
    ]
      .filter(Boolean)
      .join(" · ");

  return (
    <AccountShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[32px] font-bold tracking-[-0.6px] text-black">
          Saved Designs{" "}
          {mounted && (
            <span className="text-[18px] font-medium text-[#6b7280]">
              ({drafts.length} design{drafts.length === 1 ? "" : "s"})
            </span>
          )}
        </h1>
        <Link
          href="/design-studio"
          className="flex items-center gap-2 rounded-[8px] bg-black px-5 py-3 text-[13.5px] font-bold text-white hover:opacity-85"
        >
          <Plus className="h-4 w-4" /> Start New Design
        </Link>
      </div>

      <div className="mt-6 rounded-[12px] border border-[#e5e7eb] bg-white p-6">
        {mounted && drafts.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-[16px] font-semibold text-black">No saved designs yet</p>
            <p className="pt-2 text-[13.5px] text-[#6b7280]">
              Create something in the Design Studio and hit Save — your drafts
              appear here, stored on this device.
            </p>
            <Link
              href="/design-studio"
              className="mt-6 inline-block rounded-[8px] bg-black px-7 py-3 text-[13.5px] font-bold text-white hover:opacity-85"
            >
              Open Design Studio
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {pageRows.map((d) => (
                <div key={d.id} className="flex flex-col">
                  <div
                    className="relative flex h-[230px] items-center justify-center overflow-hidden rounded-[10px] border border-[#e5e7eb]"
                    style={{ background: d.state.colorHex ?? "#f6f5f2" }}
                  >
                    {d.state.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element -- artwork data URL */
                      <img
                        src={d.state.image}
                        alt={d.name}
                        className="max-h-[80%] max-w-[80%] object-contain"
                      />
                    ) : (
                      <span className="text-[12px] text-[#9ca3af]">No artwork yet</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <p className="truncate text-[16px] font-bold text-black">{d.name}</p>
                    <button
                      onClick={() => rename(d)}
                      aria-label={`Rename ${d.name}`}
                      className="p-1 text-[#9ca3af] hover:text-black"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[13px] text-[#6b7280]">Saved {dt(d.savedAt)}</p>
                  <p className="truncate text-[13px] text-[#6b7280]">{subtitle(d)}</p>
                  <div className="flex gap-2.5 pt-3">
                    <Link
                      href={`/design-studio?draft=${d.id}`}
                      className="flex-1 rounded-[8px] border border-[#c4c7c7] py-2.5 text-center text-[12px] font-bold uppercase tracking-[0.5px] text-black hover:bg-[#f3f4f6]"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => order(d)}
                      className="flex-1 rounded-[8px] bg-black py-2.5 text-[12px] font-bold uppercase tracking-[0.5px] text-white hover:opacity-85"
                    >
                      Order
                    </button>
                  </div>
                  <button
                    onClick={() => remove(d)}
                    className="pt-2.5 text-center text-[11.5px] font-bold uppercase tracking-[0.5px] text-[#9ca3af] hover:text-[#dc2626]"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#f3f4f6] pt-5">
              <p className="text-[13.5px] text-[#6b7280]">
                Showing {(page - 1) * PAGE_SIZE + 1}-
                {Math.min(page * PAGE_SIZE, drafts.length)} of {drafts.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#e5e7eb] text-[#374151] hover:border-black disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-9 w-9 rounded-[8px] text-[13px] font-bold ${
                      page === n
                        ? "bg-black text-white"
                        : "border border-[#e5e7eb] text-[#374151] hover:border-black"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  aria-label="Next page"
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#e5e7eb] text-[#374151] hover:border-black disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <p className="pt-4 text-[12.5px] text-[#9ca3af]">
        Designs are saved on this device from the Design Studio. Ordering opens
        the studio preview with the design loaded.
      </p>
    </AccountShell>
  );
}
