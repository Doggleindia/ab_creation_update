import { body, param, query, validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';
import {
  getAdminWalletBalance,
  getAllWalletTransactions,
  getUserWalletReports
} from '../services/walletService.js';
import { toStr } from '../utils/sanitize.js';

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
