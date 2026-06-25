import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['recharge', 'payment', 'refund'],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    requestId: {
      type: String,
      required: true,
      unique: true, // For idempotency
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
walletTransactionSchema.index({ userId: 1 });
walletTransactionSchema.index({ adminId: 1 });
walletTransactionSchema.index({ type: 1 });
walletTransactionSchema.index({ status: 1 });
// requestId is already uniquely indexed via `unique: true` on the field
walletTransactionSchema.index({ createdAt: -1 });

export default mongoose.model('WalletTransaction', walletTransactionSchema);
