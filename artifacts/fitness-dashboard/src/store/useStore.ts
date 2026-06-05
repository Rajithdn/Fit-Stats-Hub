import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  isOnboarded: boolean;
  profilePhoto: string;
  userProfile: UserProfile;
  dailyLog: DailyLog;
  progressEntries: any[];
  workoutLogs: WorkoutLogEntry[];
  stepEntries: StepEntry[];
  stepGoal: number;
  measurements: MeasurementEntry[];
  theme: 'dark' | 'light';
  activeSection: string;
  completeOnboarding: (profile: UserProfile) => void;
  setProfilePhoto: (photo: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
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

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      isOnboarded: false,
      profilePhoto: '',
      userProfile: BLANK_PROFILE,
      dailyLog: {
        foods: [],
        workouts: [],
        water: 0,
        sleep: 0,
      },
      progressEntries: [],
      workoutLogs: [],
      stepEntries: [],
      stepGoal: 10000,
      measurements: [],
      theme: 'dark',
      activeSection: 'Dashboard',
      completeOnboarding: (profile) =>
        set({ isOnboarded: true, userProfile: profile }),
      setProfilePhoto: (photo) => set({ profilePhoto: photo }),
      updateProfile: (profile) =>
        set((state) => ({ userProfile: { ...state.userProfile, ...profile } })),
      updateDailyLog: (log) =>
        set((state) => ({ dailyLog: { ...state.dailyLog, ...log } })),
      addFoodToLog: (food) =>
        set((state) => ({
          dailyLog: { ...state.dailyLog, foods: [...state.dailyLog.foods, food] },
        })),
      removeFoodFromLog: (id) =>
        set((state) => ({
          dailyLog: {
            ...state.dailyLog,
            foods: state.dailyLog.foods.filter((f) => f.id !== id),
          },
        })),
      addWorkoutLog: (entry) =>
        set((state) => ({ workoutLogs: [entry, ...state.workoutLogs] })),
      removeWorkoutLog: (id) =>
        set((state) => ({ workoutLogs: state.workoutLogs.filter((e) => e.id !== id) })),
      updateStepEntry: (date, steps) =>
        set((state) => {
          const existing = state.stepEntries.findIndex((e) => e.date === date);
          if (existing >= 0) {
            const updated = [...state.stepEntries];
            updated[existing] = { date, steps };
            return { stepEntries: updated };
          }
          return { stepEntries: [{ date, steps }, ...state.stepEntries] };
        }),
      setStepGoal: (goal) => set({ stepGoal: goal }),
      addMeasurement: (entry) =>
        set((state) => ({ measurements: [entry, ...state.measurements] })),
      removeMeasurement: (id) =>
        set((state) => ({ measurements: state.measurements.filter((m) => m.id !== id) })),
      setTheme: (theme) => set({ theme }),
      setActiveSection: (section) => set({ activeSection: section }),
    }),
    {
      name: 'fitness-dashboard-storage',
    }
  )
);
