"use client";

import {
  CreditCard,
  Globe,
  Home,
  MapPin,
  MessageCircle,
  Receipt,
  RefreshCw,
  Save,
  Settings2,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingIndicator } from "@/components/shared/loading-indicator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/auth-provider";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { ProfileSection } from "@/features/profile/components/profile-parts";
import { ToggleSettingCard } from "@/features/onboarding/components/store-config-parts";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ApiError } from "@/lib/api/types";

import {
  usePatchStoreSettingsMutation,
  useStoreSettingsQuery,
} from "../hooks/use-store-settings";
import type { StoreSettingsData, StoreSettingsFormState } from "../types/store-settings";
import { storeSettingsDataToFormState } from "../types/store-settings";
import { validateStoreSettingsForm } from "../validators/store-settings-validator";

import {
  StoreSettingsAlert,
  StoreSettingsNumericField,
  StoreSettingsToggleGrid,
} from "./store-settings-parts";

function applyLoadedSettings(
  data: StoreSettingsData,
  setForm: Dispatch<SetStateAction<StoreSettingsFormState | null>>,
) {
  setForm(storeSettingsDataToFormState(data));
}

function friendlyStoreSettingsError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return "Unable to load store settings.";
}

export function StoreSettingsScreen() {
  const { user } = useAuth();
  const twoCol = useMediaQuery("(min-width: 560px)");
  const settingsQuery = useStoreSettingsQuery();
  const saveMutation = usePatchStoreSettingsMutation();

  const userModifiedRef = useRef(false);
  const isApplyingLoadRef = useRef(false);
  const [form, setForm] = useState<StoreSettingsFormState | null>(null);

  useEffect(() => {
    if (!settingsQuery.data || userModifiedRef.current) {
      return;
    }
    isApplyingLoadRef.current = true;
    applyLoadedSettings(settingsQuery.data, setForm);
    isApplyingLoadRef.current = false;
  }, [settingsQuery.data]);

  const patchForm = (patch: Partial<StoreSettingsFormState>) => {
    if (!isApplyingLoadRef.current) {
      userModifiedRef.current = true;
    }
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const busy = settingsQuery.isLoading || saveMutation.isPending;
  const websiteCheckoutInactive = form ? !form.websiteOrders : false;
  const noChannels = form ? !form.whatsAppOrders && !form.websiteOrders : false;
  const noFulfillment = form
    ? !form.homeDeliveryEnabled && !form.storePickupEnabled
    : false;

  const handleSave = async () => {
    if (busy || !form) return;

    const validated = validateStoreSettingsForm({
      whatsAppOrders: form.whatsAppOrders,
      websiteOrders: form.websiteOrders,
      upiEnabled: form.upiEnabled,
      codEnabled: form.codEnabled,
      homeDeliveryEnabled: form.homeDeliveryEnabled,
      storePickupEnabled: form.storePickupEnabled,
      deliveryRadiusKmText: form.deliveryRadiusKm,
      minimumOrderValueText: form.minimumOrderValue,
      standardDeliveryFeeText: form.standardDeliveryFee,
      freeDeliveryThresholdText: form.freeDeliveryThreshold,
      platformHandlingFeeText: form.platformHandlingFee,
    });

    if (validated.error) {
      toast.error(validated.error);
      return;
    }
    if (!validated.patchBody) {
      toast.error("Unable to save store settings.");
      return;
    }

    try {
      const updated = await saveMutation.mutateAsync(validated.patchBody);
      userModifiedRef.current = false;
      isApplyingLoadRef.current = true;
      applyLoadedSettings(updated, setForm);
      isApplyingLoadRef.current = false;
      toast.success("Store settings saved successfully");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Unable to save store settings.",
      );
    }
  };

  if (!user) {
    return (
      <LoadingIndicator
        label="Loading store settings"
        sublabel="Checking sign-in…"
        className="py-24"
      />
    );
  }

  if (settingsQuery.isLoading && !form) {
    return (
      <LoadingIndicator
        label="Loading store settings"
        sublabel="Fetching your store configuration…"
        className="py-24"
      />
    );
  }

  if ((settingsQuery.isError || !settingsQuery.data) && !form) {
    return (
      <ErrorState
        title="Could not load store settings"
        message={friendlyStoreSettingsError(settingsQuery.error)}
        onRetry={() => void settingsQuery.refetch()}
        retryLabel="Try again"
      />
    );
  }

  if (!form) {
    return (
      <ErrorState
        title="Could not load store settings"
        message="Store settings are unavailable."
        onRetry={() => void settingsQuery.refetch()}
        retryLabel="Try again"
      />
    );
  }

  return (
    <DashboardPage className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#16a34a]">
            <Settings2 className="size-5" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Store settings
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1a1f2e]">
            Orders, payments & delivery
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#6b7280]">
            Configure how customers place orders, pay at checkout, and receive
            deliveries.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => void settingsQuery.refetch()}
            disabled={settingsQuery.isFetching || busy}
          >
            <RefreshCw
              className={
                settingsQuery.isFetching ? "size-4 animate-spin" : "size-4"
              }
            />
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-1.5 bg-[#16a34a] text-white hover:bg-[#15803d]"
            onClick={() => void handleSave()}
            disabled={busy}
          >
            <Save className="size-4" />
            {saveMutation.isPending ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </div>

      {noChannels ? (
        <StoreSettingsAlert
          variant="warning"
          message="Both order channels are off. Customers will not be able to place new orders until at least one channel is enabled."
        />
      ) : null}

      {noFulfillment ? (
        <StoreSettingsAlert
          variant="warning"
          message="Both fulfillment methods are disabled. Enable home delivery or store pickup so orders can be fulfilled."
        />
      ) : null}

      <div className="space-y-5">
        <ProfileSection
          title="Order Channels"
          description="Control how customers can place orders."
        >
          <StoreSettingsToggleGrid twoCol={twoCol}>
            <ToggleSettingCard
              title="WhatsApp Orders"
              description="Let customers order through WhatsApp."
              icon={MessageCircle}
              value={form.whatsAppOrders}
              disabled={busy}
              onChange={(whatsAppOrders) => patchForm({ whatsAppOrders })}
            />
            <ToggleSettingCard
              title="Website Orders"
              description="Enable checkout on your online store."
              icon={Globe}
              value={form.websiteOrders}
              disabled={busy}
              onChange={(websiteOrders) => patchForm({ websiteOrders })}
            />
          </StoreSettingsToggleGrid>
        </ProfileSection>

        <ProfileSection
          title="Payment Methods"
          description={
            websiteCheckoutInactive
              ? "Website checkout is off. These settings apply when website orders are enabled."
              : "Configure UPI and cash on delivery for website checkout."
          }
        >
          {websiteCheckoutInactive ? (
            <div className="mb-4">
              <StoreSettingsAlert
                variant="info"
                message="These payment methods are not shown at website checkout while website orders are disabled. You can still configure them here."
              />
            </div>
          ) : null}
          <StoreSettingsToggleGrid twoCol={twoCol}>
            <ToggleSettingCard
              title="UPI Payments"
              description="Google Pay, PhonePe, and other UPI apps."
              icon={CreditCard}
              value={form.upiEnabled}
              disabled={busy}
              onChange={(upiEnabled) => patchForm({ upiEnabled })}
            />
            <ToggleSettingCard
              title="Cash on Delivery"
              description="Collect payment when the order is delivered."
              icon={Receipt}
              value={form.codEnabled}
              disabled={busy}
              onChange={(codEnabled) => patchForm({ codEnabled })}
            />
          </StoreSettingsToggleGrid>
        </ProfileSection>

        <ProfileSection
          title="Fulfillment"
          description="Home delivery and in-store pickup options."
        >
          <StoreSettingsToggleGrid twoCol={twoCol}>
            <ToggleSettingCard
              title="Home Delivery"
              description="Deliver orders within your service area."
              icon={Home}
              value={form.homeDeliveryEnabled}
              disabled={busy}
              onChange={(homeDeliveryEnabled) => patchForm({ homeDeliveryEnabled })}
            />
            <ToggleSettingCard
              title="Store Pickup"
              description="Customers collect orders from your store."
              icon={Store}
              value={form.storePickupEnabled}
              disabled={busy}
              onChange={(storePickupEnabled) => patchForm({ storePickupEnabled })}
            />
          </StoreSettingsToggleGrid>
        </ProfileSection>

        <ProfileSection
          title="Delivery Configuration"
          description="Radius, order limits, and delivery pricing."
        >
          <div
            className={
              twoCol
                ? "grid grid-cols-2 gap-4"
                : "flex flex-col gap-4"
            }
          >
            <StoreSettingsNumericField
              label="Delivery Radius (km)"
              icon={MapPin}
              value={form.deliveryRadiusKm}
              disabled={busy}
              onChange={(deliveryRadiusKm) => patchForm({ deliveryRadiusKm })}
            />
            <StoreSettingsNumericField
              label="Minimum Order Value (₹)"
              icon={ShoppingBag}
              rupeePrefix
              value={form.minimumOrderValue}
              disabled={busy}
              onChange={(minimumOrderValue) => patchForm({ minimumOrderValue })}
            />
            <StoreSettingsNumericField
              label="Standard Delivery Fee (₹)"
              icon={Truck}
              rupeePrefix
              value={form.standardDeliveryFee}
              disabled={busy}
              onChange={(standardDeliveryFee) => patchForm({ standardDeliveryFee })}
            />
            <StoreSettingsNumericField
              label="Free Delivery Threshold (₹)"
              icon={ShoppingBag}
              rupeePrefix
              value={form.freeDeliveryThreshold}
              disabled={busy}
              onChange={(freeDeliveryThreshold) =>
                patchForm({ freeDeliveryThreshold })
              }
            />
            <StoreSettingsNumericField
              label="Platform and Handling Fee (₹)"
              icon={Receipt}
              rupeePrefix
              value={form.platformHandlingFee}
              disabled={busy}
              onChange={(platformHandlingFee) =>
                patchForm({ platformHandlingFee })
              }
            />
          </div>
        </ProfileSection>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          className="gap-1.5 bg-[#16a34a] text-white hover:bg-[#15803d]"
          onClick={() => void handleSave()}
          disabled={busy}
        >
          <Save className="size-4" />
          {saveMutation.isPending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </DashboardPage>
  );
}
