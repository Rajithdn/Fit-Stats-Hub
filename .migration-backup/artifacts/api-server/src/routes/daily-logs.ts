import { Router } from "express";
import { db } from "@workspace/db";
import { dailyLogs } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date } = req.query as { date?: string };
    const d = date ?? new Date().toISOString().split("T")[0];
    const [row] = await db.select().from(dailyLogs)
      .where(and(eq(dailyLogs.userId, req.userId!), eq(dailyLogs.date, d))).limit(1);
    res.json(row ?? { water: 0, sleep: 0, date: d });
  } catch {
    res.status(500).json({ error: "Failed to fetch daily log" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date, water, sleep } = req.body;
    const d = date ?? new Date().toISOString().split("T")[0];
    const existing = await db.select().from(dailyLogs)
      .where(and(eq(dailyLogs.userId, req.userId!), eq(dailyLogs.date, d))).limit(1);
    if (existing.length > 0) {
      const [row] = await db.update(dailyLogs).set({
        ...(water !== undefined && { water: String(water) }),
        ...(sleep !== undefined && { sleep: String(sleep) }),
      }).where(and(eq(dailyLogs.userId, req.userId!), eq(dailyLogs.date, d))).returning();
      res.json(row);
    } else {
      const [row] = await db.insert(dailyLogs).values({
        userId: req.userId!, date: d,
        water: String(water ?? 0), sleep: String(sleep ?? 0),
      }).returning();
      res.status(201).json(row);
    }
  } catch {
    res.status(500).json({ error: "Failed to update daily log" });
  }
});

export default router;
