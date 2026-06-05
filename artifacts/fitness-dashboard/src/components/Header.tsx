import { useStore } from "@/store/useStore";
import { Bell, Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Header() {
  const { userProfile, theme, setTheme } = useStore();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    // Note: in a real app, this should also sync with a global context or class on HTML
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <header className="h-16 border-b border-border/40 bg-card/30 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Fitness Terminal</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Current:</span>
          <span className="font-mono font-medium">{userProfile.weight}kg</span>
          <span className="text-muted-foreground mx-1">→</span>
          <span className="text-muted-foreground">Target:</span>
          <span className="font-mono font-medium text-primary">{userProfile.targetWeight}kg</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-notifications">
            <Bell className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-border/50">
            <Avatar className="h-8 w-8 border border-border">
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
