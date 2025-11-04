import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./authController.js";
import transactionRoutes from "./transactionsController.js";
import profileRoutes from "./profileController.js";
import { PREDEFINED_CATEGORIES } from "./Transaction.js";
import { authRequired } from "./authRequired.js";
import { MongoMemoryServer } from "mongodb-memory-server";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", authRequired, transactionRoutes);
app.use("/api/profile", authRequired, profileRoutes);
app.get("/api/categories", (req, res) => res.json(PREDEFINED_CATEGORIES));

const PORT = process.env.PORT || 5000;

async function start() {
  const mongoUri = process.env.MONGO_URI;
  const allowMemory = process.env.USE_INMEMORY_ON_FAIL === "true";

  if (!mongoUri) {
    console.error(
      "Missing MONGO_URI environment variable. Set it in .env to persist data."
    );
    if (!allowMemory) {
      process.exit(1);
    }
  }
  try {
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      console.log("MongoDB connected:", mongoUri);
    } else {
      throw new Error("No MONGO_URI provided");
    }
  } catch (err) {
    if (!allowMemory) {
      console.error(
        "MongoDB connection failed and in-memory fallback disabled:",
        err.message
      );
      process.exit(1);
    }
    console.warn(
      "MongoDB connection failed, using in-memory server (data will be lost on restart):",
      err.message
    );
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log("In-memory MongoDB started");
  }
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

if (process.env.JEST_WORKER_ID === undefined) {
  start();
}

export default app; // For testcases

// Catches all other errors
app.use((err, req, res, next) => {
  console.error("Unhandled error", err);
  res.status(500).json({ error: "Internal server error" });
});
