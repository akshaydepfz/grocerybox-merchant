import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SubscriptionPaymentSuccessScreen } from "@/features/onboarding/components/subscription-payment-success-screen";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Subscription Active",
};

/** Flutter `SubscriptionPaymentSuccessScreen`. */
export default function SubscriptionPaymentSuccessPage() {
  return (
    <div className={inter.className}>
      <SubscriptionPaymentSuccessScreen />
    </div>
  );
}
