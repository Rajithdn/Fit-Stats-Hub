import { create } from 'zustand';
import { apiFetch, setToken, clearToken, today, isRealId } from '@/lib/api';

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
  workouts: any[];
  water: number;
  sleep: number;
};

type StoreState = {
  token: string | null;
  username: string;
  userId: number | null;
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

  login: (token: string, username: string, userId: number) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
  loadUserData: (data: {
    profile: any;
    foodLogs: any[];
    workoutLogs: any[];
    stepEntries: any[];
    measurements: any[];
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

function mapProfile(p: any): { profile: UserProfile; photo: string; stepGoal: number; theme: 'dark' | 'light' } {
  return {
    profile: {
      name: p.name ?? '',
      age: parseNum(p.age),
      gender: (p.gender ?? 'male') as UserProfile['gender'],
      height: parseNum(p.height),
      weight: parseNum(p.weight),
      targetWeight: parseNum(p.targetWeight),
      activityLevel: (p.activityLevel ?? 'Moderately Active') as UserProfile['activityLevel'],
      goal: (p.goal ?? 'Weight Loss') as UserProfile['goal'],
      dailyCalorieGoal: parseNum(p.dailyCalorieGoal),
    },
    photo: p.profilePhoto ?? '',
    stepGoal: parseNum(p.stepGoal) || 10000,
    theme: (p.theme ?? 'dark') as 'dark' | 'light',
  };
}

export const useStore = create<StoreState>()((set, get) => ({
  token: null,
  username: '',
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  profilePhoto: '',
  userProfile: BLANK_PROFILE,
  dailyLog: { foods: [], workouts: [], water: 0, sleep: 0 },
  workoutLogs: [],
  stepEntries: [],
  stepGoal: 10000,
  measurements: [],
  theme: 'dark',
  activeSection: 'Dashboard',

  login: (token, username, userId) => {
    setToken(token);
    set({ token, username, userId, isAuthenticated: true });
  },

  logout: () => {
    clearToken();
    set({
      token: null, username: '', userId: null, isAuthenticated: false,
      profilePhoto: '', userProfile: BLANK_PROFILE,
      dailyLog: { foods: [], workouts: [], water: 0, sleep: 0 },
      workoutLogs: [], stepEntries: [], measurements: [],
    });
  },

  setLoading: (v) => set({ isLoading: v }),

  loadUserData: ({ profile, foodLogs, workoutLogs, stepEntries, measurements, dailyLog }) => {
    const { profile: up, photo, stepGoal, theme } = mapProfile(profile);
    set({
      userProfile: up,
      profilePhoto: photo,
      stepGoal,
      theme,
      dailyLog: {
        foods: foodLogs.map((f: any) => ({
          id: String(f.id),
          name: f.name,
          calories: parseNum(f.calories),
          protein: parseNum(f.protein),
          carbs: parseNum(f.carbs),
          fat: parseNum(f.fat),
          fiber: parseNum(f.fiber),
        })),
        workouts: [],
        water: parseNum(dailyLog.water),
        sleep: parseNum(dailyLog.sleep),
      },
      workoutLogs: workoutLogs.map((w: any) => ({
        id: String(w.id),
        date: w.date,
        exercise: w.exercise,
        sets: parseNum(w.sets),
        reps: parseNum(w.reps),
        weight: parseNum(w.weight),
        unit: w.unit ?? 'kg',
        notes: w.notes ?? '',
      })),
      stepEntries: stepEntries.map((s: any) => ({
        id: String(s.id),
        date: s.date,
        steps: parseNum(s.steps),
      })),
      measurements: measurements.map((m: any) => ({
        id: String(m.id),
        date: m.date,
        chest: parseNum(m.chest),
        waist: parseNum(m.waist),
        hips: parseNum(m.hips),
        leftArm: parseNum(m.leftArm),
        rightArm: parseNum(m.rightArm),
        leftThigh: parseNum(m.leftThigh),
        rightThigh: parseNum(m.rightThigh),
        shoulders: parseNum(m.shoulders),
        neck: parseNum(m.neck),
        notes: m.notes ?? '',
      })),
    });
  },

  updateProfile: (profile) => {
    set((state) => ({ userProfile: { ...state.userProfile, ...profile } }));
    apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify(profile) }).catch(console.error);
  },

  setProfilePhoto: (photo) => {
    set({ profilePhoto: photo });
    apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify({ profilePhoto: photo }) }).catch(console.error);
  },

  updateDailyLog: (log) => {
    set((state) => ({ dailyLog: { ...state.dailyLog, ...log } }));
    const { water, sleep } = { ...get().dailyLog, ...log };
    const patch: Record<string, number> = {};
    if (log.water !== undefined) patch.water = water;
    if (log.sleep !== undefined) patch.sleep = sleep;
    if (Object.keys(patch).length > 0) {
      apiFetch('/api/daily-logs', { method: 'POST', body: JSON.stringify({ date: today(), ...patch }) }).catch(console.error);
    }
  },

  addFoodToLog: (food) => {
    const tempId = `tmp-${Date.now()}`;
    set((state) => ({
      dailyLog: { ...state.dailyLog, foods: [...state.dailyLog.foods, { ...food, id: tempId }] },
    }));
    apiFetch<{ id: number }>('/api/food-logs', {
      method: 'POST',
      body: JSON.stringify({ ...food, date: today() }),
    }).then((row) => {
      set((state) => ({
        dailyLog: {
          ...state.dailyLog,
          foods: state.dailyLog.foods.map((f) => f.id === tempId ? { ...f, id: String(row.id) } : f),
        },
      }));
    }).catch(console.error);
  },

  removeFoodFromLog: (id) => {
    set((state) => ({
      dailyLog: { ...state.dailyLog, foods: state.dailyLog.foods.filter((f) => f.id !== id) },
    }));
    if (isRealId(id)) {
      apiFetch(`/api/food-logs/${id}`, { method: 'DELETE' }).catch(console.error);
    }
  },

  addWorkoutLog: (entry) => {
    const tempId = `tmp-${Date.now()}`;
    set((state) => ({ workoutLogs: [{ ...entry, id: tempId }, ...state.workoutLogs] }));
    apiFetch<{ id: number }>('/api/workout-logs', {
      method: 'POST',
      body: JSON.stringify(entry),
    }).then((row) => {
      set((state) => ({
        workoutLogs: state.workoutLogs.map((w) => w.id === tempId ? { ...w, id: String(row.id) } : w),
      }));
    }).catch(console.error);
  },

  removeWorkoutLog: (id) => {
    set((state) => ({ workoutLogs: state.workoutLogs.filter((e) => e.id !== id) }));
    if (isRealId(id)) {
      apiFetch(`/api/workout-logs/${id}`, { method: 'DELETE' }).catch(console.error);
    }
  },

  updateStepEntry: (date, steps) => {
    set((state) => {
      const idx = state.stepEntries.findIndex((e) => e.date === date);
      if (idx >= 0) {
        const updated = [...state.stepEntries];
        updated[idx] = { ...updated[idx], steps };
        return { stepEntries: updated };
      }
      return { stepEntries: [{ date, steps }, ...state.stepEntries] };
    });
    apiFetch('/api/steps', { method: 'POST', body: JSON.stringify({ date, steps }) }).catch(console.error);
  },

  setStepGoal: (goal) => {
    set({ stepGoal: goal });
    apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify({ stepGoal: goal }) }).catch(console.error);
  },

  addMeasurement: (entry) => {
    const tempId = `tmp-${Date.now()}`;
    set((state) => ({ measurements: [{ ...entry, id: tempId }, ...state.measurements] }));
    apiFetch<{ id: number }>('/api/measurements', {
      method: 'POST',
      body: JSON.stringify(entry),
    }).then((row) => {
      set((state) => ({
        measurements: state.measurements.map((m) => m.id === tempId ? { ...m, id: String(row.id) } : m),
      }));
    }).catch(console.error);
  },

  removeMeasurement: (id) => {
    set((state) => ({ measurements: state.measurements.filter((m) => m.id !== id) }));
    if (isRealId(id)) {
      apiFetch(`/api/measurements/${id}`, { method: 'DELETE' }).catch(console.error);
    }
  },

  setTheme: (theme) => {
    set({ theme });
    apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify({ theme }) }).catch(console.error);
  },

  setActiveSection: (section) => set({ activeSection: section }),

  completeOnboarding: (profile) => {
    set({ userProfile: profile });
    apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify(profile) }).catch(console.error);
  },
}));
