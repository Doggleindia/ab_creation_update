import mongoose from "mongoose";
import AppError from "../../utils/AppError.js";
import User from "../../models/auth/userModel.js";
import { toStr } from "../../utils/sanitize.js";

// Keep the legacy single `user.address` in sync with the default entry so
// checkout pre-fill (which reads user.address) keeps working unchanged.
const syncDefault = (user) => {
  if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
    user.addresses[0].isDefault = true;
  }
  const def = user.addresses.find((a) => a.isDefault);
  user.address = def
    ? {
        street: def.street,
        city: def.city,
        state: def.state,
        pincode: def.pincode,
        country: def.country || "India",
      }
    : { street: "", city: "", state: "", pincode: "", country: "India" };
};

const sanitize = (body) => {
  const phone = (toStr(body.phone) || "").replace(/\D/g, "");
  if (phone && phone.length !== 10) {
    throw new AppError("Phone must be a 10-digit number", 400);
  }
  const pincode = (toStr(body.pincode) || "").replace(/\D/g, "");
  if (!/^\d{6}$/.test(pincode)) {
    throw new AppError("PIN code must be 6 digits", 400);
  }
  const entry = {
    label: toStr(body.label) || "Home",
    name: toStr(body.name),
    phone,
    street: toStr(body.street),
    city: toStr(body.city),
    state: toStr(body.state),
    pincode,
    country: toStr(body.country) || "India",
  };
  if (!entry.street || !entry.city) {
    throw new AppError("Street and city are required", 400);
  }
  return entry;
};

const loadUser = async (req) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError("User not found", 404);
  return user;
};

/** GET /api/users/addresses — the caller's address book. */
export const listAddresses = async (req, res) => {
  const user = await loadUser(req);
  // Migrate the legacy single address into the book on first read
  if (user.addresses.length === 0 && user.address?.street) {
    user.addresses.push({
      label: "Home",
      name: user.name,
      phone: user.phone || "",
      street: user.address.street,
      city: user.address.city || "",
      state: user.address.state || "",
      pincode: user.address.pincode || "",
      country: user.address.country || "India",
      isDefault: true,
    });
    await user.save();
  }
  res.status(200).json({ status: "success", data: { addresses: user.addresses } });
};

/** POST /api/users/addresses — add an address (first one becomes default). */
export const addAddress = async (req, res) => {
  const user = await loadUser(req);
  if (user.addresses.length >= 10) {
    throw new AppError("Address book is full (10 max) — remove one first", 409);
  }
  const entry = sanitize(req.body);
  user.addresses.push({
    ...entry,
    isDefault: user.addresses.length === 0 || req.body.isDefault === true,
  });
  if (req.body.isDefault === true) {
    const added = user.addresses[user.addresses.length - 1];
    for (const a of user.addresses) a.isDefault = a === added;
  }
  syncDefault(user);
  await user.save();
  res.status(201).json({
    status: "success",
    message: "Address saved.",
    data: { addresses: user.addresses },
  });
};

const findEntry = (user, id) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid address id", 400);
  const entry = user.addresses.id(id);
  if (!entry) throw new AppError("Address not found", 404);
  return entry;
};

/** PUT /api/users/addresses/:id — update one entry. */
export const updateAddress = async (req, res) => {
  const user = await loadUser(req);
  const entry = findEntry(user, req.params.id);
  Object.assign(entry, sanitize(req.body));
  syncDefault(user);
  await user.save();
  res.status(200).json({
    status: "success",
    message: "Address updated.",
    data: { addresses: user.addresses },
  });
};

/** DELETE /api/users/addresses/:id */
export const deleteAddress = async (req, res) => {
  const user = await loadUser(req);
  const entry = findEntry(user, req.params.id);
  entry.deleteOne();
  syncDefault(user);
  await user.save();
  res.status(200).json({
    status: "success",
    message: "Address removed.",
    data: { addresses: user.addresses },
  });
};

/** PATCH /api/users/addresses/:id/default */
export const setDefaultAddress = async (req, res) => {
  const user = await loadUser(req);
  const entry = findEntry(user, req.params.id);
  for (const a of user.addresses) a.isDefault = a._id.equals(entry._id);
  syncDefault(user);
  await user.save();
  res.status(200).json({
    status: "success",
    message: `${entry.label} is now your default address.`,
    data: { addresses: user.addresses },
  });
};
