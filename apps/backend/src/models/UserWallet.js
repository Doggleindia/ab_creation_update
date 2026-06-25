import mongoose from 'mongoose';

const userWalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Index for faster queries
userWalletSchema.index({ userId: 1 });

export default mongoose.model('UserWallet', userWalletSchema);
