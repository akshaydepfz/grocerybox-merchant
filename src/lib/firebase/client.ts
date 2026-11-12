import { type FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";

import { firebaseWebConfig } from "./config";

function assertBrowserFirebase(): void {
  if (typeof window === "undefined") {
    throw new Error("Firebase is only available in the browser.");
  }
}

export function getFirebaseApp(): FirebaseApp {
  assertBrowserFirebase();
  if (getApps().length === 0) {
    return initializeApp(firebaseWebConfig);
  }
  return getApp();
}

export function getFirebaseAuth(): Auth {
  assertBrowserFirebase();
  return getAuth(getFirebaseApp());
}
