"use client";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { setAuthorizationHeaderProvider } from "@/lib/api/client";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { useAuthStore } from "@/stores/auth-store";

import { AuthError, getIdToken } from "../services/auth-service";
import { registerMerchant } from "../services/merchant-registration-service";

type AuthContextValue = {
  user: User | null;
  isAuthReady: boolean;
  isRegistering: boolean;
  isRegistered: boolean;
  registrationError: string | null;
  retryRegistration: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setSession, clearSession, setHydrated } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null,
  );

  const registeredUidRef = useRef<string | null>(null);
  const inFlightUidRef = useRef<string | null>(null);
  const inFlightRef = useRef<Promise<void> | null>(null);

  const ensureRegistered = useCallback(async (uid: string) => {
    if (registeredUidRef.current === uid) {
      setIsRegistered(true);
      setRegistrationError(null);
      return;
    }
    if (inFlightRef.current && inFlightUidRef.current === uid) {
      return inFlightRef.current;
    }

    inFlightUidRef.current = uid;
    setIsRegistering(true);
    setRegistrationError(null);
    setIsRegistered(false);

    const run = (async () => {
      try {
        await registerMerchant();
        registeredUidRef.current = uid;
        setIsRegistered(true);
        setRegistrationError(null);
      } catch (error) {
        const message =
          error instanceof AuthError || error instanceof Error
            ? error.message
            : "Unable to register merchant. Please try again.";
        setRegistrationError(message);
        setIsRegistered(false);
      } finally {
        if (inFlightUidRef.current === uid) {
          inFlightRef.current = null;
          inFlightUidRef.current = null;
        }
        setIsRegistering(false);
      }
    })();

    inFlightRef.current = run;
    return run;
  }, []);

  const resetRegistrationSession = useCallback(() => {
    registeredUidRef.current = null;
    inFlightUidRef.current = null;
    inFlightRef.current = null;
    setIsRegistering(false);
    setIsRegistered(false);
    setRegistrationError(null);
  }, []);

  const retryRegistration = useCallback(async () => {
    const current = getFirebaseAuth().currentUser;
    if (!current) {
      return;
    }
    resetRegistrationSession();
    await ensureRegistered(current.uid);
  }, [ensureRegistered, resetRegistrationSession]);

  useEffect(() => {
    setAuthorizationHeaderProvider(async () => {
      try {
        const token = await getIdToken();
        return token ? `Bearer ${token}` : null;
      } catch {
        return null;
      }
    });
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        setSession({
          uid: nextUser.uid,
          email: nextUser.email ?? undefined,
        });
        void ensureRegistered(nextUser.uid);
      } else {
        clearSession();
        resetRegistrationSession();
      }
      setHydrated(true);
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, [
    clearSession,
    ensureRegistered,
    resetRegistrationSession,
    setHydrated,
    setSession,
  ]);

  const value: AuthContextValue = {
    user,
    isAuthReady,
    isRegistering,
    isRegistered,
    registrationError,
    retryRegistration,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
