"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { signupUser } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/ToastProvider"

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const name = `${firstName} ${lastName}`.trim();
      const res = await signupUser(name, email, password);
      if (res?.status === "success") {
        toast("success", res?.message || "Registered successfully. Please login.");
        router.push("/login");
      } else {
        toast("error", res?.message || "Registration failed");
      }
    } catch (err: any) {
      console.error(err);
      toast("error", err?.response?.data?.message || err?.message || "Signup error");
    }
  }

  return (
    <section className="min-h-[80vh]  bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh]">
        {/* LEFT */}
        <div className="flex items-center px-8 md:px-16">
          <div className="w-full max-w-md space-y-5">
            <h2 className="text-xl font-semibold">Create Account</h2>
            <p className="text-sm text-muted-foreground">
              Create your account to be part of the Creative world and receive
              news at the earliest.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              <Input placeholder="Email / Phone number" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

              <label className="flex gap-2 text-xs">
                <Checkbox checked={agreed} onCheckedChange={(v: any) => setAgreed(!!v)} />
                I have read and understood the Privacy Information Notice.
              </label>

              <Button type="submit" className="w-44 bg-[#171717] hover:bg-[#B87D4C]">
                CREATE ACCOUNT
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
  )
}
