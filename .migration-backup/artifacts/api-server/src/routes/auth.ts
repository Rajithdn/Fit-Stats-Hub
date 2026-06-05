import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { users, userProfiles } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { JWT_SECRET, requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const {
      username, password,
      name, age, gender,
      height, weight, targetWeight,
      activityLevel, goal,
    } = req.body as {
      username: string;
      password: string;
      name?: string;
      age?: number;
      gender?: string;
      height?: number;
      weight?: number;
      targetWeight?: number;
      activityLevel?: string;
      goal?: string;
    };

    if (!username?.trim() || !password || password.length < 4) {
      res.status(400).json({ error: "Username and password (min 4 chars) required" });
      return;
    }

    const existing = await db.select().from(users).where(eq(users.username, username.trim().toLowerCase())).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({ username: username.trim().toLowerCase(), passwordHash }).returning();

    await db.insert(userProfiles).values({
      userId: user.id,
      name: name?.trim() ?? "",
      age: age ?? 25,
      gender: gender ?? "male",
      height: height ? String(height) : "170",
      weight: weight ? String(weight) : "70",
      targetWeight: targetWeight ? String(targetWeight) : "65",
      activityLevel: activityLevel ?? "Moderately Active",
      goal: goal ?? "Weight Loss",
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    res.status(201).json({ token, username: user.username, userId: user.id });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    if (!username?.trim() || !password) {
      res.status(400).json({ error: "Username and password required" });
      return;
    }
    const [user] = await db.select().from(users).where(eq(users.username, username.trim().toLowerCase())).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, username: user.username, userId: user.id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/change-password", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
    if (!currentPassword || !newPassword || newPassword.length < 4) {
      res.status(400).json({ error: "Current password and new password (min 4 chars) required" });
      return;
    }
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, req.userId!));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to change password" });
  }
});

export default router;
