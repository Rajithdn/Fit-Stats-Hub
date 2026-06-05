import { useState } from "react";
import { useStore, WorkoutLogEntry } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus, Trash2, ClipboardList, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

const POPULAR_EXERCISES = [
  "Bench Press", "Squat", "Deadlift", "Overhead Press", "Barbell Row",
  "Pull-Ups", "Dips", "Bicep Curl", "Tricep Pushdown", "Leg Press",
  "Romanian Deadlift", "Lat Pulldown", "Cable Row", "Incline Press",
  "Shoulder Press", "Lateral Raise", "Leg Curl", "Leg Extension",
  "Push-Ups", "Plank",
];

const today = () => new Date().toISOString().split("T")[0];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function WorkoutLogger() {
  const { workoutLogs, addWorkoutLog, removeWorkoutLog } = useStore();

  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("0");
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [notes, setNotes] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedDate, setExpandedDate] = useState<string | null>(today());

  const filtered = POPULAR_EXERCISES.filter(
    (e) => e.toLowerCase().includes(exercise.toLowerCase()) && exercise.length > 0
  );

  function handleAdd() {
    if (!exercise.trim()) return;
    const entry: WorkoutLogEntry = {
      id: crypto.randomUUID(),
      date: today(),
      exercise: exercise.trim(),
      sets: Number(sets) || 1,
      reps: Number(reps) || 1,
      weight: Number(weight) || 0,
      unit,
      notes: notes.trim(),
    };
    addWorkoutLog(entry);
    setExercise("");
    setSets("3");
    setReps("10");
    setWeight("0");
    setNotes("");
  }

  const grouped: Record<string, WorkoutLogEntry[]> = {};
  for (const log of workoutLogs) {
    if (!grouped[log.date]) grouped[log.date] = [];
    grouped[log.date].push(log);
  }
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const totalSets = workoutLogs.reduce((s, l) => s + l.sets, 0);
  const uniqueExercises = new Set(workoutLogs.map((l) => l.exercise)).size;

  const personalBests: Record<string, { weight: number; unit: string }> = {};
  for (const log of workoutLogs) {
    const key = log.exercise;
    if (!personalBests[key] || log.weight > personalBests[key].weight) {
      personalBests[key] = { weight: log.weight, unit: log.unit };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Workout Logger</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your sets, reps, and weight for every exercise
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{workoutLogs.length}</p>
              <p className="text-xs text-muted-foreground">Total Exercises</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSets}</p>
              <p className="text-xs text-muted-foreground">Total Sets</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{uniqueExercises}</p>
              <p className="text-xs text-muted-foreground">Unique Exercises</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Log an Exercise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Exercise name (e.g. Bench Press)"
              value={exercise}
              onChange={(e) => { setExercise(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="bg-background/50"
            />
            {showSuggestions && filtered.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filtered.map((ex) => (
                  <button
                    key={ex}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent/10 transition-colors"
                    onMouseDown={() => { setExercise(ex); setShowSuggestions(false); }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sets</label>
              <Input
                type="number"
                min="1"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Reps</label>
              <Input
                type="number"
                min="1"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Weight</label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Unit</label>
              <div className="flex rounded-md overflow-hidden border border-border h-10">
                <button
                  className={`flex-1 text-sm font-medium transition-colors ${unit === "kg" ? "bg-primary text-primary-foreground" : "bg-background/50 text-muted-foreground hover:bg-accent/10"}`}
                  onClick={() => setUnit("kg")}
                >
                  kg
                </button>
                <button
                  className={`flex-1 text-sm font-medium transition-colors ${unit === "lbs" ? "bg-primary text-primary-foreground" : "bg-background/50 text-muted-foreground hover:bg-accent/10"}`}
                  onClick={() => setUnit("lbs")}
                >
                  lbs
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes (optional)</label>
            <Input
              placeholder="e.g. felt strong, paused reps..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <Button onClick={handleAdd} disabled={!exercise.trim()} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add to Log
          </Button>
        </CardContent>
      </Card>

      {Object.keys(personalBests).length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Personal Bests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(personalBests).map(([ex, pb]) => (
                <div key={ex} className="bg-background/50 rounded-lg px-3 py-2 flex flex-col">
                  <span className="text-xs text-muted-foreground truncate">{ex}</span>
                  <span className="text-sm font-bold text-amber-400">{pb.weight} {pb.unit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          History
        </h2>
        {sortedDates.length === 0 && (
          <Card className="bg-card/30 border-border/30">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No workouts logged yet. Add your first exercise above!</p>
            </CardContent>
          </Card>
        )}
        {sortedDates.map((date) => {
          const isOpen = expandedDate === date;
          const entries = grouped[date];
          return (
            <Card key={date} className="bg-card/50 border-border/50 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/5 transition-colors"
                onClick={() => setExpandedDate(isOpen ? null : date)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">{formatDate(date)}</span>
                  {date === today() && (
                    <Badge variant="outline" className="text-xs border-primary/50 text-primary">Today</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{entries.length} exercise{entries.length !== 1 ? "s" : ""}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {isOpen && (
                <div className="border-t border-border/50">
                  {entries.map((log) => (
                    <div key={log.id} className="flex items-center justify-between px-4 py-3 border-b border-border/20 last:border-0 hover:bg-accent/5 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{log.exercise}</p>
                        <div className="flex gap-3 mt-0.5">
                          <span className="text-xs text-muted-foreground">{log.sets} sets</span>
                          <span className="text-xs text-muted-foreground">{log.reps} reps</span>
                          {log.weight > 0 && (
                            <span className="text-xs text-primary font-medium">{log.weight} {log.unit}</span>
                          )}
                        </div>
                        {log.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{log.notes}</p>}
                      </div>
                      <button
                        onClick={() => removeWorkoutLog(log.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
