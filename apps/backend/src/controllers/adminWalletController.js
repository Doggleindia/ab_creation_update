import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';
import AdminWallet from '../models/AdminWallet.js';
import WalletTransaction from '../models/WalletTransaction.js';
import {
  getAdminWalletBalance,
  getAllWalletTransactions,
  getUserWalletReports
} from '../services/walletService.js';
import { toStr } from '../utils/sanitize.js';

const MIN_WITHDRAWAL = 500;

/**
 * Get / set the payout bank account on file
 * GET|PATCH /api/admin/wallet/bank
 */
export const getBankAccount = async (req, res, next) => {
  try {
    const wallet = await AdminWallet.getGlobalWallet();
    res.status(200).json({
      status: 'success',
      data: { bankAccount: wallet.bankAccount ?? null, minWithdrawal: MIN_WITHDRAWAL }
    });
  } catch (error) {
    next(new AppError('Failed to get bank account', 500));
  }
};

export const updateBankAccount = async (req, res, next) => {
  try {
    const bankName = toStr(req.body.bankName);
    const accountHolder = toStr(req.body.accountHolder);
    const accountNumber = toStr(req.body.accountNumber).replace(/\D/g, '');
    if (!bankName || !accountHolder || accountNumber.length < 6) {
      return next(new AppError('Bank name, account holder and a valid account number are required', 400));
    }
    const wallet = await AdminWallet.getGlobalWallet();
    // Only the last 4 digits are persisted — never the full account number.
    wallet.bankAccount = { bankName, accountHolder, last4: accountNumber.slice(-4) };
    await wallet.save();
    res.status(200).json({
      status: 'success',
      message: 'Bank account updated',
      data: { bankAccount: wallet.bankAccount }
    });
  } catch (error) {
    next(new AppError('Failed to update bank account', 500));
  }
};

/**
 * Request a payout — debits the platform wallet and records a ledger entry.
 * POST /api/admin/wallet/withdraw  { amount }
 */
export const requestWithdrawal = async (req, res, next) => {
  const amount = Math.round(Number(req.body.amount));
  if (!Number.isFinite(amount) || amount < MIN_WITHDRAWAL) {
    return next(new AppError(`Minimum withdrawal is ₹${MIN_WITHDRAWAL}`, 400));
  }
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const wallet = await AdminWallet.getGlobalWallet(session);
      if (!wallet.bankAccount?.last4) {
        throw new AppError('Add a bank account before requesting a withdrawal', 400);
      }
      if (wallet.balance < amount) {
        throw new AppError(`Insufficient balance: ₹${wallet.balance} available`, 400);
      }
      wallet.balance -= amount;
      await wallet.save({ session });
      const [txn] = await WalletTransaction.create(
        [
          {
            type: 'withdrawal',
            amount,
            status: 'completed',
            adminId: req.admin._id,
            requestId: `withdraw-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
          },
        ],
        { session },
      );
      result = { balance: wallet.balance, transaction: txn, bankAccount: wallet.bankAccount };
    });
    res.status(200).json({
      status: 'success',
      message: `Withdrawal of ₹${amount.toLocaleString('en-IN')} to ${result.bankAccount.bankName} ****${result.bankAccount.last4} recorded. Funds typically arrive in 2-3 business days.`,
      data: result
    });
  } catch (error) {
    next(error instanceof AppError ? error : new AppError('Failed to process withdrawal', 500));
  } finally {
    session.endSession();
  }
};

/**
 * Get admin wallet balance
 * GET /api/admin/wallet/balance
 */
export const getBalance = async (req, res, next) => {
  try {
    const balance = await getAdminWalletBalance();
    res.status(200).json({
      status: 'success',
      data: { balance }
    });
  } catch (error) {
    next(new AppError('Failed to get admin wallet balance', 500));
  }
};


/**
 * Get all wallet transactions
 * GET /api/admin/wallet/transactions
 */
export const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // Coerce to strings so query operators (e.g. ?type[$ne]=) can't be injected
    const filters = {};
    if (req.query.type) filters.type = toStr(req.query.type);
    if (req.query.status) filters.status = toStr(req.query.status);
    if (req.query.userId) filters.userId = toStr(req.query.userId);

    const result = await getAllWalletTransactions(page, limit, filters);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(new AppError('Failed to get transactions', 500));
  }
};

/**
 * Get user-wise wallet reports
 * GET /api/admin/wallet/users-report
 */
export const getUsersReport = async (req, res, next) => {
  try {
    const reports = await getUserWalletReports();
    res.status(200).json({
      status: 'success',
      data: { reports }
    });
  } catch (error) {
    next(new AppError('Failed to get users report', 500));
  }
};
