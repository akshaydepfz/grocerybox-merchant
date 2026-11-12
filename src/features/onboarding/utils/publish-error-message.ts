import { SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT } from "../constants";
import { ApiError } from "@/lib/api/types";

type IncompleteSectionPayload = {
  key?: string;
  label?: string;
  missing_fields?: string[];
};

function incompleteSectionsFromApiError(
  error: ApiError,
): IncompleteSectionPayload[] {
  const root = error.body as
    | { data?: { incomplete_sections?: IncompleteSectionPayload[] } }
    | undefined;
  const sections = root?.data?.incomplete_sections;
  return Array.isArray(sections) ? sections : [];
}

/** User-facing publish failure text (422 from POST /merchant/store/publish). */
export function publishErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Unable to publish store.";
  }

  const sections = incompleteSectionsFromApiError(error);
  if (sections.length > 0) {
    const labels = sections
      .map((section) => section.label || section.key || "Section")
      .join(", ");
    const subscriptionBlocked = sections.some(
      (section) => section.key === "subscription_plan",
    );

    if (subscriptionBlocked && SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT) {
      return (
        `The server still requires subscription payment (${labels}). ` +
        "Deploy the latest API with SKIP_MERCHANT_SUBSCRIPTION_PUBLISH=true, " +
        "or complete plan payment on the hosted API."
      );
    }

    return `Complete these sections before publishing: ${labels}.`;
  }

  if (error.message) {
    return error.message;
  }

  return "Unable to publish store.";
}
