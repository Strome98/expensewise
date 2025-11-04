import mongoose from "mongoose";

export const PREDEFINED_CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Health",
  "Entertainment",
  "Education",
  "Travel",
  "Groceries",
  "Salary",
  "Freelance",
  "Investments",
  "Gifts",
  "Other",
];

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  amount: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: PREDEFINED_CATEGORIES,
  },
  note: { type: String, trim: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Useful indexes for filtering & sorting
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, amount: -1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);
