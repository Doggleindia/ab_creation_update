import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    
    phone: {
      type: String,
      unique: true,
      // sparse so the unique index ignores documents without a phone —
      // otherwise only the first phone-less user could ever be inserted.
      sparse: true,
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    // Distinguishes the kind of account. "normal" self-registers via /signup;
    // "bulk" and "seller" are provisioned by an admin approving a
    // BusinessApplication, which is why they can never be set from /signup.
    accountType: {
      type: String,
      enum: ["normal", "bulk", "seller"],
      default: "normal",
    },

    // Set to true when an account is created with a system-generated temporary
    // password (approved bulk/seller applications). The user is forced to set a
    // new password on first login before reaching the dashboard.
    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    // Default shipping address (mirror of the default entry in `addresses`,
    // kept in sync so checkout pre-fill keeps working unchanged)
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
        default: "India",
      },
    },

    // Labeled address book (Home / Office / …). Exactly one entry is default.
    addresses: [
      {
        label: { type: String, trim: true, default: "Home" },
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
        street: { type: String, trim: true, required: true },
        line2: { type: String, trim: true },
        city: { type: String, trim: true, required: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true, required: true },
        country: { type: String, trim: true, default: "India" },
        isDefault: { type: Boolean, default: false },
      },
    ],

    resetOtp: {
      type: String,
      select: false,
    },

    resetOtpExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true },
);

/**
 * 🔐 Hash password before save
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

/**
 * 🔑 Compare password
 */
userSchema.methods.correctPassword = async function (
  enteredPassword,
  storedPassword
) {
  return await bcrypt.compare(enteredPassword, storedPassword);
};

export default mongoose.model('User', userSchema);
