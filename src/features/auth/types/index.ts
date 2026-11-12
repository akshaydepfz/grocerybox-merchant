/**
 * Auth domain types aligned with Flutter Firebase session usage.
 */

export type AuthFlow =
  | "login"
  | "register"
  | "otp-verification"
  | "password-reset";

export type AuthSession = {
  uid: string;
  email?: string;
};

export type AuthRouteSegment =
  | "login"
  | "register"
  | "verify-otp"
  | "forgot-password";
