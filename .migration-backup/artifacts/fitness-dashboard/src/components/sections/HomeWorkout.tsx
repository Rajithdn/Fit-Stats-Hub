import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Play, Pause, RotateCcw, ChevronDown, ChevronUp, CheckCircle2, Circle, Timer, Flame } from "lucide-react";

type Exercise = {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  muscle: string;
  description: string;
};

type Routine = {
  name: string;
  duration: string;
  calories: string;
  level: string;
  exercises: Exercise[];
};

const MUSCLE_COLORS: Record<string, string> = {
  chest: "#3b82f6",
  back: "#10b981",
  legs: "#f59e0b",
  shoulders: "#a78bfa",
  biceps: "#f43f5e",
  triceps: "#fb923c",
  core: "#34d399",
  glutes: "#fbbf24",
  calves: "#60a5fa",
  cardio: "#f97316",
  full: "#8b5cf6",
};

const ROUTINES: Routine[] = [
  {
    name: "Morning Energizer",
    duration: "20 min",
    calories: "150–200",
    level: "Beginner",
    exercises: [
      { name: "Jumping Jacks", sets: "3", reps: "30", rest: "30 s", muscle: "cardio", description: "Feet together, jump and spread arms and legs, then return." },
      { name: "Push-Ups", sets: "3", reps: "12", rest: "45 s", muscle: "chest", description: "Keep body straight, lower chest to the floor, push up." },
      { name: "Bodyweight Squats", sets: "3", reps: "15", rest: "45 s", muscle: "legs", description: "Feet shoulder-width, sit back and down, thighs parallel to floor." },
      { name: "Plank Hold", sets: "3", reps: "30 s", rest: "30 s", muscle: "core", description: "Forearms and toes, keep hips level, squeeze core." },
      { name: "Glute Bridge", sets: "3", reps: "15", rest: "30 s", muscle: "glutes", description: "Lie on back, feet flat, push hips up and squeeze glutes." },
      { name: "Mountain Climbers", sets: "3", reps: "20", rest: "30 s", muscle: "core", description: "High plank position, drive knees to chest alternately, fast pace." },
    ],
  },
  {
    name: "Full Body Burn",
    duration: "30 min",
    calories: "250–320",
    level: "Intermediate",
    exercises: [
      { name: "Burpees", sets: "4", reps: "10", rest: "45 s", muscle: "full", description: "Squat, kick back, push-up, jump up with hands overhead." },
      { name: "Diamond Push-Ups", sets: "4", reps: "10", rest: "45 s", muscle: "triceps", description: "Hands close together forming a diamond, elbows in tight." },
      { name: "Jump Squats", sets: "4", reps: "12", rest: "45 s", muscle: "legs", description: "Squat down, explode up, land softly and go straight into next squat." },
      { name: "Pike Push-Ups", sets: "3", reps: "10", rest: "45 s", muscle: "shoulders", description: "Hips high in an inverted V, lower head towards floor." },
      { name: "Reverse Lunges", sets: "3", reps: "12/leg", rest: "45 s", muscle: "legs", description: "Step back, drop knee near floor, push through front heel to return." },
      { name: "Bicycle Crunch", sets: "3", reps: "20", rest: "30 s", muscle: "core", description: "Alternately bring elbow to opposite knee while extending the other leg." },
      { name: "Superman Hold", sets: "3", reps: "12", rest: "30 s", muscle: "back", description: "Lie face down, lift arms, chest and legs off the floor simultaneously." },
    ],
  },
  {
    name: "Core & Abs",
    duration: "20 min",
    calories: "100–150",
    level: "All Levels",
    exercises: [
      { name: "Plank Hold", sets: "3", reps: "45 s", rest: "30 s", muscle: "core", description: "Forearms and toes, keep hips level, breathe steadily." },
      { name: "Crunches", sets: "3", reps: "20", rest: "30 s", muscle: "core", description: "Feet flat, hands behind head, lift shoulders off ground." },
      { name: "Leg Raise", sets: "3", reps: "15", rest: "30 s", muscle: "core", description: "Lie flat, raise legs to 90°, lower slowly without touching the floor." },
      { name: "Russian Twist", sets: "3", reps: "20", rest: "30 s", muscle: "core", description: "Sit at 45°, rotate torso side to side, feet off floor for extra challenge." },
      { name: "Side Plank (each side)", sets: "3", reps: "30 s", rest: "20 s", muscle: "core", description: "Forearm on floor, hips stacked, hold body in a straight line." },
      { name: "Dead Bug", sets: "3", reps: "10/side", rest: "30 s", muscle: "core", description: "On back, arms up, alternate lowering opposite arm and leg slowly." },
    ],
  },
  {
    name: "HIIT Cardio Blast",
    duration: "25 min",
    calories: "280–350",
    level: "Advanced",
    exercises: [
      { name: "High Knees (40 s on / 20 s off)", sets: "4", reps: "rounds", rest: "20 s", muscle: "cardio", description: "Run in place driving knees as high as possible, arms pumping." },
      { name: "Burpee Jump", sets: "5", reps: "10", rest: "30 s", muscle: "full", description: "Full burpee with an explosive jump and clap at the top." },
      { name: "Speed Squat", sets: "4", reps: "20", rest: "30 s", muscle: "legs", description: "Half-squat position, pulse fast for 20 reps at maximum speed." },
      { name: "Push-Up to Downward Dog", sets: "4", reps: "10", rest: "30 s", muscle: "chest", description: "Push-up then shift back into downward dog, stretching lats." },
      { name: "Jump Lunge", sets: "4", reps: "10/leg", rest: "40 s", muscle: "legs", description: "Split-jump switching legs in mid-air, land softly each time." },
      { name: "Plank Jack", sets: "3", reps: "20", rest: "30 s", muscle: "core", description: "In high plank, jump feet wide and back together like a jumping jack." },
    ],
  },
];

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(true);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      ref.current = setInterval(() => setRemaining((r) => r - 1), 1000);
    } else if (remaining <= 0) {
      onDone();
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, remaining]);

  const pct = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="flex items-center gap-3 bg-primary/10 rounded-lg p-3">
      <div className="relative w-10 h-10 shrink-0">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
          <circle
            cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3"
            className="text-primary"
            strokeDasharray="94.2"
            strokeDashoffset={94.2 - (pct / 100) * 94.2}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{remaining}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">Rest Timer</p>
        <p className="text-xs text-muted-foreground">{remaining}s remaining</p>
      </div>
      <Button size="sm" variant="outline" onClick={() => setRunning((r) => !r)}>
        {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </Button>
      <Button size="sm" variant="outline" onClick={onDone}>
        <RotateCcw className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

export function HomeWorkout() {
  const [selected, setSelected] = useState<Routine | null>(null);
  const [expandedEx, setExpandedEx] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [restFor, setRestFor] = useState<number | null>(null);

  function parseRest(rest: string): number {
    const match = rest.match(/(\d+)/);
    return match ? parseInt(match[1]) : 30;
  }

  function startRoutine(r: Routine) {
    setSelected(r);
    setCompleted(new Set());
    setExpandedEx(0);
    setRestFor(null);
  }

  function markDone(idx: number, restStr: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
    setRestFor(parseRest(restStr));
  }

  const levelColor: Record<string, string> = {
    Beginner: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
    Intermediate: "text-blue-400 border-blue-400/40 bg-blue-400/10",
    Advanced: "text-red-400 border-red-400/40 bg-red-400/10",
    "All Levels": "text-purple-400 border-purple-400/40 bg-purple-400/10",
  };

  if (selected) {
    const allDone = selected.exercises.every((_, i) => completed.has(i));
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{selected.name}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {completed.size} / {selected.exercises.length} exercises done
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
            ← Back
          </Button>
        </div>

        <div className="w-full bg-border rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completed.size / selected.exercises.length) * 100}%` }}
          />
        </div>

        {allDone && (
          <Card className="bg-emerald-500/10 border-emerald-500/30">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-emerald-400">Workout Complete! Great job!</p>
              <p className="text-sm text-muted-foreground mt-1">
                You burned approx. {selected.calories} kcal
              </p>
              <Button className="mt-3" onClick={() => setSelected(null)}>Done</Button>
            </CardContent>
          </Card>
        )}

        {restFor !== null && (
          <RestTimer seconds={restFor} onDone={() => setRestFor(null)} />
        )}

        <div className="space-y-2">
          {selected.exercises.map((ex, idx) => {
            const done = completed.has(idx);
            const isOpen = expandedEx === idx;
            const color = MUSCLE_COLORS[ex.muscle] ?? "#94a3b8";
            return (
              <Card
                key={idx}
                className={`border-border/50 transition-all ${done ? "opacity-60 bg-card/20" : "bg-card/50"}`}
              >
                <button
                  className="w-full flex items-center gap-3 p-4 text-left"
                  onClick={() => setExpandedEx(isOpen ? null : idx)}
                >
                  <div className="shrink-0">
                    {done
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      : <Circle className="w-5 h-5 text-muted-foreground" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium text-sm ${done ? "line-through text-muted-foreground" : ""}`}>
                        {ex.name}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ color, background: `${color}18` }}>
                        {ex.muscle}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ex.sets} sets · {ex.reps} reps · rest {ex.rest}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
                    <p className="text-sm text-muted-foreground">{ex.description}</p>
                    <div className="flex gap-2">
                      {!done && (
                        <Button size="sm" onClick={() => markDone(idx, ex.rest)} className="flex-1">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Mark Done & Rest
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Home className="w-6 h-6 text-primary" />
          Home Workout
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          No gym needed — effective bodyweight routines you can do anywhere
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROUTINES.map((routine) => (
          <Card
            key={routine.name}
            className="bg-card/50 border-border/50 hover:border-primary/40 transition-all cursor-pointer group"
            onClick={() => startRoutine(routine)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {routine.name}
                </CardTitle>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${levelColor[routine.level]}`}>
                  {routine.level}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Timer className="w-4 h-4" />
                  <span>{routine.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>{routine.calories} kcal</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {routine.exercises.slice(0, 4).map((ex) => (
                  <span
                    key={ex.name}
                    className="text-xs px-2 py-0.5 rounded-full bg-background/50 border border-border/50"
                  >
                    {ex.name}
                  </span>
                ))}
                {routine.exercises.length > 4 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-background/50 border border-border/50 text-muted-foreground">
                    +{routine.exercises.length - 4} more
                  </span>
                )}
              </div>
              <Button size="sm" className="w-full mt-1" onClick={(e) => { e.stopPropagation(); startRoutine(routine); }}>
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Start Workout
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
