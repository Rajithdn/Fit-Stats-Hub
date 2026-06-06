import {
  doc, getDoc, setDoc,
  collection, addDoc, getDocs, deleteDoc,
  query, where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, FoodEntry, WorkoutLogEntry, StepEntry, MeasurementEntry } from '@/store/useStore';

// ── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(uid: string): Promise<(UserProfile & Record<string, unknown>) | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile & Record<string, unknown>) : null;
}

export async function setProfile(uid: string, data: Record<string, unknown>): Promise<void> {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}

// ── Food Logs ─────────────────────────────────────────────────────────────────

export async function getTodayFoodLogs(uid: string, date: string): Promise<FoodEntry[]> {
  const q = query(collection(db, 'users', uid, 'foodLogs'), where('date', '==', date));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FoodEntry, 'id'>) }));
}

export async function addFoodLog(
  uid: string,
  food: Omit<FoodEntry, 'id'> & { date: string },
): Promise<string> {
  const ref = await addDoc(collection(db, 'users', uid, 'foodLogs'), food);
  return ref.id;
}

export async function deleteFoodLog(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'foodLogs', id));
}

// ── Workout Logs ──────────────────────────────────────────────────────────────

export async function getWorkoutLogs(uid: string): Promise<WorkoutLogEntry[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'workoutLogs'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WorkoutLogEntry, 'id'>) }));
}

export async function addWorkoutLog(
  uid: string,
  entry: Omit<WorkoutLogEntry, 'id'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'users', uid, 'workoutLogs'), entry);
  return ref.id;
}

export async function deleteWorkoutLog(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'workoutLogs', id));
}

// ── Steps ─────────────────────────────────────────────────────────────────────

export async function getStepEntries(uid: string): Promise<StepEntry[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'steps'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StepEntry, 'id'>) }));
}

export async function setStepEntry(uid: string, date: string, steps: number): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'steps', date), { date, steps }, { merge: true });
}

// ── Measurements ──────────────────────────────────────────────────────────────

export async function getMeasurements(uid: string): Promise<MeasurementEntry[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'measurements'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MeasurementEntry, 'id'>) }));
}

export async function addMeasurement(
  uid: string,
  entry: Omit<MeasurementEntry, 'id'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'users', uid, 'measurements'), entry);
  return ref.id;
}

export async function deleteMeasurement(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'measurements', id));
}

// ── Daily Logs ────────────────────────────────────────────────────────────────

export async function getDailyLog(uid: string, date: string): Promise<{ water: number; sleep: number }> {
  const snap = await getDoc(doc(db, 'users', uid, 'dailyLogs', date));
  return snap.exists()
    ? (snap.data() as { water: number; sleep: number })
    : { water: 0, sleep: 0 };
}

export async function setDailyLog(
  uid: string,
  date: string,
  data: Partial<{ water: number; sleep: number }>,
): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'dailyLogs', date), data, { merge: true });
}
