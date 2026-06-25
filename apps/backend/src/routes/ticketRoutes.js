import express from "express";
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
  deleteLast7DaysTickets,
} from "../controllers/ticketController.js";

import { userAuth } from "../middleware/userAuth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// USER
router.post(
  "/create",
  userAuth,
  upload.fields([
    { name: "attachments", maxCount: 5 }
  ]),
  createTicket
);

router.get("/my-tickets", userAuth, getMyTickets);

// ADMIN
router.get("/admin/all", adminAuth, getAllTickets);

router.patch("/admin/:ticketId/status", adminAuth, updateTicketStatus);

// ✅ Delete last 7 days tickets
router.delete("/admin/delete-last-7-days", adminAuth, deleteLast7DaysTickets);

export default router;