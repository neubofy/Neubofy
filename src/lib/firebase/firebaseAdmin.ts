import * as admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if it hasn't been initialized already
if (!getApps().length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountJson) {
       initializeApp({
         credential: cert(JSON.parse(serviceAccountJson)),
       });
    } else {
       // Fallback for some environments (like GCP/Firebase Functions) where default credentials work
       initializeApp();
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export const adminDb = getFirestore();
export const adminAuth = getAuth();
