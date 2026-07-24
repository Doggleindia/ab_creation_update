import { body, validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';
import {
  getUserWalletBalance,
  createRechargeOrder,
  completeRecharge,
  getUserWalletTransactions
} from '../services/walletService.js';
import { getRazorpayKeyId } from '../config/razorpay.js';

/**
 * Get user wallet balance
 * GET /api/wallet/balance
 */
export const getBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const balance = await getUserWalletBalance(userId);
    res.status(200).json({
      status: 'success',
      data: { balance }
    });
  } catch (error) {
    next(new AppError('Failed to get wallet balance', 500));
  }
};

/**
 * Step 1: create a Razorpay order for a wallet recharge.
 * POST /api/wallet/recharge/create
 * Returns the Razorpay order id + public key so the client can open checkout.
 * No money is credited here.
 */
export const createRecharge = [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      const userId = req.user.id;
      const amount = Number(req.body.amount);

      const order = await createRechargeOrder(userId, amount);

      res.status(201).json({
        status: 'success',
        data: { ...order, keyId: getRazorpayKeyId() },
      });
    } catch (error) {
      next(new AppError(error.message || 'Failed to create recharge order', 500));
    }
  },
];

/**
 * Step 2: verify the Razorpay payment and credit the wallet.
 * POST /api/wallet/recharge/verify
 */
export const verifyRecharge = [
  body('razorpayOrderId').isString().notEmpty(),
  body('razorpayPaymentId').isString().notEmpty(),
  body('razorpaySignature').isString().notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError('Missing payment verification fields', 400));
      }

      const userId = req.user.id;
      const result = await completeRecharge(userId, req.body);

      if (!result.success) {
        return res.status(400).json({ status: 'error', message: result.message });
      }

      res.status(200).json({
        status: 'success',
        message: 'Wallet recharged successfully',
        data: { balance: result.balance },
      });
    } catch (error) {
      next(new AppError('Failed to verify recharge', 500));
    }
  },
];


/**
 * Get wallet transactions
 * GET /api/wallet/transactions
 */
export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getUserWalletTransactions(userId, page, limit);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(new AppError('Failed to get transactions', 500));
  }
};

// ---- User payout requests (wallet → bank, admin-approved) ----
import PayoutRequest from "../models/PayoutRequest.js";
import BusinessApplication from "../models/BusinessApplication.js";
import { toStr } from "../utils/sanitize.js";

const MIN_PAYOUT = 500;

/**
 * POST /api/wallet/payout-request — ask to withdraw wallet balance to bank.
 * One open request at a time; bank details fall back to the seller's
 * application payout details when not supplied.
 */
export const createPayoutRequest = async (req, res, next) => {
  try {
    const amount = Math.round(Number(req.body.amount));
    if (!Number.isFinite(amount) || amount < MIN_PAYOUT) {
      return next(new AppError(`Minimum payout is ₹${MIN_PAYOUT}`, 400));
    }
    const balance = await getUserWalletBalance(req.user._id);
    if (amount > balance) {
      return next(new AppError(`Insufficient balance: ₹${balance} available`, 400));
    }
    const open = await PayoutRequest.exists({ userId: req.user._id, status: "pending" });
    if (open) {
      return next(new AppError("You already have a payout request awaiting review", 409));
    }

    // Bank snapshot: request body wins, else the seller application on file
    const acct = (toStr(req.body.accountNumber) || "").replace(/\D/g, "");
    let bank = acct
      ? {
          accountLast4: acct.slice(-4),
          ifsc: toStr(req.body.ifsc) || undefined,
          accountHolder: toStr(req.body.accountHolder) || undefined,
        }
      : null;
    if (!bank) {
      const application = await BusinessApplication.findOne({
        linkedUserId: req.user._id,
        "payout.accountLast4": { $exists: true, $ne: null },
      }).select("payout");
      if (application?.payout?.accountLast4) bank = application.payout;
    }
    if (!bank?.accountLast4) {
      return next(
        new AppError("Add your bank account details to request a payout", 400),
      );
    }

    const request = await PayoutRequest.create({
      userId: req.user._id,
      amount,
      bank,
    });
    res.status(201).json({
      status: "success",
      message: `Payout request for ₹${amount.toLocaleString("en-IN")} submitted — our team reviews requests within 1-2 business days.`,
      data: { request },
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/wallet/payout-requests — the caller's own request history. */
export const getMyPayoutRequests = async (req, res, next) => {
  try {
    const requests = await PayoutRequest.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ status: "success", data: { requests } });
  } catch (err) {
    next(err);
  }
};
