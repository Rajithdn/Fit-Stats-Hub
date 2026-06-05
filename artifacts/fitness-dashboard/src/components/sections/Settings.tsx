import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/store/useStore";
import { User, Target, Activity, Settings2 } from "lucide-react";

export function Settings() {
  const { userProfile, theme, setTheme, updateProfile } = useStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    toast({
      title: "Profile Saved",
      description: "Your settings have been updated. The Diet Planner will use your new profile.",
    });
  };

  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Body Measurements */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Personal Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  data-testid="input-name"
                  value={formData.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  min={10}
                  max={120}
                  data-testid="input-age"
                  value={formData.age}
                  onChange={(e) => set("age", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => set("gender", v as UserProfile["gender"])}
                >
                  <SelectTrigger data-testid="select-gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min={100}
                  max={250}
                  data-testid="input-height"
                  value={formData.height}
                  onChange={(e) => set("height", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Current Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min={30}
                  max={300}
                  step={0.1}
                  data-testid="input-weight"
                  value={formData.weight}
                  onChange={(e) => set("weight", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  min={30}
                  max={300}
                  step={0.1}
                  data-testid="input-target-weight"
                  value={formData.targetWeight}
                  onChange={(e) => set("targetWeight", Number(e.target.value))}
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> Fitness Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label>Primary Goal</Label>
              <Select
                value={formData.goal}
                onValueChange={(v) => set("goal", v as UserProfile["goal"])}
              >
                <SelectTrigger data-testid="select-goal">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Lean Bulk">Lean Bulk</SelectItem>
                  <SelectItem value="Weight Gain">Weight Gain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select
                value={formData.activityLevel}
                onValueChange={(v) => set("activityLevel", v as UserProfile["activityLevel"])}
              >
                <SelectTrigger data-testid="select-activity">
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sedentary">Sedentary — desk job, no exercise</SelectItem>
                  <SelectItem value="Lightly Active">Lightly Active — 1–3 days/week</SelectItem>
                  <SelectItem value="Moderately Active">Moderately Active — 3–5 days/week</SelectItem>
                  <SelectItem value="Very Active">Very Active — 6–7 days/week</SelectItem>
                  <SelectItem value="Super Active">Super Active — athlete / physical job</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="dailyCalorieGoal">Manual Calorie Override (kcal/day)</Label>
              <Input
                id="dailyCalorieGoal"
                type="number"
                min={800}
                max={6000}
                data-testid="input-calorie-goal"
                value={formData.dailyCalorieGoal}
                onChange={(e) => set("dailyCalorieGoal", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Leave as-is to use the auto-calculated TDEE, or set a custom value.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" /> Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
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
                document.documentElement.classList.toggle("dark", checked);
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
              <p className="text-sm text-muted-foreground">Use kg / cm instead of lbs / inches</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end pb-4">
        <Button
          form="profile-form"
          type="submit"
          size="lg"
          data-testid="button-save-settings"
          onClick={handleSubmit}
          className="px-10"
        >
          Save All Changes
        </Button>
      </div>
    </div>
  );
}
