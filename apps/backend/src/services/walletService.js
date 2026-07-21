import mongoose from 'mongoose';
import crypto from 'crypto';
import UserWallet from '../models/UserWallet.js';
import AdminWallet from '../models/AdminWallet.js';
import WalletTransaction from '../models/WalletTransaction.js';

import AuditLog from '../models/AuditLog.js';
import winston from 'winston';
import { getRazorpay } from '../config/razorpay.js';

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'wallet.log' })
  ]
});

/**
 * Get user wallet balance
 */
export const getUserWalletBalance = async (userId) => {
  try {
    let wallet = await UserWallet.findOne({ userId });
    if (!wallet) {
      wallet = await UserWallet.create({ userId, balance: 0 });
    }
    return wallet.balance;
  } catch (error) {
    logger.error('Error getting user wallet balance:', error);
    throw error;
  }
};

/**
 * Get admin wallet balance
 */
export const getAdminWalletBalance = async () => {
  try {
    const wallet = await AdminWallet.getGlobalWallet();
    return wallet.balance;
  } catch (error) {
    logger.error('Error getting admin wallet balance:', error);
    throw error;
  }
};

/**
 * Step 1 of recharge: create a Razorpay order and a matching pending
 * transaction. Money is NOT credited here — only after the payment is
 * verified server-side in completeRecharge. This closes the old hole where
 * a client could credit an arbitrary amount with no real payment.
 */
export const createRechargeOrder = async (userId, amount) => {
  const razorpay = getRazorpay();

  // Razorpay works in the smallest currency unit (paise for INR)
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `rcpt_${userId}_${Date.now()}`,
    notes: { userId: String(userId), purpose: 'wallet_recharge' },
  });

  // Record the intent as a pending transaction keyed by the Razorpay order id
  await WalletTransaction.create({
    type: 'recharge',
    amount,
    userId,
    status: 'pending',
    requestId: order.id,
  });

  return { orderId: order.id, amount, currency: order.currency };
};

/**
 * Step 2 of recharge: verify the Razorpay payment signature and only then
 * credit the wallet. Idempotent — re-verifying a completed payment is a no-op.
 */
export const completeRecharge = async (
  userId,
  { razorpayOrderId, razorpayPaymentId, razorpaySignature }
) => {
  // Verify the signature: HMAC-SHA256(order_id|payment_id, key_secret)
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const a = Buffer.from(expectedSignature);
  const b = Buffer.from(razorpaySignature || '');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { success: false, message: 'Payment signature verification failed' };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await WalletTransaction.findOne({
      requestId: razorpayOrderId,
      userId,
      type: 'recharge',
    }).session(session);

    if (!transaction) {
      await session.abortTransaction();
      return { success: false, message: 'Recharge order not found' };
    }

    // Idempotency: already credited
    if (transaction.status === 'completed') {
      await session.abortTransaction();
      const wallet = await UserWallet.findOne({ userId });
      return { success: true, balance: wallet ? wallet.balance : 0, alreadyProcessed: true };
    }

    let userWallet = await UserWallet.findOne({ userId }).session(session);
    if (!userWallet) {
      userWallet = new UserWallet({ userId, balance: 0 });
    }

    userWallet.balance += transaction.amount;
    await userWallet.save({ session });

    transaction.status = 'completed';
    await transaction.save({ session });

    await AuditLog.create([{
      user: userId,
      action: 'recharge',
      transaction: transaction._id,
      details: { amount: transaction.amount, razorpayOrderId, razorpayPaymentId },
    }], { session });

    await session.commitTransaction();
    logger.info(`Wallet recharge verified: User ${userId} credited ${transaction.amount}`);
    return { success: true, balance: userWallet.balance };
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error completing wallet recharge:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Deduct from user wallet
 */
export const deductFromUserWallet = async (userId, amount, requestId, session) => {
  // Get user wallet
  const userWallet = await UserWallet.findOne({ userId }).session(session);
  if (!userWallet || userWallet.balance < amount) {
    throw new Error('Insufficient balance');
  }

  // Deduct amount
  userWallet.balance -= amount;
  await userWallet.save({ session });

  // Create transaction record
  const transaction = new WalletTransaction({
    type: 'payment',
    amount,
    userId,
    status: 'completed',
    requestId
  });
  await transaction.save({ session });

  return userWallet.balance;
};

/**
 * Credit to admin wallet
 */
export const creditToAdminWallet = async (amount, requestId, session) => {
  const adminWallet = await AdminWallet.getGlobalWallet(session);
  adminWallet.balance += amount;
  await adminWallet.save({ session });

  // Create transaction record
  const transaction = new WalletTransaction({
    type: 'payment',
    amount,
    status: 'completed',
    requestId
  });
  await transaction.save({ session });

  return adminWallet.balance;
};

/**
 * Get user wallet transactions
 */
export const getUserWalletTransactions = async (userId, page = 1, limit = 10) => {
  try {
    const transactions = await WalletTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await WalletTransaction.countDocuments({ userId });
    return { transactions, total, page, limit };
  } catch (error) {
    logger.error('Error getting user wallet transactions:', error);
    throw error;
  }
};

/**
 * Get all wallet transactions (admin)
 */
export const getAllWalletTransactions = async (page = 1, limit = 10, filters = {}) => {
  try {
    const query = {};
    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    if (filters.userId) query.userId = filters.userId;

    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name email');
    const total = await WalletTransaction.countDocuments(query);
    return { transactions, total, page, limit };
  } catch (error) {
    logger.error('Error getting all wallet transactions:', error);
    throw error;
  }
};

/**
 * Get user-wise wallet reports (admin)
 */
export const getUserWalletReports = async () => {
  try {
    const reports = await UserWallet.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: 1,
          name: '$user.name',
          email: '$user.email',
          balance: 1,
          createdAt: 1
        }
      },
      {
        $sort: { balance: -1 }
      }
    ]);
    return reports;
  } catch (error) {
    logger.error('Error getting user wallet reports:', error);
    throw error;
  }
};


/**
 * Refund helpers — mirror the payment path in reverse, inside the caller's
 * transaction session.
 */
export const creditToUserWallet = async (userId, amount, requestId, session) => {
  let userWallet = await UserWallet.findOne({ userId }).session(session);
  if (!userWallet) {
    const [created] = await UserWallet.create([{ userId, balance: 0 }], session ? { session } : {});
    userWallet = created;
  }
  userWallet.balance += amount;
  await userWallet.save({ session });
  const transaction = new WalletTransaction({
    type: "refund",
    amount,
    userId,
    status: "completed",
    requestId,
  });
  await transaction.save({ session });
  return userWallet.balance;
};

export const deductFromAdminWallet = async (amount, requestId, session) => {
  const adminWallet = await AdminWallet.getGlobalWallet(session);
  if (adminWallet.balance < amount) {
    throw new Error("Admin wallet balance is insufficient for this refund");
  }
  adminWallet.balance -= amount;
  await adminWallet.save({ session });
  const transaction = new WalletTransaction({
    type: "refund",
    amount,
    status: "completed",
    requestId,
  });
  await transaction.save({ session });
  return adminWallet.balance;
};

/**
 * Credit a seller's wallet with their margin from a delivered order.
 * Ledgered as type "payout" (distinct from refunds) for honest reporting.
 */
export const creditSellerPayout = async (userId, amount, requestId, session) => {
  let userWallet = await UserWallet.findOne({ userId }).session(session);
  if (!userWallet) {
    const [created] = await UserWallet.create([{ userId, balance: 0 }], session ? { session } : {});
    userWallet = created;
  }
  userWallet.balance += amount;
  await userWallet.save({ session });
  const transaction = new WalletTransaction({
    type: "payout",
    amount,
    userId,
    status: "completed",
    requestId,
  });
  await transaction.save({ session });
  return userWallet.balance;
};
