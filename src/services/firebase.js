import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ─── Firebase Configuration ───────────────────────────────────────────────────
// Values are loaded from environment variables.
// For local dev: create a .env.local file (see .env.example)
// For GitHub Pages: add these as GitHub Secrets (see .github/workflows/deploy.yml)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
