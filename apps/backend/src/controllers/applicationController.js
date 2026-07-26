import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import BusinessApplication from "../models/BusinessApplication.js";
import User from "../models/auth/userModel.js";
import AppError from "../utils/AppError.js";
import { uploadFileToS3 } from "../config/s3Service.js";
import { toStr } from "../utils/sanitize.js";
import {
  generateTempPassword,
  sendCredentialsEmail,
} from "../utils/sendCredentials.js";
import EmailTransporter from "../utils/EmailTransporter.js";
import { notificationEnabled } from "./siteContentController.js";

// Fields a public applicant is allowed to set. Everything else (status,
// reviewedBy, linkedUserId, …) is server-controlled.
const pickApplicationInput = (body = {}) => ({
  businessName: body.businessName,
  contactName: body.contactName,
  email: toStr(body.email)?.toLowerCase().trim(),
  phone: body.phone,
  address: body.address,
  message: body.message,
  expectedVolume: body.expectedVolume,
  orderFrequency: body.orderFrequency,
  gstNumber: body.gstNumber,
  brandName: body.brandName,
  website: body.website,
  productsToSell: body.productsToSell,
  categories: Array.isArray(body.categories) ? body.categories : undefined,
  portfolioFiles: Array.isArray(body.portfolioFiles)
    ? body.portfolioFiles
        .filter(
          (f) =>
            typeof f === "string" &&
            (f.startsWith("http://") || f.startsWith("https://")),
        )
        .slice(0, 10)
    : undefined,
});

/**
 * Shared submit handler for both public forms. `type` is fixed by the route,
 * never taken from the body, so a bulk form can't create a seller application.
 */
const submitApplication = (type) => async (req, res, next) => {
  const input = pickApplicationInput(req.body);

  if (!input.businessName || !input.contactName || !input.email) {
    return next(
      new AppError("Business name, contact name and email are required", 400),
    );
  }

  // Seller registration extras: a chosen password (hashed immediately, the
  // plaintext is never stored) and a masked payout destination.
  const extra = {};
  if (type === "seller") {
    const password =
      typeof req.body.password === "string" ? req.body.password : "";
    if (password) {
      if (password.length < 8) {
        return next(new AppError("Password must be at least 8 characters", 400));
      }
      extra.passwordHash = await bcrypt.hash(password, 12);
    }
    const p = req.body.payout || {};
    const acct = (toStr(p.accountNumber) || "").replace(/\D/g, "");
    if (acct || p.ifsc || p.accountHolder) {
      extra.payout = {
        accountLast4: acct ? acct.slice(-4) : undefined,
        ifsc: toStr(p.ifsc) || undefined,
        accountHolder: toStr(p.accountHolder) || undefined,
      };
    }
  }

  const application = await BusinessApplication.create({ ...input, ...extra, type });

  res.status(201).json({
    status: "success",
    message:
      "Application submitted. Our team will review it and get back to you shortly.",
    data: {
      application: {
        id: application._id,
        type: application.type,
        status: application.status,
      },
    },
  });
};

export const submitBulkApplication = submitApplication("bulk");
export const submitSellerApplication = submitApplication("seller");

/**
 * ADMIN — list applications, filterable by ?type=bulk|seller and
 * ?status=pending|approved|rejected. Powers the two approval queues.
 */
export const getApplications = async (req, res, next) => {
  const filter = {};

  const type = toStr(req.query.type);
  if (type) {
    if (!["bulk", "seller"].includes(type)) {
      return next(new AppError("Invalid application type", 400));
    }
    filter.type = type;
  }

  const status = toStr(req.query.status);
  if (status) {
    if (!["pending", "approved", "rejected"].includes(status)) {
      return next(new AppError("Invalid application status", 400));
    }
    filter.status = status;
  }

  const applications = await BusinessApplication.find(filter)
    .sort({ createdAt: -1 })
    .populate("reviewedBy", "name email")
    .populate("linkedUserId", "name email accountType");

  res.status(200).json({
    status: "success",
    results: applications.length,
    data: { applications },
  });
};

/**
 * ADMIN — single application detail.
 */
export const getApplication = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid application id", 400));
  }

  const application = await BusinessApplication.findById(id)
    .populate("reviewedBy", "name email")
    .populate("linkedUserId", "name email accountType");

  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { application },
  });
};

/**
 * ADMIN — approve an application. Creates a User of the matching accountType
 * with a temporary password, links it back to the application, and emails the
 * applicant their credentials. If the credentials email fails, the account was
 * still created, so the temp password is returned once for a manual fallback.
 */
export const approveApplication = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid application id", 400));
  }

  const application = await BusinessApplication.findById(id).select("+passwordHash");
  if (!application) {
    return next(new AppError("Application not found", 404));
  }
  if (application.status !== "pending") {
    return next(
      new AppError(`Application already ${application.status}`, 409),
    );
  }

  // The applicant may already hold a normal account with this email — approving
  // would collide with the unique email index, so block it explicitly and let
  // the admin resolve it (e.g. upgrade the existing account manually).
  const existingUser = await User.findOne({ email: application.email });
  if (existingUser) {
    return next(
      new AppError(
        "A user with this email already exists. Resolve the existing account before approving.",
        409,
      ),
    );
  }

  // If the applicant chose a password at registration, the account activates
  // with it directly; otherwise fall back to an emailed temporary password.
  const hasChosenPassword = Boolean(application.passwordHash);
  const tempPassword = generateTempPassword();

  const userData = {
    name: application.contactName,
    email: application.email,
    password: tempPassword, // replaced below when a password was chosen
    accountType: application.type, // "bulk" | "seller"
    mustChangePassword: !hasChosenPassword,
  };

  // phone is unique+sparse on User; only carry it over if it's free, otherwise
  // skip it so approval never fails on a phone collision.
  if (application.phone) {
    const phoneTaken = await User.exists({ phone: application.phone });
    if (!phoneTaken) userData.phone = application.phone;
  }
  if (application.address) userData.address = application.address;

  const user = await User.create(userData);

  // Swap in the pre-hashed chosen password directly (updateOne skips the
  // pre-save hook, so the hash is stored as-is — same bcrypt format).
  if (hasChosenPassword) {
    await User.updateOne(
      { _id: user._id },
      { $set: { password: application.passwordHash, mustChangePassword: false } },
    );
  }

  application.status = "approved";
  application.reviewedBy = req.admin._id;
  application.reviewedAt = new Date();
  application.linkedUserId = user._id;
  await application.save();

  let emailSent = true;
  try {
    // Settings → Notifications toggle; when off, the temp password is
    // returned in the response for manual sharing instead.
    if (await notificationEnabled("applicationDecisions")) {
      if (hasChosenPassword) {
        await EmailTransporter.sendEmail(
          user.email,
          "Your AB Creation seller account is approved",
          `Hello ${user.name},\n\nGood news — your seller application has been approved and your account is now active.\n\nLog in at ${process.env.FRONTEND_URL || "http://localhost:3000"}/login with your email and the password you chose during registration to open your Seller Studio.\n\nThanks,\nAB Creation Team\n`,
        );
      } else {
        await sendCredentialsEmail({
          email: user.email,
          name: user.name,
          tempPassword,
          accountType: user.accountType,
        });
      }
    } else {
      emailSent = false;
    }
  } catch (err) {
    emailSent = false;
    console.error("Failed to send approval email:", err);
  }

  res.status(200).json({
    status: "success",
    message: hasChosenPassword
      ? emailSent
        ? "Application approved — the applicant can log in with the password they chose at registration."
        : "Application approved. The notification email didn't go out, but the applicant can already log in with their chosen password."
      : emailSent
        ? "Application approved and credentials emailed to the applicant."
        : "Application approved, but the credentials email failed to send. Share the temporary password manually.",
    data: {
      application: {
        id: application._id,
        status: application.status,
        linkedUserId: user._id,
      },
      emailSent,
      // Only exposed as a fallback when the automated email did not go out.
      tempPassword: hasChosenPassword || emailSent ? undefined : tempPassword,
    },
  });
};

/**
 * ADMIN — reject an application with an optional reason.
 */
export const rejectApplication = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid application id", 400));
  }

  const application = await BusinessApplication.findById(id);
  if (!application) {
    return next(new AppError("Application not found", 404));
  }
  if (application.status !== "pending") {
    return next(
      new AppError(`Application already ${application.status}`, 409),
    );
  }

  application.status = "rejected";
  application.rejectionReason = toStr(req.body.reason);
  application.reviewedBy = req.admin._id;
  application.reviewedAt = new Date();
  await application.save();

  res.status(200).json({
    status: "success",
    message: "Application rejected.",
    data: {
      application: {
        id: application._id,
        status: application.status,
      },
    },
  });
};


/**
 * PUBLIC — upload portfolio images for an application (max 5, images only).
 * Returns hosted URLs the intake form submits as portfolioFiles.
 */
export const uploadPortfolio = async (req, res, next) => {
  const files = (req.files || []).filter((f) => {
    const mime = f.mimetype || "";
    // Artwork can be raster images or vector files (.pdf, .ai, .eps)
    return (
      mime.startsWith("image/") ||
      mime === "application/pdf" ||
      mime === "application/postscript" ||
      mime === "application/illustrator"
    );
  });
  if (!files.length) {
    return next(new AppError("No image or vector files uploaded", 400));
  }
  const urls = [];
  for (const file of files.slice(0, 5)) {
    const result = await uploadFileToS3(file);
    if (result?.Location) urls.push(result.Location);
  }
  res.status(200).json({ status: "success", data: { urls } });
};

/**
 * ADMIN — persist review aids (notes, checklist, priority flag).
 */
export const updateApplicationReview = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid application id", 400));
  }
  const application = await BusinessApplication.findById(id);
  if (!application) {
    return next(new AppError("Application not found", 404));
  }
  if (typeof req.body.internalNotes === "string") {
    application.internalNotes = req.body.internalNotes;
  }
  if (Array.isArray(req.body.checklist)) {
    application.checklist = req.body.checklist
      .filter((x) => typeof x === "string")
      .slice(0, 20);
  }
  if (typeof req.body.priority === "boolean") {
    application.priority = req.body.priority;
  }
  if (typeof req.body.assignee === "string") {
    application.assignee = toStr(req.body.assignee);
  }
  await application.save();
  res.status(200).json({
    status: "success",
    data: {
      application: {
        id: application._id,
        priority: application.priority,
        internalNotes: application.internalNotes,
        checklist: application.checklist,
      },
    },
  });
};

/**
 * ADMIN — send (or re-send) a quote for a bulk application. Emails the
 * applicant a link to the public quote page.
 */
export const sendQuote = async (req, res, next) => {
  const application = await BusinessApplication.findById(req.params.id);
  if (!application) return next(new AppError("Application not found", 404));
  if (application.type !== "bulk") {
    return next(new AppError("Quotes can only be sent for bulk applications", 400));
  }
  // Structured proposal lines (optional — a plain amount still works).
  // The total is ALWAYS computed server-side from items + costs when items
  // are given, so an inconsistent client total can never be stored.
  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const items = Array.isArray(req.body.items)
    ? req.body.items
        .map((it) => {
          const qty = Math.round(num(it.qty));
          const unitPrice = Math.round(num(it.unitPrice));
          return {
            name: toStr(it.name),
            qty,
            sizeBreakdown: toStr(it.sizeBreakdown),
            unitPrice,
            total: qty * unitPrice,
          };
        })
        .filter((it) => it.name && it.qty > 0 && it.unitPrice > 0)
        .slice(0, 20)
    : [];
  const printingCost = Math.max(0, Math.round(num(req.body.printingCost)));
  const shippingCost = Math.max(0, Math.round(num(req.body.shippingCost)));
  const advancePct = Math.min(100, Math.max(0, Math.round(num(req.body.advancePct) || 50)));

  const amount =
    items.length > 0
      ? items.reduce((s, it) => s + it.total, 0) + printingCost + shippingCost
      : Math.round(Number(req.body.amount));
  if (!Number.isFinite(amount) || amount <= 0) {
    return next(new AppError("A positive quote amount is required", 400));
  }

  const asDate = (v) => {
    if (!v) return undefined;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  };

  application.quote = {
    amount,
    notes: toStr(req.body.notes),
    status: "sent",
    sentAt: new Date(),
    respondedAt: undefined,
    items,
    printingCost,
    shippingCost,
    advancePct,
    validUntil: asDate(req.body.validUntil),
    estimatedDelivery: asDate(req.body.estimatedDelivery),
  };
  await application.save();

  const quoteUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/bulk-order/quote/${application._id}`;
  let emailSent = true;
  try {
    if (!(await notificationEnabled("quoteEmails"))) throw new Error("disabled");
    await EmailTransporter.sendEmail(
      application.email,
      "Your AB Creation bulk order quote is ready",
      `Hello ${application.contactName},\n\nWe've prepared a quote for your bulk order enquiry (${application.businessName}).\n\n  Quoted amount: Rs ${amount.toLocaleString("en-IN")}\n${application.quote.notes ? `  Notes: ${application.quote.notes}\n` : ""}\nReview and respond to the quote here:\n${quoteUrl}\n\nThanks,\nAB Creation Team\n`,
    );
  } catch {
    emailSent = false;
  }

  res.status(200).json({
    status: "success",
    message: emailSent
      ? `Quote of Rs ${amount.toLocaleString("en-IN")} sent to ${application.email}.`
      : `Quote saved, but the email could not be sent. Share the link manually: ${quoteUrl}`,
    data: { quote: application.quote, quoteUrl, emailSent },
  });
};

/**
 * PUBLIC — the applicant views their quote (minimal fields only).
 */
export const getPublicQuote = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError("Request not found", 404));
  }
  const application = await BusinessApplication.findById(req.params.id).select(
    "businessName contactName type expectedVolume productsToSell portfolioFiles quote status createdAt",
  );
  if (!application || application.type !== "bulk") {
    return next(new AppError("Request not found", 404));
  }
  // Also serves as the request tracker before a quote exists —
  // quote is simply null until the team sends a proposal.
  res.status(200).json({
    status: "success",
    data: {
      businessName: application.businessName,
      contactName: application.contactName,
      expectedVolume: application.expectedVolume,
      productsToSell: application.productsToSell,
      portfolioFiles: application.portfolioFiles ?? [],
      applicationStatus: application.status,
      submittedAt: application.createdAt,
      quote: application.quote?.status ? application.quote : null,
    },
  });
};

/**
 * PUBLIC — the applicant accepts or declines a sent quote.
 */
export const respondToQuote = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError("Quote not found", 404));
  }
  const application = await BusinessApplication.findById(req.params.id);
  if (!application || application.type !== "bulk" || !application.quote?.status) {
    return next(new AppError("Quote not found", 404));
  }
  if (application.quote.status !== "sent") {
    return next(
      new AppError(`This quote has already been ${application.quote.status}`, 409),
    );
  }
  const decision = toStr(req.body.decision);
  if (!["accepted", "declined", "changes"].includes(decision)) {
    return next(
      new AppError("Decision must be 'accepted', 'declined' or 'changes'", 400),
    );
  }

  if (decision === "changes") {
    const note = toStr(req.body.note);
    if (!note) {
      return next(new AppError("Tell us what you'd like changed", 400));
    }
    // Quote stays open ("sent") while the team revises the proposal.
    application.quote.changeRequest = { note, at: new Date() };
    application.markModified("quote");
    await application.save();
    return res.status(200).json({
      status: "success",
      message:
        "Change request sent — our team will revise the proposal and email you an update.",
      data: { quote: application.quote },
    });
  }

  application.quote.status = decision;
  application.quote.respondedAt = new Date();
  await application.save();
  res.status(200).json({
    status: "success",
    message:
      decision === "accepted"
        ? "Quote accepted — our team will reach out to arrange the advance payment and start production."
        : "Quote declined — thanks for letting us know.",
    data: { quote: application.quote },
  });
};

/**
 * ADMIN — advance a bulk order's fulfilment stage after quote acceptance.
 * accepted -> in_production -> completed
 */
export const advanceQuoteStage = async (req, res, next) => {
  const application = await BusinessApplication.findById(req.params.id);
  if (!application || application.type !== "bulk" || !application.quote?.status) {
    return next(new AppError("Bulk request not found", 404));
  }
  const stage = toStr(req.body.stage);
  const allowed = {
    accepted: "in_production",
    in_production: "completed",
  };
  if (allowed[application.quote.status] !== stage) {
    return next(
      new AppError(
        `Cannot move a ${application.quote.status} request to ${stage || "(none)"}`,
        409,
      ),
    );
  }
  application.quote.status = stage;
  await application.save();
  res.status(200).json({
    status: "success",
    message: stage === "in_production" ? "Bulk order moved to production." : "Bulk order completed.",
    data: { quote: application.quote },
  });
};

/**
 * USER — the caller's own bulk applications and their quote states, so the
 * buyer dashboard can show the bulk pipeline. Matched by the account link
 * set at approval, falling back to the login email for pre-approval
 * applications submitted with the same address.
 */
export const getMyApplications = async (req, res) => {
  const applications = await BusinessApplication.find({
    type: "bulk",
    $or: [{ linkedUserId: req.user._id }, { email: req.user.email }],
  })
    .sort({ createdAt: -1 })
    .select(
      "businessName contactName status createdAt expectedVolume productsToSell quote.amount quote.status quote.sentAt quote.respondedAt quote.notes",
    );
  res.status(200).json({ status: "success", data: { applications } });
};

// Wallet legs of the bulk advance payment (imports hoist in ESM)
import {
  deductFromUserWallet,
  creditToAdminWallet,
} from "../services/walletService.js";

/**
 * USER — accept a sent quote and pay the advance from the wallet in one
 * transactional step. Only the account linked to the application may pay.
 * POST /api/applications/:id/quote/pay-advance
 */
export const payQuoteAdvance = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid application id", 400));
  }
  const application = await BusinessApplication.findById(id);
  if (!application || application.type !== "bulk" || !application.quote?.status) {
    return next(new AppError("Quote not found", 404));
  }
  const isOwner =
    (application.linkedUserId && String(application.linkedUserId) === String(req.user._id)) ||
    application.email === req.user.email;
  if (!isOwner) {
    return next(new AppError("This quote belongs to a different account", 403));
  }
  if (application.quote.status !== "sent") {
    return next(new AppError(`This quote has already been ${application.quote.status}`, 409));
  }
  if (application.quote.validUntil && application.quote.validUntil < new Date()) {
    return next(new AppError("This quote has expired — ask us for a fresh one", 409));
  }

  const pct = application.quote.advancePct ?? 50;
  const advance = Math.round((application.quote.amount * pct) / 100);

  if (advance > 0) {
    const requestId = `BULK-ADV-${application._id}`;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await deductFromUserWallet(req.user._id, advance, requestId, session);
        await creditToAdminWallet(advance, `BULK-ADV-ADMIN-${application._id}`, session);
        application.quote.status = "accepted";
        application.quote.respondedAt = new Date();
        application.quote.advancePaid = { amount: advance, at: new Date(), requestId };
        application.markModified("quote");
        await application.save({ session });
      });
    } catch (txErr) {
      if (txErr instanceof AppError) return next(txErr);
      // walletService throws plain Errors for insufficient balance
      return next(new AppError(txErr.message || "Payment failed", 402));
    } finally {
      session.endSession();
    }
  } else {
    application.quote.status = "accepted";
    application.quote.respondedAt = new Date();
    application.markModified("quote");
    await application.save();
  }

  res.status(200).json({
    status: "success",
    message:
      advance > 0
        ? `Quote accepted — advance of Rs ${advance.toLocaleString("en-IN")} paid from your wallet.`
        : "Quote accepted.",
    data: { quote: application.quote },
  });
};
