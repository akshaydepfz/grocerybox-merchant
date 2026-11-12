"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/components/auth-provider";
import { AuthError, resolveSignedInEmail } from "@/features/auth/services/auth-service";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import {
  fetchStoreConfig,
  saveStoreConfig,
} from "../services/store-config-service";
import {
  defaultStoreConfigFormState,
  storeConfigDataToFormState,
  type StoreConfigData,
  type StoreConfigFormState,
} from "../types/store-config";
import {
  STORE_CONFIG_DELIVERY_RADII,
  validateStoreConfig,
} from "../validators/store-config-validator";

import {
  MerchantOnboardingScreenLayout,
  OnboardingFormFooter,
  OnboardingStepProgress,
} from "./merchant-onboarding-layout";
import {
  CodLeadingIcon,
  DeliveryRadiusField,
  MinimumOrderValueField,
  OrderOptionCard,
  PaymentOptionTile,
  StoreConfigSection,
  StoreConfigSectionIcons,
  ToggleSettingCard,
  UpiBadge,
} from "./store-config-parts";

const STORE_LOCATION_PATH = "/onboarding/store-location";
const PLAN_PATH = "/onboarding/plan";
const CONTINUE_LIME_CLASS = "bg-[#B4F316]";

function applyLoadedConfig(
  data: StoreConfigData,
  setForm: React.Dispatch<React.SetStateAction<StoreConfigFormState>>,
) {
  const next = storeConfigDataToFormState(data.config);
  if (
    !STORE_CONFIG_DELIVERY_RADII.includes(
      next.deliveryRadius as (typeof STORE_CONFIG_DELIVERY_RADII)[number],
    )
  ) {
    next.deliveryRadius = defaultStoreConfigFormState().deliveryRadius;
  }
  setForm(next);
}

export function StoreConfigScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const signedInEmail = resolveSignedInEmail(user?.email);
  const twoCol = useMediaQuery("(min-width: 560px)");

  const userModifiedRef = useRef(false);
  const isApplyingLoadRef = useRef(false);

  const [form, setForm] = useState<StoreConfigFormState>(
    defaultStoreConfigFormState(),
  );

  const loadQuery = useQuery({
    queryKey: ["merchant-store-config"],
    queryFn: fetchStoreConfig,
    enabled: Boolean(user),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!loadQuery.data || userModifiedRef.current) {
      return;
    }
    isApplyingLoadRef.current = true;
    applyLoadedConfig(loadQuery.data, setForm);
    isApplyingLoadRef.current = false;
  }, [loadQuery.data]);

  useEffect(() => {
    if (loadQuery.error) {
      toast.error(
        loadQuery.error instanceof ApiError
          ? loadQuery.error.message
          : "Unable to load store configuration.",
      );
    }
  }, [loadQuery.error]);

  const patchForm = (patch: Partial<StoreConfigFormState>) => {
    if (!isApplyingLoadRef.current) {
      userModifiedRef.current = true;
    }
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const saveMutation = useMutation({
    mutationFn: saveStoreConfig,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["merchant-onboarding-review"] });
    },
  });

  const busy = loadQuery.isLoading || saveMutation.isPending;

  const handleContinue = async () => {
    if (busy) return;

    const validated = validateStoreConfig({
      whatsAppOrders: form.whatsAppOrders,
      websiteOrders: form.websiteOrders,
      homeDelivery: form.homeDelivery,
      storePickup: form.storePickup,
      deliveryRadius: form.deliveryRadius,
      minimumOrderValueText: form.minimumOrderValue,
      upiEnabled: form.upiEnabled,
      codEnabled: form.codEnabled,
    });

    if (validated.error) {
      toast.error(validated.error);
      return;
    }
    if (!validated.values) {
      toast.error("Unable to save store configuration.");
      return;
    }

    try {
      await saveMutation.mutateAsync(validated.values);
      router.push(PLAN_PATH);
    } catch (error) {
      toast.error(
        error instanceof AuthError || error instanceof ApiError
          ? error.message
          : "Unable to save store configuration.",
      );
    }
  };

  const gridClass = twoCol ? "grid grid-cols-2 gap-3.5" : "flex flex-col gap-3.5";

  return (
    <MerchantOnboardingScreenLayout
      signedInEmail={signedInEmail}
      currentStep={5}
      footer={
        <OnboardingFormFooter
          onBack={busy ? undefined : () => router.push(STORE_LOCATION_PATH)}
          onContinue={() => void handleContinue()}
          isContinueLoading={saveMutation.isPending}
          continueColor={CONTINUE_LIME_CLASS}
        />
      }
    >
      <OnboardingStepProgress currentStep={5} />
      <h1 className="mt-5 text-[28px] font-extrabold tracking-tight text-gb-mo-gray-900">
        Store Configuration
      </h1>
      <p className="mt-1 text-sm font-medium text-gb-mo-gray-500">
        Set up how you want to run your store, deliveries and orders.
      </p>

      {loadQuery.isLoading ? (
        <span
          aria-hidden
          className="mt-4 block h-0.5 w-full bg-gb-mo-progress-track"
        />
      ) : null}

      <section className="mt-7 space-y-5">
        <StoreConfigSection
          icon={StoreConfigSectionIcons.orders}
          title="Order Options"
          subtitle="Choose how customers can place orders."
        >
          <div className={gridClass}>
            <OrderOptionCard
              title="WhatsApp Orders"
              description="Customers can place orders via WhatsApp."
              icon={StoreConfigSectionIcons.whatsApp}
              iconColor="#25D366"
              iconBackground="#E8F8EC"
              selected={form.whatsAppOrders}
              disabled={busy}
              onChange={(whatsAppOrders) => patchForm({ whatsAppOrders })}
            />
            <OrderOptionCard
              title="Website Orders"
              description="Customers can place orders through your online store."
              icon={StoreConfigSectionIcons.website}
              iconColor="#4B5563"
              iconBackground="#F3F4F6"
              selected={form.websiteOrders}
              disabled={busy}
              onChange={(websiteOrders) => patchForm({ websiteOrders })}
            />
          </div>
        </StoreConfigSection>

        <StoreConfigSection
          icon={StoreConfigSectionIcons.delivery}
          title="Delivery & Pickup Settings"
          subtitle="Configure delivery and pickup options for your store."
        >
          <div className={gridClass}>
            <ToggleSettingCard
              title="Home Delivery"
              description="Deliver orders to customers within your service area."
              icon={StoreConfigSectionIcons.homeDelivery}
              value={form.homeDelivery}
              disabled={busy}
              onChange={(homeDelivery) => patchForm({ homeDelivery })}
            />
            <ToggleSettingCard
              title="Store Pickup"
              description="Allow customers to pick up orders from your store."
              icon={StoreConfigSectionIcons.storePickup}
              value={form.storePickup}
              disabled={busy}
              onChange={(storePickup) => patchForm({ storePickup })}
            />
          </div>

          <div className={cn(gridClass, "mt-4")}>
            <DeliveryRadiusField
              value={form.deliveryRadius}
              onChange={(deliveryRadius) => patchForm({ deliveryRadius })}
            />
            <MinimumOrderValueField
              value={form.minimumOrderValue}
              disabled={busy}
              onChange={(minimumOrderValue) => patchForm({ minimumOrderValue })}
            />
          </div>
        </StoreConfigSection>

        <StoreConfigSection
          icon={StoreConfigSectionIcons.payment}
          title="Payment Options"
          subtitle="Choose the payment methods you want to accept."
        >
          <div className={gridClass}>
            <PaymentOptionTile
              label="UPI (Google Pay, PhonePe, etc.)"
              leading={<UpiBadge />}
              value={form.upiEnabled}
              disabled={busy}
              onChange={(upiEnabled) => patchForm({ upiEnabled })}
            />
            <PaymentOptionTile
              label="Cash on Delivery (COD)"
              leading={<CodLeadingIcon />}
              value={form.codEnabled}
              disabled={busy}
              onChange={(codEnabled) => patchForm({ codEnabled })}
            />
          </div>
        </StoreConfigSection>
      </section>
    </MerchantOnboardingScreenLayout>
  );
}
