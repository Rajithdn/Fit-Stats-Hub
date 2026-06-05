import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { pgTable, serial, text, integer, numeric, timestamp, date, unique } from "drizzle-orm/pg-core";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ── Schema ────────────────────────────────────────────────────────────────────
const users = pgTable("users", {
  id:           serial("id").primaryKey(),
  username:     text("username").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});

const userProfiles = pgTable("user_profiles", {
  id:               serial("id").primaryKey(),
  userId:           integer("user_id").notNull(),
  name:             text("name").default("").notNull(),
  age:              integer("age").default(25).notNull(),
  gender:           text("gender").default("male").notNull(),
  height:           numeric("height").default("170").notNull(),
  weight:           numeric("weight").default("70").notNull(),
  targetWeight:     numeric("target_weight").default("65").notNull(),
  activityLevel:    text("activity_level").default("Moderately Active").notNull(),
  goal:             text("goal").default("Weight Loss").notNull(),
  dailyCalorieGoal: integer("daily_calorie_goal").default(2000).notNull(),
  profilePhoto:     text("profile_photo").default("").notNull(),
  stepGoal:         integer("step_goal").default(10000).notNull(),
  theme:            text("theme").default("dark").notNull(),
  updatedAt:        timestamp("updated_at").defaultNow().notNull(),
});

const foodLogs = pgTable("food_logs", {
  id:        serial("id").primaryKey(),
  userId:    integer("user_id").notNull(),
  date:      date("date").notNull(),
  name:      text("name").notNull(),
  calories:  integer("calories").default(0).notNull(),
  protein:   numeric("protein").default("0").notNull(),
  carbs:     numeric("carbs").default("0").notNull(),
  fat:       numeric("fat").default("0").notNull(),
  fiber:     numeric("fiber").default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const workoutLogs = pgTable("workout_logs", {
  id:        serial("id").primaryKey(),
  userId:    integer("user_id").notNull(),
  date:      date("date").notNull(),
  exercise:  text("exercise").notNull(),
  sets:      integer("sets").default(1).notNull(),
  reps:      integer("reps").default(1).notNull(),
  weight:    numeric("weight").default("0").notNull(),
  unit:      text("unit").default("kg").notNull(),
  notes:     text("notes").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const stepEntries = pgTable("step_entries", {
  id:     serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date:   date("date").notNull(),
  steps:  integer("steps").default(0).notNull(),
}, (t) => [unique().on(t.userId, t.date)]);

const measurements = pgTable("measurements", {
  id:         serial("id").primaryKey(),
  userId:     integer("user_id").notNull(),
  date:       date("date").notNull(),
  chest:      numeric("chest").default("0").notNull(),
  waist:      numeric("waist").default("0").notNull(),
  hips:       numeric("hips").default("0").notNull(),
  leftArm:    numeric("left_arm").default("0").notNull(),
  rightArm:   numeric("right_arm").default("0").notNull(),
  leftThigh:  numeric("left_thigh").default("0").notNull(),
  rightThigh: numeric("right_thigh").default("0").notNull(),
  shoulders:  numeric("shoulders").default("0").notNull(),
  neck:       numeric("neck").default("0").notNull(),
  notes:      text("notes").default("").notNull(),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

const dailyLogs = pgTable("daily_logs", {
  id:     serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date:   date("date").notNull(),
  water:  numeric("water").default("0").notNull(),
  sleep:  numeric("sleep").default("0").notNull(),
}, (t) => [unique().on(t.userId, t.date)]);

// ── DB ────────────────────────────────────────────────────────────────────────
const { Pool } = pg;
const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("No DATABASE_URL or NEON_DATABASE_URL set");
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
const db = drizzle(pool);

// Auto-create tables on first request (needed for Vercel / fresh databases)
let dbReady = false;
async function ensureDb() {
  if (dbReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name TEXT DEFAULT '' NOT NULL,
      age INTEGER DEFAULT 25 NOT NULL,
      gender TEXT DEFAULT 'male' NOT NULL,
      height NUMERIC DEFAULT 170 NOT NULL,
      weight NUMERIC DEFAULT 70 NOT NULL,
      target_weight NUMERIC DEFAULT 65 NOT NULL,
      activity_level TEXT DEFAULT 'Moderately Active' NOT NULL,
      goal TEXT DEFAULT 'Weight Loss' NOT NULL,
      daily_calorie_goal INTEGER DEFAULT 2000 NOT NULL,
      profile_photo TEXT DEFAULT '' NOT NULL,
      step_goal INTEGER DEFAULT 10000 NOT NULL,
      theme TEXT DEFAULT 'dark' NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS food_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      date DATE NOT NULL,
      name TEXT NOT NULL,
      calories INTEGER DEFAULT 0 NOT NULL,
      protein NUMERIC DEFAULT 0 NOT NULL,
      carbs NUMERIC DEFAULT 0 NOT NULL,
      fat NUMERIC DEFAULT 0 NOT NULL,
      fiber NUMERIC DEFAULT 0 NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workout_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      date DATE NOT NULL,
      exercise TEXT NOT NULL,
      sets INTEGER DEFAULT 1 NOT NULL,
      reps INTEGER DEFAULT 1 NOT NULL,
      weight NUMERIC DEFAULT 0 NOT NULL,
      unit TEXT DEFAULT 'kg' NOT NULL,
      notes TEXT DEFAULT '' NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS step_entries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      date DATE NOT NULL,
      steps INTEGER DEFAULT 0 NOT NULL,
      UNIQUE(user_id, date)
    );
    CREATE TABLE IF NOT EXISTS measurements (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      date DATE NOT NULL,
      chest NUMERIC DEFAULT 0 NOT NULL,
      waist NUMERIC DEFAULT 0 NOT NULL,
      hips NUMERIC DEFAULT 0 NOT NULL,
      left_arm NUMERIC DEFAULT 0 NOT NULL,
      right_arm NUMERIC DEFAULT 0 NOT NULL,
      left_thigh NUMERIC DEFAULT 0 NOT NULL,
      right_thigh NUMERIC DEFAULT 0 NOT NULL,
      shoulders NUMERIC DEFAULT 0 NOT NULL,
      neck NUMERIC DEFAULT 0 NOT NULL,
      notes TEXT DEFAULT '' NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS daily_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      date DATE NOT NULL,
      water NUMERIC DEFAULT 0 NOT NULL,
      sleep NUMERIC DEFAULT 0 NOT NULL,
      UNIQUE(user_id, date)
    );
  `);
  dbReady = true;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "termfit-jwt-secret-dev-only";

interface AuthRequest extends Request { userId?: number; }

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) { res.status(401).json({ error: "No token provided" }); return; }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ── App ───────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use((_req, _res, next) => { ensureDb().then(next).catch(next); });

// Health / diagnostics — never cache this response
async function healthHandler(_req: Request, res: Response) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.set("Pragma", "no-cache");
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  const dbConfigured = !!dbUrl;
  let dbConnected = false;
  let dbError = "";
  if (dbConfigured) {
    try {
      await pool.query("SELECT 1");
      dbConnected = true;
    } catch (e: any) {
      dbError = e.message;
    }
  }
  res.json({
    ok: dbConnected,
    db: dbConfigured ? (dbConnected ? "connected" : "error") : "missing DATABASE_URL",
    dbError: dbError || undefined,
    ts: Date.now(),
  });
}
app.get("/api/health", healthHandler);
app.post("/api/health", healthHandler); // POST is never CDN-cached

// ── Auth routes ───────────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, name, age, gender, height, weight, targetWeight, activityLevel, goal } = req.body;
    if (!username?.trim() || !password || password.length < 4) {
      res.status(400).json({ error: "Username and password (min 4 chars) required" }); return;
    }
    const existing = await db.select().from(users).where(eq(users.username, username.trim().toLowerCase())).limit(1);
    if (existing.length > 0) { res.status(409).json({ error: "Username already taken" }); return; }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({ username: username.trim().toLowerCase(), passwordHash }).returning();
    await db.insert(userProfiles).values({
      userId: user.id, name: name?.trim() ?? "", age: age ?? 25, gender: gender ?? "male",
      height: height ? String(height) : "170", weight: weight ? String(weight) : "70",
      targetWeight: targetWeight ? String(targetWeight) : "65",
      activityLevel: activityLevel ?? "Moderately Active", goal: goal ?? "Weight Loss",
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    res.status(201).json({ token, username: user.username, userId: user.id });
  } catch (err) { console.error(err); res.status(500).json({ error: "Registration failed" }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username?.trim() || !password) { res.status(400).json({ error: "Username and password required" }); return; }
    const [user] = await db.select().from(users).where(eq(users.username, username.trim().toLowerCase())).limit(1);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid username or password" }); return;
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, username: user.username, userId: user.id });
  } catch (err) { console.error(err); res.status(500).json({ error: "Login failed" }); }
});

app.post("/api/auth/change-password", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 4) {
      res.status(400).json({ error: "New password must be at least 4 chars" }); return;
    }
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      res.status(401).json({ error: "Current password is incorrect" }); return;
    }
    await db.update(users).set({ passwordHash: await bcrypt.hash(newPassword, 10) }).where(eq(users.id, req.userId!));
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Failed to change password" }); }
});

// ── Profile routes ────────────────────────────────────────────────────────────
app.get("/api/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, req.userId!)).limit(1);
    if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }
    const [user] = await db.select({ username: users.username }).from(users).where(eq(users.id, req.userId!)).limit(1);
    res.json({ ...profile, username: user?.username ?? "" });
  } catch { res.status(500).json({ error: "Failed to fetch profile" }); }
});

app.put("/api/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, age, gender, height, weight, targetWeight, activityLevel, goal, dailyCalorieGoal, profilePhoto, stepGoal, theme } = req.body;
    const [updated] = await db.update(userProfiles).set({
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
    }).where(eq(userProfiles.userId, req.userId!)).returning();
    res.json(updated);
  } catch { res.status(500).json({ error: "Failed to update profile" }); }
});

// ── Food logs ─────────────────────────────────────────────────────────────────
app.get("/api/food-logs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date } = req.query as { date?: string };
    const conds = [eq(foodLogs.userId, req.userId!)];
    if (date) conds.push(eq(foodLogs.date, date));
    res.json(await db.select().from(foodLogs).where(and(...conds)).orderBy(foodLogs.createdAt));
  } catch { res.status(500).json({ error: "Failed to fetch food logs" }); }
});

app.post("/api/food-logs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date, name, calories, protein, carbs, fat, fiber } = req.body;
    const [row] = await db.insert(foodLogs).values({
      userId: req.userId!, date: date ?? new Date().toISOString().split("T")[0],
      name, calories: Number(calories), protein: String(protein), carbs: String(carbs),
      fat: String(fat), fiber: String(fiber ?? 0),
    }).returning();
    res.status(201).json(row);
  } catch { res.status(500).json({ error: "Failed to add food log" }); }
});

app.delete("/api/food-logs/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db.delete(foodLogs).where(and(eq(foodLogs.id, Number(req.params.id)), eq(foodLogs.userId, req.userId!)));
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Failed to delete food log" }); }
});

// ── Workout logs ──────────────────────────────────────────────────────────────
app.get("/api/workout-logs", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.json(await db.select().from(workoutLogs).where(eq(workoutLogs.userId, req.userId!)).orderBy(workoutLogs.createdAt));
  } catch { res.status(500).json({ error: "Failed to fetch workout logs" }); }
});

app.post("/api/workout-logs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date, exercise, sets, reps, weight, unit, notes } = req.body;
    const [row] = await db.insert(workoutLogs).values({
      userId: req.userId!, date: date ?? new Date().toISOString().split("T")[0],
      exercise, sets: Number(sets), reps: Number(reps), weight: String(weight ?? 0),
      unit: unit ?? "kg", notes: notes ?? "",
    }).returning();
    res.status(201).json(row);
  } catch { res.status(500).json({ error: "Failed to add workout log" }); }
});

app.delete("/api/workout-logs/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db.delete(workoutLogs).where(and(eq(workoutLogs.id, Number(req.params.id)), eq(workoutLogs.userId, req.userId!)));
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Failed to delete workout log" }); }
});

// ── Steps ─────────────────────────────────────────────────────────────────────
app.get("/api/steps", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.json(await db.select().from(stepEntries).where(eq(stepEntries.userId, req.userId!)).orderBy(stepEntries.date));
  } catch { res.status(500).json({ error: "Failed to fetch steps" }); }
});

app.post("/api/steps", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date, steps } = req.body;
    const d = date ?? new Date().toISOString().split("T")[0];
    const existing = await db.select().from(stepEntries).where(and(eq(stepEntries.userId, req.userId!), eq(stepEntries.date, d))).limit(1);
    if (existing.length > 0) {
      const [row] = await db.update(stepEntries).set({ steps: Number(steps) })
        .where(and(eq(stepEntries.userId, req.userId!), eq(stepEntries.date, d))).returning();
      res.json(row);
    } else {
      const [row] = await db.insert(stepEntries).values({ userId: req.userId!, date: d, steps: Number(steps) }).returning();
      res.status(201).json(row);
    }
  } catch { res.status(500).json({ error: "Failed to save steps" }); }
});

// ── Measurements ──────────────────────────────────────────────────────────────
app.get("/api/measurements", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.json(await db.select().from(measurements).where(eq(measurements.userId, req.userId!)).orderBy(measurements.date));
  } catch { res.status(500).json({ error: "Failed to fetch measurements" }); }
});

app.post("/api/measurements", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date, chest, waist, hips, leftArm, rightArm, leftThigh, rightThigh, shoulders, neck, notes } = req.body;
    const [row] = await db.insert(measurements).values({
      userId: req.userId!, date: date ?? new Date().toISOString().split("T")[0],
      chest: String(chest ?? 0), waist: String(waist ?? 0), hips: String(hips ?? 0),
      leftArm: String(leftArm ?? 0), rightArm: String(rightArm ?? 0),
      leftThigh: String(leftThigh ?? 0), rightThigh: String(rightThigh ?? 0),
      shoulders: String(shoulders ?? 0), neck: String(neck ?? 0), notes: notes ?? "",
    }).returning();
    res.status(201).json(row);
  } catch { res.status(500).json({ error: "Failed to add measurement" }); }
});

app.delete("/api/measurements/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db.delete(measurements).where(and(eq(measurements.id, Number(req.params.id)), eq(measurements.userId, req.userId!)));
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Failed to delete measurement" }); }
});

// ── Daily logs ────────────────────────────────────────────────────────────────
app.get("/api/daily-logs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const d = (req.query.date as string) ?? new Date().toISOString().split("T")[0];
    const [row] = await db.select().from(dailyLogs).where(and(eq(dailyLogs.userId, req.userId!), eq(dailyLogs.date, d))).limit(1);
    res.json(row ?? { water: 0, sleep: 0, date: d });
  } catch { res.status(500).json({ error: "Failed to fetch daily log" }); }
});

app.post("/api/daily-logs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date, water, sleep } = req.body;
    const d = date ?? new Date().toISOString().split("T")[0];
    const existing = await db.select().from(dailyLogs).where(and(eq(dailyLogs.userId, req.userId!), eq(dailyLogs.date, d))).limit(1);
    if (existing.length > 0) {
      const [row] = await db.update(dailyLogs).set({
        ...(water !== undefined && { water: String(water) }),
        ...(sleep !== undefined && { sleep: String(sleep) }),
      }).where(and(eq(dailyLogs.userId, req.userId!), eq(dailyLogs.date, d))).returning();
      res.json(row);
    } else {
      const [row] = await db.insert(dailyLogs).values({ userId: req.userId!, date: d, water: String(water ?? 0), sleep: String(sleep ?? 0) }).returning();
      res.status(201).json(row);
    }
  } catch { res.status(500).json({ error: "Failed to update daily log" }); }
});

// ── Global JSON error handler (must be last) ──────────────────────────────────
// Without this, Express returns HTML on errors → frontend can't parse → "Request failed"
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[API Error]", err?.message ?? err);
  const status = typeof err?.status === "number" ? err.status : 500;
  res.status(status).json({ error: err?.message ?? "Internal server error" });
});

export default app;
