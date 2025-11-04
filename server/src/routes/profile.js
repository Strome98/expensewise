import { Router } from "express";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { FX_RATES } from "../util/currency.js";

const router = Router();

// Get current user profile (preferences only for now)
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("email preferences");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ email: user.email, preferences: user.preferences });
  } catch (e) {
    res.status(500).json({ error: "Failed to load profile" });
  }
});

// Update preferences
router.patch("/preferences", async (req, res) => {
  try {
    const { alertOnNegativeNet, currency, displayName } = req.body;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (typeof alertOnNegativeNet === "boolean") {
      user.preferences.alertOnNegativeNet = alertOnNegativeNet;
    }

    if (typeof currency === "string" && currency.length <= 8) {
      user.preferences.currency = currency.toUpperCase();
    }

    if (typeof displayName === "string") {
      user.displayName = displayName.trim();
    }

    await user.save();
    res.json({ preferences: user.preferences, displayName: user.displayName });
  } catch (e) {
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

// Current central rate
router.get("/fx/rates", (req, res) => {
  res.json({
    base: "HUF",
    rates: FX_RATES,
    timestamp: new Date().toISOString(),
  });
});

export default router;

// Data export (JSON or CSV)
router.get("/export", async (req, res) => {
  try {
    const format = (req.query.format || "json").toLowerCase();
    const user = await User.findById(req.userId).select(
      "email displayName preferences deletionRequestedAt deletionScheduledFor"
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    const tx = await Transaction.find({ userId: req.userId }).sort({ date: 1 });
    if (format === "csv") {
      const header = ["date", "type", "category", "amount", "note"];
      const rows = tx.map((t) => [
        t.date.toISOString(),
        t.type,
        t.category,
        t.amount,
        (t.note || "").replace(/"/g, '""'),
      ]);
      const csv = [
        header.join(","),
        ...rows.map((r) => r.map((f) => `"${String(f)}"`).join(",")),
      ].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="expensewise_export.csv"'
      );
      return res.send(csv);
    } else {
      return res.json({ user, transactions: tx });
    }
  } catch (e) {
    res.status(500).json({ error: "Export failed" });
  }
});

// Request account deletion (grace period 7 days)
router.post("/delete/request", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const now = new Date();
    const graceDays = 7;
    user.deletionRequestedAt = now;
    user.deletionScheduledFor = new Date(
      now.getTime() + graceDays * 24 * 60 * 60 * 1000
    );
    await user.save();
    res.json({
      status: "scheduled",
      deletionScheduledFor: user.deletionScheduledFor,
    });
  } catch (e) {
    res.status(500).json({ error: "Could not schedule deletion" });
  }
});

// Cancel deletion request
router.post("/delete/cancel", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.deletionRequestedAt = undefined;
    user.deletionScheduledFor = undefined;
    await user.save();
    res.json({ status: "canceled" });
  } catch (e) {
    res.status(500).json({ error: "Could not cancel deletion" });
  }
});

// Immediate deletion if grace period passed (or force query param true)
router.delete("/delete/execute", async (req, res) => {
  try {
    const force = req.query.force === "true";
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.deletionScheduledFor)
      return res.status(400).json({ error: "No deletion scheduled" });
    const now = new Date();
    if (now < user.deletionScheduledFor && !force) {
      return res.status(400).json({ error: "Grace period not finished" });
    }
    await Transaction.deleteMany({ userId: req.userId });
    await User.deleteOne({ _id: req.userId });
    res.json({ status: "deleted" });
  } catch (e) {
    res.status(500).json({ error: "Deletion failed" });
  }
});
