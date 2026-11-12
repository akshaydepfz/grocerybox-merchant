import { create } from "zustand";

import type { AuthSession } from "@/features/auth/types";

/** Client auth snapshot (Firebase session metadata for UI and API wiring). */
export type AuthStoreState = {
  session: AuthSession | null;
  isHydrated: boolean;
  setSession: (session: AuthSession | null) => void;
  setHydrated: (hydrated: boolean) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthStoreState>()((set) => ({
  session: null,
  isHydrated: false,
  setSession: (session) => set({ session }),
  setHydrated: (isHydrated) => set({ isHydrated }),
  clearSession: () => set({ session: null }),
}));
