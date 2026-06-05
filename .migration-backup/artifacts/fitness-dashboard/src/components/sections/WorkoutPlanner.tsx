import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, ChevronDown, ChevronUp, Flame, Timer, Repeat } from "lucide-react";

type Exercise = { name: string; sets: string; reps: string; rest: string; muscle: string };
type WorkoutDay = { label: string; focus: string; isRest?: boolean; exercises: Exercise[] };
type Split = { name: string; desc: string; days: WorkoutDay[] };

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
  hamstrings: "#ef4444",
  quads: "#eab308",
};

const DB: Record<string, Record<string, Split[]>> = {
  "Muscle Gain": {
    splits: [
      {
        name: "Push / Pull / Legs",
        desc: "6-day PPL — optimal for hypertrophy",
        days: [
          {
            label: "Day 1", focus: "Push — Chest, Shoulders, Triceps",
            exercises: [
              { name: "Barbell Bench Press",       sets: "4", reps: "6-8",   rest: "2 min",  muscle: "chest" },
              { name: "Incline Dumbbell Press",     sets: "3", reps: "10-12", rest: "90 s",   muscle: "chest" },
              { name: "Overhead Press (BB)",        sets: "4", reps: "6-8",   rest: "2 min",  muscle: "shoulders" },
              { name: "Lateral Raises",             sets: "4", reps: "15-20", rest: "45 s",   muscle: "shoulders" },
              { name: "Skull Crushers",             sets: "3", reps: "10-12", rest: "60 s",   muscle: "triceps" },
              { name: "Tricep Rope Pushdown",       sets: "3", reps: "12-15", rest: "45 s",   muscle: "triceps" },
            ],
          },
          {
            label: "Day 2", focus: "Pull — Back & Biceps",
            exercises: [
              { name: "Barbell Bent-Over Row",      sets: "4", reps: "6-8",   rest: "2 min",  muscle: "back" },
              { name: "Pull-Ups / Lat Pulldown",    sets: "4", reps: "8-10",  rest: "90 s",   muscle: "back" },
              { name: "Seated Cable Row",           sets: "3", reps: "10-12", rest: "75 s",   muscle: "back" },
              { name: "Face Pulls",                 sets: "3", reps: "15-20", rest: "45 s",   muscle: "shoulders" },
              { name: "Barbell Curl",               sets: "3", reps: "10-12", rest: "60 s",   muscle: "biceps" },
              { name: "Hammer Curl",                sets: "3", reps: "12-15", rest: "45 s",   muscle: "biceps" },
            ],
          },
          {
            label: "Day 3", focus: "Legs — Quads, Hamstrings, Calves",
            exercises: [
              { name: "Barbell Back Squat",         sets: "4", reps: "6-8",   rest: "2.5 min", muscle: "quads" },
              { name: "Romanian Deadlift",          sets: "3", reps: "8-10",  rest: "2 min",   muscle: "hamstrings" },
              { name: "Leg Press",                  sets: "3", reps: "10-12", rest: "90 s",    muscle: "quads" },
              { name: "Leg Curl",                   sets: "3", reps: "12-15", rest: "60 s",    muscle: "hamstrings" },
              { name: "Walking Lunges",             sets: "3", reps: "12/leg", rest: "60 s",   muscle: "quads" },
              { name: "Standing Calf Raise",        sets: "4", reps: "15-20", rest: "45 s",    muscle: "calves" },
            ],
          },
          {
            label: "Day 4", focus: "Push — Volume Day",
            exercises: [
              { name: "Dumbbell Flat Press",        sets: "4", reps: "10-12", rest: "75 s",   muscle: "chest" },
              { name: "Cable Fly",                  sets: "3", reps: "15",    rest: "60 s",   muscle: "chest" },
              { name: "Arnold Press",               sets: "4", reps: "10-12", rest: "75 s",   muscle: "shoulders" },
              { name: "Rear Delt Fly",              sets: "3", reps: "15-20", rest: "45 s",   muscle: "shoulders" },
              { name: "Close-Grip Bench Press",     sets: "3", reps: "10-12", rest: "60 s",   muscle: "triceps" },
              { name: "Overhead Tricep Extension",  sets: "3", reps: "12-15", rest: "45 s",   muscle: "triceps" },
            ],
          },
          {
            label: "Day 5", focus: "Pull — Volume Day",
            exercises: [
              { name: "Dumbbell Row",               sets: "4", reps: "10-12", rest: "75 s",   muscle: "back" },
              { name: "Cable Pullover",             sets: "3", reps: "12-15", rest: "60 s",   muscle: "back" },
              { name: "Chest-Supported Row",        sets: "3", reps: "10-12", rest: "75 s",   muscle: "back" },
              { name: "Incline Dumbbell Curl",      sets: "3", reps: "10-12", rest: "60 s",   muscle: "biceps" },
              { name: "Concentration Curl",         sets: "3", reps: "12-15", rest: "45 s",   muscle: "biceps" },
              { name: "Shrugs",                     sets: "3", reps: "15-20", rest: "45 s",   muscle: "back" },
            ],
          },
          {
            label: "Day 6", focus: "Legs — Volume Day",
            exercises: [
              { name: "Front Squat / Hack Squat",   sets: "4", reps: "10-12", rest: "90 s",   muscle: "quads" },
              { name: "Sumo Deadlift",              sets: "3", reps: "8-10",  rest: "2 min",  muscle: "hamstrings" },
              { name: "Leg Extension",              sets: "3", reps: "15-20", rest: "45 s",   muscle: "quads" },
              { name: "Lying Leg Curl",             sets: "3", reps: "12-15", rest: "60 s",   muscle: "hamstrings" },
              { name: "Glute Kickback",             sets: "3", reps: "15/leg", rest: "45 s",  muscle: "glutes" },
              { name: "Seated Calf Raise",          sets: "4", reps: "20-25", rest: "30 s",   muscle: "calves" },
            ],
          },
          { label: "Day 7", focus: "Rest & Recovery", isRest: true, exercises: [] },
        ],
      },
      {
        name: "Upper / Lower",
        desc: "4-day split — strength + size balance",
        days: [
          {
            label: "Day 1", focus: "Upper A — Strength",
            exercises: [
              { name: "Barbell Bench Press",        sets: "4", reps: "5",     rest: "3 min",  muscle: "chest" },
              { name: "Barbell Row",                sets: "4", reps: "5",     rest: "3 min",  muscle: "back" },
              { name: "Overhead Press (BB)",        sets: "3", reps: "6-8",   rest: "2 min",  muscle: "shoulders" },
              { name: "Weighted Pull-Ups",          sets: "3", reps: "6-8",   rest: "2 min",  muscle: "back" },
              { name: "Barbell Curl",               sets: "2", reps: "8-10",  rest: "60 s",   muscle: "biceps" },
              { name: "Skull Crushers",             sets: "2", reps: "8-10",  rest: "60 s",   muscle: "triceps" },
            ],
          },
          {
            label: "Day 2", focus: "Lower A — Strength",
            exercises: [
              { name: "Barbell Back Squat",         sets: "4", reps: "5",     rest: "3 min",  muscle: "quads" },
              { name: "Romanian Deadlift",          sets: "3", reps: "6-8",   rest: "2.5 min", muscle: "hamstrings" },
              { name: "Leg Press",                  sets: "3", reps: "10",    rest: "2 min",  muscle: "quads" },
              { name: "Leg Curl",                   sets: "3", reps: "10-12", rest: "60 s",   muscle: "hamstrings" },
              { name: "Standing Calf Raise",        sets: "4", reps: "8-12",  rest: "60 s",   muscle: "calves" },
              { name: "Plank",                      sets: "3", reps: "60 s",  rest: "45 s",   muscle: "core" },
            ],
          },
          { label: "Day 3", focus: "Rest & Recovery", isRest: true, exercises: [] },
          {
            label: "Day 4", focus: "Upper B — Hypertrophy",
            exercises: [
              { name: "Incline Dumbbell Press",     sets: "4", reps: "10-12", rest: "75 s",   muscle: "chest" },
              { name: "Cable Row",                  sets: "4", reps: "10-12", rest: "75 s",   muscle: "back" },
              { name: "Dumbbell Shoulder Press",    sets: "3", reps: "12-15", rest: "60 s",   muscle: "shoulders" },
              { name: "Lat Pulldown",               sets: "3", reps: "12-15", rest: "60 s",   muscle: "back" },
              { name: "Superset: Curl + Pushdown",  sets: "3", reps: "12-15", rest: "60 s",   muscle: "biceps" },
              { name: "Cable Fly",                  sets: "3", reps: "15",    rest: "45 s",   muscle: "chest" },
            ],
          },
          {
            label: "Day 5", focus: "Lower B — Hypertrophy",
            exercises: [
              { name: "Hack Squat / Front Squat",   sets: "4", reps: "10-12", rest: "90 s",   muscle: "quads" },
              { name: "Stiff-Leg Deadlift",         sets: "3", reps: "10-12", rest: "90 s",   muscle: "hamstrings" },
              { name: "Walking Lunges",             sets: "3", reps: "12/leg", rest: "60 s",   muscle: "quads" },
              { name: "Leg Extension",              sets: "3", reps: "15-20", rest: "45 s",   muscle: "quads" },
              { name: "Glute Bridge",               sets: "3", reps: "15-20", rest: "45 s",   muscle: "glutes" },
              { name: "Seated Calf Raise",          sets: "4", reps: "20-25", rest: "30 s",   muscle: "calves" },
            ],
          },
          { label: "Day 6", focus: "Active Recovery", isRest: true, exercises: [] },
          { label: "Day 7", focus: "Rest", isRest: true, exercises: [] },
        ],
      },
    ],
  },
  "Weight Loss": {
    splits: [
      {
        name: "Cardio + Strength (3×/wk)",
        desc: "Full body lifts + cardio bursts",
        days: [
          {
            label: "Day 1", focus: "Full Body A + Cardio",
            exercises: [
              { name: "Goblet Squat",               sets: "3", reps: "15",    rest: "60 s",   muscle: "quads" },
              { name: "Dumbbell RDL",               sets: "3", reps: "12",    rest: "60 s",   muscle: "hamstrings" },
              { name: "Push-Ups / Bench Press",     sets: "3", reps: "12-15", rest: "60 s",   muscle: "chest" },
              { name: "Dumbbell Row",               sets: "3", reps: "12",    rest: "60 s",   muscle: "back" },
              { name: "Plank Hold",                 sets: "3", reps: "45 s",  rest: "30 s",   muscle: "core" },
              { name: "Steady-State Cardio (Bike)", sets: "1", reps: "20 min", rest: "—",     muscle: "cardio" },
            ],
          },
          { label: "Day 2", focus: "Active Recovery — 30-min walk", isRest: true, exercises: [] },
          {
            label: "Day 3", focus: "Full Body B + HIIT",
            exercises: [
              { name: "Barbell Deadlift",           sets: "3", reps: "8",     rest: "90 s",   muscle: "back" },
              { name: "Dumbbell Split Squat",       sets: "3", reps: "10/leg", rest: "60 s",  muscle: "quads" },
              { name: "Incline Push-Up",            sets: "3", reps: "15",    rest: "45 s",   muscle: "chest" },
              { name: "Lat Pulldown",               sets: "3", reps: "12",    rest: "60 s",   muscle: "back" },
              { name: "Mountain Climbers",          sets: "4", reps: "30 s",  rest: "30 s",   muscle: "core" },
              { name: "HIIT (30s on / 30s off)",   sets: "8", reps: "rounds", rest: "—",     muscle: "cardio" },
            ],
          },
          { label: "Day 4", focus: "Rest", isRest: true, exercises: [] },
          {
            label: "Day 5", focus: "Full Body C + Cardio",
            exercises: [
              { name: "Front Squat / Leg Press",    sets: "3", reps: "12",    rest: "75 s",   muscle: "quads" },
              { name: "Hip Thrust",                 sets: "3", reps: "15",    rest: "60 s",   muscle: "glutes" },
              { name: "Arnold Press",               sets: "3", reps: "12",    rest: "60 s",   muscle: "shoulders" },
              { name: "Cable Row",                  sets: "3", reps: "12",    rest: "60 s",   muscle: "back" },
              { name: "Russian Twists",             sets: "3", reps: "20",    rest: "30 s",   muscle: "core" },
              { name: "Treadmill / Run",            sets: "1", reps: "25 min", rest: "—",     muscle: "cardio" },
            ],
          },
          { label: "Day 6", focus: "Light Walk / Stretching", isRest: true, exercises: [] },
          { label: "Day 7", focus: "Rest", isRest: true, exercises: [] },
        ],
      },
      {
        name: "Circuit Training (5×/wk)",
        desc: "High-rep circuits for max calorie burn",
        days: [
          {
            label: "Day 1", focus: "Upper Body Circuit",
            exercises: [
              { name: "Push-Up (wide grip)",        sets: "4", reps: "20",    rest: "30 s",   muscle: "chest" },
              { name: "Dumbbell Row",               sets: "4", reps: "15/arm", rest: "30 s",  muscle: "back" },
              { name: "Lateral Raise",              sets: "3", reps: "20",    rest: "30 s",   muscle: "shoulders" },
              { name: "Tricep Dips",                sets: "3", reps: "15",    rest: "30 s",   muscle: "triceps" },
              { name: "Hammer Curl",                sets: "3", reps: "15",    rest: "30 s",   muscle: "biceps" },
              { name: "Jumping Jacks",              sets: "3", reps: "40",    rest: "20 s",   muscle: "cardio" },
            ],
          },
          {
            label: "Day 2", focus: "Lower Body Circuit + Cardio",
            exercises: [
              { name: "Jump Squat",                 sets: "4", reps: "15",    rest: "30 s",   muscle: "quads" },
              { name: "Reverse Lunge",              sets: "3", reps: "12/leg", rest: "30 s",  muscle: "quads" },
              { name: "Hip Thrust",                 sets: "3", reps: "20",    rest: "45 s",   muscle: "glutes" },
              { name: "Leg Curl",                   sets: "3", reps: "15",    rest: "30 s",   muscle: "hamstrings" },
              { name: "Calf Raise",                 sets: "3", reps: "25",    rest: "20 s",   muscle: "calves" },
              { name: "Rowing Machine",             sets: "1", reps: "15 min", rest: "—",     muscle: "cardio" },
            ],
          },
          { label: "Day 3", focus: "Active Recovery — Yoga / Walk", isRest: true, exercises: [] },
          {
            label: "Day 4", focus: "Full Body HIIT",
            exercises: [
              { name: "Burpees",                    sets: "5", reps: "10",    rest: "30 s",   muscle: "full" },
              { name: "Kettlebell Swing",           sets: "4", reps: "20",    rest: "45 s",   muscle: "glutes" },
              { name: "Box Jump / Step-Up",         sets: "4", reps: "12",    rest: "45 s",   muscle: "quads" },
              { name: "Battle Ropes",               sets: "4", reps: "30 s",  rest: "30 s",   muscle: "cardio" },
              { name: "Med Ball Slam",              sets: "3", reps: "15",    rest: "30 s",   muscle: "core" },
              { name: "Sprint Intervals",           sets: "8", reps: "20 s",  rest: "40 s",   muscle: "cardio" },
            ],
          },
          {
            label: "Day 5", focus: "Core + Cardio Finisher",
            exercises: [
              { name: "Plank (hold)",               sets: "3", reps: "60 s",  rest: "30 s",   muscle: "core" },
              { name: "Bicycle Crunch",             sets: "3", reps: "25",    rest: "30 s",   muscle: "core" },
              { name: "Hanging Leg Raise",          sets: "3", reps: "12",    rest: "45 s",   muscle: "core" },
              { name: "Russian Twist",              sets: "3", reps: "20",    rest: "30 s",   muscle: "core" },
              { name: "Cable Woodchop",             sets: "3", reps: "12/side", rest: "30 s", muscle: "core" },
              { name: "Elliptical / Bike",          sets: "1", reps: "30 min", rest: "—",     muscle: "cardio" },
            ],
          },
          { label: "Day 6", focus: "Light Activity / Mobility", isRest: true, exercises: [] },
          { label: "Day 7", focus: "Rest", isRest: true, exercises: [] },
        ],
      },
    ],
  },
  "Home Workout": {
    splits: [
      {
        name: "Bodyweight 3×/wk",
        desc: "Push / Pull / Legs — no equipment",
        days: [
          {
            label: "Day 1", focus: "Push — Chest, Shoulders, Triceps",
            exercises: [
              { name: "Push-Ups (Standard)",        sets: "4", reps: "15-20", rest: "60 s",   muscle: "chest" },
              { name: "Diamond Push-Ups",           sets: "3", reps: "12",    rest: "60 s",   muscle: "triceps" },
              { name: "Wide Push-Ups",              sets: "3", reps: "15",    rest: "45 s",   muscle: "chest" },
              { name: "Pike Push-Ups",              sets: "3", reps: "10-12", rest: "60 s",   muscle: "shoulders" },
              { name: "Tricep Dips (chair)",        sets: "3", reps: "15",    rest: "45 s",   muscle: "triceps" },
              { name: "Plank Shoulder Taps",        sets: "3", reps: "20",    rest: "30 s",   muscle: "core" },
            ],
          },
          { label: "Day 2", focus: "Rest / Light Walk", isRest: true, exercises: [] },
          {
            label: "Day 3", focus: "Pull — Back & Biceps",
            exercises: [
              { name: "Doorframe Rows / Table Rows", sets: "4", reps: "10-12", rest: "60 s",  muscle: "back" },
              { name: "Towel Bicep Curl",           sets: "3", reps: "12",    rest: "60 s",   muscle: "biceps" },
              { name: "Superman Hold",              sets: "3", reps: "45 s",  rest: "30 s",   muscle: "back" },
              { name: "Reverse Snow Angels (floor)", sets: "3", reps: "15",   rest: "30 s",   muscle: "shoulders" },
              { name: "Bird Dog",                   sets: "3", reps: "10/side", rest: "30 s", muscle: "back" },
              { name: "Chin-Ups (if bar available)", sets: "3", reps: "max",  rest: "90 s",   muscle: "back" },
            ],
          },
          { label: "Day 4", focus: "Rest / Yoga", isRest: true, exercises: [] },
          {
            label: "Day 5", focus: "Legs + Core",
            exercises: [
              { name: "Bodyweight Squat",           sets: "4", reps: "20",    rest: "45 s",   muscle: "quads" },
              { name: "Reverse Lunge",              sets: "3", reps: "12/leg", rest: "45 s",  muscle: "quads" },
              { name: "Glute Bridge",               sets: "3", reps: "20",    rest: "30 s",   muscle: "glutes" },
              { name: "Single-Leg Deadlift",        sets: "3", reps: "10/leg", rest: "45 s",  muscle: "hamstrings" },
              { name: "Calf Raise (step edge)",     sets: "4", reps: "20",    rest: "30 s",   muscle: "calves" },
              { name: "Plank + Side Plank",         sets: "3", reps: "30s each", rest: "30 s", muscle: "core" },
            ],
          },
          {
            label: "Day 6", focus: "Core & Mobility",
            exercises: [
              { name: "Plank Hold",                 sets: "3", reps: "60 s",  rest: "30 s",   muscle: "core" },
              { name: "Bicycle Crunch",             sets: "3", reps: "20",    rest: "30 s",   muscle: "core" },
              { name: "Leg Raise",                  sets: "3", reps: "15",    rest: "30 s",   muscle: "core" },
              { name: "Hip Flexor Stretch",         sets: "2", reps: "60 s",  rest: "—",      muscle: "full" },
              { name: "World's Greatest Stretch",   sets: "2", reps: "5/side", rest: "—",     muscle: "full" },
              { name: "Cat-Cow",                    sets: "2", reps: "10",    rest: "—",      muscle: "back" },
            ],
          },
          { label: "Day 7", focus: "Rest", isRest: true, exercises: [] },
        ],
      },
      {
        name: "Calisthenics PPL",
        desc: "Skill-based 6-day calisthenics",
        days: [
          {
            label: "Day 1", focus: "Push Skills",
            exercises: [
              { name: "Archer Push-Up",             sets: "4", reps: "5-8/side", rest: "90 s", muscle: "chest" },
              { name: "Pike Push-Up Progression",   sets: "4", reps: "8-12",  rest: "90 s",   muscle: "shoulders" },
              { name: "Dip Progression",            sets: "3", reps: "10-15", rest: "75 s",   muscle: "triceps" },
              { name: "L-sit Hold (floor/chair)",   sets: "4", reps: "max s", rest: "60 s",   muscle: "core" },
              { name: "Pseudo Planche Push-Up",     sets: "3", reps: "8",     rest: "90 s",   muscle: "chest" },
            ],
          },
          {
            label: "Day 2", focus: "Pull Skills",
            exercises: [
              { name: "Pull-Up Progression",        sets: "5", reps: "5-8",   rest: "2 min",  muscle: "back" },
              { name: "Australian Row",             sets: "4", reps: "10-12", rest: "90 s",   muscle: "back" },
              { name: "Chin-Up",                    sets: "3", reps: "6-8",   rest: "90 s",   muscle: "biceps" },
              { name: "Scapular Pull-Up",           sets: "3", reps: "10",    rest: "60 s",   muscle: "back" },
              { name: "Hollow Body Hold",           sets: "3", reps: "30 s",  rest: "30 s",   muscle: "core" },
            ],
          },
          {
            label: "Day 3", focus: "Legs + Core",
            exercises: [
              { name: "Pistol Squat Progression",   sets: "4", reps: "5-8/leg", rest: "90 s", muscle: "quads" },
              { name: "Nordic Curl / Glute-Ham",    sets: "3", reps: "5-8",   rest: "2 min",  muscle: "hamstrings" },
              { name: "Bulgarian Split Squat",      sets: "3", reps: "10/leg", rest: "60 s",  muscle: "quads" },
              { name: "Single-Leg Hip Thrust",      sets: "3", reps: "12/leg", rest: "45 s",  muscle: "glutes" },
              { name: "Dragon Flag Progression",    sets: "3", reps: "5-8",   rest: "60 s",   muscle: "core" },
            ],
          },
          {
            label: "Day 4", focus: "Push — Volume",
            exercises: [
              { name: "Push-Ups 100 rep challenge", sets: "5", reps: "20",    rest: "45 s",   muscle: "chest" },
              { name: "Hindu Push-Up",              sets: "4", reps: "10",    rest: "60 s",   muscle: "shoulders" },
              { name: "Close-Grip Push-Up",         sets: "4", reps: "15",    rest: "45 s",   muscle: "triceps" },
              { name: "Wall Handstand Hold",        sets: "3", reps: "20 s",  rest: "60 s",   muscle: "shoulders" },
              { name: "Ring Dip / Dip",             sets: "3", reps: "10-12", rest: "60 s",   muscle: "triceps" },
            ],
          },
          {
            label: "Day 5", focus: "Pull — Volume",
            exercises: [
              { name: "Pull-Up (wide grip)",        sets: "5", reps: "8",     rest: "90 s",   muscle: "back" },
              { name: "Commando Pull-Up",           sets: "3", reps: "5/side", rest: "90 s",  muscle: "back" },
              { name: "Towel Pull-Up",              sets: "3", reps: "5-8",   rest: "90 s",   muscle: "biceps" },
              { name: "Face Pull (band)",           sets: "3", reps: "15",    rest: "45 s",   muscle: "shoulders" },
              { name: "Dead Hang",                  sets: "3", reps: "max s", rest: "60 s",   muscle: "back" },
            ],
          },
          {
            label: "Day 6", focus: "Legs + Core — Volume",
            exercises: [
              { name: "Jump Squat",                 sets: "4", reps: "15",    rest: "45 s",   muscle: "quads" },
              { name: "Walking Lunges",             sets: "4", reps: "20",    rest: "45 s",   muscle: "quads" },
              { name: "Glute Bridge + March",       sets: "3", reps: "15",    rest: "30 s",   muscle: "glutes" },
              { name: "Plank Variations",           sets: "5", reps: "30 s",  rest: "20 s",   muscle: "core" },
              { name: "V-Up",                       sets: "3", reps: "15",    rest: "30 s",   muscle: "core" },
            ],
          },
          { label: "Day 7", focus: "Rest & Stretch", isRest: true, exercises: [] },
        ],
      },
    ],
  },
  "Gym Workout": {
    splits: [
      {
        name: "Classic Bro Split (5-day)",
        desc: "One muscle group per day — maximal focus",
        days: [
          {
            label: "Day 1", focus: "Chest",
            exercises: [
              { name: "Flat Barbell Bench Press",   sets: "4", reps: "6-10",  rest: "2 min",  muscle: "chest" },
              { name: "Incline DB Press",           sets: "4", reps: "10-12", rest: "90 s",   muscle: "chest" },
              { name: "Decline Press / Dips",       sets: "3", reps: "10-12", rest: "75 s",   muscle: "chest" },
              { name: "Cable Fly",                  sets: "3", reps: "15",    rest: "60 s",   muscle: "chest" },
              { name: "Pec-Deck / DB Fly",          sets: "3", reps: "15-20", rest: "45 s",   muscle: "chest" },
            ],
          },
          {
            label: "Day 2", focus: "Back",
            exercises: [
              { name: "Deadlift",                   sets: "4", reps: "4-6",   rest: "3 min",  muscle: "back" },
              { name: "Pull-Ups / Weighted",        sets: "4", reps: "8-10",  rest: "2 min",  muscle: "back" },
              { name: "Barbell Row",                sets: "3", reps: "8-10",  rest: "90 s",   muscle: "back" },
              { name: "Cable Row (close grip)",     sets: "3", reps: "12",    rest: "75 s",   muscle: "back" },
              { name: "Lat Pulldown (wide grip)",   sets: "3", reps: "12-15", rest: "60 s",   muscle: "back" },
              { name: "Straight-Arm Pulldown",      sets: "2", reps: "15",    rest: "45 s",   muscle: "back" },
            ],
          },
          {
            label: "Day 3", focus: "Shoulders",
            exercises: [
              { name: "Barbell Overhead Press",     sets: "4", reps: "6-8",   rest: "2 min",  muscle: "shoulders" },
              { name: "Dumbbell Lateral Raise",     sets: "4", reps: "15-20", rest: "60 s",   muscle: "shoulders" },
              { name: "Rear Delt Fly (cable)",      sets: "4", reps: "15-20", rest: "45 s",   muscle: "shoulders" },
              { name: "Arnold Press",               sets: "3", reps: "10-12", rest: "75 s",   muscle: "shoulders" },
              { name: "Face Pulls",                 sets: "3", reps: "20",    rest: "45 s",   muscle: "shoulders" },
              { name: "Upright Row",                sets: "2", reps: "12",    rest: "60 s",   muscle: "shoulders" },
            ],
          },
          {
            label: "Day 4", focus: "Arms",
            exercises: [
              { name: "Barbell Curl",               sets: "4", reps: "8-10",  rest: "75 s",   muscle: "biceps" },
              { name: "Incline Dumbbell Curl",      sets: "3", reps: "10-12", rest: "60 s",   muscle: "biceps" },
              { name: "Hammer Curl",                sets: "3", reps: "12-15", rest: "45 s",   muscle: "biceps" },
              { name: "Close-Grip Bench Press",     sets: "4", reps: "8-10",  rest: "90 s",   muscle: "triceps" },
              { name: "Overhead Tricep Extension",  sets: "3", reps: "10-12", rest: "60 s",   muscle: "triceps" },
              { name: "Rope Pushdown",              sets: "3", reps: "15",    rest: "45 s",   muscle: "triceps" },
            ],
          },
          {
            label: "Day 5", focus: "Legs",
            exercises: [
              { name: "Barbell Back Squat",         sets: "4", reps: "6-8",   rest: "2.5 min", muscle: "quads" },
              { name: "Romanian Deadlift",          sets: "3", reps: "8-10",  rest: "2 min",   muscle: "hamstrings" },
              { name: "Leg Press",                  sets: "3", reps: "12-15", rest: "90 s",    muscle: "quads" },
              { name: "Leg Curl",                   sets: "3", reps: "12-15", rest: "60 s",    muscle: "hamstrings" },
              { name: "Hip Thrust (Barbell)",       sets: "3", reps: "12-15", rest: "75 s",    muscle: "glutes" },
              { name: "Standing Calf Raise",        sets: "5", reps: "15-20", rest: "45 s",    muscle: "calves" },
            ],
          },
          { label: "Day 6", focus: "Rest", isRest: true, exercises: [] },
          { label: "Day 7", focus: "Rest", isRest: true, exercises: [] },
        ],
      },
      {
        name: "Arnold Split (6-day)",
        desc: "Classic chest+back / shoulders+arms / legs",
        days: [
          {
            label: "Day 1", focus: "Chest + Back",
            exercises: [
              { name: "Barbell Bench Press",        sets: "4", reps: "8-10",  rest: "2 min",  muscle: "chest" },
              { name: "Barbell Row",                sets: "4", reps: "8-10",  rest: "2 min",  muscle: "back" },
              { name: "Incline DB Press",           sets: "3", reps: "10-12", rest: "75 s",   muscle: "chest" },
              { name: "Pull-Ups",                   sets: "3", reps: "8-10",  rest: "90 s",   muscle: "back" },
              { name: "Cable Fly",                  sets: "3", reps: "15",    rest: "60 s",   muscle: "chest" },
              { name: "Lat Pulldown",               sets: "3", reps: "12",    rest: "60 s",   muscle: "back" },
            ],
          },
          {
            label: "Day 2", focus: "Shoulders + Arms",
            exercises: [
              { name: "Overhead Press (BB)",        sets: "4", reps: "8-10",  rest: "90 s",   muscle: "shoulders" },
              { name: "Barbell Curl",               sets: "4", reps: "10",    rest: "75 s",   muscle: "biceps" },
              { name: "Lateral Raise",              sets: "4", reps: "15-20", rest: "45 s",   muscle: "shoulders" },
              { name: "Close-Grip Bench",           sets: "3", reps: "10",    rest: "75 s",   muscle: "triceps" },
              { name: "Hammer Curl",                sets: "3", reps: "12",    rest: "60 s",   muscle: "biceps" },
              { name: "Skull Crushers",             sets: "3", reps: "12",    rest: "60 s",   muscle: "triceps" },
            ],
          },
          {
            label: "Day 3", focus: "Legs",
            exercises: [
              { name: "Squat",                      sets: "4", reps: "8-10",  rest: "2 min",  muscle: "quads" },
              { name: "Romanian Deadlift",          sets: "3", reps: "8-10",  rest: "2 min",  muscle: "hamstrings" },
              { name: "Leg Press",                  sets: "3", reps: "12",    rest: "90 s",   muscle: "quads" },
              { name: "Leg Curl",                   sets: "3", reps: "12-15", rest: "60 s",   muscle: "hamstrings" },
              { name: "Hip Thrust",                 sets: "3", reps: "15",    rest: "60 s",   muscle: "glutes" },
              { name: "Calf Raise",                 sets: "4", reps: "20",    rest: "30 s",   muscle: "calves" },
            ],
          },
          {
            label: "Day 4", focus: "Chest + Back (volume)",
            exercises: [
              { name: "DB Flat Press",              sets: "4", reps: "10-12", rest: "75 s",   muscle: "chest" },
              { name: "T-Bar Row",                  sets: "4", reps: "10",    rest: "75 s",   muscle: "back" },
              { name: "Pec-Deck Fly",               sets: "3", reps: "15",    rest: "60 s",   muscle: "chest" },
              { name: "Cable Row",                  sets: "3", reps: "12",    rest: "60 s",   muscle: "back" },
              { name: "Dips",                       sets: "3", reps: "12-15", rest: "60 s",   muscle: "chest" },
              { name: "Shrugs",                     sets: "3", reps: "15-20", rest: "45 s",   muscle: "back" },
            ],
          },
          {
            label: "Day 5", focus: "Shoulders + Arms (volume)",
            exercises: [
              { name: "Arnold Press",               sets: "4", reps: "10-12", rest: "75 s",   muscle: "shoulders" },
              { name: "Incline Curl",               sets: "4", reps: "10-12", rest: "60 s",   muscle: "biceps" },
              { name: "Rear Delt Fly",              sets: "3", reps: "15-20", rest: "45 s",   muscle: "shoulders" },
              { name: "Overhead Tricep Ext.",       sets: "3", reps: "12-15", rest: "60 s",   muscle: "triceps" },
              { name: "Face Pulls",                 sets: "3", reps: "20",    rest: "30 s",   muscle: "shoulders" },
              { name: "Rope Pushdown",              sets: "3", reps: "15",    rest: "45 s",   muscle: "triceps" },
            ],
          },
          {
            label: "Day 6", focus: "Legs (volume)",
            exercises: [
              { name: "Front Squat",                sets: "4", reps: "10-12", rest: "90 s",   muscle: "quads" },
              { name: "Stiff-Leg Deadlift",         sets: "3", reps: "10-12", rest: "90 s",   muscle: "hamstrings" },
              { name: "Walking Lunges",             sets: "3", reps: "15/leg", rest: "60 s",  muscle: "quads" },
              { name: "Leg Extension",              sets: "3", reps: "15-20", rest: "45 s",   muscle: "quads" },
              { name: "Glute Kickback",             sets: "3", reps: "15/leg", rest: "45 s",  muscle: "glutes" },
              { name: "Seated Calf Raise",          sets: "4", reps: "20-25", rest: "30 s",   muscle: "calves" },
            ],
          },
          { label: "Day 7", focus: "Rest", isRest: true, exercises: [] },
        ],
      },
    ],
  },
};

function DayCard({ day, index }: { day: WorkoutDay; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-border/50 transition-colors ${!day.isRest ? "hover:border-primary/30" : "opacity-70"}`}>
      <button
        className="w-full text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-primary shrink-0 text-sm font-mono">{day.label}</span>
              <span className="truncate text-sm font-normal text-muted-foreground">{day.focus}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!day.isRest && <Dumbbell className="w-3.5 h-3.5 text-primary" />}
              {open
                ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </CardTitle>
        </CardHeader>
      </button>

      {open && (
        <CardContent className="pt-4">
          {day.isRest ? (
            <div className="flex items-center justify-center h-20 text-muted-foreground italic text-sm">
              🛌 Active Recovery or Rest Day
            </div>
          ) : (
            <div className="space-y-3">
              {day.exercises.map((ex, j) => {
                const color = MUSCLE_COLORS[ex.muscle] ?? "#10b981";
                return (
                  <div key={j} className="rounded-lg p-2.5 border" style={{ borderColor: `${color}25`, backgroundColor: `${color}08` }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm leading-tight">{ex.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize mt-1 inline-block" style={{ backgroundColor: `${color}22`, color }}>
                          {ex.muscle}
                        </span>
                      </div>
                      <div className="shrink-0 text-right space-y-0.5">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                          <Repeat className="w-3 h-3" />
                          <span className="font-mono">{ex.sets}×{ex.reps}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                          <Timer className="w-3 h-3" />
                          <span>{ex.rest}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function WorkoutPlanner() {
  const [category, setCategory] = useState<keyof typeof DB>("Muscle Gain");
  const splits = (DB[category] as { splits: Split[] }).splits;
  const [splitIdx, setSplitIdx] = useState(0);
  const selectedSplit = splits[splitIdx];

  const workDays = selectedSplit.days.filter((d) => !d.isRest).length;
  const restDays = selectedSplit.days.filter((d) => d.isRest).length;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 space-y-1">
          <p className="text-xs text-muted-foreground px-1">Category</p>
          <Select value={category} onValueChange={(v) => { setCategory(v as keyof typeof DB); setSplitIdx(0); }}>
            <SelectTrigger data-testid="select-workout-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(DB).map((k) => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-1">
          <p className="text-xs text-muted-foreground px-1">Split / Program</p>
          <Select value={String(splitIdx)} onValueChange={(v) => setSplitIdx(Number(v))}>
            <SelectTrigger data-testid="select-workout-split">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {splits.map((s, i) => (
                <SelectItem key={i} value={String(i)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Split summary */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="text-sm font-semibold">{selectedSplit.name}</span>
        <span className="text-sm text-muted-foreground">—</span>
        <span className="text-sm text-muted-foreground">{selectedSplit.desc}</span>
        <div className="flex gap-2 ml-auto">
          <Badge variant="outline" className="text-primary border-primary/30 gap-1">
            <Dumbbell className="w-3 h-3" /> {workDays} training
          </Badge>
          <Badge variant="outline" className="text-muted-foreground gap-1">
            <Flame className="w-3 h-3" /> {restDays} rest
          </Badge>
        </div>
      </div>

      {/* Day cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {selectedSplit.days.map((day, i) => (
          <DayCard key={`${category}-${splitIdx}-${i}`} day={day} index={i} />
        ))}
      </div>
    </div>
  );
}
