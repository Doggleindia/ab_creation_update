import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiUploadCloud,
  FiTrash2,
  FiArrowUp,
  FiArrowDown,
  FiEdit2,
  FiCheck,
  FiFilm,
} from "react-icons/fi";
import Shell, { Card } from "../components/Shell";
import { api, apiForm } from "../lib/api";

type LookbookItem = {
  _id: string;
  title?: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  position: number;
};

export default function Content() {
  const [items, setItems] = useState<LookbookItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    api<{ data: { lookbookItems: LookbookItem[] } }>("/api/lookbook/all")
      .then((j) => setItems(j.data?.lookbookItems ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);
  useEffect(load, [load]);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setFlash({ kind: "err", text: "Choose an image or video first." });
      return;
    }
    setUploading(true);
    setFlash(null);
    try {
      const form = new FormData();
      form.append("media", file);
      const title = titleRef.current?.value?.trim();
      if (title) form.append("title", title);
      await apiForm("/api/lookbook/upload", form);
      if (fileRef.current) fileRef.current.value = "";
      if (titleRef.current) titleRef.current.value = "";
      setFlash({ kind: "ok", text: "Uploaded — now live on the Lookbook page." });
      load();
    } catch (err) {
      setFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  }

  async function move(idx: number, dir: -1 | 1) {
    const to = idx + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[idx], next[to]] = [next[to], next[idx]];
    const payload = next.map((it, i) => ({ _id: it._id, position: i + 1 }));
    setItems(next.map((it, i) => ({ ...it, position: i + 1 })));
    try {
      await api("/api/lookbook/position", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    } catch {
      load(); // roll back to server truth
    }
  }

  async function saveTitle(id: string) {
    setBusyId(id);
    try {
      await api(`/api/lookbook/${id}/details`, {
        method: "PATCH",
        body: JSON.stringify({ title: editTitle }),
      });
      setEditId(null);
      load();
    } catch (err) {
      setFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Could not save title",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: LookbookItem) {
    if (!window.confirm(`Delete "${item.title || "this media"}" from the lookbook? The file is removed from storage too.`)) return;
    setBusyId(item._id);
    try {
      await api(`/api/lookbook/${item._id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setFlash({
        kind: "err",
        text: err instanceof Error ? err.message : "Delete failed",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Shell
      title="Content Management"
      subtitle="Curate the public Lookbook gallery shown on the storefront."
    >
      {/* Upload */}
      <Card className="p-6">
        <h2 className="text-[15px] font-bold text-black">Add Media</h2>
        <p className="pt-1 text-[12.5px] text-[#6b7280]">
          Images and videos appear on the storefront’s Lookbook page in the
          order below.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="text-[13px] text-[#374151] file:mr-3 file:rounded-lg file:border file:border-[#e5e7eb] file:bg-white file:px-4 file:py-2 file:text-[13px] file:font-bold file:text-black"
          />
          <input
            ref={titleRef}
            placeholder="Caption (optional)"
            className="h-10 w-[220px] rounded-lg border border-[#e5e7eb] px-3 text-[13px] text-black placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
          />
          <button
            onClick={() => void upload()}
            disabled={uploading}
            className="flex h-10 items-center gap-2 rounded-lg bg-black px-5 text-[13px] font-bold text-white hover:opacity-85 disabled:opacity-40"
          >
            <FiUploadCloud className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
        {flash && (
          <p
            className={`mt-4 w-fit rounded-lg px-3 py-2 text-[12.5px] font-medium ${
              flash.kind === "ok"
                ? "bg-[#dcfce7] text-[#166534]"
                : "bg-[#fee2e2] text-[#ba1a1a]"
            }`}
          >
            {flash.text}
          </p>
        )}
      </Card>

      {/* Gallery */}
      {!loaded && (
        <p className="py-10 text-center text-[13px] text-[#9ca3af]">Loading media…</p>
      )}
      {loaded && items.length === 0 && (
        <Card className="mt-6 p-10 text-center text-[13px] text-[#9ca3af]">
          No lookbook media yet — upload the first one above.
        </Card>
      )}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item, idx) => (
          <Card key={item._id} className="overflow-hidden">
            <div className="relative flex h-[180px] items-center justify-center bg-[#f3f4f6]">
              {item.mediaType === "video" ? (
                <video
                  src={item.mediaUrl}
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={item.mediaUrl}
                  alt={item.title ?? ""}
                  className="h-full w-full object-cover"
                />
              )}
              <span className="absolute left-3 top-3 rounded-md bg-black/70 px-2 py-0.5 text-[10.5px] font-bold text-white">
                #{idx + 1}
              </span>
              {item.mediaType === "video" && (
                <span className="absolute right-3 top-3 rounded-md bg-black/70 p-1.5 text-white">
                  <FiFilm className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 p-4">
              {editId === item._id ? (
                <span className="flex flex-1 items-center gap-2">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                    className="h-8 w-full rounded-lg border border-[#e5e7eb] px-2 text-[12.5px] text-black focus:border-black focus:outline-none"
                  />
                  <button
                    aria-label="Save caption"
                    onClick={() => void saveTitle(item._id)}
                    disabled={busyId === item._id}
                    className="text-[#16a34a] hover:opacity-70 disabled:opacity-40"
                  >
                    <FiCheck className="h-4 w-4" />
                  </button>
                </span>
              ) : (
                <>
                  <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-black">
                    {item.title || <span className="text-[#9ca3af]">No caption</span>}
                  </p>
                  <span className="flex shrink-0 items-center gap-2 text-[#6b7280]">
                    <button
                      aria-label="Move up"
                      onClick={() => void move(idx, -1)}
                      disabled={idx === 0}
                      className="hover:text-black disabled:opacity-30"
                    >
                      <FiArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Move down"
                      onClick={() => void move(idx, 1)}
                      disabled={idx === items.length - 1}
                      className="hover:text-black disabled:opacity-30"
                    >
                      <FiArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Edit caption"
                      onClick={() => {
                        setEditId(item._id);
                        setEditTitle(item.title ?? "");
                      }}
                      className="hover:text-black"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Delete"
                      onClick={() => void remove(item)}
                      disabled={busyId === item._id}
                      className="text-[#dc2626] hover:opacity-70 disabled:opacity-40"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </span>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
