import { useState } from "react";
import { useStore, FoodEntry } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Trash2 } from "lucide-react";

// Mock Food Database
const foodDatabase: FoodEntry[] = [
  { id: "f1", name: "Egg (1 Large)", calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0 },
  { id: "f2", name: "Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { id: "f3", name: "Rice, Cooked (100g)", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  { id: "f4", name: "Oats (50g)", calories: 195, protein: 6.5, carbs: 33, fat: 3.5, fiber: 5 },
  { id: "f5", name: "Paneer (100g)", calories: 265, protein: 18, carbs: 1.2, fat: 20, fiber: 0 },
  { id: "f6", name: "Milk, Whole (250ml)", calories: 150, protein: 8, carbs: 12, fat: 8, fiber: 0 },
  { id: "f7", name: "Banana (1 Medium)", calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3.1 },
  { id: "f8", name: "Apple (1 Medium)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 },
  { id: "f9", name: "Almonds (30g)", calories: 170, protein: 6, carbs: 6, fat: 15, fiber: 3.5 },
  { id: "f10", name: "Salmon (100g)", calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
];

export function Nutrition() {
  const { dailyLog, addFoodToLog, removeFoodFromLog } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFoods = foodDatabase.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const consumedCalories = dailyLog.foods.reduce((acc, f) => acc + f.calories, 0);
  const consumedProtein = dailyLog.foods.reduce((acc, f) => acc + f.protein, 0);
  const consumedCarbs = dailyLog.foods.reduce((acc, f) => acc + f.carbs, 0);
  const consumedFat = dailyLog.foods.reduce((acc, f) => acc + f.fat, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Food Search */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Food Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-food-search"
              />
            </div>
            <div className="h-[400px] overflow-y-auto pr-2 space-y-3">
              {filteredFoods.map((food) => (
                <div key={food.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-accent/5 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => addFoodToLog({ ...food, id: Math.random().toString() })}
                    data-testid={`button-add-food-${food.id}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {filteredFoods.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-10">No foods found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Log */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle>Today's Log</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="grid grid-cols-4 gap-2 mb-4 p-3 rounded-lg bg-secondary/10 border border-secondary/20 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Calories</p>
                <p className="font-bold font-mono">{consumedCalories}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Protein</p>
                <p className="font-bold font-mono">{consumedProtein}g</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Carbs</p>
                <p className="font-bold font-mono">{consumedCarbs}g</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fat</p>
                <p className="font-bold font-mono">{consumedFat}g</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[340px]">
              {dailyLog.foods.map((food) => (
                <div key={food.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-accent/5 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeFoodFromLog(food.id)}
                    data-testid={`button-remove-food-${food.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {dailyLog.foods.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-10">No foods logged today.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
