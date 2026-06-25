"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";
import { loginUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

export default function LoginPage() {
  const [openForgot, setOpenForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginUser(email, password);
      if (res?.status === "success") {
        if (res.token) {
          localStorage.setItem("token", res.token);
          // Also set token in cookie for middleware. SameSite=Lax limits CSRF
          // exposure and Secure keeps it off plaintext HTTP in production.
          // (A JS-set cookie can't be HttpOnly — see migration notes for moving
          // auth to server-set HttpOnly cookies.)
          const secure =
            typeof window !== "undefined" && window.location.protocol === "https:"
              ? "; Secure"
              : "";
          document.cookie = `token=${res.token}; path=/; max-age=2592000; SameSite=Lax${secure}`;
        }
        if (res.data?.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        toast("success", "Logged in successfully");
        router.push("/dashboard");
      } else {
        toast("error", res?.message || "Login failed");
      }
    } catch (err: any) {
      console.error(err);
      toast("error", err?.response?.data?.message || err?.message || "Login error");
    }
  };

  return (
    <>
      <section className="min-h-[80vh]  bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh] ">
          {/* LEFT */}
          <div className="flex items-center px-8 md:px-16">
            <div className="w-full max-w-md space-y-6">
              <h2 className="text-xl font-semibold">Log In</h2>
              <p className="text-sm text-muted-foreground">
                Create your account to be part of the Creative world, discover
                our new collections and receive news at the earliest.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Email/Phone number"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={remember}
                      onCheckedChange={(val: any) => setRemember(!!val)}
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => setOpenForgot(true)}
                    className="underline text-sm"
                  >
                    Forget Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-40 bg-[#171717] hover:bg-[#B87D4C]"
                >
                  LOG IN
                </Button>
              </form>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="hidden md:block relative">
            <Image
              src="/images/auth/printing.png"
              alt="Login"
              fill
              className="object-cover m-auto login-image"
            />
          </div>
        </div>
      </section>
      <ForgotPasswordModal
        open={openForgot}
        onClose={() => setOpenForgot(false)}
      />
    </>
  );
}
