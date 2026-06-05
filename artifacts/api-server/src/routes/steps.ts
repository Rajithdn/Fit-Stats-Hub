import { Router } from "express";
import { db } from "@workspace/db";
import { stepEntries } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const rows = await db.select().from(stepEntries)
      .where(eq(stepEntries.userId, req.userId!))
      .orderBy(stepEntries.date);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch steps" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date, steps } = req.body;
    const d = date ?? new Date().toISOString().split("T")[0];
    const existing = await db.select().from(stepEntries)
      .where(and(eq(stepEntries.userId, req.userId!), eq(stepEntries.date, d))).limit(1);
    if (existing.length > 0) {
      const [row] = await db.update(stepEntries).set({ steps: Number(steps) })
        .where(and(eq(stepEntries.userId, req.userId!), eq(stepEntries.date, d)))
        .returning();
      res.json(row);
    } else {
      const [row] = await db.insert(stepEntries).values({ userId: req.userId!, date: d, steps: Number(steps) }).returning();
      res.status(201).json(row);
    }
  } catch {
    res.status(500).json({ error: "Failed to save steps" });
  }
});

export default router;
