import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: { type: String, required: true },
  displayName: { type: String, trim: true },
  role: { type: String, enum: ['Administrator','User'], default: 'User' },
  preferences: {
    alertOnNegativeNet: { type: Boolean, default: true },
    currency: { type: String, default: "HUF" },
  },
});

userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

userSchema.statics.hashPassword = function (password) {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
};

export const User = mongoose.model("User", userSchema);
