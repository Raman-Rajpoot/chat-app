import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Validates proper email format
    },
    bio: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      public_id: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      }
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password before saving
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare login password with stored hash password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate access token
UserSchema.methods.generateAccessToken = async function () {
  console.log("generateAccessToken", process.env.ACCESS_TOKEN_SECRET, process.env.ACCESS_TOKEN_EXPIRY);
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Generate refresh token
UserSchema.methods.generateRefreshToken = async function () {
  console.log("generateRefreshToken");
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", UserSchema);
