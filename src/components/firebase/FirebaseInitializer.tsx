"use client";

import { useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";

export interface FirebaseConfigProps {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId: string | undefined;
}

export default function FirebaseInitializer({ config }: { config: FirebaseConfigProps }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const firebaseConfig = {
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
        measurementId: config.measurementId,
      };

      if (!getApps().length) {
        initializeApp(firebaseConfig);
      }
    }
  }, [config]);

  return null;
}
