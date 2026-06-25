import jwt from "jsonwebtoken";
import Admin from "../../models/auth/adminModel.js";
import User from "../../models/auth/userModel.js"; //
import AppError from "../../utils/AppError.js";
import sendOtp from "../../utils/sendOtp.js";
import { hashOtp } from "../../utils/otp.js";

const generateToken = (id) =>
  jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET, {
    // Fallback expiry so an unset JWT_EXPIRATION can never mint a non-expiring token
    expiresIn: process.env.JWT_EXPIRATION || "7d",
  });

/**
 * ======================
 * SIGNUP
 * ======================
 */
export const signupAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Bootstrap gate: the first admin can be created freely, but once any admin
    // exists only an authenticated admin (req.admin set by optionalAdminAuth)
    // may create more. This closes the public admin-registration hole.
    const adminCount = await Admin.estimatedDocumentCount();
    if (adminCount > 0 && !req.admin) {
      return next(
        new AppError("Admin registration is restricted to existing admins", 403)
      );
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        status: "fail",
        message: "Admin already exists",
      });
    }

    // Create new admin
    await Admin.create({ name, email, password });

    res.status(201).json({
      status: "success",
      message: "Admin registered successfully. Please login.",
    });
  } catch (err) {
    next(err); // other errors will be handled by your global error handler
  }
};

/**
 * ======================
 * LOGIN
 * ======================
 */
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email & password provided
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email & password are required",
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email }).select("+password");

    // If admin not found or password incorrect
    if (!admin || !(await admin.correctPassword(password, admin.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = generateToken(admin._id);

    res.status(200).json({
      status: "success",
      token,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
        },
      },
    });
  } catch (err) {
    next(err); // unexpected errors go to global handler
  }
};

/**
 * ======================
 * FORGOT PASSWORD
 * ======================
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Always respond the same way regardless of whether the account exists,
    // to avoid leaking which emails are registered. sendOtp no-ops if absent.
    await sendOtp(email, "Admin");

    res.status(200).json({
      status: "success",
      message: "If an account exists for that email, an OTP has been sent",
    });
  } catch (err) {
    next(err);
  }
};


/**
 * ======================
 * VALIDATE OTP
 * ======================
 */
export const validateResetCode = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const admin = await Admin.findOne({ email }).select(
      "+resetOtp +resetOtpExpires",
    );

    if (
      !admin ||
      !admin.resetOtp ||
      admin.resetOtp !== hashOtp(otp) ||
      admin.resetOtpExpires < Date.now()
    ) {
      return next(new AppError("Invalid or expired OTP", 400));
    }

    res.status(200).json({
      status: "success",
      message: "OTP verified",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================
 * RESET PASSWORD
 * ======================
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const admin = await Admin.findOne({ email }).select(
      "+resetOtp +resetOtpExpires",
    );

    if (
      !admin ||
      !admin.resetOtp ||
      admin.resetOtp !== hashOtp(otp) ||
      admin.resetOtpExpires < Date.now()
    ) {
      return next(new AppError("Invalid or expired OTP", 400));
    }

    admin.password = newPassword;
    admin.resetOtp = undefined;
    admin.resetOtpExpires = undefined;
    await admin.save();

    res.status(200).json({
      status: "success",
      message: "Password reset successful",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================
 * GET ALL ADMINS
 * ======================
 */
export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find().select(
      "-password -resetOtp -resetOtpExpires",
    );

    res.status(200).json({
      status: "success",
      results: admins.length,
      data: {
        admins,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================
 * DELETE ADMIN (BY ID)
 * ======================
 */
export const deleteAdmin = async (req, res, next) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return next(new AppError("Admin not found", 404));
    }

    await Admin.findByIdAndDelete(adminId);

    res.status(200).json({
      status: "success",
      message: "Admin deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================
 * LOGOUT ADMIN
 * ======================
 */
export const logoutAdmin = async (req, res, next) => {
  try {
    // JWT stateless hota hai, backend me kuch invalidate nahi hota
    // Client ko bas token delete karna hota hai

    res.status(200).json({
      status: "success",
      message: "Admin logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};


/**
 * ======================
 * GET ALL USERS
 * ======================
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select(
      "-password -resetOtp -resetOtpExpires",
    );

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    next(err);
  }
};
