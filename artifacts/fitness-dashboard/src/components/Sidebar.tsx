import { useStore } from "@/store/useStore";
import {
  LayoutDashboard,
  Apple,
  Utensils,
  Dumbbell,
  FileText,
  TrendingUp,
  MessageSquare,
  X,
  ClipboardList,
  Home,
  Footprints,
  Ruler,
  Camera,
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
  { id: "Progress Photos",        icon: Camera },
  { id: "Health Report Analyzer", icon: FileText },
  { id: "Progress Tracker",       icon: TrendingUp },
  { id: "AI Coach",               icon: MessageSquare },
];

interface SidebarProps {
  onNavClick: () => void;
}

export function Sidebar({ onNavClick }: SidebarProps) {
  const { activeSection, setActiveSection, userProfile, profilePhoto, email } = useStore();

  const initials = userProfile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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

      <div className="px-4 pb-3">
        <button
          onClick={() => { setActiveSection("Settings"); onNavClick(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full border-2 border-primary/30 overflow-hidden bg-primary/20 flex items-center justify-center shrink-0">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-primary">{initials || email?.[0]?.toUpperCase() || "?"}</span>
            )}
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold truncate">{userProfile.name || email || "Set up profile"}</p>
            <p className="text-xs text-muted-foreground truncate">{userProfile.goal || "Set up your profile"}</p>
          </div>
        </button>
      </div>

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
        {email && (
          <div className="px-3 py-2 rounded-lg bg-card border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        )}
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
