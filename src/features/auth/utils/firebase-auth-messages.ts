import type { FirebaseError } from "firebase/app";

/**
 * User-facing copy for Firebase Auth errors (mirrors Flutter `onboard_screen.dart`).
 */
export function firebaseAuthMessage(error: FirebaseError): string {
  switch (error.code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with a different sign-in method.";
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled for this app. Check Firebase Console.";
    default:
      return error.message || "Google sign-in failed.";
  }
}
