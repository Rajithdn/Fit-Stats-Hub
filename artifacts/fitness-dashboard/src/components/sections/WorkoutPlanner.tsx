import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell } from "lucide-react";

export function WorkoutPlanner() {
  const [category, setCategory] = useState("Muscle Gain");

  const days = ["Day 1: Push", "Day 2: Pull", "Day 3: Legs", "Day 4: Rest", "Day 5: Upper", "Day 6: Lower", "Day 7: Rest"];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Workout Planner</h2>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-workout-category">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Weight Loss">Weight Loss</SelectItem>
            <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
            <SelectItem value="Home Workout">Home Workout</SelectItem>
            <SelectItem value="Gym Workout">Gym Workout</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {days.map((day, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg flex items-center justify-between">
                {day}
                {day.includes("Rest") ? null : <Dumbbell className="w-4 h-4 text-primary" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {day.includes("Rest") ? (
                <div className="h-32 flex items-center justify-center text-muted-foreground italic">
                  Active Recovery or Rest
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { name: "Barbell Bench Press", sets: "4 × 8-10", rest: "90s" },
                    { name: "Incline Dumbbell Press", sets: "3 × 10-12", rest: "60s" },
                    { name: "Overhead Triceps Extension", sets: "3 × 12-15", rest: "60s" },
                    { name: "Lateral Raises", sets: "4 × 15-20", rest: "45s" },
                  ].map((ex, j) => (
                    <div key={j} className="text-sm">
                      <div className="font-medium flex justify-between">
                        <span>{ex.name}</span>
                        <span className="text-muted-foreground font-mono">{ex.sets}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Rest: {ex.rest}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
