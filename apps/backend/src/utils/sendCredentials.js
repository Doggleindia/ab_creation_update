import crypto from "crypto";
import EmailTransporter from "./EmailTransporter.js";

// Ambiguous characters (0/O, 1/l/I) are left out so the temporary password is
// easy to read aloud or retype from the email.
const PASSWORD_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

/**
 * Generate a random temporary password. Uses crypto.randomInt for unbiased
 * character selection. Default length 12 comfortably exceeds the model's
 * 6-char minimum.
 */
export const generateTempPassword = (length = 12) => {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += PASSWORD_ALPHABET[crypto.randomInt(0, PASSWORD_ALPHABET.length)];
  }
  return out;
};

const ACCOUNT_LABEL = {
  bulk: "Bulk Buyer",
  seller: "Seller Partner",
};

/**
 * Email a newly approved bulk/seller applicant their login credentials.
 * Throws on send failure so the caller can surface it and retry.
 */
export const sendCredentialsEmail = async ({
  email,
  name,
  tempPassword,
  accountType,
}) => {
  const label = ACCOUNT_LABEL[accountType] || "Account";
  const subject = `Your AB Creation ${label} account is ready`;
  const text = `
Hello ${name},

Good news — your ${label} application has been approved and your account is now active.

You can sign in with these temporary credentials:

  Email:    ${email}
  Password: ${tempPassword}

For your security, you'll be asked to set a new password the first time you log in.

Thanks,
AB Creation Team
`;

  return EmailTransporter.sendEmail(email, subject, text);
};

export default sendCredentialsEmail;
