import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Activity, Flame, Droplets, Moon, Dumbbell, Apple, Zap, TrendingDown, TrendingUp, Minus } from "lucide-react";

function MacroPieChart({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat || 1;
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 72;
  const ir = 48;
  const gap = 3;

  function slice(startDeg: number, endDeg: number, color: string, key: string) {
    const toRad = (d: number) => (d - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const xi1 = cx + ir * Math.cos(toRad(startDeg));
    const yi1 = cy + ir * Math.sin(toRad(startDeg));
    const xi2 = cx + ir * Math.cos(toRad(endDeg));
    const yi2 = cy + ir * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    const d = `M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ir} ${ir} 0 ${large} 0 ${xi1} ${yi1} Z`;
    return <path key={key} d={d} fill={color} opacity={0.9} />;
  }

  const slices = [
    { label: 'Protein', value: protein, color: '#10b981' },
    { label: 'Carbs', value: carbs, color: '#3b82f6' },
    { label: 'Fat', value: fat, color: '#f59e0b' },
  ];

  let current = 0;
  const paths = slices.map((s) => {
    const sweep = (s.value / total) * (360 - gap * 3);
    const start = current + (current === 0 ? 0 : gap);
    const end = start + sweep;
    current = end;
    return slice(start, end, s.color, s.label);
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#94a3b8" fontSize="11">Total</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#f1f5f9" fontSize="16" fontWeight="bold">{total.toFixed(0)}g</text>
    </svg>
  );
}

const RAW_OFFSETS = [0.12, -0.08, 0.25, -0.15, 0.18, -0.22, 0.09, 0.31, -0.19, 0.14,
  -0.11, 0.27, -0.06, 0.21, -0.24, 0.16, -0.13, 0.08, 0.29, -0.17,
  0.11, -0.09, 0.23, -0.20, 0.15, -0.10, 0.07, 0.22, -0.14, 0.19];

const weightData = Array.from({ length: 30 }).map((_, i) => ({
  day: i + 1,
  weight: parseFloat((85 - (i * 0.1) + RAW_OFFSETS[i]).toFixed(1))
}));

const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

const ACTIVITY_LEVELS = [
  { label: "Sedentary",        desc: "Little or no exercise",          multiplier: 1.2   },
  { label: "Lightly Active",   desc: "Light exercise 1–3 days/week",   multiplier: 1.375 },
  { label: "Moderately Active",desc: "Moderate exercise 3–5 days/week",multiplier: 1.55  },
  { label: "Very Active",      desc: "Hard exercise 6–7 days/week",    multiplier: 1.725 },
  { label: "Super Active",     desc: "Very hard exercise + physical job",multiplier: 1.9  },
];

export function Dashboard() {
  const { userProfile, dailyLog } = useStore();
  const [activityIdx, setActivityIdx] = useState(2);

  // Calculate BMI
  const heightM = userProfile.height / 100;
  const bmi = (userProfile.weight / (heightM * heightM)).toFixed(1);
  let bmiCategory = "Normal";
  let bmiColor = "text-green-500";
  const bmiNum = Number(bmi);
  if (bmiNum < 18.5) { bmiCategory = "Underweight"; bmiColor = "text-blue-500"; }
  else if (bmiNum > 25) { bmiCategory = "Overweight"; bmiColor = "text-amber-500"; }
  else if (bmiNum > 30) { bmiCategory = "Obese"; bmiColor = "text-rose-500"; }

  // BMR — Mifflin-St Jeor
  const bmr = Math.round(
    10 * userProfile.weight +
    6.25 * userProfile.height -
    5 * userProfile.age +
    (userProfile.gender === "male" ? 5 : -161)
  );
  const { multiplier, label: actLabel, desc: actDesc } = ACTIVITY_LEVELS[activityIdx];
  const maintenance = Math.round(bmr * multiplier);
  const cutting     = maintenance - 500;
  const bulking     = maintenance + 500;

  // Calculate Macros from log
  const consumedCalories = dailyLog.foods.reduce((acc, f) => acc + f.calories, 0);
  const consumedProtein = dailyLog.foods.reduce((acc, f) => acc + f.protein, 0);
  const consumedCarbs = dailyLog.foods.reduce((acc, f) => acc + f.carbs, 0);
  const consumedFat = dailyLog.foods.reduce((acc, f) => acc + f.fat, 0);

  const pieData = [
    { name: 'Protein', value: consumedProtein || 1 },
    { name: 'Carbs', value: consumedCarbs || 1 },
    { name: 'Fat', value: consumedFat || 1 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* BMI Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
              Body Mass Index <Activity className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{bmi}</div>
            <p className={`text-xs mt-1 font-medium ${bmiColor}`}>{bmiCategory}</p>
          </CardContent>
        </Card>

        {/* Calories Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
              Calories <Flame className="w-4 h-4 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{consumedCalories} <span className="text-lg text-muted-foreground">/ {userProfile.dailyCalorieGoal}</span></div>
            <Progress value={(consumedCalories / userProfile.dailyCalorieGoal) * 100} className="h-2 mt-3 bg-secondary/20" />
          </CardContent>
        </Card>

        {/* Water Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
              Hydration <Droplets className="w-4 h-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{dailyLog.water}L <span className="text-lg text-muted-foreground">/ 3.0L</span></div>
            <Progress value={(dailyLog.water / 3) * 100} className="h-2 mt-3 bg-secondary/20" />
          </CardContent>
        </Card>

        {/* Sleep Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
              Sleep <Moon className="w-4 h-4 text-indigo-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{dailyLog.sleep}h <span className="text-lg text-muted-foreground">/ 8.0h</span></div>
            <Progress value={(dailyLog.sleep / 8) * 100} className="h-2 mt-3 bg-secondary/20" />
          </CardContent>
        </Card>
      </div>

      {/* BMR & TDEE Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50" data-testid="card-bmr-tdee">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            BMR &amp; TDEE Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Activity Level</span>
              <span className="text-sm font-semibold text-primary">{actLabel}</span>
            </div>
            <input
              data-testid="slider-activity"
              type="range"
              min={0}
              max={4}
              step={1}
              value={activityIdx}
              onChange={(e) => setActivityIdx(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${activityIdx * 25}%, #1e293b ${activityIdx * 25}%, #1e293b 100%)`,
              }}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
              {ACTIVITY_LEVELS.map((a, i) => (
                <span
                  key={a.label}
                  className={`cursor-pointer transition-colors ${i === activityIdx ? "text-primary font-semibold" : ""}`}
                  onClick={() => setActivityIdx(i)}
                >
                  {a.label.split(" ")[0]}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center italic">{actDesc}</p>
          </div>

          {/* Values grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl p-3 bg-muted/30 border border-border/40 text-center space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">BMR</p>
              <p className="text-2xl font-bold font-mono text-foreground" data-testid="value-bmr">{bmr.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">kcal / day at rest</p>
            </div>
            <div className="rounded-xl p-3 border text-center space-y-1" style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.25)" }}>
              <div className="flex items-center justify-center gap-1">
                <Minus className="w-3 h-3 text-blue-400" />
                <p className="text-[11px] text-blue-400 uppercase tracking-wide">Cutting</p>
              </div>
              <p className="text-2xl font-bold font-mono text-blue-400" data-testid="value-cutting">{cutting.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">kcal • −500 deficit</p>
            </div>
            <div className="rounded-xl p-3 border text-center space-y-1" style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.35)" }}>
              <div className="flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-primary" />
                <p className="text-[11px] text-primary uppercase tracking-wide">Maintenance</p>
              </div>
              <p className="text-2xl font-bold font-mono text-primary" data-testid="value-maintenance">{maintenance.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">kcal • TDEE</p>
            </div>
            <div className="rounded-xl p-3 border text-center space-y-1" style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }}>
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-amber-400" />
                <p className="text-[11px] text-amber-400 uppercase tracking-wide">Bulking</p>
              </div>
              <p className="text-2xl font-bold font-mono text-amber-400" data-testid="value-bulking">{bulking.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">kcal • +500 surplus</p>
            </div>
          </div>

          {/* Multiplier bar */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="shrink-0">Activity multiplier</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((multiplier - 1.2) / (1.9 - 1.2)) * 100}%`,
                  backgroundColor: "#10b981",
                }}
              />
            </div>
            <span className="shrink-0 font-mono font-semibold text-foreground">×{multiplier}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Progress Chart */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Weight Trend (30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickCount={5} tickFormatter={(v) => `${v}kg`} width={50} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Macro Distribution */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Macro Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-2">
            <MacroPieChart protein={consumedProtein} carbs={consumedCarbs} fat={consumedFat} />
            <div className="flex justify-center gap-4 text-sm mt-4">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }} /><span>Protein</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} /><span>Carbs</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} /><span>Fat</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Today's Workout */}
         <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Today's Workout</CardTitle>
            <Dumbbell className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                <div>
                  <p className="font-medium text-secondary">Upper Body Power</p>
                  <p className="text-xs text-muted-foreground">6 exercises • 45 mins</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">~420</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Meals */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Recent Meals</CardTitle>
            <Apple className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyLog.foods.slice(-3).map((food) => (
                <div key={food.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 hover:bg-accent/5 transition-colors">
                  <span className="font-medium text-sm">{food.name}</span>
                  <div className="flex gap-4 text-xs font-mono text-muted-foreground">
                    <span>{food.protein}P</span>
                    <span>{food.carbs}C</span>
                    <span>{food.fat}F</span>
                    <span className="text-foreground font-bold">{food.calories}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
