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
