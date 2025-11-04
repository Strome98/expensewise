import { Router } from "express";
import { User } from "./User.js";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email & password required" });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already used" });
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ email, passwordHash });
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({ token });
  } catch (e) {
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email & password required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await user.verifyPassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
