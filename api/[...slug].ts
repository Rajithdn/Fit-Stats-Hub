// Vercel catch-all route: handles ALL /api/* requests
// File-based routing takes priority over SPA fallback
// This re-exports the same Express app as api/index.ts
export { default } from "./index";
