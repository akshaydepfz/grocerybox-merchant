"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Palette, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/shared/error-state";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { Button } from "@/components/ui/button";
import { dashboardRoutePrefix } from "@/config/routes";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { MERCHANT_PROFILE_QUERY_KEY } from "@/features/profile/hooks/use-merchant-profile";
import { ProfileSection } from "@/features/profile/components/profile-parts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/components/auth-provider";
import { AuthError, resolveSignedInEmail } from "@/features/auth/services/auth-service";
import { ApiError } from "@/lib/api/types";
import { useMediaQuery } from "@/hooks/use-media-query";

import { fetchStore } from "../services/store-identity-service";
import {
  deleteBanner,
  deleteLogo,
  fetchBranding,
  friendlyBrandingUploadMessage,
  updateBrandingColors,
  uploadBanner,
  uploadLogo,
} from "../services/store-branding-service";
import type { StoreBrandingData } from "../types/store-branding";
import {
  BRANDING_QUICK_PICK_HEX,
  DEFAULT_PRIMARY_HEX,
  DEFAULT_SECONDARY_HEX,
  colorFromHex,
  colorToHex,
} from "../utils/brand-colors";
import {
  displayNameFromUrl,
  validateBannerUpload,
  validateBrandingColors,
  validateLogoUpload,
} from "../validators/store-branding-validator";

import {
  MerchantOnboardingScreenLayout,
  OnboardingFormFooter,
  OnboardingStepProgress,
} from "./merchant-onboarding-layout";
import {
  BannerUploadCard,
  BrandColorSelector,
  LogoUploadCard,
  QuickPickSwatches,
  StoreBrandingPreview,
} from "./store-branding-parts";
import { StoreBrandingColorPickerDialog } from "./store-branding-color-picker-dialog";

const STORE_IDENTITY_PATH = "/onboarding/store-identity";
const STORE_LOCATION_PATH = "/onboarding/store-location";
const PROFILE_PATH = `${dashboardRoutePrefix}/profile`;
const CONTINUE_LIME_CLASS = "bg-[#C7F400]";

type ImageKind = "logo" | "banner";

type StoreBrandingScreenProps = {
  /** Onboarding step flow vs editable from merchant profile. */
  mode?: "onboarding" | "edit";
};

export function StoreBrandingScreen({ mode = "onboarding" }: StoreBrandingScreenProps) {
  const isEditMode = mode === "edit";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const signedInEmail = resolveSignedInEmail(user?.email);
  const twoCol = useMediaQuery("(min-width: 640px)");
  const wideColors = useMediaQuery("(min-width: 720px)");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [brandingOverride, setBrandingOverride] =
    useState<StoreBrandingData | null>(null);
  const [userColors, setUserColors] = useState<{
    primary: string;
    secondary: string;
    quickPick: number;
  } | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState("");
  const [bannerFileName, setBannerFileName] = useState("");
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);
  const [bannerUploadProgress, setBannerUploadProgress] = useState(0);
  const [picker, setPicker] = useState<"primary" | "secondary" | null>(null);
  const [deleteKind, setDeleteKind] = useState<ImageKind | null>(null);

  const brandingQuery = useQuery({
    queryKey: ["merchant-store-branding"],
    queryFn: fetchBranding,
    enabled: Boolean(user),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const storeQuery = useQuery({
    queryKey: ["merchant-store"],
    queryFn: fetchStore,
    enabled: Boolean(user),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const storeName = storeQuery.data?.storeName?.trim() || "Fresh Mart";

  const branding = brandingOverride ?? brandingQuery.data ?? null;

  const serverPrimary =
    colorFromHex(branding?.branding.primaryColor) ?? DEFAULT_PRIMARY_HEX;
  const serverSecondary =
    colorFromHex(branding?.branding.secondaryColor) ?? DEFAULT_SECONDARY_HEX;
  const serverQuickPick = BRANDING_QUICK_PICK_HEX.findIndex(
    (c) => colorToHex(c) === colorToHex(serverPrimary),
  );

  const primaryHex = userColors?.primary ?? serverPrimary;
  const secondaryHex = userColors?.secondary ?? serverSecondary;
  const selectedQuickPick =
    userColors?.quickPick ?? (serverQuickPick >= 0 ? serverQuickPick : -1);

  const refreshBrandingCaches = () => {
    void queryClient.invalidateQueries({ queryKey: ["merchant-store-branding"] });
    if (isEditMode) {
      void queryClient.invalidateQueries({ queryKey: MERCHANT_PROFILE_QUERY_KEY });
    }
  };

  useEffect(() => {
    if (brandingQuery.error) {
      const err = brandingQuery.error;
      toast.error(
        err instanceof ApiError ? err.message : "Unable to load store branding.",
      );
    }
  }, [brandingQuery.error]);

  const hasRemoteLogo = Boolean(branding?.branding.logoUrl);
  const hasRemoteBanner = Boolean(branding?.branding.bannerUrl);
  const hasLogo = hasRemoteLogo || Boolean(logoPreviewUrl);
  const hasBanner = hasRemoteBanner || Boolean(bannerPreviewUrl);

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) =>
      uploadLogo(file, (ratio) => setLogoUploadProgress(ratio)),
    onSettled: () => setLogoUploadProgress(0),
  });

  const uploadBannerMutation = useMutation({
    mutationFn: (file: File) =>
      uploadBanner(file, (ratio) => setBannerUploadProgress(ratio)),
    onSettled: () => setBannerUploadProgress(0),
  });

  const deleteLogoMutation = useMutation({ mutationFn: deleteLogo });
  const deleteBannerMutation = useMutation({ mutationFn: deleteBanner });

  const saveColorsMutation = useMutation({
    mutationFn: () =>
      updateBrandingColors({
        primaryColor: colorToHex(primaryHex),
        secondaryColor: colorToHex(secondaryHex),
      }),
  });

  const isBusy =
    brandingQuery.isLoading ||
    uploadLogoMutation.isPending ||
    uploadBannerMutation.isPending ||
    deleteLogoMutation.isPending ||
    deleteBannerMutation.isPending ||
    saveColorsMutation.isPending;

  const handleFilePick = async (kind: ImageKind, file: File) => {
    const validation =
      kind === "logo"
        ? validateLogoUpload(file.size, file.type, file.name)
        : validateBannerUpload(file.size, file.type, file.name);

    if (validation) {
      toast.error(validation);
      return;
    }

    const preview = URL.createObjectURL(file);
    if (kind === "logo") {
      setLogoPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return preview;
      });
      setLogoFileName(file.name);
    } else {
      setBannerPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return preview;
      });
      setBannerFileName(file.name);
    }

    try {
      const data =
        kind === "logo"
          ? await uploadLogoMutation.mutateAsync(file)
          : await uploadBannerMutation.mutateAsync(file);
      setBrandingOverride(data);
      refreshBrandingCaches();
      if (isEditMode) {
        toast.success(kind === "logo" ? "Logo updated" : "Banner updated");
      }
      if (kind === "logo") {
        setLogoFileName(
          displayNameFromUrl(data.branding.logoUrl, file.name),
        );
      } else {
        setBannerFileName(
          displayNameFromUrl(data.branding.bannerUrl, file.name),
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(friendlyBrandingUploadMessage(error));
      } else if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error("Unable to upload image.");
      }
    }
  };

  const onFileInputChange =
    (kind: ImageKind) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (file) void handleFilePick(kind, file);
    };

  const confirmDelete = async () => {
    if (!deleteKind) return;
    const kind = deleteKind;
    setDeleteKind(null);
    try {
      const data =
        kind === "logo"
          ? await deleteLogoMutation.mutateAsync()
          : await deleteBannerMutation.mutateAsync();
      setBrandingOverride(data);
      refreshBrandingCaches();
      if (isEditMode) {
        toast.success(kind === "logo" ? "Logo removed" : "Banner removed");
      }
      if (kind === "logo") {
        setLogoFileName("");
        setLogoPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      } else {
        setBannerFileName("");
        setBannerPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      }
    } catch (error) {
      toast.error(
        error instanceof ApiError || error instanceof AuthError
          ? error.message
          : "Unable to remove image.",
      );
    }
  };

  const applyQuickPick = (index: number) => {
    const primary = BRANDING_QUICK_PICK_HEX[index] ?? DEFAULT_PRIMARY_HEX;
    let secondary: string;
    if (index === 1) {
      secondary = "#16A34A";
    } else if (index === 0) {
      secondary = "#D4FF3F";
    } else {
      secondary =
        BRANDING_QUICK_PICK_HEX[(index + 1) % BRANDING_QUICK_PICK_HEX.length] ??
        DEFAULT_SECONDARY_HEX;
    }
    setUserColors({ primary, secondary, quickPick: index });
  };

  const handleContinue = async () => {
    if (isBusy) return;

    if (!hasLogo) {
      toast.error("Please upload a store logo before continuing.");
      return;
    }

    const colorError = validateBrandingColors(
      colorToHex(primaryHex),
      colorToHex(secondaryHex),
    );
    if (colorError) {
      toast.error(colorError);
      return;
    }

    try {
      await saveColorsMutation.mutateAsync();
      refreshBrandingCaches();
      if (isEditMode) {
        toast.success("Brand colours saved");
        router.push(PROFILE_PATH);
      } else {
        router.push(STORE_LOCATION_PATH);
      }
    } catch (error) {
      toast.error(
        error instanceof ApiError || error instanceof AuthError
          ? error.message
          : "Unable to save store branding.",
      );
    }
  };

  const logoSrc = logoPreviewUrl ?? branding?.branding.logoUrl ?? null;
  const bannerSrc = bannerPreviewUrl ?? branding?.branding.bannerUrl ?? null;

  const logoCardProps = {
    hasLogo: hasLogo || uploadLogoMutation.isPending,
    displayName:
      logoFileName ||
      displayNameFromUrl(branding?.branding.logoUrl, "store-logo"),
    logoSrc,
    primaryHex,
    isLoading: brandingQuery.isLoading,
    isUploading: uploadLogoMutation.isPending,
    uploadProgress: logoUploadProgress,
    isBusy,
    onUpload: () => logoInputRef.current?.click(),
    onChange: () => logoInputRef.current?.click(),
    onDelete: () => setDeleteKind("logo"),
  };

  const bannerCardProps = {
    hasBanner: hasBanner || uploadBannerMutation.isPending,
    displayName:
      bannerFileName ||
      displayNameFromUrl(branding?.branding.bannerUrl, "store-banner"),
    bannerSrc,
    primaryHex,
    secondaryHex,
    isLoading: brandingQuery.isLoading,
    isUploading: uploadBannerMutation.isPending,
    uploadProgress: bannerUploadProgress,
    isBusy,
    onUpload: () => bannerInputRef.current?.click(),
    onChange: () => bannerInputRef.current?.click(),
    onDelete: () => setDeleteKind("banner"),
  };

  const brandingFormFields = (
    <section className="min-w-0 max-w-full space-y-5 overflow-x-hidden sm:space-y-7">
      <div
        className={
          twoCol
            ? "grid grid-cols-2 gap-5"
            : "flex min-w-0 max-w-full flex-col gap-4 sm:gap-5"
        }
      >
        <LogoUploadCard {...logoCardProps} />
        <BannerUploadCard {...bannerCardProps} />
      </div>

      <div className="min-w-0 max-w-full">
        <p className="text-sm font-bold text-gb-mo-gray-900">Brand Colours</p>
        <p className="mt-1 text-xs leading-relaxed text-gb-mo-gray-400">
          Choose colours for your store theme and branding.
        </p>
        <div
          className={
            wideColors
              ? "mt-3 grid grid-cols-3 gap-5"
              : "mt-3 flex flex-col gap-3 sm:gap-4"
          }
        >
          <BrandColorSelector
            label="Primary Colour"
            required
            hex={colorToHex(primaryHex)}
            disabled={isBusy}
            onClick={() => setPicker("primary")}
          />
          <BrandColorSelector
            label="Secondary Colour"
            required
            hex={colorToHex(secondaryHex)}
            disabled={isBusy}
            onClick={() => setPicker("secondary")}
          />
          <QuickPickSwatches
            selectedIndex={selectedQuickPick}
            disabled={isBusy}
            onSelect={applyQuickPick}
          />
        </div>
      </div>

      <StoreBrandingPreview
        storeName={storeName}
        primaryHex={primaryHex}
        secondaryHex={secondaryHex}
        hasBanner={hasBanner}
        logoSrc={logoSrc}
        bannerSrc={bannerSrc}
      />
    </section>
  );

  let mainContent: ReactNode;

  if (isEditMode) {
    if (!user) {
      mainContent = (
        <GroceryAnimatedLoader
          theme="dashboard"
          label="Loading branding"
          sublabel="Checking sign-in…"
          className="py-24"
        />
      );
    } else if (brandingQuery.isLoading && !branding) {
      mainContent = (
        <GroceryAnimatedLoader
          theme="dashboard"
          label="Loading branding"
          sublabel="Fetching logo, banner, and colours…"
          className="py-24"
        />
      );
    } else if (brandingQuery.isError && !branding) {
      mainContent = (
        <ErrorState
          title="Could not load branding"
          message={
            brandingQuery.error instanceof ApiError
              ? brandingQuery.error.message
              : "Unable to load store branding."
          }
          onRetry={() => void brandingQuery.refetch()}
          retryLabel="Try again"
        />
      );
    } else {
      mainContent = (
        <DashboardPage className="mx-auto max-w-6xl gap-3 sm:gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2 mb-1 h-8 gap-1 px-2 text-[#6b7280] hover:text-[#1a1f2e]"
                asChild
              >
                <Link href={PROFILE_PATH}>
                  <ArrowLeft className="size-4" />
                  Back to profile
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-[#16a34a]">
                <Palette className="size-5" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Store branding
                </span>
              </div>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-[#1a1f2e] sm:text-2xl">
                Logo, banner & colours
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-[#6b7280]">
                Updates apply to your customer storefront. Logo and banner upload
                immediately; save to apply colour changes.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              className="w-full gap-1.5 bg-[#16a34a] text-white hover:bg-[#15803d] sm:w-auto"
              onClick={() => void handleContinue()}
              disabled={isBusy}
            >
              <Save className="size-4" />
              {saveColorsMutation.isPending ? "Saving…" : "Save colours"}
            </Button>
          </div>

          <ProfileSection
            title="Branding assets"
            description="Upload or replace your store logo and banner."
          >
            {brandingFormFields}
          </ProfileSection>
        </DashboardPage>
      );
    }
  } else {
    mainContent = (
      <MerchantOnboardingScreenLayout
        signedInEmail={signedInEmail}
        currentStep={3}
        footer={
          <OnboardingFormFooter
            onBack={isBusy ? undefined : () => router.push(STORE_IDENTITY_PATH)}
            onContinue={() => void handleContinue()}
            isContinueLoading={saveColorsMutation.isPending}
            continueColor={CONTINUE_LIME_CLASS}
          />
        }
      >
        <OnboardingStepProgress currentStep={3} useGradient />
        <h1 className="mt-4 text-xl font-extrabold tracking-tight text-gb-mo-gray-900 sm:mt-5 sm:text-[28px]">
          Store Branding
        </h1>
        <p className="mt-1 text-xs font-medium leading-relaxed text-gb-mo-gray-500 sm:text-sm">
          Add your store logo, banner and choose your brand colours.
        </p>
        <div className="mt-4 sm:mt-7">{brandingFormFields}</div>
      </MerchantOnboardingScreenLayout>
    );
  }

  return (
    <>
      <input
        ref={logoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileInputChange("logo")}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileInputChange("banner")}
      />

      {mainContent}

      <StoreBrandingColorPickerDialog
        open={picker === "primary"}
        title="Primary colour"
        initialHex={primaryHex}
        onClose={() => setPicker(null)}
        onConfirm={(hex) => {
          const idx = BRANDING_QUICK_PICK_HEX.findIndex(
            (c) => colorToHex(c) === colorToHex(hex),
          );
          setUserColors((prev) => ({
            primary: hex,
            secondary: prev?.secondary ?? secondaryHex,
            quickPick: idx,
          }));
          setPicker(null);
        }}
      />
      <StoreBrandingColorPickerDialog
        open={picker === "secondary"}
        title="Secondary colour"
        initialHex={secondaryHex}
        onClose={() => setPicker(null)}
        onConfirm={(hex) => {
          setUserColors((prev) => ({
            primary: prev?.primary ?? primaryHex,
            secondary: hex,
            quickPick: prev?.quickPick ?? selectedQuickPick,
          }));
          setPicker(null);
        }}
      />

      <Dialog
        open={deleteKind !== null}
        onOpenChange={(open) => !open && setDeleteKind(null)}
      >
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {deleteKind === "logo"
                ? "Remove store logo?"
                : "Remove store banner?"}
            </DialogTitle>
            <DialogDescription>
              {deleteKind === "logo"
                ? "Your store logo will be removed. You can upload a new logo anytime."
                : "Your store banner will be removed. You can upload a new banner anytime."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteKind(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void confirmDelete()}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}