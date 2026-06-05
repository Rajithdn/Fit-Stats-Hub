import { useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/store/useStore";
import { User, Target, Settings2, Camera, Trash2, HardDrive, RefreshCw } from "lucide-react";

export function Settings() {
  const { userProfile, profilePhoto, theme, setTheme, updateProfile, setProfilePhoto } = useStore();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    toast({
      title: "Profile Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please choose an image under 5 MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhoto(reader.result as string);
      toast({ title: "Photo updated!", description: "Your profile photo has been saved." });
    };
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setProfilePhoto('');
    toast({ title: "Photo removed" });
  }

  const initials = userProfile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const storageKey = 'fitness-dashboard-storage';
  const storageSize = (() => {
    try {
      const raw = localStorage.getItem(storageKey) ?? '';
      return (new Blob([raw]).size / 1024).toFixed(1);
    } catch { return '0'; }
  })();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Profile Photo */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" /> Profile Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full border-2 border-border overflow-hidden bg-primary/10 flex items-center justify-center">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary">{initials || "?"}</span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="font-medium">{userProfile.name || "Your Name"}</p>
              <p className="text-sm text-muted-foreground">{userProfile.goal} · {userProfile.activityLevel}</p>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  {profilePhoto ? "Change Photo" : "Upload Photo"}
                </Button>
                {profilePhoto && (
                  <Button size="sm" variant="ghost" onClick={handleRemovePhoto} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">JPG, PNG or WebP · Max 5 MB</p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
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
                  value={formData.age}
                  onChange={(e) => set("age", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => set("gender", v as UserProfile["gender"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Select value={formData.goal} onValueChange={(v) => set("goal", v as UserProfile["goal"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Select value={formData.activityLevel} onValueChange={(v) => set("activityLevel", v as UserProfile["activityLevel"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                setTheme(checked ? "dark" : "light");
                document.documentElement.classList.toggle("dark", checked);
              }}
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

      {/* How data is saved */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-primary" /> How Your Data is Saved
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border/40">
              <HardDrive className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Local Storage (your browser)</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  All your data — profile, workouts, steps, meals, measurements, and photo — is stored directly in your browser's localStorage under the key <code className="bg-background px-1 py-0.5 rounded text-primary text-[11px]">fitness-dashboard-storage</code>.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border/40">
              <RefreshCw className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Persists across sessions</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Data survives page refreshes, tab closes, and browser restarts. It is automatically re-loaded every time you open the app.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border/40">
              <User className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Only on this device</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Data is not sent to any server. It lives only on this browser/device. Switching browsers, clearing site data, or uninstalling the app will erase it.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/40">
            <div>
              <p className="text-sm font-medium">Storage used</p>
              <p className="text-xs text-muted-foreground">Current data size on this device</p>
            </div>
            <span className="text-sm font-bold text-primary">{storageSize} KB</span>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end pb-4">
        <Button form="profile-form" type="submit" size="lg" onClick={handleSubmit} className="px-10">
          Save All Changes
        </Button>
      </div>
    </div>
  );
}
