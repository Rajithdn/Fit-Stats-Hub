import { useStore } from "@/store/useStore";
import { Dashboard } from "@/components/sections/Dashboard";
import { Nutrition } from "@/components/sections/Nutrition";
import { DietPlanner } from "@/components/sections/DietPlanner";
import { WorkoutPlanner } from "@/components/sections/WorkoutPlanner";
import { HealthReportAnalyzer } from "@/components/sections/HealthReportAnalyzer";
import { ProgressTracker } from "@/components/sections/ProgressTracker";
import { AICoach } from "@/components/sections/AICoach";
import { Settings } from "@/components/sections/Settings";
import { Layout } from "@/components/Layout";

export default function App() {
  const { activeSection, theme } = useStore();

  const renderSection = () => {
    switch (activeSection) {
      case "Dashboard":
        return <Dashboard />;
      case "Nutrition":
        return <Nutrition />;
      case "Diet Planner":
        return <DietPlanner />;
      case "Workout Planner":
        return <WorkoutPlanner />;
      case "Health Report Analyzer":
        return <HealthReportAnalyzer />;
      case "Progress Tracker":
        return <ProgressTracker />;
      case "AI Coach":
        return <AICoach />;
      case "Settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen w-full bg-background text-foreground ${theme}`}>
      <Layout>{renderSection()}</Layout>
    </div>
  );
}
