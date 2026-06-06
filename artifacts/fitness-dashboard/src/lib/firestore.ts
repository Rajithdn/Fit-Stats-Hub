import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { FoodEntry, WorkoutLogEntry, StepEntry, MeasurementEntry, UserProfile } from "@/store/useStore";

// ── helpers ───────────────────────────────────────────────────────────────────
function n(v: unknown): number {
  const x = typeof v === "string" ? parseFloat(v) : Number(v);
  return isNaN(x) ? 0 : x;
}

function userRef(uid: string) {
  return doc(db, "users", uid);
}

// ── Profile ───────────────────────────────────────────────────────────────────
export async function getProfile(uid: string) {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? (snap.data() as Record<string, unknown>) : null;
}

export async function saveProfile(uid: string, data: Record<string, unknown>) {
  await setDoc(userRef(uid), data, { merge: true });
}

// ── Food logs ─────────────────────────────────────────────────────────────────
export async function getFoodLogs(uid: string, date: string): Promise<FoodEntry[]> {
  const q = query(
    collection(db, "users", uid, "foodLogs"),
    where("date", "==", date),
    orderBy("createdAt", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const r = d.data();
    return {
      id: d.id,
      name: r.name as string,
      calories: n(r.calories),
      protein: n(r.protein),
      carbs: n(r.carbs),
      fat: n(r.fat),
      fiber: n(r.fiber),
    };
  });
}

export async function addFoodLog(
  uid: string,
  food: Omit<FoodEntry, "id"> & { date: string },
): Promise<FoodEntry> {
  const ref = await addDoc(collection(db, "users", uid, "foodLogs"), {
    ...food,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...food };
}

export async function deleteFoodLog(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "foodLogs", id));
}

// ── Workout logs ──────────────────────────────────────────────────────────────
export async function getWorkoutLogs(uid: string): Promise<WorkoutLogEntry[]> {
  const q = query(
    collection(db, "users", uid, "workoutLogs"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const r = d.data();
    return {
      id: d.id,
      date: r.date as string,
      exercise: r.exercise as string,
      sets: n(r.sets),
      reps: n(r.reps),
      weight: n(r.weight),
      unit: (r.unit as "kg" | "lbs") ?? "kg",
      notes: (r.notes as string) ?? "",
    };
  });
}

export async function addWorkoutLog(
  uid: string,
  entry: Omit<WorkoutLogEntry, "id">,
): Promise<WorkoutLogEntry> {
  const ref = await addDoc(collection(db, "users", uid, "workoutLogs"), {
    ...entry,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...entry };
}

export async function deleteWorkoutLog(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "workoutLogs", id));
}

// ── Step entries ──────────────────────────────────────────────────────────────
export async function getStepEntries(uid: string): Promise<StepEntry[]> {
  const q = query(
    collection(db, "users", uid, "stepEntries"),
    orderBy("date", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const r = d.data();
    return { id: d.id, date: r.date as string, steps: n(r.steps) };
  });
}

export async function upsertStepEntry(uid: string, date: string, steps: number) {
  await setDoc(doc(db, "users", uid, "stepEntries", date), { date, steps }, { merge: true });
}

// ── Measurements ──────────────────────────────────────────────────────────────
export async function getMeasurements(uid: string): Promise<MeasurementEntry[]> {
  const q = query(
    collection(db, "users", uid, "measurements"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const r = d.data();
    return {
      id: d.id,
      date: r.date as string,
      chest: n(r.chest), waist: n(r.waist), hips: n(r.hips),
      leftArm: n(r.leftArm), rightArm: n(r.rightArm),
      leftThigh: n(r.leftThigh), rightThigh: n(r.rightThigh),
      shoulders: n(r.shoulders), neck: n(r.neck),
      notes: (r.notes as string) ?? "",
    };
  });
}

export async function addMeasurementDoc(
  uid: string,
  entry: Omit<MeasurementEntry, "id">,
): Promise<MeasurementEntry> {
  const ref = await addDoc(collection(db, "users", uid, "measurements"), {
    ...entry,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...entry };
}

export async function deleteMeasurementDoc(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "measurements", id));
}

// ── Daily logs (water / sleep) ────────────────────────────────────────────────
export async function getDailyLog(uid: string, date: string): Promise<{ water: number; sleep: number }> {
  const snap = await getDoc(doc(db, "users", uid, "dailyLogs", date));
  if (!snap.exists()) return { water: 0, sleep: 0 };
  const r = snap.data();
  return { water: n(r.water), sleep: n(r.sleep) };
}

export async function upsertDailyLog(uid: string, date: string, patch: { water?: number; sleep?: number }) {
  await setDoc(doc(db, "users", uid, "dailyLogs", date), { date, ...patch }, { merge: true });
}

// ── Load all user data at once ────────────────────────────────────────────────
export async function fetchAllUserData(uid: string, todayDate: string) {
  const [profile, foodLogs, workoutLogs, stepEntries, measurements, dailyLog] = await Promise.all([
    getProfile(uid),
    getFoodLogs(uid, todayDate),
    getWorkoutLogs(uid),
    getStepEntries(uid),
    getMeasurements(uid),
    getDailyLog(uid, todayDate),
  ]);
  return { profile, foodLogs, workoutLogs, stepEntries, measurements, dailyLog };
}

export { type UserProfile };
