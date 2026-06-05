import { Router } from "express";
import { db } from "@workspace/db";
import { measurements } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const rows = await db.select().from(measurements)
      .where(eq(measurements.userId, req.userId!))
      .orderBy(measurements.date);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch measurements" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date, chest, waist, hips, leftArm, rightArm, leftThigh, rightThigh, shoulders, neck, notes } = req.body;
    const [row] = await db.insert(measurements).values({
      userId: req.userId!,
      date: date ?? new Date().toISOString().split("T")[0],
      chest: String(chest ?? 0), waist: String(waist ?? 0),
      hips: String(hips ?? 0), leftArm: String(leftArm ?? 0),
      rightArm: String(rightArm ?? 0), leftThigh: String(leftThigh ?? 0),
      rightThigh: String(rightThigh ?? 0), shoulders: String(shoulders ?? 0),
      neck: String(neck ?? 0), notes: notes ?? "",
    }).returning();
    res.status(201).json(row);
  } catch {
    res.status(500).json({ error: "Failed to add measurement" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db.delete(measurements).where(
      and(eq(measurements.id, Number(req.params.id)), eq(measurements.userId, req.userId!))
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete measurement" });
  }
});

export default router;
