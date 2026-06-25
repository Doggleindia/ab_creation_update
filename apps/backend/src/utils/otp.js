import crypto from "crypto";

// HMAC the OTP with a server secret before storing/comparing. A bare 6-digit
// OTP has only ~900k possibilities, so a plain hash would be brute-forceable
// offline if the DB leaked; keying it with a secret prevents that.
const otpSecret = () =>
  process.env.OTP_SECRET || process.env.JWT_SECRET || "kt-otp-secret";

export const hashOtp = (otp) =>
  crypto.createHmac("sha256", otpSecret()).update(String(otp)).digest("hex");

export default hashOtp;
