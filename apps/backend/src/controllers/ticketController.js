import Ticket from "../models/Ticket.js";
import { generateAISuggestion } from "../services/geminiService.js";
import { uploadFileToS3 } from "../config/s3Service.js";
import { deleteFileFromS3ByUrl } from "../config/deleteFileFromS3ByUrl.js";
import AppError from "../utils/AppError.js";

// ================= USER CREATE =================
export const createTicket = async (req, res, next) => {
  try {
    const { subject, description } = req.body;

    if (!subject || !description) {
      return next(new AppError("Subject and description required", 400));
    }

    const lowerText = description.toLowerCase();
    const seriousKeywords = [
      "wallet",
      "money",
      "refund",
      "payment",
      "deducted",
    ];

    const isSerious = seriousKeywords.some((word) => lowerText.includes(word));

    /// ================= HANDLE ATTACHMENTS =================
    let attachments = [];

    if (req.files && req.files.attachments) {
      for (const file of req.files.attachments) {
        const result = await uploadFileToS3(file);

        attachments.push({
          url: result.Location,
          filename: file.originalname,
        });
      }
    }

    // ================= SERIOUS ISSUE =================
    if (isSerious) {
      const ticket = await Ticket.create({
        userId: req.user._id,
        subject,
        description,
        attachments,
      });

      return res.status(201).json({
        success: true,
        type: "ticket_created",
        message: "Serious issue detected. Ticket created.",
        data: ticket,
      });
    }

    // ================= NORMAL ISSUE (AI) =================
    const aiSuggestion = await generateAISuggestion(description);

    return res.status(200).json({
      success: true,
      type: "ai_suggestion",
      message: "AI suggestion generated",
      aiSuggestion,
    });
  } catch (error) {
    next(error);
  }
};

// ================= USER =================
export const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// ================= ADMIN =================
export const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!["pending", "solved"].includes(status)) {
      return next(new AppError("Invalid status", 400));
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return next(new AppError("Ticket not found", 404));
    }

    ticket.status = status;
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// ================= ADMIN DELETE LAST 7 DAYS =================
export const deleteLast7DaysTickets = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await Ticket.deleteMany({
      createdAt: { $gte: sevenDaysAgo },
    });

    res.status(200).json({
      success: true,
      message: "Last 7 days tickets deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};
