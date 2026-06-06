import { create } from 'zustand';
import { today } from '@/lib/api';
import {
  setProfile,
  getTodayFoodLogs,
  addFoodLog,
  deleteFoodLog,
  getWorkoutLogs,
  addWorkoutLog as fbAddWorkoutLog,
  deleteWorkoutLog,
  getStepEntries,
  setStepEntry,
  getMeasurements,
  addMeasurement as fbAddMeasurement,
  deleteMeasurement,
  getDailyLog,
  setDailyLog,
} from '@/lib/firebaseDb';

export type UserProfile = {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Super Active';
  goal: 'Weight Loss' | 'Weight Gain' | 'Lean Bulk' | 'Maintenance';
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
  unit: 'kg' | 'lbs';
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
  email: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  profilePhoto: string;
  userProfile: UserProfile;
  dailyLog: DailyLog;
  workoutLogs: WorkoutLogEntry[];
  stepEntries: StepEntry[];
  stepGoal: number;
  measurements: MeasurementEntry[];
  theme: 'dark' | 'light';
  activeSection: string;

  login: (uid: string, email: string) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
  loadUserData: (data: {
    profile: Record<string, unknown> | null;
    foodLogs: FoodEntry[];
    workoutLogs: WorkoutLogEntry[];
    stepEntries: StepEntry[];
    measurements: MeasurementEntry[];
    dailyLog: { water: number; sleep: number };
  }) => void;

  updateProfile: (profile: Partial<UserProfile>) => void;
  setProfilePhoto: (photo: string) => void;
  updateDailyLog: (log: Partial<DailyLog>) => void;
  addFoodToLog: (food: FoodEntry) => void;
  removeFoodFromLog: (id: string) => void;
  addWorkoutLog: (entry: WorkoutLogEntry) => void;
  removeWorkoutLog: (id: string) => void;
  updateStepEntry: (date: string, steps: number) => void;
  setStepGoal: (goal: number) => void;
  addMeasurement: (entry: MeasurementEntry) => void;
  removeMeasurement: (id: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setActiveSection: (section: string) => void;
  completeOnboarding: (profile: UserProfile) => void;
};

const BLANK_PROFILE: UserProfile = {
  name: '',
  age: 25,
  gender: 'male',
  height: 170,
  weight: 70,
  targetWeight: 65,
  activityLevel: 'Moderately Active',
  goal: 'Weight Loss',
  dailyCalorieGoal: 2000,
};

function parseNum(v: unknown): number {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return isNaN(n) ? 0 : n;
}

function mapProfile(p: Record<string, unknown>): {
  profile: UserProfile;
  photo: string;
  stepGoal: number;
  theme: 'dark' | 'light';
} {
  return {
    profile: {
      name: (p.name as string) ?? '',
      age: parseNum(p.age),
      gender: ((p.gender as string) ?? 'male') as UserProfile['gender'],
      height: parseNum(p.height),
      weight: parseNum(p.weight),
      targetWeight: parseNum(p.targetWeight),
      activityLevel: ((p.activityLevel as string) ?? 'Moderately Active') as UserProfile['activityLevel'],
      goal: ((p.goal as string) ?? 'Weight Loss') as UserProfile['goal'],
      dailyCalorieGoal: parseNum(p.dailyCalorieGoal),
    },
    photo: (p.profilePhoto as string) ?? '',
    stepGoal: parseNum(p.stepGoal) || 10000,
    theme: ((p.theme as string) ?? 'dark') as 'dark' | 'light',
  };
}

const RESET = {
  uid: null as string | null,
  email: '',
  isAuthenticated: false,
  isLoading: false,
  profilePhoto: '',
  userProfile: BLANK_PROFILE,
  dailyLog: { foods: [] as FoodEntry[], workouts: [] as unknown[], water: 0, sleep: 0 },
  workoutLogs: [] as WorkoutLogEntry[],
  stepEntries: [] as StepEntry[],
  stepGoal: 10000,
  measurements: [] as MeasurementEntry[],
  theme: 'dark' as 'dark' | 'light',
  activeSection: 'Dashboard',
};

export const useStore = create<StoreState>()((set, get) => ({
  ...RESET,
  isLoading: true,

  login: (uid, email) => set({ uid, email, isAuthenticated: true }),

  logout: () => set({ ...RESET }),

  setLoading: (v) => set({ isLoading: v }),

  loadUserData: ({ profile, foodLogs, workoutLogs, stepEntries, measurements, dailyLog }) => {
    if (profile) {
      const { profile: up, photo, stepGoal, theme } = mapProfile(profile);
      set({ userProfile: up, profilePhoto: photo, stepGoal, theme });
    }
    set({
      dailyLog: {
        foods: foodLogs,
        workouts: [],
        water: parseNum(dailyLog.water),
        sleep: parseNum(dailyLog.sleep),
      },
      workoutLogs,
      stepEntries,
      measurements,
    });
  },

  updateProfile: (profile) => {
    set((s) => ({ userProfile: { ...s.userProfile, ...profile } }));
    const { uid } = get();
    if (uid) setProfile(uid, profile as Record<string, unknown>).catch(console.error);
  },

  setProfilePhoto: (photo) => {
    set({ profilePhoto: photo });
    const { uid } = get();
    if (uid) setProfile(uid, { profilePhoto: photo }).catch(console.error);
  },

  updateDailyLog: (log) => {
    set((s) => ({ dailyLog: { ...s.dailyLog, ...log } }));
    const { uid } = get();
    if (!uid) return;
    const patch: Partial<{ water: number; sleep: number }> = {};
    if (log.water !== undefined) patch.water = log.water;
    if (log.sleep !== undefined) patch.sleep = log.sleep;
    if (Object.keys(patch).length > 0) setDailyLog(uid, today(), patch).catch(console.error);
  },

  addFoodToLog: (food) => {
    const tempId = `tmp-${Date.now()}`;
    set((s) => ({ dailyLog: { ...s.dailyLog, foods: [...s.dailyLog.foods, { ...food, id: tempId }] } }));
    const { uid } = get();
    if (!uid) return;
    addFoodLog(uid, { ...food, date: today() }).then((id) => {
      set((s) => ({
        dailyLog: { ...s.dailyLog, foods: s.dailyLog.foods.map((f) => (f.id === tempId ? { ...f, id } : f)) },
      }));
    }).catch(console.error);
  },

  removeFoodFromLog: (id) => {
    set((s) => ({ dailyLog: { ...s.dailyLog, foods: s.dailyLog.foods.filter((f) => f.id !== id) } }));
    const { uid } = get();
    if (uid && !id.startsWith('tmp-')) deleteFoodLog(uid, id).catch(console.error);
  },

  addWorkoutLog: (entry) => {
    const tempId = `tmp-${Date.now()}`;
    set((s) => ({ workoutLogs: [{ ...entry, id: tempId }, ...s.workoutLogs] }));
    const { uid } = get();
    if (!uid) return;
    const { id: _id, ...rest } = entry;
    fbAddWorkoutLog(uid, rest).then((id) => {
      set((s) => ({ workoutLogs: s.workoutLogs.map((w) => (w.id === tempId ? { ...w, id } : w)) }));
    }).catch(console.error);
  },

  removeWorkoutLog: (id) => {
    set((s) => ({ workoutLogs: s.workoutLogs.filter((e) => e.id !== id) }));
    const { uid } = get();
    if (uid && !id.startsWith('tmp-')) deleteWorkoutLog(uid, id).catch(console.error);
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
    const { uid } = get();
    if (uid) setStepEntry(uid, date, steps).catch(console.error);
  },

  setStepGoal: (goal) => {
    set({ stepGoal: goal });
    const { uid } = get();
    if (uid) setProfile(uid, { stepGoal: goal }).catch(console.error);
  },

  addMeasurement: (entry) => {
    const tempId = `tmp-${Date.now()}`;
    set((s) => ({ measurements: [{ ...entry, id: tempId }, ...s.measurements] }));
    const { uid } = get();
    if (!uid) return;
    const { id: _id, ...rest } = entry;
    fbAddMeasurement(uid, rest).then((id) => {
      set((s) => ({ measurements: s.measurements.map((m) => (m.id === tempId ? { ...m, id } : m)) }));
    }).catch(console.error);
  },

  removeMeasurement: (id) => {
    set((s) => ({ measurements: s.measurements.filter((m) => m.id !== id) }));
    const { uid } = get();
    if (uid && !id.startsWith('tmp-')) deleteMeasurement(uid, id).catch(console.error);
  },

  setTheme: (theme) => {
    set({ theme });
    const { uid } = get();
    if (uid) setProfile(uid, { theme }).catch(console.error);
  },

  setActiveSection: (section) => set({ activeSection: section }),

  completeOnboarding: (profile) => {
    set({ userProfile: profile });
    const { uid } = get();
    if (uid) setProfile(uid, profile as unknown as Record<string, unknown>).catch(console.error);
  },
}));

// Helper: load all user data from Firestore after sign-in
export async function fetchAndLoadUserData(uid: string) {
  const t = today();
  const [profile, foodLogs, workoutLogs, stepEntries, measurements, dailyLog] = await Promise.all([
    import('@/lib/firebaseDb').then((m) => m.getProfile(uid)),
    getTodayFoodLogs(uid, t),
    getWorkoutLogs(uid),
    getStepEntries(uid),
    getMeasurements(uid),
    getDailyLog(uid, t),
  ]);
  return { profile, foodLogs, workoutLogs, stepEntries, measurements, dailyLog };
}
