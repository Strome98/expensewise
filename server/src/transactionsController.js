import { Router } from "express";
import mongoose from "mongoose";
import { Transaction, PREDEFINED_CATEGORIES } from "./Transaction.js";
import { convertFromHUF, roundCurrency, FX_RATES } from "./currency.js";

const router = Router();

// Create
router.post("/", async (req, res) => {
  const { type, amount, category, note, date } = req.body;

  if (!type || !amount || !category || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!PREDEFINED_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    const tx = await Transaction.create({
      userId: req.userId,
      type,
      amount,
      category,
      note,
      date,
    });
    res.status(201).json(tx);
  } catch (e) {
    res.status(500).json({ error: "Create failed" });
  }
});

// Read list (optional filters)
router.get("/", async (req, res) => {
  const {
    from,
    to,
    category,
    type,
    page = "1",
    pageSize = "20",
    sort = "date:desc",
    search,
  } = req.query;
  const targetCurrency = (req.query.currency || "HUF").toUpperCase();
  const filter = { userId: req.userId };

  if (category) filter.category = category;
  if (type) filter.type = type;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ note: regex }, { category: regex }];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const sizeNum = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), 100);

  const sortSpec = {};
  sort.split(",").forEach((part) => {
    const [field, dir] = part.split(":");

    if (field) {
      const direction = dir === "asc" ? 1 : -1;
      sortSpec[field] = direction;
    }
  });

  try {
    const total = await Transaction.countDocuments(filter);
    const items = await Transaction.find(filter)
      .sort(Object.keys(sortSpec).length ? sortSpec : { date: -1 })
      .skip((pageNum - 1) * sizeNum)
      .limit(sizeNum);
    let convertedItems = items;
    if (
      targetCurrency &&
      targetCurrency !== "HUF" &&
      FX_RATES[targetCurrency]
    ) {
      convertedItems = items.map((i) => ({
        ...i.toObject(),
        amountOriginal: i.amount,
        amount: roundCurrency(convertFromHUF(i.amount, targetCurrency)),
        currency: targetCurrency,
      }));
    }
    res.json({
      items: convertedItems,
      page: pageNum,
      pageSize: sizeNum,
      total,
      totalPages: Math.ceil(total / sizeNum),
      currency: targetCurrency,
    });
  } catch (e) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// Update
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: "Update failed" });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// Category summary
router.get("/summary/categories", async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const agg = await Transaction.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
        },
      },
    ]);
    const formatted = agg.map((i) => ({
      category: i._id.category,
      type: i._id.type,
      total: i.total,
    }));
    const targetCurrency = (req.query.currency || "HUF").toUpperCase();
    let out = formatted;
    if (targetCurrency !== "HUF" && FX_RATES[targetCurrency]) {
      out = formatted.map((r) => ({
        ...r,
        totalOriginal: r.total,
        total: roundCurrency(convertFromHUF(r.total, targetCurrency)),
        currency: targetCurrency,
      }));
    }
    if (process.env.NODE_ENV !== "test") {
      console.log(
        "[summary/categories] user",
        req.userId,
        "records",
        formatted.length
      );
    }
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: "Summary failed" });
  }
});

// Monthly summary (net + breakdown per month)
router.get("/summary/monthly", async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const agg = await Transaction.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$date" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);
    const map = {};
    for (const row of agg) {
      if (!map[row._id.month])
        map[row._id.month] = { month: row._id.month, income: 0, expense: 0 };
      map[row._id.month][row._id.type] = row.total;
    }
    const result = Object.values(map).map((r) => ({
      ...r,
      net: r.income - r.expense,
    }));
    const targetCurrency = (req.query.currency || "HUF").toUpperCase();
    let out = result;
    if (targetCurrency !== "HUF" && FX_RATES[targetCurrency]) {
      out = result.map((r) => ({
        ...r,
        incomeOriginal: r.income,
        expenseOriginal: r.expense,
        netOriginal: r.net,
        income: roundCurrency(convertFromHUF(r.income, targetCurrency)),
        expense: roundCurrency(convertFromHUF(r.expense, targetCurrency)),
        net: roundCurrency(convertFromHUF(r.net, targetCurrency)),
        currency: targetCurrency,
      }));
    }
    if (process.env.NODE_ENV !== "test") {
      console.log(
        "[summary/monthly] user",
        req.userId,
        "months",
        result.length
      );
    }
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: "Monthly summary failed" });
  }
});

// Overall totals for header summary
router.get("/totals", async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const agg = await Transaction.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);
    let income = 0,
      expense = 0;
    for (const row of agg) {
      if (row._id === "income") income = row.total;
      if (row._id === "expense") expense = row.total;
    }
    const targetCurrency = (req.query.currency || "HUF").toUpperCase();
    let payload = { income, expense, net: income - expense, currency: "HUF" };
    if (targetCurrency !== "HUF" && FX_RATES[targetCurrency]) {
      payload = {
        incomeOriginal: income,
        expenseOriginal: expense,
        netOriginal: income - expense,
        income: roundCurrency(convertFromHUF(income, targetCurrency)),
        expense: roundCurrency(convertFromHUF(expense, targetCurrency)),
        net: roundCurrency(convertFromHUF(income - expense, targetCurrency)),
        currency: targetCurrency,
      };
    }
    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: "Totals failed" });
  }
});

// Last 7 days daily summary
router.get("/summary/last7", async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6
    ); // inclusive 6 days ago
    const agg = await Transaction.aggregate([
      { $match: { userId: userObjectId, date: { $gte: start, $lte: now } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);
    const dayMap = {};

    for (const row of agg) {
      const day = row._id.day;
      if (!dayMap[day]) dayMap[day] = { day, income: 0, expense: 0 };
      dayMap[day][row._id.type] = row.total;
    }

    for (let i = 0; i < 7; i++) {
      const d = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 6 + i
      );
      const key = d.toISOString().slice(0, 10);
      if (!dayMap[key]) dayMap[key] = { day: key, income: 0, expense: 0 };
    }

    const result = Object.values(dayMap)
      .sort((a, b) => a.day.localeCompare(b.day))
      .map((r) => ({ ...r, net: r.income - r.expense }));
    const targetCurrency = (req.query.currency || "HUF").toUpperCase();
    let out = result;

    if (targetCurrency !== "HUF" && FX_RATES[targetCurrency]) {
      out = result.map((r) => ({
        ...r,
        incomeOriginal: r.income,
        expenseOriginal: r.expense,
        netOriginal: r.net,
        income: roundCurrency(convertFromHUF(r.income, targetCurrency)),
        expense: roundCurrency(convertFromHUF(r.expense, targetCurrency)),
        net: roundCurrency(convertFromHUF(r.net, targetCurrency)),
        currency: targetCurrency,
      }));
    }
    if (process.env.NODE_ENV !== "test") {
      console.log("[summary/last7] user", req.userId, "days", result.length);
    }
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: "Last7 summary failed" });
  }
});

// Month + Category matrix
router.get("/summary/monthCategory", async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const agg = await Transaction.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$date" } },
            category: "$category",
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1, "_id.category": 1 } },
    ]);
    const rows = agg.map((r) => ({
      month: r._id.month,
      category: r._id.category,
      type: r._id.type,
      total: r.total,
    }));

    if (process.env.NODE_ENV !== "test") {
      console.log(
        "[summary/monthCategory] user",
        req.userId,
        "rows",
        rows.length
      );
    }
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Month+Category summary failed" });
  }
});

// Check categories
router.get("/categories/list", (req, res) => {
  res.json(PREDEFINED_CATEGORIES);
});

export default router;
