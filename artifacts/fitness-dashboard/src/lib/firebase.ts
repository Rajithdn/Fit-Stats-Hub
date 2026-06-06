import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// ─────────────────────────────────────────────────────────────────────────────
// REPLACE the values below with your own Firebase project config.
// Get them from: https://console.firebase.google.com
//   → Your project → Project Settings → Your apps → SDK setup and config
//
// Also add databaseURL — format:
//   https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "termfit-c8168.firebaseapp.com",
  projectId: "termfit-c8168",
  storageBucket: "termfit-c8168.firebasestorage.app",
  messagingSenderId: "...",
  appId: "1:...",
  databaseURL: "https://termfit-c8168-default-rtdb.firebaseio.com",  // ← add this
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
