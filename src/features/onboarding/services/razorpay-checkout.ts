export type RazorpayCheckoutSuccess = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type RazorpayCheckoutFailure = {
  code: string;
  description: string;
};

type RazorpayHandlerResponse = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

type RazorpayFailureResponse = {
  error?: {
    code?: string;
    description?: string;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: RazorpayFailureResponse) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const SCRIPT_ID = "razorpay-checkout-js";
const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptLoadPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay is only available in the browser."));
  }
  if (window.Razorpay) {
    return Promise.resolve();
  }
  if (document.getElementById(SCRIPT_ID) && window.Razorpay) {
    return Promise.resolve();
  }
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Unable to load Razorpay checkout script.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Unable to load Razorpay checkout script."));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export async function openRazorpayCheckout(options: {
  keyId: string;
  amountPaise: number;
  currency: string;
  orderId: string;
  merchantName: string;
  description: string;
  customerEmail?: string;
  customerContact?: string;
  onSuccess: (success: RazorpayCheckoutSuccess) => void;
  onFailure: (failure: RazorpayCheckoutFailure) => void;
  onDismiss: () => void;
}): Promise<void> {
  try {
    await loadRazorpayScript();
  } catch {
    options.onFailure({
      code: "script_load_failed",
      description: "Unable to load payment checkout. Check your connection.",
    });
    return;
  }

  if (!window.Razorpay) {
    options.onFailure({
      code: "checkout_unavailable",
      description: "Payment checkout is unavailable.",
    });
    return;
  }

  let completed = false;
  const finish = () => {
    completed = true;
  };

  const checkout = new window.Razorpay({
    key: options.keyId,
    amount: options.amountPaise,
    currency: options.currency,
    name: options.merchantName,
    description: options.description,
    order_id: options.orderId,
    prefill: {
      ...(options.customerEmail ? { email: options.customerEmail } : {}),
      ...(options.customerContact ? { contact: options.customerContact } : {}),
    },
    handler: (response: RazorpayHandlerResponse) => {
      if (completed) return;
      finish();
      options.onSuccess({
        razorpayOrderId: response.razorpay_order_id ?? "",
        razorpayPaymentId: response.razorpay_payment_id ?? "",
        razorpaySignature: response.razorpay_signature ?? "",
      });
    },
    modal: {
      ondismiss: () => {
        if (completed) return;
        finish();
        options.onDismiss();
      },
    },
  });

  checkout.on("payment.failed", (response: RazorpayFailureResponse) => {
    if (completed) return;
    finish();
    options.onFailure({
      code: response.error?.code ?? "payment_failed",
      description:
        response.error?.description ?? "Payment failed. Please try again.",
    });
  });

  checkout.open();
}
