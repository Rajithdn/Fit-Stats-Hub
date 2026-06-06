import { ref, get, set, push, remove } from "firebase/database";
import { db } from "./firebase";
import type {
  FoodEntry,
  WorkoutLogEntry,
  StepEntry,
  MeasurementEntry,
} from "@/store/useStore";

// ── helpers ───────────────────────────────────────────────────────────────────
function n(v: unknown): number {
  const x = typeof v === "string" ? parseFloat(v) : Number(v);
  return isNaN(x) ? 0 : x;
}

function r(path: string) {
  return ref(db, path);
}

// ── Profile ───────────────────────────────────────────────────────────────────
export async function getProfile(uid: string) {
  const snap = await get(r(`users/${uid}/profile`));
  return snap.exists() ? (snap.val() as Record<string, unknown>) : null;
}

export async function saveProfile(uid: string, data: Record<string, unknown>) {
  const snap = await get(r(`users/${uid}/profile`));
  const existing = snap.exists() ? snap.val() : {};
  await set(r(`users/${uid}/profile`), { ...existing, ...data });
}

// ── Food logs ─────────────────────────────────────────────────────────────────
export async function getFoodLogs(uid: string, date: string): Promise<FoodEntry[]> {
  const snap = await get(r(`users/${uid}/foodLogs`));
  if (!snap.exists()) return [];
  const all = snap.val() as Record<string, Record<string, unknown>>;
  return Object.entries(all)
    .filter(([, v]) => v.date === date)
    .map(([id, v]) => ({
      id,
      name: v.name as string,
      calories: n(v.calories),
      protein: n(v.protein),
      carbs: n(v.carbs),
      fat: n(v.fat),
      fiber: n(v.fiber),
    }))
    .sort((a, b) => {
      const ta = (all[a.id]?.createdAt as number) ?? 0;
      const tb = (all[b.id]?.createdAt as number) ?? 0;
      return ta - tb;
    });
}

export async function addFoodLog(
  uid: string,
  food: Omit<FoodEntry, "id"> & { date: string },
): Promise<FoodEntry> {
  const newRef = push(r(`users/${uid}/foodLogs`));
  await set(newRef, { ...food, createdAt: Date.now() });
  return { id: newRef.key!, ...food };
}

export async function deleteFoodLog(uid: string, id: string) {
  await remove(r(`users/${uid}/foodLogs/${id}`));
}

// ── Workout logs ──────────────────────────────────────────────────────────────
export async function getWorkoutLogs(uid: string): Promise<WorkoutLogEntry[]> {
  const snap = await get(r(`users/${uid}/workoutLogs`));
  if (!snap.exists()) return [];
  const all = snap.val() as Record<string, Record<string, unknown>>;
  return Object.entries(all)
    .map(([id, v]) => ({
      id,
      date: v.date as string,
      exercise: v.exercise as string,
      sets: n(v.sets),
      reps: n(v.reps),
      weight: n(v.weight),
      unit: (v.unit as "kg" | "lbs") ?? "kg",
      notes: (v.notes as string) ?? "",
      _ts: (v.createdAt as number) ?? 0,
    }))
    .sort((a, b) => b._ts - a._ts)
    .map(({ _ts: _, ...entry }) => entry);
}

export async function addWorkoutLog(
  uid: string,
  entry: Omit<WorkoutLogEntry, "id">,
): Promise<WorkoutLogEntry> {
  const newRef = push(r(`users/${uid}/workoutLogs`));
  await set(newRef, { ...entry, createdAt: Date.now() });
  return { id: newRef.key!, ...entry };
}

export async function deleteWorkoutLog(uid: string, id: string) {
  await remove(r(`users/${uid}/workoutLogs/${id}`));
}

// ── Step entries ──────────────────────────────────────────────────────────────
export async function getStepEntries(uid: string): Promise<StepEntry[]> {
  const snap = await get(r(`users/${uid}/stepEntries`));
  if (!snap.exists()) return [];
  const all = snap.val() as Record<string, Record<string, unknown>>;
  return Object.entries(all)
    .map(([date, v]) => ({ id: date, date, steps: n(v.steps) }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function upsertStepEntry(uid: string, date: string, steps: number) {
  await set(r(`users/${uid}/stepEntries/${date}`), { date, steps });
}

// ── Measurements ──────────────────────────────────────────────────────────────
export async function getMeasurements(uid: string): Promise<MeasurementEntry[]> {
  const snap = await get(r(`users/${uid}/measurements`));
  if (!snap.exists()) return [];
  const all = snap.val() as Record<string, Record<string, unknown>>;
  return Object.entries(all)
    .map(([id, v]) => ({
      id,
      date: v.date as string,
      chest: n(v.chest), waist: n(v.waist), hips: n(v.hips),
      leftArm: n(v.leftArm), rightArm: n(v.rightArm),
      leftThigh: n(v.leftThigh), rightThigh: n(v.rightThigh),
      shoulders: n(v.shoulders), neck: n(v.neck),
      notes: (v.notes as string) ?? "",
      _ts: (v.createdAt as number) ?? 0,
    }))
    .sort((a, b) => b._ts - a._ts)
    .map(({ _ts: _, ...entry }) => entry);
}

export async function addMeasurementDoc(
  uid: string,
  entry: Omit<MeasurementEntry, "id">,
): Promise<MeasurementEntry> {
  const newRef = push(r(`users/${uid}/measurements`));
  await set(newRef, { ...entry, createdAt: Date.now() });
  return { id: newRef.key!, ...entry };
}

export async function deleteMeasurementDoc(uid: string, id: string) {
  await remove(r(`users/${uid}/measurements/${id}`));
}

// ── Daily logs (water / sleep) ────────────────────────────────────────────────
export async function getDailyLog(
  uid: string,
  date: string,
): Promise<{ water: number; sleep: number }> {
  const snap = await get(r(`users/${uid}/dailyLogs/${date}`));
  if (!snap.exists()) return { water: 0, sleep: 0 };
  const v = snap.val();
  return { water: n(v.water), sleep: n(v.sleep) };
}

export async function upsertDailyLog(
  uid: string,
  date: string,
  patch: { water?: number; sleep?: number },
) {
  const snap = await get(r(`users/${uid}/dailyLogs/${date}`));
  const existing = snap.exists() ? snap.val() : { water: 0, sleep: 0 };
  await set(r(`users/${uid}/dailyLogs/${date}`), { ...existing, date, ...patch });
}

// ── Load all user data at once ────────────────────────────────────────────────
export async function fetchAllUserData(uid: string, todayDate: string) {
  const [profile, foodLogs, workoutLogs, stepEntries, measurements, dailyLog] =
    await Promise.all([
      getProfile(uid),
      getFoodLogs(uid, todayDate),
      getWorkoutLogs(uid),
      getStepEntries(uid),
      getMeasurements(uid),
      getDailyLog(uid, todayDate),
    ]);
  return { profile, foodLogs, workoutLogs, stepEntries, measurements, dailyLog };
}

export type { MeasurementEntry };
