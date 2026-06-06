# TermFit — Deployment Guide

---

## 🚀 Option A: Vercel (Recommended — Easiest)

### What Vercel Does
Vercel hosts your React frontend as a static site and your Express backend as a serverless function — all from one repo, zero server management.

---

### Step 1 — Push to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "TermFit app"
```

Create a repo at https://github.com/new, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/termfit.git
git push -u origin main
```

---

### Step 2 — Import to Vercel

1. Go to https://vercel.com → sign in with GitHub
2. Click **Add New → Project**
3. Select your `termfit` repo
4. Vercel auto-detects the config from `vercel.json` — **don't change anything**
5. Click **Deploy**

---

### Step 3 — Set Environment Variables

In Vercel → your project → **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your full Neon connection string (see below) |
| `JWT_SECRET` | Any random string, e.g. `termfit-super-secret-rajith-2025` |

**Your Neon connection string:**
```
postgresql://neondb_owner:npg_IrjhZXu1xR9p@ep-floral-breeze-ap249cg1-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require
```

After adding env vars → click **Redeploy** (or push any commit).

---

### Step 4 — Your App is Live!

URL: `https://termfit.vercel.app` (or whatever Vercel assigns)

Every time you push to `main`, Vercel auto-deploys. ✅

---

### Vercel Config Reference (`vercel.json`)

```json
{
  "version": 2,
  "installCommand": "pnpm install --no-frozen-lockfile",
  "buildCommand": "pnpm --filter @workspace/fitness-dashboard run build && cp -r artifacts/fitness-dashboard/dist/public/. public/",
  "outputDirectory": "public",
  "functions": {
    "api/[...slug].ts": { "memory": 1024, "maxDuration": 30 }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

---

## 🔥 Option B: Firebase Hosting + Cloud Functions

### What Firebase Does
Firebase Hosting serves your frontend, Firebase Cloud Functions runs your Express backend.

> ⚠️ **Requires Blaze (pay-as-you-go) plan** for Cloud Functions.
> Free tier covers ~2M function invocations/month — more than enough for personal use.

---

### Step 1 — Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it (e.g. `termfit`)
3. Disable Google Analytics (optional) → **Create project**
4. Copy your **Project ID** from Project Settings (gear icon top-left)
   - It looks like: `termfit-ab123`

---

### Step 2 — Enable Hosting and Functions

In your Firebase project:
- Left sidebar → **Hosting** → Get started → click through setup wizard
- Left sidebar → **Functions** → Get started → **Upgrade to Blaze plan**

---

### Step 3 — Set Firebase Functions Environment Variables

In Firebase Console → Functions → **Dashboard → Manage → Edit function**,
OR use the CLI (step 5):

```bash
firebase functions:config:set app.database_url="YOUR_NEON_URL" app.jwt_secret="termfit-secret-2025"
```

Or use the `.env` file approach (Firebase Gen 2 functions):
Create `functions/.env`:
```
DATABASE_URL=postgresql://neondb_owner:npg_IrjhZXu1xR9p@ep-floral-breeze-ap249cg1-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=termfit-super-secret-rajith-2025
```

---

### Step 4 — Update `.firebaserc` with your Project ID

Edit `.firebaserc` in your project root:
```json
{
  "projects": {
    "default": "YOUR-PROJECT-ID-HERE"
  }
}
```

---

### Step 5 — Install Firebase CLI and Deploy

On your **local machine** (not Replit — CLI is too large):

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Navigate to your project folder
cd termfit

# Build the frontend first
pnpm --filter @workspace/fitness-dashboard run build
cp -r artifacts/fitness-dashboard/dist/public/. public/

# Build the Cloud Function
cd functions
npm install
npm run build
cd ..

# Deploy everything
firebase deploy
```

This deploys:
- Frontend → Firebase Hosting
- Backend → Cloud Function at `https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/api`

---

### Firebase Config Files Reference

**`firebase.json`** (already in your project):
```json
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "/api/**", "destination": "/api" },
      { "source": "**", "destination": "/index.html" }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  }
}
```

---

## 🏆 Which Should I Choose?

| | Vercel | Firebase |
|---|---|---|
| Setup difficulty | ⭐ Very easy | ⭐⭐ Medium |
| Free tier | Generous | Requires Blaze plan |
| Deploy command | Git push | `firebase deploy` |
| Custom domain | ✅ Free | ✅ Free |
| Cold starts | Fast | Slightly slower |
| **Recommended for TermFit** | ✅ **Yes** | Works too |

**Bottom line: Use Vercel.** It's simpler, free, and deploys automatically on every git push.

---

## 🔑 Environment Variables Summary

Both platforms need these two env vars:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon PostgreSQL connection string |
| `JWT_SECRET` | Any secret string (keep it private!) |

Your Neon DB is already set up and the schema is pushed. You just need to provide the connection string to whichever host you use.
