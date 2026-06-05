import { Router } from "express";
import { db } from "@workspace/db";
import { userProfiles, users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, req.userId!)).limit(1);
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    const [user] = await db.select({ username: users.username }).from(users).where(eq(users.id, req.userId!)).limit(1);
    res.json({ ...profile, username: user?.username ?? "" });
  } catch {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.put("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      name, age, gender, height, weight, targetWeight,
      activityLevel, goal, dailyCalorieGoal, profilePhoto,
      stepGoal, theme,
    } = req.body;
    const [updated] = await db.update(userProfiles)
      .set({
        ...(name !== undefined && { name }),
        ...(age !== undefined && { age: Number(age) }),
        ...(gender !== undefined && { gender }),
        ...(height !== undefined && { height: String(height) }),
        ...(weight !== undefined && { weight: String(weight) }),
        ...(targetWeight !== undefined && { targetWeight: String(targetWeight) }),
        ...(activityLevel !== undefined && { activityLevel }),
        ...(goal !== undefined && { goal }),
        ...(dailyCalorieGoal !== undefined && { dailyCalorieGoal: Number(dailyCalorieGoal) }),
        ...(profilePhoto !== undefined && { profilePhoto }),
        ...(stepGoal !== undefined && { stepGoal: Number(stepGoal) }),
        ...(theme !== undefined && { theme }),
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, req.userId!))
      .returning();
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
