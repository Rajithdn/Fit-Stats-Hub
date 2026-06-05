import { Router } from "express";
import { db } from "@workspace/db";
import { workoutLogs } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const rows = await db.select().from(workoutLogs)
      .where(eq(workoutLogs.userId, req.userId!))
      .orderBy(workoutLogs.createdAt);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch workout logs" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date, exercise, sets, reps, weight, unit, notes } = req.body;
    const [row] = await db.insert(workoutLogs).values({
      userId: req.userId!,
      date: date ?? new Date().toISOString().split("T")[0],
      exercise, sets: Number(sets), reps: Number(reps),
      weight: String(weight ?? 0),
      unit: unit ?? "kg",
      notes: notes ?? "",
    }).returning();
    res.status(201).json(row);
  } catch {
    res.status(500).json({ error: "Failed to add workout log" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db.delete(workoutLogs).where(
      and(eq(workoutLogs.id, Number(req.params.id)), eq(workoutLogs.userId, req.userId!))
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete workout log" });
  }
});

export default router;
