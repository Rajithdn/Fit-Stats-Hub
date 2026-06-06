// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
