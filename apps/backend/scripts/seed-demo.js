/**
 * Seed demo accounts for local/testing use.
 *
 *   cd apps/backend
 *   cp .env.example .env   # ensure MONGO_URI is set
 *   npm run seed:demo
 *
 * Idempotent: re-running resets the demo passwords to the values below, so the
 * credentials are always known. Safe to run multiple times.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/auth/userModel.js";
import Admin from "../src/models/auth/adminModel.js";
import UserWallet from "../src/models/UserWallet.js";

dotenv.config();

const DEMO_USER = {
  name: "Demo User",
  email: "demo@abcreation.com",
  password: "Demo@1234",
};
const DEMO_ADMIN = {
  name: "Demo Admin",
  email: "admin@abcreation.com",
  password: "Admin@1234",
};
const DEMO_WALLET_BALANCE = 10000; // ₹ — lets the demo user check out without Razorpay

// Find-or-create, always (re)setting the password through .save() so the
// model's pre-save hashing runs and the credentials stay predictable.
async function upsertWithPassword(Model, { name, email, password }) {
  let doc = await Model.findOne({ email }).select("+password");
  const created = !doc;
  if (!doc) doc = new Model({ name, email, password });
  else {
    doc.name = name;
    doc.password = password;
  }
  await doc.save();
  return { created, doc };
}

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const user = await upsertWithPassword(User, DEMO_USER);
  console.log(`${user.created ? "Created" : "Updated"} demo user:  ${DEMO_USER.email}`);

  await UserWallet.findOneAndUpdate(
    { userId: user.doc._id },
    { $set: { balance: DEMO_WALLET_BALANCE } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Set demo user wallet balance to ₹${DEMO_WALLET_BALANCE}`);

  const admin = await upsertWithPassword(Admin, DEMO_ADMIN);
  console.log(`${admin.created ? "Created" : "Updated"} demo admin: ${DEMO_ADMIN.email}`);

  console.log("\n================ DEMO CREDENTIALS ================");
  console.log(`Storefront  →  ${DEMO_USER.email}   /  ${DEMO_USER.password}`);
  console.log(`Admin panel →  ${DEMO_ADMIN.email}  /  ${DEMO_ADMIN.password}`);
  console.log("=================================================");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
