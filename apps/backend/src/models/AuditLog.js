import mongoose from "mongoose";

const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    admin: { type: Schema.Types.ObjectId, ref: "Admin" },
    transaction: { type: Schema.Types.ObjectId, ref: "WalletTransaction" },
    action: {
      type: String,
      enum: [
        "transaction_created",
        "transaction_completed",
        "transaction_failed",
        "transaction_reversed",
        "transaction_refunded",
        "wallet_frozen",
        "wallet_unfrozen",
        "manual_debit",
        "manual_credit",
        "withdraw_requested",
        "withdraw_approved",
        "withdraw_rejected",
        "withdraw_processed",
        "contest_prize_distributed",
        "contest_prize_credited",
        "recharge",
        "payment",
        "refund"
      ],
      required: true,
    },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ admin: 1, createdAt: -1 });
auditLogSchema.index({ transaction: 1 });
auditLogSchema.index({ action: 1 });

export default mongoose.model("AuditLog", auditLogSchema);
