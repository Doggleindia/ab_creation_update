import Razorpay from "razorpay";

// Razorpay client. Keys come from the environment so they are never committed:
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
// The public key id is also sent to the browser so the checkout widget can open.
let instance = null;

export const getRazorpay = () => {
  if (!instance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
      );
    }
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
};

export const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID;
