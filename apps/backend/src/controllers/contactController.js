import Contact from "../models/contactModel.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";
/**
 * ======================
 * SUBMIT CONTACT (USER SIDE)
 * ======================
 */
export const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        status: "fail",
        message: "All fields (name, email, subject, message) are required",
      });
    }

    // Create new contact
    const contact = await Contact.create({ name, email, subject, message });

    res.status(201).json({
      status: "success",
      message: "Contact submitted successfully",
      data: {
        contact: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          message: contact.message,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================
 * GET ALL CONTACTS (ADMIN SIDE)
 * ======================
 */
export const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: contacts.length,
      data: {
        contacts,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================
 * UPDATE CONTACT STATUS (ADMIN SIDE)
 * ======================
 */
export const updateContactStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid contact id", 400));
    }

    // ✅ Status validation
    const validStatuses = ["new", "reviewed", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid status. Must be one of: new, reviewed, resolved",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!contact) {
      return next(new AppError("Contact not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Contact status updated successfully",
      data: {
        contact,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================
 * DELETE CONTACT (ADMIN SIDE)
 * ======================
 */
export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return next(new AppError("Contact not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Contact deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
