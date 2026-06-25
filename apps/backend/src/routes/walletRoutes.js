import express from 'express';
import {
  getBalance,
  createRecharge,
  verifyRecharge,
  getTransactions,
} from '../controllers/walletController.js';
import { userAuth } from '../middleware/userAuth.js';

const router = express.Router();

// All wallet routes require user authentication
router.use(userAuth);

// GET /api/wallet/balance
router.get('/balance', getBalance);

// Recharge is a two-step Razorpay flow: create order, then verify payment
// POST /api/wallet/recharge/create
router.post('/recharge/create', createRecharge);
// POST /api/wallet/recharge/verify
router.post('/recharge/verify', verifyRecharge);

// GET /api/wallet/transactions
router.get('/transactions', getTransactions);

export default router;
