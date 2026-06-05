import { useState } from "react";
import { useStore } from "@/store/useStore";
import { UserProfile } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Utensils, Droplets, Flame, Beef, Wheat, Zap } from "lucide-react";

const MULTIPLIERS: Record<UserProfile["activityLevel"], number> = {
  "Sedentary": 1.2,
  "Lightly Active": 1.375,
  "Moderately Active": 1.55,
  "Very Active": 1.725,
  "Super Active": 1.9,
};

type MealItem = { meal: string; emoji: string; items: string; cals: number; protein: number; carbs: number; fat: number };

function buildPlan(
  calories: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
  goal: UserProfile["goal"]
): MealItem[] {
  const isLoss = goal === "Weight Loss";
  const isBulk = goal === "Weight Gain" || goal === "Lean Bulk";

  return [
    {
      meal: "Breakfast",
      emoji: "🌅",
      items: isLoss
        ? "Oats (50g) + Egg Whites (4) + Berries (100g)"
        : isBulk
        ? "Oats (80g) + Whole Eggs (3) + Whole Milk (200ml) + Banana"
        : "Oats (60g) + Eggs (2) + Milk (150ml) + Almonds (15g)",
      cals: Math.round(calories * 0.25),
      protein: Math.round(proteinG * 0.22),
      carbs: Math.round(carbsG * 0.28),
      fat: Math.round(fatG * 0.20),
    },
    {
      meal: "Morning Snack",
      emoji: "🍎",
      items: isLoss
        ? "Greek Yogurt (150g) + Apple"
        : isBulk
        ? "Peanut Butter (30g) + Banana + Whole Milk (250ml)"
        : "Greek Yogurt (150g) + Almonds (20g)",
      cals: Math.round(calories * 0.10),
      protein: Math.round(proteinG * 0.10),
      carbs: Math.round(carbsG * 0.12),
      fat: Math.round(fatG * 0.12),
    },
    {
      meal: "Lunch",
      emoji: "🍗",
      items: isLoss
        ? "Chicken Breast (150g) + Brown Rice (80g cooked) + Steamed Broccoli (200g)"
        : isBulk
        ? "Chicken Breast (200g) + Brown Rice (150g cooked) + Avocado (½) + Sweet Potato (100g)"
        : "Chicken Breast (150g) + Brown Rice (120g cooked) + Mixed Vegetables (150g)",
      cals: Math.round(calories * 0.30),
      protein: Math.round(proteinG * 0.32),
      carbs: Math.round(carbsG * 0.30),
      fat: Math.round(fatG * 0.25),
    },
    {
      meal: "Evening Snack",
      emoji: "🥜",
      items: isLoss
        ? "Cottage Cheese (100g) + Cucumber slices"
        : isBulk
        ? "Mixed Nuts (40g) + Protein Bar (1) + Orange"
        : "Paneer (80g) + Fruit (1 piece)",
      cals: Math.round(calories * 0.10),
      protein: Math.round(proteinG * 0.12),
      carbs: Math.round(carbsG * 0.10),
      fat: Math.round(fatG * 0.18),
    },
    {
      meal: "Dinner",
      emoji: "🍽️",
      items: isLoss
        ? "Grilled Salmon (150g) + Steamed Vegetables (200g) + Quinoa (60g cooked)"
        : isBulk
        ? "Beef / Paneer (200g) + Sweet Potato (200g) + Rice (100g cooked) + Olive Oil (1 tbsp)"
        : "Grilled Fish (150g) + Sweet Potato (150g) + Salad (200g)",
      cals: Math.round(calories * 0.20),
      protein: Math.round(proteinG * 0.20),
      carbs: Math.round(carbsG * 0.15),
      fat: Math.round(fatG * 0.20),
    },
    {
      meal: "Post-Workout",
      emoji: "💪",
      items: isLoss
        ? "Whey Protein Isolate (1 scoop, 30g) + Water"
        : isBulk
        ? "Whey Protein (2 scoops) + Banana + Whole Milk (250ml)"
        : "Whey Protein (1 scoop) + Banana",
      cals: Math.round(calories * 0.05),
      protein: Math.round(proteinG * 0.04),
      carbs: Math.round(carbsG * 0.05),
      fat: Math.round(fatG * 0.05),
    },
  ];
}

export function DietPlanner() {
  const { userProfile } = useStore();

  const [goal, setGoal] = useState<UserProfile["goal"]>(userProfile.goal);
  const [activity, setActivity] = useState<UserProfile["activityLevel"]>(userProfile.activityLevel);
  const [plan, setPlan] = useState<{ cals: number; protein: number; carbs: number; fat: number; water: number; meals: MealItem[] } | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    const { weight, height, age, gender } = userProfile;

    const bmr = Math.round(
      10 * weight + 6.25 * height - 5 * age + (gender === "male" ? 5 : -161)
    );
    const tdee = bmr * MULTIPLIERS[activity];

    let cals: number;
    switch (goal) {
      case "Weight Loss": cals = Math.round(tdee - 500); break;
      case "Lean Bulk":   cals = Math.round(tdee + 250); break;
      case "Weight Gain": cals = Math.round(tdee + 500); break;
      default:            cals = Math.round(tdee);
    }

    const protein = Math.round(goal === "Weight Loss" ? weight * 2.0 : weight * 2.2);
    const fat     = Math.round((cals * 0.25) / 9);
    const carbs   = Math.round((cals - protein * 4 - fat * 9) / 4);
    const water   = Math.round(weight * 0.035 * 10) / 10;

    setPlan({ cals, protein, carbs, fat, water, meals: buildPlan(cals, protein, carbs, fat, goal) });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Profile summary banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-3 px-5">
          <p className="text-sm text-muted-foreground">
            Calculating for&nbsp;
            <span className="text-foreground font-semibold">{userProfile.name}</span>
            &nbsp;·&nbsp;{userProfile.age} yrs&nbsp;·&nbsp;
            {userProfile.height} cm&nbsp;·&nbsp;{userProfile.weight} kg&nbsp;→&nbsp;
            <span className="text-primary font-semibold">{userProfile.targetWeight} kg target</span>
            <span className="text-muted-foreground text-xs ml-2">(update in Settings)</span>
          </p>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" /> Customize Your Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Goal</Label>
                <Select value={goal} onValueChange={(v) => setGoal(v as UserProfile["goal"])}>
                  <SelectTrigger data-testid="select-diet-goal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weight Loss">Weight Loss (−500 kcal deficit)</SelectItem>
                    <SelectItem value="Maintenance">Maintenance (TDEE)</SelectItem>
                    <SelectItem value="Lean Bulk">Lean Bulk (+250 kcal surplus)</SelectItem>
                    <SelectItem value="Weight Gain">Weight Gain (+500 kcal surplus)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select value={activity} onValueChange={(v) => setActivity(v as UserProfile["activityLevel"])}>
                  <SelectTrigger data-testid="select-diet-activity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedentary">Sedentary</SelectItem>
                    <SelectItem value="Lightly Active">Lightly Active</SelectItem>
                    <SelectItem value="Moderately Active">Moderately Active</SelectItem>
                    <SelectItem value="Very Active">Very Active</SelectItem>
                    <SelectItem value="Super Active">Super Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" data-testid="button-generate-plan">
              <Zap className="w-4 h-4 mr-2" /> Generate My Diet Plan
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {plan && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Macro targets */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Calories",  value: plan.cals.toLocaleString(), unit: "kcal", icon: <Flame className="w-4 h-4" />, color: "#10b981" },
              { label: "Protein",   value: `${plan.protein}g`,          unit: "per day", icon: <Beef className="w-4 h-4" />,  color: "#3b82f6" },
              { label: "Carbs",     value: `${plan.carbs}g`,            unit: "per day", icon: <Wheat className="w-4 h-4" />, color: "#f59e0b" },
              { label: "Fat",       value: `${plan.fat}g`,              unit: "per day", icon: <Zap className="w-4 h-4" />,   color: "#f43f5e" },
              { label: "Water",     value: `${plan.water}L`,            unit: "per day", icon: <Droplets className="w-4 h-4" />, color: "#60a5fa" },
            ].map((item) => (
              <Card key={item.label} className="bg-card/50 backdrop-blur-sm border-border/40">
                <CardContent className="p-4 text-center space-y-1">
                  <div className="flex justify-center" style={{ color: item.color }}>{item.icon}</div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.label}</p>
                  <p className="text-2xl font-bold font-mono" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-[10px] text-muted-foreground">{item.unit}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Meal plan */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg px-1">Daily Meal Plan</h3>
            {plan.meals.map((m, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-primary">{m.meal}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{m.items}</p>
                    </div>
                    <div className="flex gap-4 shrink-0 font-mono text-sm">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">kcal</p>
                        <p className="font-bold text-foreground">{m.cals}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">protein</p>
                        <p className="font-bold text-blue-400">{m.protein}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">carbs</p>
                        <p className="font-bold text-amber-400">{m.carbs}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">fat</p>
                        <p className="font-bold text-rose-400">{m.fat}g</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
