import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase/client";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}

export function getCurrentUser(): User | null {
  return getFirebaseAuth().currentUser;
}

/** Use email from `useAuth().user` — do not touch Firebase Auth during render. */
export function resolveSignedInEmail(email?: string | null): string {
  const trimmed = email?.trim();
  return trimmed?.length ? trimmed : "";
}

/**
 * Returns a Firebase ID token for backend Authorization headers.
 */
export async function getIdToken(forceRefresh = false): Promise<string> {
  const user = getCurrentUser();
  if (!user) {
    throw new AuthError("Authentication failed. Please sign in again.");
  }
  try {
    const token = await user.getIdToken(forceRefresh);
    if (!token) {
      throw new AuthError("Authentication failed. Please sign in again.");
    }
    return token;
  } catch {
    throw new AuthError("Authentication failed. Please sign in again.");
  }
}
