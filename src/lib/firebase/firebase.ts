import { initializeApp, getApps, getApp, deleteApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const getFirebaseApp = () => {
  if (typeof window !== "undefined") {
    const injectedConfig = (window as unknown as { __FIREBASE_CONFIG__?: Record<string, string | undefined> }).__FIREBASE_CONFIG__;
    if (injectedConfig && injectedConfig.apiKey) {
      if (getApps().length === 0) {
        return initializeApp(injectedConfig);
      }
      const existing = getApp();
      if (!existing.options.apiKey && injectedConfig.apiKey) {
        try {
          deleteApp(existing);
        } catch {
          // ignore error if already deleting
        }
        return initializeApp(injectedConfig);
      }
      return existing;
    }
  }

  if (getApps().length > 0) {
    return getApp();
  }

  const fallbackConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.authDomain || "neubofy.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.projectId || "neubofy",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.storageBucket || "neubofy.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.messagingSenderId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.appId,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.measurementId,
  };

  return initializeApp(fallbackConfig);
};

export const getFirebaseAuth = () => {
  return getAuth(getFirebaseApp());
};

export const getFirebaseDb = () => {
  return getFirestore(getFirebaseApp());
};
