import jwt from "jsonwebtoken";
import User from "../../models/auth/userModel.js";
import Order from "../../models/Order.js";
import UserWallet from "../../models/UserWallet.js";
import AppError from "../../utils/AppError.js";
import sendOtp from "../../utils/sendOtp.js";
import { hashOtp } from "../../utils/otp.js";
import { toStr } from "../../utils/sanitize.js";

const generateToken = (id) =>
  jwt.sign({ id, role: "user" }, process.env.JWT_SECRET, {
    // Fallback expiry so an unset JWT_EXPIRATION can never mint a non-expiring token
    expiresIn: process.env.JWT_EXPIRATION || "7d",
  });

/**
 * ======================
 * SIGNUP
 * ======================
 */
export const signupUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User already exists",
      });
    }

    // Create new user
    await User.create({ name, email, password });

    res.status(201).json({
      status: "success",
      message: "User registered successfully. Please login.",
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
export const loginUser = async (req, res, next) => {
  try {
    const { password } = req.body;
    // Coerce email to a primitive string so a crafted object (e.g.
    // {"$ne":null}) can't turn the lookup into a NoSQL operator query.
    const email = toStr(req.body.email);

    // Check if email & password provided
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email & password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+password");

    // If user not found or password incorrect
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    // Suspended accounts can authenticate but are not allowed in.
    if (user.status === "suspended") {
      return res.status(403).json({
        status: "fail",
        message: "This account has been suspended. Please contact support.",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      status: "success",
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          accountType: user.accountType,
          mustChangePassword: user.mustChangePassword,
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
    await sendOtp(email, "User");

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

    const user = await User.findOne({ email }).select(
      "+resetOtp +resetOtpExpires",
    );

    if (
      !user ||
      !user.resetOtp ||
      user.resetOtp !== hashOtp(otp) ||
      user.resetOtpExpires < Date.now()
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

    const user = await User.findOne({ email }).select(
      "+resetOtp +resetOtpExpires",
    );

    if (
      !user ||
      !user.resetOtp ||
      user.resetOtp !== hashOtp(otp) ||
      user.resetOtpExpires < Date.now()
    ) {
      return next(new AppError("Invalid or expired OTP", 400));
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

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
 * LOGOUT
 * ======================
 */
export const logoutUser = async (req, res, next) => {
  try {
    // For JWT, logout is typically handled client-side by removing the token
    // But we can send a response indicating logout success
    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================
 * GET USER PROFILE
 * ======================
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { dateFilter = "all" } = req.query; // Query param for date filtering

    const user = await User.findById(userId).select(
      "-password -resetOtp -resetOtpExpires",
    );

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Helper function to get date range based on filter
    const getDateRange = (filter) => {
      const now = new Date();
      let startDate;

      switch (filter) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          break;
        case "last7days":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "onemonthago":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "all":
        default:
          return null;
      }
      return startDate;
    };

    const dateRange = getDateRange(dateFilter);
    const dateQuery = dateRange ? { createdAt: { $gte: dateRange } } : {};

    // Query order stats dynamically from the new Order model
    const totalOrders = await Order.countDocuments({ userId, ...dateQuery });
    const productsOrders = await Order.countDocuments({ userId, productType: "ready", ...dateQuery });
    const ApperalOrders = await Order.countDocuments({ userId, productType: "bulk", ...dateQuery });

    // Get wallet balance
    const wallet = await UserWallet.findOne({ userId }).select("balance");
    const walletBalance = wallet?.balance || 0;

    // Format user data with all fields including address
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      accountType: user.accountType,
      mustChangePassword: user.mustChangePassword,
      address: {
        street: user.address?.street || null,
        city: user.address?.city || null,
        state: user.address?.state || null,
        pincode: user.address?.pincode || null,
        country: user.address?.country || "India",
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      status: "success",
      data: {
        user: userData,
        stats: {
          totalOrders,
          productsOrders,
          ApperalOrders,
          walletBalance,
          dateFilter,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================
 * UPDATE USER PROFILE
 * ======================
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Explicit allowlist — never trust the raw body. This blocks mass-assignment
    // of sensitive/internal fields (password, role, email, otp, etc.).
    const { name, phone, address } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) {
      const { street, city, state, pincode, country } = address || {};
      updates.address = { street, city, state, pincode, country };
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password -resetOtp -resetOtpExpires");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Format user data with all fields including address
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      accountType: user.accountType,
      mustChangePassword: user.mustChangePassword,
      address: {
        street: user.address?.street || null,
        city: user.address?.city || null,
        state: user.address?.state || null,
        pincode: user.address?.pincode || null,
        country: user.address?.country || "India",
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: { user: userData },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================
 * CHANGE PASSWORD
 * ======================
 * Used both for the forced first-login change (temp password -> new password)
 * and for a normal voluntary change from the profile screen. Clears the
 * mustChangePassword flag so an approved bulk/seller user only sets it once.
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Current and new password are required",
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({
        status: "fail",
        message: "New password must be at least 6 characters",
      });
    }

    // req.user was loaded without the password (select:false); re-fetch with it.
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const isCorrect = await user.correctPassword(
      currentPassword,
      user.password,
    );
    if (!isCorrect) {
      return res.status(401).json({
        status: "fail",
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword; // pre-save hook re-hashes
    user.mustChangePassword = false;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (err) {
    next(err);
  }
};
