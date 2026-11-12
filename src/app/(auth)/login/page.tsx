import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { LoginScreen } from "@/features/auth/components/login-screen";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in with Google to create and manage your Grocery.in merchant store.",
};

/** Merchant sign-in (Flutter `OnboardScreen` / route `/onboard`). */
export default function LoginPage() {
  return (
    <div className={inter.className}>
      <LoginScreen />
    </div>
  );
}
