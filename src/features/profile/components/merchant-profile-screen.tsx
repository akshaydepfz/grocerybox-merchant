"use client";

import {
  Banknote,
  Building2,
  CreditCard,
  Globe,
  IndianRupee,
  MapPin,
  MessageCircle,
  Pencil,
  RefreshCw,
  Settings2,
  Store,
  Truck,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingIndicator } from "@/components/shared/loading-indicator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { merchantStorePublicUrl } from "@/config/store-domain";
import { ApiError } from "@/lib/api/types";

import {
  useMerchantProfileQuery,
  useUpdateMerchantAccountNameMutation,
} from "../hooks/use-merchant-profile";
import type { MerchantProfile } from "../types";
import {
  displayOrDash,
  formatProfileDate,
  formatProfileMoney,
} from "../utils/format-profile";
import {
  friendlyMerchantProfileError,
  friendlyProfileNameUpdateError,
} from "../utils/profile-error-message";
import {
  ColorSwatch,
  CopyStoreLinkButton,
  OpenStoreLink,
  ProfileBadge,
  ProfileField,
  ProfileFieldGrid,
  ProfileImagePreview,
  ProfileOnboardingProgress,
  ProfileSection,
  ProfileStatusRow,
} from "./profile-parts";

function accountStatusVariant(
  status: string | null | undefined,
): "success" | "danger" | "neutral" {
  const normalized = status?.toLowerCase() ?? "";
  if (normalized === "active" || normalized === "enabled") return "success";
  if (normalized === "disabled" || normalized === "suspended") return "danger";
  return "neutral";
}

function ProfileHeaderSection({
  profile,
  onEditName,
}: {
  profile: MerchantProfile;
  onEditName: () => void;
}) {
  const account = profile.account;
  const displayName =
    account?.fullName?.trim() ||
    account?.email?.split("@")[0] ||
    "Merchant";
  const imageUrl = account?.profileImageUrl;
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <ProfileSection
      title="Account"
      description="Your merchant account and sign-in details"
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onEditName}
        >
          <Pencil className="size-3.5" />
          Edit name
        </Button>
      }
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-[#eceef2] bg-gradient-to-br from-[#16a34a] to-[#0a3d32] text-2xl font-bold text-white shadow-sm">
          {imageUrl && !imageFailed ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="80px"
              unoptimized
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="flex size-full items-center justify-center">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold text-[#1a1f2e]">{displayName}</h3>
            {account?.emailVerified ? (
              <ProfileBadge variant="success">Email verified</ProfileBadge>
            ) : (
              <ProfileBadge variant="warning">Email not verified</ProfileBadge>
            )}
            <ProfileBadge variant={accountStatusVariant(account?.accountStatus)}>
              {displayOrDash(account?.accountStatus ?? "Unknown")}
            </ProfileBadge>
          </div>
          <p className="mt-1 text-sm text-[#6b7280]">
            {displayOrDash(account?.email)}
          </p>

          <ProfileFieldGrid>
            <ProfileField label="Merchant ID" value={displayOrDash(profile.merchantId)} />
            <ProfileField
              label="Member since"
              value={formatProfileDate(account?.createdAt)}
            />
            <ProfileField label="Phone" value={displayOrDash(account?.phone)} />
          </ProfileFieldGrid>
        </div>
      </div>
    </ProfileSection>
  );
}

export function MerchantProfileScreen() {
  const profileQuery = useMerchantProfileQuery();
  const updateNameMutation = useUpdateMerchantAccountNameMutation();
  const [editOpen, setEditOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const openEdit = () => {
    setNameDraft(profileQuery.data?.account?.fullName?.trim() ?? "");
    setEditOpen(true);
  };

  const saveName = async () => {
    const next = nameDraft.trim();
    if (next.length < 2) {
      toast.error("Enter a name with at least 2 characters.");
      return;
    }
    try {
      await updateNameMutation.mutateAsync({ fullName: next });
      toast.success("Profile name updated");
      setEditOpen(false);
    } catch (error) {
      toast.error(friendlyProfileNameUpdateError(error));
    }
  };

  if (profileQuery.isLoading) {
    return (
      <LoadingIndicator
        label="Loading profile"
        sublabel="Fetching your merchant details…"
        className="py-24"
      />
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    const message = friendlyMerchantProfileError(profileQuery.error);
    const isAuth = profileQuery.error instanceof ApiError && profileQuery.error.status === 401;

    return (
      <ErrorState
        title={isAuth ? "Sign in required" : "Could not load profile"}
        message={message}
        onRetry={() => void profileQuery.refetch()}
        retryLabel="Try again"
      />
    );
  }

  const profile = profileQuery.data;
  const business = profile.business;
  const store = profile.store;
  const branding = profile.branding;
  const location = profile.location;
  const config = profile.configuration;
  const subscription = profile.subscription;
  const storeUrl = store?.subdomain
    ? merchantStorePublicUrl(store.subdomain)
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#16a34a]">
            <UserRound className="size-5" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Merchant profile
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1a1f2e]">
            Your store identity
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#6b7280]">
            View account, business, storefront, and subscription details from
            your live backend profile.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => void profileQuery.refetch()}
          disabled={profileQuery.isFetching}
        >
          <RefreshCw
            className={profileQuery.isFetching ? "size-4 animate-spin" : "size-4"}
          />
          Refresh
        </Button>
      </div>

      <ProfileOnboardingProgress
        status={profile.onboardingStatus}
        storePublished={profile.storePublished}
      />

      <ProfileHeaderSection profile={profile} onEditName={openEdit} />

      <ProfileSection
        title="Business information"
        description="Legal and contact details for your business"
      >
        {business ? (
          <ProfileFieldGrid>
            <ProfileField label="Business name" value={displayOrDash(business.businessName)} />
            <ProfileField label="Business type" value={displayOrDash(business.businessType)} />
            <ProfileField label="Owner name" value={displayOrDash(business.ownerFullName)} />
            <ProfileField label="Mobile" value={displayOrDash(business.mobileNumber)} />
            <ProfileField label="GSTIN" value={displayOrDash(business.gstin)} />
            <ProfileField label="Address line 1" value={displayOrDash(business.addressLine1)} />
            <ProfileField label="Address line 2" value={displayOrDash(business.addressLine2)} />
            <ProfileField label="City" value={displayOrDash(business.city)} />
            <ProfileField label="District" value={displayOrDash(business.district)} />
            <ProfileField label="State" value={displayOrDash(business.state)} />
            <ProfileField label="PIN code" value={displayOrDash(business.pinCode)} />
          </ProfileFieldGrid>
        ) : (
          <p className="text-sm text-[#6b7280]">
            Business details are not set up yet.
          </p>
        )}
      </ProfileSection>

      <ProfileSection
        title="Store information"
        description="Public storefront identity"
        action={
          storeUrl ? (
            <div className="flex flex-wrap gap-2">
              <CopyStoreLinkButton url={storeUrl} />
              {profile.storePublished ? <OpenStoreLink url={storeUrl} /> : null}
            </div>
          ) : null
        }
      >
        {store ? (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Building2 className="size-4 text-[#16a34a]" />
              {profile.storePublished ? (
                <ProfileBadge variant="success">Published</ProfileBadge>
              ) : (
                <ProfileBadge variant="warning">Not published</ProfileBadge>
              )}
              {profile.publishedAt ? (
                <span className="text-xs text-[#6b7280]">
                  Published on {formatProfileDate(profile.publishedAt)}
                </span>
              ) : null}
            </div>
            <ProfileFieldGrid>
              <ProfileField label="Store name" value={displayOrDash(store.storeName)} />
              <ProfileField label="Subdomain" value={displayOrDash(store.subdomain)} />
              <ProfileField label="Store ID" value={displayOrDash(profile.storeId)} />
              <ProfileField label="Public URL" value={storeUrl ?? "—"} className="sm:col-span-2" />
              <ProfileField
                label="Description"
                value={displayOrDash(store.description)}
                className="sm:col-span-2 lg:col-span-3"
              />
            </ProfileFieldGrid>
          </>
        ) : (
          <p className="text-sm text-[#6b7280]">Store identity is not configured yet.</p>
        )}
      </ProfileSection>

      <div className="grid gap-5 lg:grid-cols-2">
        <ProfileSection title="Branding" description="Logo, banner, and theme colors">
          {branding ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileImagePreview
                  src={branding.logoUrl}
                  alt="Store logo"
                  fallbackLabel="No logo"
                />
                <ProfileImagePreview
                  src={branding.bannerUrl}
                  alt="Store banner"
                  aspect="banner"
                  fallbackLabel="No banner"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ColorSwatch label="Primary" color={branding.primaryColor} />
                <ColorSwatch label="Secondary" color={branding.secondaryColor} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#6b7280]">Branding not configured yet.</p>
          )}
        </ProfileSection>

        <ProfileSection title="Location" description="Store address and coordinates">
          {location ? (
            <ProfileFieldGrid>
              <ProfileField
                label="Store address"
                value={displayOrDash(location.storeAddress)}
                className="sm:col-span-2"
              />
              <ProfileField label="City" value={displayOrDash(location.city)} />
              <ProfileField label="District" value={displayOrDash(location.district)} />
              <ProfileField label="State" value={displayOrDash(location.state)} />
              <ProfileField label="PIN code" value={displayOrDash(location.pinCode)} />
              <ProfileField
                label="Coordinates"
                value={
                  location.latitude != null && location.longitude != null
                    ? `${location.latitude}, ${location.longitude}`
                    : "—"
                }
                className="sm:col-span-2"
              />
            </ProfileFieldGrid>
          ) : (
            <p className="text-sm text-[#6b7280]">Location not configured yet.</p>
          )}
        </ProfileSection>
      </div>

      <ProfileSection
        title="Store configuration"
        description="Orders, payments, and delivery settings"
      >
        {config ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ProfileStatusRow icon={MessageCircle} label="WhatsApp orders" enabled={config.whatsAppOrders} />
            <ProfileStatusRow icon={Globe} label="Website orders" enabled={config.websiteOrders} />
            <ProfileStatusRow icon={Truck} label="Home delivery" enabled={config.homeDelivery} />
            <ProfileStatusRow icon={Store} label="Store pickup" enabled={config.storePickup} />
            <ProfileStatusRow icon={IndianRupee} label="UPI payments" enabled={config.upiEnabled} />
            <ProfileStatusRow icon={Banknote} label="Cash on delivery" enabled={config.codEnabled} />
            <ProfileStatusRow
              icon={MapPin}
              label="Delivery radius"
              enabled
              detail={config.deliveryRadius}
            />
            <ProfileStatusRow
              icon={Settings2}
              label="Minimum order"
              enabled
              detail={`₹${config.minimumOrderValue}`}
            />
          </div>
        ) : (
          <p className="text-sm text-[#6b7280]">Store configuration not set yet.</p>
        )}
      </ProfileSection>

      <ProfileSection
        title="Subscription"
        description="Your active plan and billing cycle"
      >
        {subscription?.plan ? (
          <div className="rounded-2xl border border-[#dcefe0] bg-gradient-to-br from-[#f8fcf9] to-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-[#1a1f2e]">
                  {displayOrDash(subscription.plan.name)}
                </p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  {displayOrDash(subscription.plan.description)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#14532d]">
                  {formatProfileMoney(
                    subscription.plan.price,
                    subscription.plan.currency,
                  )}
                </p>
                <p className="text-xs text-[#6b7280]">
                  per {displayOrDash(subscription.plan.billingInterval)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <ProfileBadge variant={subscription.status === "active" ? "success" : "warning"}>
                {displayOrDash(subscription.status)}
              </ProfileBadge>
              <span className="text-xs text-[#6b7280]">
                {formatProfileDate(subscription.startedAt)} —{" "}
                {formatProfileDate(subscription.expiresAt)}
              </span>
            </div>

            {subscription.plan.features.length > 0 ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {subscription.plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-[#374151]"
                  >
                    <CreditCard className="size-3.5 shrink-0 text-[#16a34a]" />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[#6b7280]">No subscription on this account yet.</p>
        )}
      </ProfileSection>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit full name</DialogTitle>
          </DialogHeader>
          <Input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="Your full name"
            autoComplete="name"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void saveName()}
              disabled={updateNameMutation.isPending}
            >
              {updateNameMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
