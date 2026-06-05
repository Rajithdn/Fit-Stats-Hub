import { useState } from "react";
import { useStore, FoodEntry } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Trash2, Flame, Beef, Wheat, Zap, Droplets } from "lucide-react";

type FoodRow = Omit<FoodEntry, "id"> & { category: string };

const FOOD_DB: FoodRow[] = [
  // Proteins
  { name: "Egg (1 Large)",             calories: 72,  protein: 6.3, carbs: 0.4, fat: 4.8,  fiber: 0,   category: "Protein" },
  { name: "Chicken Breast (100g)",     calories: 165, protein: 31,  carbs: 0,   fat: 3.6,  fiber: 0,   category: "Protein" },
  { name: "Grilled Salmon (100g)",     calories: 208, protein: 20,  carbs: 0,   fat: 13,   fiber: 0,   category: "Protein" },
  { name: "Tuna, Canned (100g)",       calories: 116, protein: 26,  carbs: 0,   fat: 1,    fiber: 0,   category: "Protein" },
  { name: "Greek Yogurt (150g)",       calories: 100, protein: 17,  carbs: 6,   fat: 0.7,  fiber: 0,   category: "Protein" },
  { name: "Cottage Cheese (100g)",     calories: 98,  protein: 11,  carbs: 3.4, fat: 4.3,  fiber: 0,   category: "Protein" },
  { name: "Paneer (100g)",             calories: 265, protein: 18,  carbs: 1.2, fat: 20,   fiber: 0,   category: "Protein" },
  { name: "Whey Protein Shake (1 scoop)", calories: 120, protein: 25, carbs: 3, fat: 1.5,  fiber: 0,   category: "Protein" },
  { name: "Beef, Lean (100g)",         calories: 215, protein: 26,  carbs: 0,   fat: 12,   fiber: 0,   category: "Protein" },
  { name: "Turkey Breast (100g)",      calories: 135, protein: 30,  carbs: 0,   fat: 1,    fiber: 0,   category: "Protein" },
  { name: "Tofu, Firm (100g)",         calories: 76,  protein: 8,   carbs: 2,   fat: 4,    fiber: 0.3, category: "Protein" },
  { name: "Lentils, Cooked (100g)",    calories: 116, protein: 9,   carbs: 20,  fat: 0.4,  fiber: 8,   category: "Protein" },

  // Carbs
  { name: "Brown Rice, Cooked (100g)", calories: 123, protein: 2.7, carbs: 26,  fat: 0.9,  fiber: 1.8, category: "Carbs" },
  { name: "White Rice, Cooked (100g)", calories: 130, protein: 2.7, carbs: 28,  fat: 0.3,  fiber: 0.4, category: "Carbs" },
  { name: "Oats (50g dry)",            calories: 195, protein: 6.5, carbs: 33,  fat: 3.5,  fiber: 5,   category: "Carbs" },
  { name: "Whole Wheat Bread (1 slice)", calories: 80, protein: 4,  carbs: 14,  fat: 1,    fiber: 2,   category: "Carbs" },
  { name: "Sweet Potato (100g)",       calories: 86,  protein: 1.6, carbs: 20,  fat: 0.1,  fiber: 3,   category: "Carbs" },
  { name: "Quinoa, Cooked (100g)",     calories: 120, protein: 4.4, carbs: 21,  fat: 1.9,  fiber: 2.8, category: "Carbs" },
  { name: "Pasta, Cooked (100g)",      calories: 158, protein: 5.8, carbs: 31,  fat: 0.9,  fiber: 1.8, category: "Carbs" },

  // Fruits
  { name: "Banana (1 Medium)",         calories: 105, protein: 1.3, carbs: 27,  fat: 0.3,  fiber: 3.1, category: "Fruits" },
  { name: "Apple (1 Medium)",          calories: 95,  protein: 0.5, carbs: 25,  fat: 0.3,  fiber: 4.4, category: "Fruits" },
  { name: "Orange (1 Medium)",         calories: 62,  protein: 1.2, carbs: 15,  fat: 0.2,  fiber: 3.1, category: "Fruits" },
  { name: "Strawberries (100g)",       calories: 32,  protein: 0.7, carbs: 7.7, fat: 0.3,  fiber: 2,   category: "Fruits" },
  { name: "Blueberries (100g)",        calories: 57,  protein: 0.7, carbs: 14,  fat: 0.3,  fiber: 2.4, category: "Fruits" },
  { name: "Avocado (½ medium)",        calories: 120, protein: 1.5, carbs: 6.5, fat: 11,   fiber: 5,   category: "Fruits" },
  { name: "Mango (100g)",              calories: 60,  protein: 0.8, carbs: 15,  fat: 0.4,  fiber: 1.6, category: "Fruits" },

  // Vegetables
  { name: "Broccoli (100g)",           calories: 34,  protein: 2.8, carbs: 7,   fat: 0.4,  fiber: 2.6, category: "Vegetables" },
  { name: "Spinach (100g)",            calories: 23,  protein: 2.9, carbs: 3.6, fat: 0.4,  fiber: 2.2, category: "Vegetables" },
  { name: "Carrot (100g)",             calories: 41,  protein: 0.9, carbs: 10,  fat: 0.2,  fiber: 2.8, category: "Vegetables" },

  // Fats
  { name: "Almonds (30g)",             calories: 170, protein: 6,   carbs: 6,   fat: 15,   fiber: 3.5, category: "Fats" },
  { name: "Peanut Butter (2 tbsp)",    calories: 190, protein: 8,   carbs: 7,   fat: 16,   fiber: 2,   category: "Fats" },
  { name: "Olive Oil (1 tbsp)",        calories: 119, protein: 0,   carbs: 0,   fat: 14,   fiber: 0,   category: "Fats" },
  { name: "Walnuts (30g)",             calories: 185, protein: 4,   carbs: 4,   fat: 18,   fiber: 2,   category: "Fats" },

  // Dairy
  { name: "Milk, Whole (250ml)",       calories: 150, protein: 8,   carbs: 12,  fat: 8,    fiber: 0,   category: "Dairy" },
  { name: "Milk, Skim (250ml)",        calories: 90,  protein: 9,   carbs: 13,  fat: 0.2,  fiber: 0,   category: "Dairy" },
  { name: "Cheddar Cheese (30g)",      calories: 120, protein: 7,   carbs: 0.5, fat: 10,   fiber: 0,   category: "Dairy" },
];

const CATEGORIES = ["All", "Protein", "Carbs", "Fruits", "Vegetables", "Fats", "Dairy"];

const SERVINGS_OPTIONS = ["0.5×", "1×", "1.5×", "2×", "3×"];

function scaleFood(food: FoodRow, mult: number): Omit<FoodEntry, "id"> {
  return {
    name: mult !== 1 ? `${food.name} ×${mult}` : food.name,
    calories: Math.round(food.calories * mult),
    protein:  Math.round(food.protein  * mult * 10) / 10,
    carbs:    Math.round(food.carbs    * mult * 10) / 10,
    fat:      Math.round(food.fat      * mult * 10) / 10,
    fiber:    Math.round((food.fiber ?? 0) * mult * 10) / 10,
  };
}

const MACRO_COLORS = {
  calories: "#10b981",
  protein:  "#3b82f6",
  carbs:    "#f59e0b",
  fat:      "#f43f5e",
};

export function Nutrition() {
  const { dailyLog, addFoodToLog, removeFoodFromLog } = useStore();
  const [searchTerm, setSearchTerm]   = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [servings, setServings]       = useState<Record<string, number>>({});

  const getServing = (name: string) => servings[name] ?? 1;

  const filtered = FOOD_DB.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat    = activeCategory === "All" || f.category === activeCategory;
    return matchSearch && matchCat;
  });

  const totals = {
    calories: dailyLog.foods.reduce((a, f) => a + f.calories, 0),
    protein:  Math.round(dailyLog.foods.reduce((a, f) => a + f.protein, 0) * 10) / 10,
    carbs:    Math.round(dailyLog.foods.reduce((a, f) => a + f.carbs, 0)   * 10) / 10,
    fat:      Math.round(dailyLog.foods.reduce((a, f) => a + f.fat, 0)     * 10) / 10,
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Macro summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["calories", "protein", "carbs", "fat"] as const).map((key) => {
          const icons = { calories: <Flame className="w-3.5 h-3.5" />, protein: <Beef className="w-3.5 h-3.5" />, carbs: <Wheat className="w-3.5 h-3.5" />, fat: <Zap className="w-3.5 h-3.5" /> };
          const units = { calories: "kcal", protein: "g", carbs: "g", fat: "g" };
          return (
            <Card key={key} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${MACRO_COLORS[key]}18`, color: MACRO_COLORS[key] }}>
                  {icons[key]}
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground capitalize">{key}</p>
                  <p className="font-bold font-mono text-base">{totals[key]} <span className="text-xs font-normal text-muted-foreground">{units[key]}</span></p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Food Search Panel ── */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="w-4 h-4 text-primary" /> Food Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search 35+ foods…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-food-search"
              />
            </div>

            {/* Category filter chips */}
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Food list */}
            <div className="h-[360px] overflow-y-auto pr-1 space-y-2">
              {filtered.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-12">No foods found.</p>
              )}
              {filtered.map((food) => {
                const mult = getServing(food.name);
                const scaled = scaleFood(food, mult);
                return (
                  <div
                    key={food.name}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-border/40 hover:bg-accent/5 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-medium text-sm truncate">{food.name}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">{food.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-emerald-400 font-medium">{scaled.calories} kcal</span>
                        {" · "}P {scaled.protein}g · C {scaled.carbs}g · F {scaled.fat}g
                        {food.fiber > 0 && ` · Fiber ${Math.round(food.fiber * mult * 10) / 10}g`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Select
                        value={String(mult)}
                        onValueChange={(v) => setServings((s) => ({ ...s, [food.name]: Number(v) }))}
                      >
                        <SelectTrigger className="h-7 w-14 text-xs px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVINGS_OPTIONS.map((opt, i) => {
                            const val = [0.5, 1, 1.5, 2, 3][i];
                            return <SelectItem key={opt} value={String(val)}>{opt}</SelectItem>;
                          })}
                        </SelectContent>
                      </Select>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-primary hover:bg-primary/10 hover:text-primary"
                        onClick={() => addFoodToLog({ ...scaled, id: `${food.name}-${Date.now()}` })}
                        data-testid={`button-add-food-${food.name.replace(/\s+/g, "-").toLowerCase()}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Today's Log Panel ── */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-primary" /> Today's Log
              </span>
              {dailyLog.foods.length > 0 && (
                <Badge variant="secondary" className="font-mono">{dailyLog.foods.length} items</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3">

            {/* Running macro totals */}
            <div className="grid grid-cols-4 gap-2 p-3 rounded-xl border border-border/40 bg-secondary/10 text-center">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Cal</p>
                <p className="font-bold font-mono text-sm text-emerald-400">{totals.calories}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Protein</p>
                <p className="font-bold font-mono text-sm text-blue-400">{totals.protein}g</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Carbs</p>
                <p className="font-bold font-mono text-sm text-amber-400">{totals.carbs}g</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Fat</p>
                <p className="font-bold font-mono text-sm text-rose-400">{totals.fat}g</p>
              </div>
            </div>

            {/* Logged items */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[340px] pr-1">
              {dailyLog.foods.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                  <Search className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Search for a food and tap + to log it.</p>
                </div>
              )}
              {dailyLog.foods.map((food, idx) => (
                <div
                  key={food.id}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border/40 hover:bg-accent/5 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-emerald-400">{food.calories} kcal</span>
                      {" · "}P {food.protein}g · C {food.carbs}g · F {food.fat}g
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFoodFromLog(food.id)}
                    data-testid={`button-remove-food-${food.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
