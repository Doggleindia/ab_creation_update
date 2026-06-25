import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "solved"],
      default: "pending",
    },

    attachments: [
      {
        url: {
          type: String,
          trim: true,
        },
        filename: {
          type: String,
          trim: true,
        },
      },
    ],

    aiSuggestion: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Ticket", ticketSchema);