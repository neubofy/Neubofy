import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// We won't initialize here. FirebaseInitializer will do it.
// We provide getters to ensure they are called AFTER initialization.

export const getFirebaseAuth = () => {
  return getAuth(getApp());
};

export const getFirebaseDb = () => {
  return getFirestore(getApp());
};
