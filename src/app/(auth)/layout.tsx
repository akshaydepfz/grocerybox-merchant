import type { ReactNode } from "react";

/** Auth routes use full-bleed onboard layouts (see `LoginScreen`). */
export default function AuthRouteGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
