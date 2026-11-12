import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  merchantSubscriptionFromJson,
  subscriptionPaymentOrderFromJson,
  subscriptionPlanFromJson,
  verifyPaymentRequestToJson,
  type MerchantSubscription,
  type SubscriptionPaymentOrder,
  type SubscriptionPlan,
  type VerifySubscriptionPaymentRequest,
} from "../types/subscription";

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await apiClient.get(API_ENDPOINTS.subscriptionPlans);
  if (response.status !== 200) {
    const envelope = parseApiEnvelope(response.data);
    throw new ApiError(
      envelopeErrorMessage(response.status, envelope),
      response.status,
    );
  }
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(
      envelopeErrorMessage(response.status, envelope),
      response.status,
    );
  }
  const plansRaw = (envelope.data as Record<string, unknown>).plans;
  if (!Array.isArray(plansRaw)) {
    return [];
  }
  return plansRaw
    .filter(
      (item): item is Record<string, unknown> =>
        item != null && typeof item === "object",
    )
    .map((item) => subscriptionPlanFromJson(item))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function fetchCurrentSubscription(): Promise<MerchantSubscription | null> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.merchantSubscription);
    if (response.status !== 200) {
      const envelope = parseApiEnvelope(response.data);
      throw new ApiError(
        envelopeErrorMessage(response.status, envelope),
        response.status,
      );
    }
    const envelope = parseApiEnvelope(response.data);
    if (!envelope.success || typeof envelope.data !== "object") {
      throw new ApiError(
        envelopeErrorMessage(response.status, envelope),
        response.status,
      );
    }
    const sub = (envelope.data as Record<string, unknown>).subscription;
    if (!sub || typeof sub !== "object") {
      return null;
    }
    return merchantSubscriptionFromJson(sub as Record<string, unknown>);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function selectSubscriptionPlan(
  planId: string,
): Promise<MerchantSubscription> {
  const response = await apiClient.post(API_ENDPOINTS.merchantSubscriptionSelect, {
    plan_id: planId,
  });
  if (response.status !== 200 && response.status !== 201) {
    const envelope = parseApiEnvelope(response.data);
    throw new ApiError(
      envelopeErrorMessage(response.status, envelope),
      response.status,
    );
  }
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(
      envelopeErrorMessage(response.status, envelope),
      response.status,
    );
  }
  const data = envelope.data as Record<string, unknown>;
  const sub = data.subscription;
  if (sub && typeof sub === "object") {
    return merchantSubscriptionFromJson(sub as Record<string, unknown>);
  }
  return merchantSubscriptionFromJson(data);
}

export async function createSubscriptionPaymentOrder(): Promise<SubscriptionPaymentOrder> {
  const response = await apiClient.post(
    API_ENDPOINTS.merchantSubscriptionPaymentOrder,
    {},
  );
  if (response.status !== 200 && response.status !== 201) {
    const envelope = parseApiEnvelope(response.data);
    throw new ApiError(
      envelopeErrorMessage(response.status, envelope),
      response.status,
    );
  }
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(
      envelopeErrorMessage(response.status, envelope),
      response.status,
    );
  }
  return subscriptionPaymentOrderFromJson(
    envelope.data as Record<string, unknown>,
  );
}

export async function verifySubscriptionPayment(
  request: VerifySubscriptionPaymentRequest,
): Promise<MerchantSubscription> {
  const response = await apiClient.post(
    API_ENDPOINTS.merchantSubscriptionPaymentVerify,
    verifyPaymentRequestToJson(request),
  );
  if (response.status !== 200) {
    const envelope = parseApiEnvelope(response.data);
    throw new ApiError(
      envelopeErrorMessage(response.status, envelope),
      response.status,
    );
  }
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(
      envelopeErrorMessage(response.status, envelope),
      response.status,
    );
  }
  const data = envelope.data as Record<string, unknown>;
  const sub = data.subscription;
  if (sub && typeof sub === "object") {
    return merchantSubscriptionFromJson(sub as Record<string, unknown>);
  }
  throw new ApiError(
    envelopeErrorMessage(response.status, envelope),
    response.status,
  );
}
