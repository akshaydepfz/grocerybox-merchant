import { openRazorpayCheckout } from "../services/razorpay-checkout";
import { createSubscriptionPaymentOrder } from "../services/subscription-service";
import type { SubscriptionPlan } from "../types/subscription";

/** Creates a Razorpay order and opens checkout (no plan select API). */
export async function runSubscriptionCheckout(options: {
  plan: SubscriptionPlan;
  customerEmail?: string;
  onVerifying: () => void;
  onDismiss: () => void;
  onFailure: (message: string) => void;
  onSuccess: (payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => void;
}): Promise<void> {
  let order;
  try {
    order = await createSubscriptionPaymentOrder();
  } catch (error) {
    options.onFailure(
      error instanceof Error ? error.message : "Unable to start payment.",
    );
    return;
  }

  await openRazorpayCheckout({
    keyId: order.keyId,
    amountPaise: order.amount,
    currency: order.currency,
    orderId: order.orderId,
    merchantName: "Grocery.in",
    description: `${options.plan.name} subscription`,
    customerEmail: options.customerEmail,
    onSuccess: (success) => {
      options.onVerifying();
      options.onSuccess(success);
    },
    onFailure: (failure) => {
      options.onFailure(
        failure.description || "Payment failed. Please try again.",
      );
    },
    onDismiss: options.onDismiss,
  });
}
