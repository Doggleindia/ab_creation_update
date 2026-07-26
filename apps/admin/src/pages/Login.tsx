import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await adminLogin(String(fd.get("email")), String(fd.get("password")));
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9fb] px-4">
      <div className="w-full max-w-[400px] rounded-xl border border-[#e5e7eb] bg-white p-10 shadow-sm">
        <p className="text-[22px] font-extrabold tracking-tight text-black">
          AB Creation
        </p>
        <p className="pt-1 text-[10px] font-bold uppercase tracking-[1.5px] text-[#9ca3af]">
          Admin Console
        </p>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 pt-8">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold uppercase tracking-[0.5px] text-[#6b7280]">
              Email
            </span>
            <input
              name="email"
              type="email"
              required
              placeholder="admin@abcreation.com"
              className="h-11 rounded-lg border border-[#e5e7eb] px-4 text-[14px] text-black focus:border-black focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold uppercase tracking-[0.5px] text-[#6b7280]">
              Password
            </span>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="h-11 rounded-lg border border-[#e5e7eb] px-4 text-[14px] text-black focus:border-black focus:outline-none"
            />
          </label>
          {error && (
            <p className="rounded-lg bg-[#fef2f2] px-4 py-3 text-[13px] text-[#ba1a1a]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="mt-2 h-11 rounded-lg bg-black text-[14px] font-bold text-white transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
