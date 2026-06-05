import { useStore } from "@/store/useStore";
import { 
  LayoutDashboard, 
  Apple, 
  Utensils, 
  Dumbbell, 
  FileText, 
  TrendingUp, 
  MessageSquare, 
  Settings as SettingsIcon 
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "Dashboard", icon: LayoutDashboard },
  { id: "Nutrition", icon: Apple },
  { id: "Diet Planner", icon: Utensils },
  { id: "Workout Planner", icon: Dumbbell },
  { id: "Health Report Analyzer", icon: FileText },
  { id: "Progress Tracker", icon: TrendingUp },
  { id: "AI Coach", icon: MessageSquare },
  { id: "Settings", icon: SettingsIcon },
];

export function Sidebar() {
  const { activeSection, setActiveSection } = useStore();

  return (
    <aside className="w-64 border-r border-border/40 bg-card/30 backdrop-blur-md h-full flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg tracking-tight">TermFit</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              data-testid={`sidebar-nav-${item.id.replace(/\s+/g, '-').toLowerCase()}`}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 relative group",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-primary/10 rounded-md"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{item.id}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 m-4 rounded-xl bg-card border border-border/50 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">PRO ACTIVE</p>
        <p>Syncing data from Apple Health & MyFitnessPal.</p>
      </div>
    </aside>
  );
}
