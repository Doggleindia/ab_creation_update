import rateLimit from "express-rate-limit";

// Per-IP rate limits for abuse-prone endpoints. Responses use the same
// {status, message} shape as the global error handler so clients surface
// the message directly. Requires `app.set("trust proxy", 1)` in production
// so req.ip is the real client behind the load balancer.
const make = ({ windowMs, limit, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests,
    message: { status: "fail", message },
  });

// Credential endpoints — only failed attempts count, so a normal user who
// logs in and out repeatedly is never locked out, but password guessing is.
export const authLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many attempts — please try again in 15 minutes.",
});

// Email-sending endpoints (password reset / OTP) — successes count too,
// or the mailbox gets flooded within the failure allowance.
export const otpLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: "Too many requests — please try again in 15 minutes.",
});

// Public form intake: seller/bulk applications, quote responses, contact.
export const intakeLimiter = make({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: "Too many submissions from this network — please try again later.",
});

// File uploads (S3-backed). The portfolio endpoint is public, so this is
// the only thing between it and unbounded storage abuse.
export const uploadLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  message: "Too many uploads — please wait a few minutes and try again.",
});
