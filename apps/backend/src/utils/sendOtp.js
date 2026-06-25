import crypto from 'crypto';
import Admin from '../models/auth/adminModel.js';
import User from '../models/auth/userModel.js';
import EmailTransporter from './EmailTransporter.js';
import AppError from './AppError.js';
import { hashOtp } from './otp.js';

/**
 * role = "Admin" | "User"
 */
const sendOtp = async (email, role = "User") => {
  try {
    let account;

    // ✅ Find account based on role
    if (role === "Admin") {
      account = await Admin.findOne({ email });
    } else {
      account = await User.findOne({ email });
    }

    // Do not reveal whether the account exists — silently no-op so callers can
    // always return a generic response and avoid account enumeration.
    if (!account) {
      return;
    }

    // ✅ Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // ✅ OTP expiry (10 min)
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // ✅ Save OTP (hashed at rest)
    account.resetOtp = hashOtp(otp);
    account.resetOtpExpires = otpExpires;
    await account.save();

    // ✅ Email content
    const subject = `Password Reset OTP - KT Adhesives (${role})`;
    const text = `
Hello ${account.name},

You requested to reset your password.

Your OTP is: ${otp}

This OTP is valid for 10 minutes.

If you didn't request this, ignore this email.

Thanks,
KT Adhesives Team
`;

    await EmailTransporter.sendEmail(email, subject, text);
    // Never log the OTP itself.
  } catch (error) {
    console.error("❌ OTP Error:", error);
    throw new AppError("Failed to send OTP. Please try again.", 500);
  }
};

export default sendOtp;
