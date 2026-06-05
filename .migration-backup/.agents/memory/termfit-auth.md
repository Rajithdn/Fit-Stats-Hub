---
name: TermFit Auth Architecture
description: How authentication and data persistence work in the TermFit fitness app.
---

# TermFit Auth + DB Architecture

## How it works
- **Auth**: username + bcrypt password, JWT (30d expiry) signed with `JWT_SECRET` env var (falls back to dev secret)
- **Token storage**: `localStorage` key `termfit-auth-token` — only the token, NOT the data
- **DB**: Replit PostgreSQL via Drizzle ORM (`@workspace/db`), schema in `lib/db/src/schema/index.ts`
- **Tables**: users, user_profiles, food_logs, workout_logs, step_entries, measurements, daily_logs
- **API**: Express at port 8080, routes under `/api/...`
- **Vite proxy**: `/api` → `http://localhost:8080` (in `vite.config.ts`)

## Data flow
1. App mount → check localStorage token → `GET /api/profile` (+ other endpoints) → populate Zustand store
2. Fresh login via Auth.tsx → POST to `/api/auth/login` → fetch all data → `login()` + `loadUserData()` in store
3. Store actions: optimistic local update immediately, fire-and-forget API call in background
4. For adds: temp ID `tmp-{timestamp}` replaced with real DB integer ID after API responds
5. For deletes: only calls API if ID is numeric (`isRealId()` check in `lib/api.ts`)

## Why
- Users wanted data to persist across devices/browsers, not just localStorage
- Each user sees only their own data via JWT userId claim

## How to apply
- Always set `JWT_SECRET` env var in production
- Profile endpoint also returns `username` field (joined from users table) for token-restoration flow
- `GET /api/profile` is the "ping" to verify token validity on app load
