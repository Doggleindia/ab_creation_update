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
    const accountNumber = (toStr(req.body.accountNumber) || '').replace(/\D/g, '');
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

// ---- User payout requests (review queue) ----
import PayoutRequest from '../models/PayoutRequest.js';
import UserWallet from '../models/UserWallet.js';

/** GET /api/admin/wallet/payout-requests?status= */
export const getPayoutRequests = async (req, res, next) => {
  try {
    const filter = {};
    const status = toStr(req.query.status);
    if (status) filter.status = status;
    const requests = await PayoutRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email accountType');
    res.status(200).json({ status: 'success', data: { requests } });
  } catch (error) {
    next(new AppError('Failed to load payout requests', 500));
  }
};

/**
 * PATCH /api/admin/wallet/payout-requests/:id  { action: approve|reject, note }
 * Approval debits the user's wallet transactionally and writes a withdrawal
 * ledger entry; the actual bank transfer is done manually.
 */
export const resolvePayoutRequest = async (req, res, next) => {
  const action = toStr(req.body.action);
  if (!['approve', 'reject'].includes(action)) {
    return next(new AppError("action must be 'approve' or 'reject'", 400));
  }
  const request = await PayoutRequest.findById(req.params.id).populate(
    'userId',
    'name email',
  );
  if (!request) return next(new AppError('Payout request not found', 404));
  if (request.status !== 'pending') {
    return next(new AppError(`Request already ${request.status}`, 409));
  }

  if (action === 'reject') {
    request.status = 'rejected';
    request.adminNote = toStr(req.body.note) || undefined;
    request.resolvedAt = new Date();
    request.resolvedBy = req.admin._id;
    await request.save();
    return res.status(200).json({
      status: 'success',
      message: 'Payout request rejected — the balance stays in the wallet.',
      data: { request },
    });
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const wallet = await UserWallet.findOne({ userId: request.userId._id }).session(session);
      if (!wallet || wallet.balance < request.amount) {
        throw new AppError('User wallet no longer covers this amount', 400);
      }
      wallet.balance -= request.amount;
      await wallet.save({ session });
      await WalletTransaction.create(
        [
          {
            type: 'withdrawal',
            amount: request.amount,
            userId: request.userId._id,
            status: 'completed',
            requestId: `user-payout-${request._id}`,
          },
        ],
        { session },
      );
      request.status = 'approved';
      request.adminNote = toStr(req.body.note) || undefined;
      request.resolvedAt = new Date();
      request.resolvedBy = req.admin._id;
      await request.save({ session });
    });
    res.status(200).json({
      status: 'success',
      message: `Approved — ₹${request.amount.toLocaleString('en-IN')} debited from ${request.userId.name}'s wallet. Transfer to ****${request.bank?.accountLast4 ?? '????'} manually.`,
      data: { request },
    });
  } catch (error) {
    next(error instanceof AppError ? error : new AppError('Failed to approve payout', 500));
  } finally {
    session.endSession();
  }
};
