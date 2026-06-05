import { useStore } from "@/store/useStore";
import {
  LayoutDashboard,
  Apple,
  Utensils,
  Dumbbell,
  FileText,
  TrendingUp,
  MessageSquare,
  Settings as SettingsIcon,
  X,
  ClipboardList,
  Home,
  Footprints,
  Ruler,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "Dashboard",              icon: LayoutDashboard },
  { id: "Nutrition",              icon: Apple },
  { id: "Diet Planner",           icon: Utensils },
  { id: "Workout Planner",        icon: Dumbbell },
  { id: "Workout Logger",         icon: ClipboardList },
  { id: "Home Workout",           icon: Home },
  { id: "Daily Steps",            icon: Footprints },
  { id: "Body Measurements",      icon: Ruler },
  { id: "Health Report Analyzer", icon: FileText },
  { id: "Progress Tracker",       icon: TrendingUp },
  { id: "AI Coach",               icon: MessageSquare },
  { id: "Settings",               icon: SettingsIcon },
];

interface SidebarProps {
  onNavClick: () => void;
}

export function Sidebar({ onNavClick }: SidebarProps) {
  const { activeSection, setActiveSection, userProfile } = useStore();

  return (
    <aside className="w-64 border-r border-border/40 bg-card/80 md:bg-card/30 backdrop-blur-md h-full flex flex-col shrink-0">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">TermFit</span>
        </div>
        <button
          onClick={onNavClick}
          className="md:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {userProfile.name && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{userProfile.name}</p>
              <p className="text-xs text-muted-foreground truncate">{userProfile.goal}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                onNavClick();
              }}
              data-testid={`sidebar-nav-${item.id.replace(/\s+/g, "-").toLowerCase()}`}
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
              <Icon className="w-5 h-5 relative z-10 shrink-0" />
              <span className="relative z-10">{item.id}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-2">
        <div className="p-3 rounded-xl bg-card border border-border/50 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-0.5">PRO ACTIVE</p>
          <p>Syncing data from Apple Health &amp; MyFitnessPal.</p>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 text-center">
        <p className="text-[10px] text-muted-foreground/50">
          Developed by{" "}
          <span className="text-primary/70 font-semibold">Rajith</span>
        </p>
      </div>
    </aside>
  );
}
