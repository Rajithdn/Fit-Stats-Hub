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
  apiKey: "AIzaSyAxClLOr8bXn9Tuyrgdk6BaV5UH7MhpSoI",
  authDomain: "termfit-c8168.firebaseapp.com",
  databaseURL: "https://termfit-c8168-default-rtdb.firebaseio.com",
  projectId: "termfit-c8168",
  storageBucket: "termfit-c8168.firebasestorage.app",
  messagingSenderId: "663596337283",
  appId: "1:663596337283:web:c3ac2daade8692103733b6",
  measurementId: "G-CWNXFSLG4F"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
