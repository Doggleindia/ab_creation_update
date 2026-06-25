/**
 * One-off migration: make the users.phone unique index SPARSE.
 *
 *   cd apps/backend && npm run migrate:phone-index
 *
 * The original index was unique-but-not-sparse, so only a single user without a
 * phone number could ever exist (a 2nd phone-less insert throws E11000). This
 * drops it and recreates it unique + sparse so phone-less users are allowed
 * while real phone numbers stay unique. Safe and idempotent.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set.");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const coll = mongoose.connection.db.collection("users");

  const indexes = await coll.indexes();
  const phoneIdx = indexes.find((i) => i.key && i.key.phone === 1);

  if (!phoneIdx) {
    console.log("No phone index found — creating unique+sparse.");
    await coll.createIndex({ phone: 1 }, { unique: true, sparse: true });
  } else if (phoneIdx.sparse) {
    console.log(`Index ${phoneIdx.name} is already sparse — nothing to do.`);
  } else {
    console.log(`Dropping non-sparse index ${phoneIdx.name}...`);
    await coll.dropIndex(phoneIdx.name);
    await coll.createIndex({ phone: 1 }, { unique: true, sparse: true });
    console.log("Recreated phone index as unique + sparse.");
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
