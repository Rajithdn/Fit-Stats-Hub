import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useStore, fetchAndLoadUserData } from "@/store/useStore";
import { Dashboard } from "@/components/sections/Dashboard";
import { Nutrition } from "@/components/sections/Nutrition";
import { DietPlanner } from "@/components/sections/DietPlanner";
import { WorkoutPlanner } from "@/components/sections/WorkoutPlanner";
import { WorkoutLogger } from "@/components/sections/WorkoutLogger";
import { HomeWorkout } from "@/components/sections/HomeWorkout";
import { DailySteps } from "@/components/sections/DailySteps";
import { BodyMeasurements } from "@/components/sections/BodyMeasurements";
import { HealthReportAnalyzer } from "@/components/sections/HealthReportAnalyzer";
import { ProgressTracker } from "@/components/sections/ProgressTracker";
import { ProgressPhotos } from "@/components/sections/ProgressPhotos";
import { AICoach } from "@/components/sections/AICoach";
import { Settings } from "@/components/sections/Settings";
import { Layout } from "@/components/Layout";
import { Auth } from "@/components/Auth";
import { Loader2 } from "lucide-react";

export default function App() {
  const { activeSection, theme, isAuthenticated, isLoading, login, loadUserData, setLoading, logout } = useStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        logout();
        setLoading(false);
        return;
      }

      try {
        const email = firebaseUser.email ?? "";
        const username = email.replace(/@termfit\.app$/, "");
        login(firebaseUser.uid, username);

        const data = await fetchAndLoadUserData(firebaseUser.uid);
        loadUserData(data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-gray-400 text-sm">Loading your fitness data…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case "Dashboard":              return <Dashboard />;
      case "Nutrition":              return <Nutrition />;
      case "Diet Planner":           return <DietPlanner />;
      case "Workout Planner":        return <WorkoutPlanner />;
      case "Workout Logger":         return <WorkoutLogger />;
      case "Home Workout":           return <HomeWorkout />;
      case "Daily Steps":            return <DailySteps />;
      case "Body Measurements":      return <BodyMeasurements />;
      case "Health Report Analyzer": return <HealthReportAnalyzer />;
      case "Progress Tracker":       return <ProgressTracker />;
      case "Progress Photos":        return <ProgressPhotos />;
      case "AI Coach":               return <AICoach />;
      case "Settings":               return <Settings />;
      default:                       return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen w-full bg-background text-foreground ${theme}`}>
      <Layout>{renderSection()}</Layout>
    </div>
  );
}
