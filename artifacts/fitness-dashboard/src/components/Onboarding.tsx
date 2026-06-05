import { useState } from "react";
import { useStore, UserProfile } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, User, Target, Activity, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = ["Welcome", "Personal Info", "Body Stats", "Your Goal"];

type Draft = Omit<UserProfile, "dailyCalorieGoal"> & { dailyCalorieGoal: number };

export function Onboarding() {
  const { completeOnboarding } = useStore();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    name: "",
    age: 25,
    gender: "male",
    height: 170,
    weight: 70,
    targetWeight: 65,
    activityLevel: "Moderately Active",
    goal: "Weight Loss",
    dailyCalorieGoal: 2000,
  });

  const set = <K extends keyof Draft>(key: K, val: Draft[K]) =>
    setDraft((p) => ({ ...p, [key]: val }));

  function canAdvance() {
    if (step === 1) return draft.name.trim().length >= 2;
    if (step === 2) return draft.height > 0 && draft.weight > 0;
    return true;
  }

  function handleFinish() {
    completeOnboarding(draft as UserProfile);
  }

  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold tracking-tight">TermFit</span>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            {STEPS.map((s, i) => (
              <span key={s} className={i <= step ? "text-primary font-medium" : ""}>{s}</span>
            ))}
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="p-8"
            >
              {step === 0 && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold">Welcome to TermFit</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Your all-in-one fitness companion. Track workouts, nutrition, steps, and body measurements — all in one place.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Let's set up your personal profile in just a few steps. Your data is saved locally on your device.
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                      { emoji: "🏋️", label: "Workouts" },
                      { emoji: "🥗", label: "Nutrition" },
                      { emoji: "👣", label: "Steps" },
                    ].map((f) => (
                      <div key={f.label} className="bg-background/50 border border-border/50 rounded-xl p-3 text-center">
                        <div className="text-2xl mb-1">{f.emoji}</div>
                        <div className="text-xs font-medium">{f.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" /> Personal Info
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Tell us a bit about yourself</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Your Name</Label>
                      <Input
                        autoFocus
                        placeholder="e.g. Rajith"
                        value={draft.name}
                        onChange={(e) => set("name", e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Age</Label>
                        <Input
                          type="number"
                          min={10}
                          max={120}
                          value={draft.age}
                          onChange={(e) => set("age", Number(e.target.value))}
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Gender</Label>
                        <Select value={draft.gender} onValueChange={(v) => set("gender", v as Draft["gender"])}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" /> Body Stats
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Used to calculate your calorie needs</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Height (cm)</Label>
                      <Input
                        type="number"
                        min={100}
                        max={250}
                        value={draft.height}
                        onChange={(e) => set("height", Number(e.target.value))}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Current Weight (kg)</Label>
                      <Input
                        type="number"
                        min={30}
                        max={300}
                        step={0.1}
                        value={draft.weight}
                        onChange={(e) => set("weight", Number(e.target.value))}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <Label>Target Weight (kg)</Label>
                      <Input
                        type="number"
                        min={30}
                        max={300}
                        step={0.1}
                        value={draft.targetWeight}
                        onChange={(e) => set("targetWeight", Number(e.target.value))}
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" /> Your Goal
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">We'll personalise your plan around this</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Primary Goal</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["Weight Loss", "Weight Gain", "Lean Bulk", "Maintenance"] as Draft["goal"][]).map((g) => (
                          <button
                            key={g}
                            onClick={() => set("goal", g)}
                            className={`px-3 py-3 rounded-xl border text-sm font-medium text-left transition-all ${
                              draft.goal === g
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/50 bg-background/50 text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {g === "Weight Loss" && "⬇️ "}
                            {g === "Weight Gain" && "⬆️ "}
                            {g === "Lean Bulk" && "💪 "}
                            {g === "Maintenance" && "⚖️ "}
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Activity Level</Label>
                      <Select
                        value={draft.activityLevel}
                        onValueChange={(v) => set("activityLevel", v as Draft["activityLevel"])}
                      >
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
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

                    {/* Summary */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-1.5">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your Profile Summary</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <span className="font-semibold text-foreground">{draft.name}</span>
                        <span className="text-muted-foreground">{draft.age}y · {draft.gender}</span>
                        <span className="text-muted-foreground">{draft.height}cm · {draft.weight}kg</span>
                        <span className="text-primary font-medium">{draft.goal}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="px-8 pb-8 flex gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()} className="flex-1">
                {step === 0 ? "Get Started" : "Continue"} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish} className="flex-1 bg-emerald-600 hover:bg-emerald-500">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Save & Go to Dashboard
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Developed by <span className="text-primary font-medium">Rajith</span>
        </p>
      </div>
    </div>
  );
}
