import express from 'express';
import {
  getBalance,
  getTransactions,
  getUsersReport,
  getBankAccount,
  updateBankAccount,
  requestWithdrawal,
} from '../controllers/adminWalletController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// All admin wallet routes require admin authentication
router.use(adminAuth);

// GET /api/admin/wallet/balance
router.get('/balance', getBalance);

// GET /api/admin/wallet/transactions
router.get('/transactions', getTransactions);

// GET /api/admin/wallet/users-report
router.get('/users-report', getUsersReport);

// Payouts
router.get('/bank', getBankAccount);
router.patch('/bank', updateBankAccount);
router.post('/withdraw', requestWithdrawal);

export default router;
