"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { forgotPassword, resetPassword } from "@/lib/api"
import { useToast } from "@/components/ui/ToastProvider"

export default function ForgotPasswordModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();

  if (!open) return null

  const handleSend = async () => {
    try {
      const res = await forgotPassword(email);
      if (res?.status === "success") {
        toast("success", res.message || "OTP sent to email");
        setOtpSent(true);
      } else {
        toast("error", res?.message || "Failed to send OTP");
      }
    } catch (err: any) {
      console.error(err);
      toast("error", err?.response?.data?.message || err?.message || "Error sending OTP");
    }
  }

  const handleReset = async () => {
    try {
      const res = await resetPassword(email, otp, newPassword);
      if (res?.status === "success") {
        toast("success", res.message || "Password reset successful");
        onClose();
      } else {
        toast("error", res?.message || "Reset failed");
      }
    } catch (err: any) {
      console.error(err);
      toast("error", err?.response?.data?.message || err?.message || "Reset error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-10 relative text-center">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-sm flex items-center gap-1"
        >
          <X size={14} /> Close
        </button>

        <h2 className="text-lg font-semibold mb-2">Password Reset</h2>
        <p className="text-sm text-muted-foreground mb-6">We will help you reset your password</p>

        {!otpSent ? (
          <>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email Address" className="mb-4" />
            <Button onClick={handleSend} className="w-full bg-[#171717] hover:bg-[#B87D4C]">Send OTP</Button>
          </>
        ) : (
          <>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email Address" className="mb-4" />
            <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="mb-4" />
            <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" type="password" className="mb-4" />
            <Button onClick={handleReset} className="w-full bg-[#171717] hover:bg-[#B87D4C]">Reset Password</Button>
          </>
        )}

        <Link href="/login" className="mt-4 text-sm underline">Back to Sign In</Link>
      </div>
    </div>
  )
}
