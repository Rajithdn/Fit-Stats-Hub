import { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useStore } from "@/store/useStore";
import { Bell, Moon, Sun, Menu, Settings, LogOut, User, CheckCheck, Dumbbell, Apple, Droplets, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, type Variants } from "framer-motion";

interface HeaderProps {
  onMenuClick: () => void;
}

const NOTIFICATIONS = [
  { id: 1, icon: Apple, color: "text-emerald-400", bg: "bg-emerald-400/10", title: "Log your meals", body: "You haven't logged any food today. Track your nutrition!", time: "Now" },
  { id: 2, icon: Dumbbell, color: "text-blue-400", bg: "bg-blue-400/10", title: "Workout reminder", body: "Stay consistent — have you completed today's workout?", time: "2h ago" },
  { id: 3, icon: Droplets, color: "text-cyan-400", bg: "bg-cyan-400/10", title: "Hydration check", body: "Remember to drink at least 8 glasses of water today.", time: "4h ago" },
  { id: 4, icon: Footprints, color: "text-yellow-400", bg: "bg-yellow-400/10", title: "Step goal", body: "You're halfway to your daily step goal. Keep moving!", time: "6h ago" },
];

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function listener(e: MouseEvent) {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

export function Header({ onMenuClick }: HeaderProps) {
  const { userProfile, profilePhoto, email, theme, setTheme, setActiveSection, logout } = useStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [readAll, setReadAll] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useClickOutside(notifRef, () => setNotifOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const initials = userProfile.name
    ? userProfile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() || "?";

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.15, ease: "easeOut" as const } },
    exit: { opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.1 } },
  };

  return (
    <header className="h-14 md:h-16 border-b border-border/40 bg-card/30 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={onMenuClick} aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </Button>
        <h2 className="text-base md:text-lg font-semibold tracking-tight">Fitness Terminal</h2>
      </div>

      <div className="flex items-center gap-1 md:gap-4">
        {/* Weight display */}
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Current:</span>
          <span className="font-mono font-medium">{userProfile.weight}kg</span>
          <span className="text-muted-foreground mx-1">→</span>
          <span className="text-muted-foreground">Target:</span>
          <span className="font-mono font-medium text-primary">{userProfile.targetWeight}kg</span>
        </div>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
        </Button>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
            className="relative"
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            {!readAll && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background" />
            )}
          </Button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {!readAll && (
                    <button onClick={() => setReadAll(true)} className="text-xs text-primary flex items-center gap-1 hover:opacity-80 transition-opacity">
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="divide-y divide-border/40 max-h-72 overflow-y-auto">
                  {NOTIFICATIONS.map(n => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-accent/5 transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.bg}`}>
                          <Icon className={`w-4 h-4 ${n.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">{n.time}</p>
                        </div>
                        {!readAll && <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
                {readAll && (
                  <div className="px-4 py-3 text-center text-xs text-muted-foreground">
                    All caught up! 🎉
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile avatar with dropdown */}
        <div className="relative ml-1 pl-2 md:pl-3 border-l border-border/50" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg hover:bg-accent/10 px-1.5 py-1 transition-colors"
          >
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-border overflow-hidden bg-primary/20 flex items-center justify-center shrink-0">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-primary">{initials}</span>
              )}
            </div>
            <span className="text-sm font-medium hidden sm:inline-block max-w-[100px] truncate">
              {userProfile.name || email}
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {/* Profile info */}
                <div className="px-4 py-3 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-border overflow-hidden bg-primary/20 flex items-center justify-center shrink-0">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-primary">{initials}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{userProfile.name || "Set your name"}</p>
                      <p className="text-xs text-muted-foreground truncate">{email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => { setActiveSection("Settings"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent/10 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    Settings
                  </button>
                  <button
                    onClick={() => { setActiveSection("Settings"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent/10 transition-colors"
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    Edit Profile
                  </button>
                </div>

                <div className="p-1.5 border-t border-border/60">
                  <button
                    onClick={() => { setProfileOpen(false); logout(); signOut(auth).catch(console.error); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
