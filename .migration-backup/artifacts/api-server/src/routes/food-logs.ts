import { Router } from "express";
import { db } from "@workspace/db";
import { foodLogs } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date } = req.query as { date?: string };
    const conds = [eq(foodLogs.userId, req.userId!)];
    if (date) conds.push(eq(foodLogs.date, date));
    const rows = await db.select().from(foodLogs).where(and(...conds)).orderBy(foodLogs.createdAt);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch food logs" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date, name, calories, protein, carbs, fat, fiber } = req.body;
    const [row] = await db.insert(foodLogs).values({
      userId: req.userId!,
      date: date ?? new Date().toISOString().split("T")[0],
      name, calories: Number(calories),
      protein: String(protein), carbs: String(carbs),
      fat: String(fat), fiber: String(fiber ?? 0),
    }).returning();
    res.status(201).json(row);
  } catch {
    res.status(500).json({ error: "Failed to add food log" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db.delete(foodLogs).where(
      and(eq(foodLogs.id, Number(req.params.id)), eq(foodLogs.userId, req.userId!))
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete food log" });
  }
});

export default router;
