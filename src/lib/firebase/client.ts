
// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
// import { getFirestore, Firestore } from 'firebase/firestore'; // Add if using Firestore

// Your web app's Firebase configuration
// IMPORTANT: Replace with your actual Firebase config values
// Store these in environment variables (.env.local) for security
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Ensure this is set in .env.local
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, // Ensure this is set in .env.local
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Ensure this is set in .env.local
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Ensure this is set in .env.local
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // Ensure this is set in .env.local
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID, // Ensure this is set in .env.local
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};

// Basic validation to ensure required variables are present
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    console.error(
        'Firebase configuration error: Missing required environment variables (NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID). ' +
        'Please create a .env.local file in the project root and add your Firebase project credentials.'
    );
    // Depending on the desired behavior, you might want to throw an error here
    // throw new Error("Firebase configuration is incomplete. Check environment variables.");
}


// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  // Check if config values are present before initializing
  if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId) {
      app = initializeApp(firebaseConfig);
  } else {
      // Handle the case where initialization cannot proceed
      console.error("Firebase could not be initialized due to missing configuration.");
      // Assign a placeholder or handle appropriately to avoid runtime errors later
      // This part depends on how the rest of the app handles a missing Firebase instance
      // For now, we'll let errors occur downstream if auth is used without proper init.
  }
} else {
  app = getApp();
}

// Initialize Auth only if Firebase app was successfully initialized
let auth: Auth | null = null; // Initialize as null
if (app!) { // Use non-null assertion if you ensure app is initialized or throw error above
    try {
        auth = getAuth(app);
    } catch (error) {
        console.error("Failed to initialize Firebase Authentication:", error);
    }
}

// const db: Firestore = getFirestore(app); // Add if using Firestore

export { app, auth /*, db */ }; // Export db if using Firestore
// Note: Exported 'auth' can be null if initialization failed. Code using 'auth' should check for null.

