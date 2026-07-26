import mongoose from "mongoose";

/**
 * A user's request to withdraw wallet balance to their bank account.
 * Admin approval performs the transactional wallet debit; the actual bank
 * transfer is executed manually until a payout API is integrated.
 */
const payoutRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Masked destination snapshot at request time
    bank: {
      accountLast4: { type: String, trim: true, maxlength: 4 },
      ifsc: { type: String, trim: true, uppercase: true },
      accountHolder: { type: String, trim: true },
    },
    adminNote: { type: String, trim: true },
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true },
);

payoutRequestSchema.index({ userId: 1, status: 1 });
payoutRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("PayoutRequest", payoutRequestSchema);
