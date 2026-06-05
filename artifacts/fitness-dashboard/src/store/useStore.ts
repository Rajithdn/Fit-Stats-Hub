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

export type DailyLog = {
  foods: FoodEntry[];
  workouts: any[];
  water: number;
  sleep: number;
};

type StoreState = {
  userProfile: UserProfile;
  dailyLog: DailyLog;
  progressEntries: any[];
  theme: 'dark' | 'light';
  activeSection: string;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateDailyLog: (log: Partial<DailyLog>) => void;
  addFoodToLog: (food: FoodEntry) => void;
  removeFoodFromLog: (id: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setActiveSection: (section: string) => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      userProfile: {
        name: 'Alex',
        age: 28,
        gender: 'male',
        height: 180,
        weight: 85,
        targetWeight: 78,
        activityLevel: 'Moderately Active',
        goal: 'Weight Loss',
        dailyCalorieGoal: 2200,
      },
      dailyLog: {
        foods: [
          { id: '1', name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4 },
          { id: '2', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
        ],
        workouts: [],
        water: 1.5,
        sleep: 7.5,
      },
      progressEntries: [],
      theme: 'dark',
      activeSection: 'Dashboard',
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
      setTheme: (theme) => set({ theme }),
      setActiveSection: (section) => set({ activeSection: section }),
    }),
    {
      name: 'fitness-dashboard-storage',
    }
  )
);
