import mongoose from "mongoose";
import bcrypt from "bcrypt";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Validates email format
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 5 * 60 * 1000), // Expires in 5 minutes
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });


export const OTP = mongoose.model("OTP", otpSchema);