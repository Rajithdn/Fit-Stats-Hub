import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function Settings() {
  const { userProfile, theme, setTheme, updateProfile } = useStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState(userProfile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    toast({
      title: "Settings Saved",
      description: "Your profile has been updated.",
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  value={formData.age} 
                  onChange={e => setFormData({...formData, age: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input 
                  id="height" 
                  type="number" 
                  value={formData.height} 
                  onChange={e => setFormData({...formData, height: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input 
                  id="weight" 
                  type="number" 
                  value={formData.weight} 
                  onChange={e => setFormData({...formData, weight: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                <Input 
                  id="targetWeight" 
                  type="number" 
                  value={formData.targetWeight} 
                  onChange={e => setFormData({...formData, targetWeight: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyCalorieGoal">Daily Calorie Goal</Label>
                <Input 
                  id="dailyCalorieGoal" 
                  type="number" 
                  value={formData.dailyCalorieGoal} 
                  onChange={e => setFormData({...formData, dailyCalorieGoal: Number(e.target.value)})} 
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button type="submit" data-testid="button-save-settings">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Toggle application theme</p>
            </div>
            <Switch 
              checked={theme === "dark"} 
              onCheckedChange={(checked) => {
                const newTheme = checked ? "dark" : "light";
                setTheme(newTheme);
                document.documentElement.classList.toggle('dark', checked);
              }}
              data-testid="switch-theme"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Daily Reminders</p>
              <p className="text-sm text-muted-foreground">Push notifications for logging meals</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Metric System</p>
              <p className="text-sm text-muted-foreground">Use kg/cm instead of lbs/inches</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
