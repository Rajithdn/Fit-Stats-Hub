import { create } from "zustand";
import {
  saveProfile,
  addFoodLog,
  deleteFoodLog,
  addWorkoutLog as addWorkoutLogFs,
  deleteWorkoutLog,
  upsertStepEntry,
  addMeasurementDoc,
  deleteMeasurementDoc,
  upsertDailyLog,
  fetchAllUserData,
} from "@/lib/firestore";

// ── Types ─────────────────────────────────────────────────────────────────────
export type UserProfile = {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel:
    | "Sedentary"
    | "Lightly Active"
    | "Moderately Active"
    | "Very Active"
    | "Super Active";
  goal: "Weight Loss" | "Weight Gain" | "Lean Bulk" | "Maintenance";
  dailyCalorieGoal: number;
};

export type FoodEntry = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type WorkoutLogEntry = {
  id: string;
  date: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  unit: "kg" | "lbs";
  notes: string;
};

export type StepEntry = {
  id?: string;
  date: string;
  steps: number;
};

export type MeasurementEntry = {
  id: string;
  date: string;
  chest: number;
  waist: number;
  hips: number;
  leftArm: number;
  rightArm: number;
  leftThigh: number;
  rightThigh: number;
  shoulders: number;
  neck: number;
  notes: string;
};

export type DailyLog = {
  foods: FoodEntry[];
  workouts: unknown[];
  water: number;
  sleep: number;
};

type StoreState = {
  uid: string | null;
  username: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  profilePhoto: string;
  userProfile: UserProfile;
  dailyLog: DailyLog;
  workoutLogs: WorkoutLogEntry[];
  stepEntries: StepEntry[];
  stepGoal: number;
  measurements: MeasurementEntry[];
  theme: "dark" | "light";
  activeSection: string;

  login: (uid: string, username: string) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
  loadUserData: (data: {
    profile: Record<string, unknown> | null;
    foodLogs: FoodEntry[];
    workoutLogs: WorkoutLogEntry[];
    stepEntries: StepEntry[];
    measurements: MeasurementEntry[];
    dailyLog: { water: number | string; sleep: number | string };
  }) => void;

  updateProfile: (
    profile: Partial<
      UserProfile & { profilePhoto?: string; stepGoal?: number; theme?: string }
    >,
  ) => void;
  setProfilePhoto: (photo: string) => void;
  updateDailyLog: (log: Partial<DailyLog>) => void;
  addFoodToLog: (food: Omit<FoodEntry, "id">) => void;
  removeFoodFromLog: (id: string) => void;
  addWorkoutLog: (entry: Omit<WorkoutLogEntry, "id">) => void;
  removeWorkoutLog: (id: string) => void;
  updateStepEntry: (date: string, steps: number) => void;
  setStepGoal: (goal: number) => void;
  addMeasurement: (entry: Omit<MeasurementEntry, "id">) => void;
  removeMeasurement: (id: string) => void;
  setTheme: (theme: "dark" | "light") => void;
  setActiveSection: (section: string) => void;
  completeOnboarding: (profile: UserProfile) => void;
};

// ── helpers ───────────────────────────────────────────────────────────────────
function n(v: unknown): number {
  const x = typeof v === "string" ? parseFloat(v) : Number(v);
  return isNaN(x) ? 0 : x;
}

export function today(): string {
  return new Date().toISOString().split("T")[0];
}

function mapProfile(p: Record<string, unknown>) {
  return {
    profile: {
      name: (p.name as string) ?? "",
      age: n(p.age),
      gender: ((p.gender as string) ?? "male") as UserProfile["gender"],
      height: n(p.height),
      weight: n(p.weight),
      targetWeight: n(p.targetWeight),
      activityLevel: ((p.activityLevel as string) ??
        "Moderately Active") as UserProfile["activityLevel"],
      goal: ((p.goal as string) ?? "Weight Loss") as UserProfile["goal"],
      dailyCalorieGoal: n(p.dailyCalorieGoal) || 2000,
    },
    photo: (p.profilePhoto as string) ?? "",
    stepGoal: n(p.stepGoal) || 10000,
    theme: ((p.theme as string) ?? "dark") as "dark" | "light",
    username: (p.username as string) ?? "",
  };
}

// ── defaults ──────────────────────────────────────────────────────────────────
const BLANK_PROFILE: UserProfile = {
  name: "",
  age: 25,
  gender: "male",
  height: 170,
  weight: 70,
  targetWeight: 65,
  activityLevel: "Moderately Active",
  goal: "Weight Loss",
  dailyCalorieGoal: 2000,
};

const RESET = {
  uid: null as string | null,
  username: "",
  isAuthenticated: false,
  isLoading: false,
  profilePhoto: "",
  userProfile: BLANK_PROFILE,
  dailyLog: {
    foods: [] as FoodEntry[],
    workouts: [] as unknown[],
    water: 0,
    sleep: 0,
  },
  workoutLogs: [] as WorkoutLogEntry[],
  stepEntries: [] as StepEntry[],
  stepGoal: 10000,
  measurements: [] as MeasurementEntry[],
  theme: "dark" as "dark" | "light",
  activeSection: "Dashboard",
};

// ── Store ─────────────────────────────────────────────────────────────────────
export const useStore = create<StoreState>()((set, get) => ({
  ...RESET,
  isLoading: true,

  login: (uid, username) => set({ uid, username, isAuthenticated: true }),

  logout: () => set({ ...RESET, isLoading: false }),

  setLoading: (v) => set({ isLoading: v }),

  loadUserData: ({
    profile,
    foodLogs,
    workoutLogs,
    stepEntries,
    measurements,
    dailyLog,
  }) => {
    if (profile) {
      const { profile: up, photo, stepGoal, theme, username } =
        mapProfile(profile);
      set({ userProfile: up, profilePhoto: photo, stepGoal, theme, username });
    }
    set({
      isAuthenticated: true,
      dailyLog: {
        foods: foodLogs,
        workouts: [],
        water: n(dailyLog.water),
        sleep: n(dailyLog.sleep),
      },
      workoutLogs,
      stepEntries,
      measurements,
    });
  },

  updateProfile: (patch) => {
    set((s) => ({ userProfile: { ...s.userProfile, ...patch } }));
    if (patch.profilePhoto !== undefined) set({ profilePhoto: patch.profilePhoto });
    if (patch.theme !== undefined) set({ theme: patch.theme as "dark" | "light" });
    if (patch.stepGoal !== undefined) set({ stepGoal: Number(patch.stepGoal) });
    const uid = get().uid;
    if (uid) saveProfile(uid, patch).catch(console.error);
  },

  setProfilePhoto: (photo) => {
    set({ profilePhoto: photo });
    const uid = get().uid;
    if (uid) saveProfile(uid, { profilePhoto: photo }).catch(console.error);
  },

  updateDailyLog: (log) => {
    set((s) => ({ dailyLog: { ...s.dailyLog, ...log } }));
    const uid = get().uid;
    if (!uid) return;
    const patch: { water?: number; sleep?: number } = {};
    if (log.water !== undefined) patch.water = log.water;
    if (log.sleep !== undefined) patch.sleep = log.sleep;
    if (Object.keys(patch).length > 0) {
      upsertDailyLog(uid, today(), patch).catch(console.error);
    }
  },

  addFoodToLog: (food) => {
    const tempId = `tmp-${Date.now()}`;
    set((s) => ({
      dailyLog: {
        ...s.dailyLog,
        foods: [...s.dailyLog.foods, { ...food, id: tempId }],
      },
    }));
    const uid = get().uid;
    if (!uid) return;
    addFoodLog(uid, { ...food, date: today() })
      .then((row) => {
        set((s) => ({
          dailyLog: {
            ...s.dailyLog,
            foods: s.dailyLog.foods.map((f) => (f.id === tempId ? row : f)),
          },
        }));
      })
      .catch(console.error);
  },

  removeFoodFromLog: (id) => {
    set((s) => ({
      dailyLog: {
        ...s.dailyLog,
        foods: s.dailyLog.foods.filter((f) => f.id !== id),
      },
    }));
    const uid = get().uid;
    if (uid && !id.startsWith("tmp-")) {
      deleteFoodLog(uid, id).catch(console.error);
    }
  },

  addWorkoutLog: (entry) => {
    const tempId = `tmp-${Date.now()}`;
    set((s) => ({ workoutLogs: [{ ...entry, id: tempId }, ...s.workoutLogs] }));
    const uid = get().uid;
    if (!uid) return;
    addWorkoutLogFs(uid, entry)
      .then((row) => {
        set((s) => ({
          workoutLogs: s.workoutLogs.map((w) => (w.id === tempId ? row : w)),
        }));
      })
      .catch(console.error);
  },

  removeWorkoutLog: (id) => {
    set((s) => ({
      workoutLogs: s.workoutLogs.filter((e) => e.id !== id),
    }));
    const uid = get().uid;
    if (uid && !id.startsWith("tmp-")) {
      deleteWorkoutLog(uid, id).catch(console.error);
    }
  },

  updateStepEntry: (date, steps) => {
    set((s) => {
      const idx = s.stepEntries.findIndex((e) => e.date === date);
      if (idx >= 0) {
        const updated = [...s.stepEntries];
        updated[idx] = { ...updated[idx], steps };
        return { stepEntries: updated };
      }
      return { stepEntries: [{ date, steps }, ...s.stepEntries] };
    });
    const uid = get().uid;
    if (uid) upsertStepEntry(uid, date, steps).catch(console.error);
  },

  setStepGoal: (goal) => {
    set({ stepGoal: goal });
    const uid = get().uid;
    if (uid) saveProfile(uid, { stepGoal: goal }).catch(console.error);
  },

  addMeasurement: (entry) => {
    const tempId = `tmp-${Date.now()}`;
    set((s) => ({
      measurements: [{ ...entry, id: tempId }, ...s.measurements],
    }));
    const uid = get().uid;
    if (!uid) return;
    addMeasurementDoc(uid, entry)
      .then((row) => {
        set((s) => ({
          measurements: s.measurements.map((m) =>
            m.id === tempId ? row : m,
          ),
        }));
      })
      .catch(console.error);
  },

  removeMeasurement: (id) => {
    set((s) => ({
      measurements: s.measurements.filter((m) => m.id !== id),
    }));
    const uid = get().uid;
    if (uid && !id.startsWith("tmp-")) {
      deleteMeasurementDoc(uid, id).catch(console.error);
    }
  },

  setTheme: (theme) => {
    set({ theme });
    const uid = get().uid;
    if (uid) saveProfile(uid, { theme }).catch(console.error);
  },

  setActiveSection: (section) => set({ activeSection: section }),

  completeOnboarding: (profile) => {
    set({ userProfile: profile });
    const uid = get().uid;
    if (uid) saveProfile(uid, profile).catch(console.error);
  },
}));

// ── fetchAndLoadUserData (called from App.tsx after auth) ─────────────────────
export async function fetchAndLoadUserData(uid: string) {
  const t = today();
  return fetchAllUserData(uid, t);
}
