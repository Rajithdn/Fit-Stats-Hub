# Fitness Dashboard

An AI-powered Fitness & Nutrition Dashboard SPA that helps users track BMI/BMR/TDEE, calories and macros, generate diet plans, track workouts, monitor nutrition, and get AI-powered recommendations.

## Run & Operate

- `pnpm --filter @workspace/fitness-dashboard run dev` — run the React frontend (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS
- State: Zustand
- Charts: Recharts
- Animation: Framer Motion
- Forms: React Hook Form + Zod
- UI: shadcn/ui + Lucide React icons
- API: Express 5 (minimal, health check only)
- DB: PostgreSQL + Drizzle ORM (provisioned but not used in first build)

## Where things live

- `artifacts/fitness-dashboard/src/` — React SPA source
- `artifacts/fitness-dashboard/src/store/` — Zustand state stores
- `artifacts/fitness-dashboard/src/data/` — Mock nutrition/workout datasets
- `artifacts/fitness-dashboard/src/components/` — Reusable UI components & widgets
- `artifacts/api-server/src/` — Express API server
- `lib/api-spec/openapi.yaml` — OpenAPI contract (health check only)

## Architecture decisions

- Frontend-only SPA: all fitness calculations (BMI, BMR, TDEE, meal plans) run client-side with no backend needed.
- Zustand for global state: user profile, daily food log, progress entries, and theme preference all live in a single store with localStorage persistence.
- Mock data approach: nutrition database and workout plans are hardcoded datasets — no external API keys required.
- Dark-mode-first: emerald green primary accent, deep navy/charcoal backgrounds, glassmorphism cards.
- Single-page layout: all 8 sections (Dashboard, Nutrition, Diet Planner, Workout Planner, Health Report, Progress Tracker, AI Coach, Settings) rendered in the DOM; sidebar controls active section visibility.

## Product

- BMI/BMR/TDEE calculator with color-coded indicators
- Daily nutrition tracker with food search across 20+ foods and full micro/macronutrient data
- AI Diet Planner that generates complete meal plans based on user goals
- Workout Planner with 4 categories (Weight Loss, Muscle Gain, Home, Gym) and 6-day schedules
- Health Report Analyzer with mock PDF/image upload and analysis
- Progress Tracker with weekly/monthly charts and achievement badges
- AI Coach chat interface with pre-populated nutrition Q&A
- Settings with user profile management, theme toggle, and unit system

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- All CSS custom property placeholders ("red") must be replaced with real HSL values in index.css before any components render correctly.
- Google Font @import must be the very first line in index.css — before @import "tailwindcss".
- Zustand store must be initialized with mock data so the dashboard isn't empty on first load.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
