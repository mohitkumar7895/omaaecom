import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA6cmDFn170YIrAbCXDjnkm8Amn7gusZ7c",
  authDomain: "omma-company.firebaseapp.com",
  projectId: "omma-company",
  storageBucket: "omma-company.firebasestorage.app",
  messagingSenderId: "527623021735",
  appId: "1:527623021735:web:bfdcdd474be952e0f2e782",
  measurementId: "G-4KJCETVFKM"
};

// Initialize Firebase (Singleton pattern to prevent re-initialization in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Analytics safely (only runs on client side)
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, analytics };
