import mongoose from 'mongoose';

const adminWalletSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// This will be a single document, so we can use a fixed _id
adminWalletSchema.statics.getGlobalWallet = async function () {
  let wallet = await this.findOne();
  if (!wallet) {
    wallet = await this.create({ balance: 0 });
  }
  return wallet;
};

export default mongoose.model('AdminWallet', adminWalletSchema);
