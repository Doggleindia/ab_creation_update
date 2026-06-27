"use client";

import { useEffect, useState } from "react";
import { getLookbookAll } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";

type LookbookItem = {
  _id: string;
  title?: string;
  description?: string;
  mediaUrl: string;
  mediaType: string; // 'image' | 'video'
};

export default function LookbookSection() {
  const [items, setItems] = useState<LookbookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getLookbookAll();
        if (!mounted) return;
        if (res?.status === "success") {
          setItems(res?.data?.lookbookItems || []);
        } else {
          toast("error", res?.message || "Failed to load lookbook");
        }
      } catch (err: any) {
        console.error(err);
        toast("error", err?.response?.data?.message || err?.message || "Failed to load lookbook");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, [toast]);

  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4 py-14">
        {loading ? (
          <div className="text-center py-20 text-sm text-muted-foreground">Loading lookbook...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-sm text-muted-foreground">No lookbook items available.</div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {items.map((it, index) => (
              <div key={it._id || index} className="break-inside-avoid">
                {it.mediaType === "video" ? (
                  <video
                    src={it.mediaUrl}
                    controls
                    className="w-full rounded-sm object-cover"
                    preload="metadata"
                  />
                ) : (
                  <img loading="lazy" decoding="async" src={it.mediaUrl} alt={it.title || `Lookbook ${index + 1}`} className="w-full rounded-sm object-cover" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
