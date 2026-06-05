import { useStore } from "@/store/useStore";
import { Bell, Moon, Sun, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { userProfile, theme, setTheme } = useStore();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <header className="h-14 md:h-16 border-b border-border/40 bg-card/30 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={onMenuClick}
          aria-label="Open menu"
          data-testid="button-mobile-menu"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <h2 className="text-base md:text-lg font-semibold tracking-tight">Fitness Terminal</h2>
      </div>

      <div className="flex items-center gap-1 md:gap-6">
        {/* Weight display — hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Current:</span>
          <span className="font-mono font-medium">{userProfile.weight}kg</span>
          <span className="text-muted-foreground mx-1">→</span>
          <span className="text-muted-foreground">Target:</span>
          <span className="font-mono font-medium text-primary">{userProfile.targetWeight}kg</span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle">
            {theme === "dark" ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-notifications">
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
          </Button>

          <div className="flex items-center gap-2 ml-1 pl-2 md:pl-4 border-l border-border/50">
            <Avatar className="h-7 w-7 md:h-8 md:w-8 border border-border shrink-0">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.name}`} alt={userProfile.name} />
              <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:inline-block">{userProfile.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
