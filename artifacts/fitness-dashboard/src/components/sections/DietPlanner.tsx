import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Utensils } from "lucide-react";

export function DietPlanner() {
  const { userProfile } = useStore();
  const [showPlan, setShowPlan] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPlan(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5" /> Diet Planner Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Goal</Label>
                <Select defaultValue={userProfile.goal}>
                  <SelectTrigger id="goal">
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
                <Label htmlFor="activity">Activity Level</Label>
                <Select defaultValue={userProfile.activityLevel}>
                  <SelectTrigger id="activity">
                    <SelectValue placeholder="Select activity level" />
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
              Generate Meal Plan
            </Button>
          </form>
        </CardContent>
      </Card>

      {showPlan && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Calories</p>
                <p className="text-2xl font-bold font-mono text-primary">2,200</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10 border-secondary/20">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Protein</p>
                <p className="text-2xl font-bold font-mono text-secondary">160g</p>
              </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--chart-3))]/10 border-[hsl(var(--chart-3))]/20">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Carbs</p>
                <p className="text-2xl font-bold font-mono text-[hsl(var(--chart-3))]">220g</p>
              </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--chart-4))]/10 border-[hsl(var(--chart-4))]/20">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Fat</p>
                <p className="text-2xl font-bold font-mono text-[hsl(var(--chart-4))]">75g</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {[
              { meal: "Breakfast", items: "Oats with Whey Protein, Berries, and Almonds", cals: 450, macros: "35P / 50C / 12F" },
              { meal: "Lunch", items: "Chicken Breast, Brown Rice, Steamed Broccoli", cals: 550, macros: "45P / 60C / 10F" },
              { meal: "Pre-Workout", items: "Banana, Black Coffee", cals: 120, macros: "1P / 28C / 0F" },
              { meal: "Post-Workout", items: "Whey Protein Isolate (1 scoop)", cals: 120, macros: "25P / 2C / 1F" },
              { meal: "Dinner", items: "Grilled Salmon, Sweet Potato, Asparagus", cals: 600, macros: "40P / 45C / 22F" },
            ].map((m, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold">{m.meal}</h4>
                    <p className="text-sm text-muted-foreground">{m.items}</p>
                  </div>
                  <div className="text-left md:text-right shrink-0">
                    <p className="font-bold font-mono">{m.cals} kcal</p>
                    <p className="text-xs text-muted-foreground">{m.macros}</p>
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
