import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footprints, Target, Flame, TrendingUp, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const today = () => new Date().toISOString().split("T")[0];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function shortDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function stepsToCalories(steps: number) {
  return Math.round(steps * 0.04);
}

function stepsToKm(steps: number) {
  return (steps * 0.000762).toFixed(2);
}

function StepRing({ current, goal }: { current: number; goal: number }) {
  const pct = Math.min(current / goal, 1);
  const size = 180;
  const r = 78;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - pct * circumference;

  const color = pct >= 1 ? "#10b981" : pct >= 0.7 ? "#3b82f6" : pct >= 0.4 ? "#f59e0b" : "#f43f5e";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="12" className="text-border" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="12"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x={cx} y={cy - 18} textAnchor="middle" fill="#94a3b8" fontSize="12">Steps Today</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill={color} fontSize="26" fontWeight="bold">
        {current.toLocaleString()}
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill="#64748b" fontSize="12">
        / {goal.toLocaleString()}
      </text>
      <text x={cx} y={cy + 48} textAnchor="middle" fill={color} fontSize="13" fontWeight="600">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

export function DailySteps() {
  const { stepEntries, stepGoal, updateStepEntry, setStepGoal } = useStore();

  const todayEntry = stepEntries.find((e) => e.date === today());
  const todaySteps = todayEntry?.steps ?? 0;

  const [inputSteps, setInputSteps] = useState(todaySteps.toString());
  const [inputGoal, setInputGoal] = useState(stepGoal.toString());
  const [editingGoal, setEditingGoal] = useState(false);

  function handleSaveSteps() {
    const val = parseInt(inputSteps) || 0;
    updateStepEntry(today(), val);
  }

  function handleSaveGoal() {
    const val = parseInt(inputGoal) || 10000;
    setStepGoal(val);
    setEditingGoal(false);
  }

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const entry = stepEntries.find((e) => e.date === dateStr);
    return { date: dateStr, day: shortDay(dateStr), steps: entry?.steps ?? 0 };
  });

  const totalWeek = last7.reduce((s, d) => s + d.steps, 0);
  const avgDay = Math.round(totalWeek / 7);
  const daysGoalMet = last7.filter((d) => d.steps >= stepGoal).length;

  const BADGES = [
    { label: "First Step", steps: 1, icon: "🦶" },
    { label: "Casual Walker", steps: 5000, icon: "🚶" },
    { label: "Goal Crusher", steps: 10000, icon: "🎯" },
    { label: "Power Walker", steps: 15000, icon: "⚡" },
    { label: "Marathon Mode", steps: 20000, icon: "🏆" },
  ];
  const earnedBadges = BADGES.filter((b) => todaySteps >= b.steps);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Footprints className="w-6 h-6 text-primary" />
          Daily Steps
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your daily steps and stay active
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6 flex flex-col items-center">
            <StepRing current={todaySteps} goal={stepGoal} />
            <div className="w-full mt-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Update today's steps</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={inputSteps}
                    onChange={(e) => setInputSteps(e.target.value)}
                    className="bg-background/50"
                    placeholder="e.g. 8500"
                  />
                  <Button onClick={handleSaveSteps}>Save</Button>
                </div>
              </div>
              {editingGoal ? (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Daily goal (steps)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1000"
                      step="500"
                      value={inputGoal}
                      onChange={(e) => setInputGoal(e.target.value)}
                      className="bg-background/50"
                    />
                    <Button onClick={handleSaveGoal}>Set</Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setEditingGoal(true)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  <Target className="w-3.5 h-3.5" />
                  Goal: {stepGoal.toLocaleString()} steps — tap to change
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-muted-foreground">Calories Burned</span>
                </div>
                <p className="text-2xl font-bold">{stepsToCalories(todaySteps)}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-muted-foreground">Distance</span>
                </div>
                <p className="text-2xl font-bold">{stepsToKm(todaySteps)}</p>
                <p className="text-xs text-muted-foreground">km</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Footprints className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-muted-foreground">7-Day Avg</span>
                </div>
                <p className="text-2xl font-bold">{avgDay.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">steps/day</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-muted-foreground">Goal Days</span>
                </div>
                <p className="text-2xl font-bold">{daysGoalMet} / 7</p>
                <p className="text-xs text-muted-foreground">this week</p>
              </CardContent>
            </Card>
          </div>

          {earnedBadges.length > 0 && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Today's Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {earnedBadges.map((b) => (
                    <div key={b.label} className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 rounded-full px-3 py-1">
                      <span>{b.icon}</span>
                      <span className="text-xs font-medium text-amber-400">{b.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last7} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#94a3b8" }}
                formatter={(v: number) => [`${v.toLocaleString()} steps`]}
              />
              <Bar dataKey="steps" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {last7.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.steps >= stepGoal ? "#10b981" : entry.steps >= stepGoal * 0.7 ? "#3b82f6" : "#334155"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-3 h-2 rounded-sm bg-emerald-500 inline-block" />
              Goal reached
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-3 h-2 rounded-sm bg-blue-500 inline-block" />
              70%+ of goal
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-3 h-2 rounded-sm bg-slate-600 inline-block" />
              Below 70%
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Step History</CardTitle>
        </CardHeader>
        <CardContent>
          {stepEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No steps logged yet. Start by entering today's steps above.</p>
          ) : (
            <div className="space-y-2">
              {[...stepEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14).map((entry) => {
                const pct = Math.min(entry.steps / stepGoal, 1);
                const color = pct >= 1 ? "bg-emerald-500" : pct >= 0.7 ? "bg-blue-500" : "bg-slate-600";
                return (
                  <div key={entry.date} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-32 shrink-0">
                      {entry.date === today() ? "Today" : formatDate(entry.date)}
                    </span>
                    <div className="flex-1 bg-border rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium w-20 text-right">{entry.steps.toLocaleString()} steps</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
