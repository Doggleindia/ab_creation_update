import mongoose from "mongoose";
import BusinessApplication from "../models/BusinessApplication.js";
import User from "../models/auth/userModel.js";
import AppError from "../utils/AppError.js";
import { uploadFileToS3 } from "../config/s3Service.js";
import { toStr } from "../utils/sanitize.js";
import {
  generateTempPassword,
  sendCredentialsEmail,
} from "../utils/sendCredentials.js";

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

  const application = await BusinessApplication.create({ ...input, type });

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

  const application = await BusinessApplication.findById(id);
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

  const tempPassword = generateTempPassword();

  const userData = {
    name: application.contactName,
    email: application.email,
    password: tempPassword,
    accountType: application.type, // "bulk" | "seller"
    mustChangePassword: true,
  };

  // phone is unique+sparse on User; only carry it over if it's free, otherwise
  // skip it so approval never fails on a phone collision.
  if (application.phone) {
    const phoneTaken = await User.exists({ phone: application.phone });
    if (!phoneTaken) userData.phone = application.phone;
  }
  if (application.address) userData.address = application.address;

  const user = await User.create(userData);

  application.status = "approved";
  application.reviewedBy = req.admin._id;
  application.reviewedAt = new Date();
  application.linkedUserId = user._id;
  await application.save();

  let emailSent = true;
  try {
    await sendCredentialsEmail({
      email: user.email,
      name: user.name,
      tempPassword,
      accountType: user.accountType,
    });
  } catch (err) {
    emailSent = false;
    console.error("Failed to send credentials email:", err);
  }

  res.status(200).json({
    status: "success",
    message: emailSent
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
      tempPassword: emailSent ? undefined : tempPassword,
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
  const files = (req.files || []).filter((f) =>
    (f.mimetype || "").startsWith("image/"),
  );
  if (!files.length) {
    return next(new AppError("No image files uploaded", 400));
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
