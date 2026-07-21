import mongoose from 'mongoose';

const adminWalletSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Payout destination on file — only the last 4 digits are ever stored.
    bankAccount: {
      bankName: { type: String, trim: true },
      accountHolder: { type: String, trim: true },
      last4: { type: String, trim: true, maxlength: 4 },
    },
  },
  { timestamps: true }
);

// Single global document. Accepts an optional session so callers inside a
// transaction read/create the wallet within that transaction — a doc fetched
// or created outside the session is invisible to it and save({ session })
// fails with "No document found".
adminWalletSchema.statics.getGlobalWallet = async function (session = null) {
  let wallet = await this.findOne().session(session);
  if (!wallet) {
    const [created] = await this.create([{ balance: 0 }], session ? { session } : {});
    wallet = created;
  }
  return wallet;
};

export default mongoose.model('AdminWallet', adminWalletSchema);
