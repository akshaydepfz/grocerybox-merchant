/**
 * Route classification for middleware and navigation guards.
 * Path lists will be finalized alongside Flutter route mapping.
 */

export const publicRoutes = ["/"] as const;

export const authRoutes = ["/login", "/register", "/verify-otp"] as const;

export const onboardingRoutePrefix = "/onboarding" as const;

export const dashboardRoutePrefix = "/dashboard" as const;

export type PublicRoute = (typeof publicRoutes)[number];
