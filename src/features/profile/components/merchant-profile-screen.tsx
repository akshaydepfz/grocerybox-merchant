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
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/shared/error-state";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { dashboardRoutePrefix } from "@/config/routes";
import { merchantStorePublicUrl } from "@/config/store-domain";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { DashboardStorefrontCard } from "@/features/dashboard/components/dashboard-storefront-card";
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
  ProfileQuickLinks,
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
      className="overflow-hidden"
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 w-full gap-1.5 rounded-xl sm:h-9 sm:w-auto"
          onClick={onEditName}
        >
          <Pencil className="size-3.5" />
          Edit name
        </Button>
      }
    >
      <div className="-mx-3.5 mb-4 bg-gradient-to-br from-[#0a3d32] to-[#14532d] px-4 py-5 text-white sm:mx-0 sm:mb-5 sm:rounded-2xl">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-5">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-white/10 text-xl font-bold shadow-sm sm:size-20 sm:text-2xl">
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
          <div className="min-w-0 w-full flex-1 text-center sm:text-left">
            <h3 className="text-lg font-bold sm:text-xl">{displayName}</h3>
            <p className="mt-0.5 text-sm text-white/75">{displayOrDash(account?.email)}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
              {account?.emailVerified ? (
                <ProfileBadge variant="success">Email verified</ProfileBadge>
              ) : (
                <ProfileBadge variant="warning">Email not verified</ProfileBadge>
              )}
              <ProfileBadge variant={accountStatusVariant(account?.accountStatus)}>
                {displayOrDash(account?.accountStatus ?? "Unknown")}
              </ProfileBadge>
            </div>
          </div>
        </div>
      </div>

      <ProfileFieldGrid>
        <ProfileField label="Merchant ID" value={displayOrDash(profile.merchantId)} />
        <ProfileField
          label="Member since"
          value={formatProfileDate(account?.createdAt)}
        />
        <ProfileField label="Phone" value={displayOrDash(account?.phone)} />
      </ProfileFieldGrid>
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
      <div className="flex min-h-[50vh] items-center justify-center py-16">
        <GroceryAnimatedLoader
          theme="dashboard"
          label="Loading profile"
          sublabel="Fetching your merchant details"
        />
      </div>
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

  const actionButtonClass = "w-full gap-1.5 sm:w-auto";

  const storeName =
    store?.storeName?.trim() ||
    business?.businessName?.trim() ||
    "Your store";

  return (
    <DashboardPage className="mx-auto w-full max-w-6xl gap-3 sm:gap-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#16a34a]">{storeName}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <UserRound className="size-5 shrink-0 text-[#16a34a] lg:hidden" aria-hidden />
            <h1 className="text-xl font-bold tracking-tight text-[#1a1f2e] sm:text-2xl">
              Profile
            </h1>
          </div>
          <p className="mt-0.5 hidden text-sm leading-relaxed text-[#6b7280] sm:block">
            Account, storefront, location, and subscription details.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`${actionButtonClass} h-10 rounded-xl sm:h-9`}
          onClick={() => void profileQuery.refetch()}
          disabled={profileQuery.isFetching}
        >
          <RefreshCw
            className={profileQuery.isFetching ? "size-4 animate-spin" : "size-4"}
          />
          Refresh
        </Button>
      </div>

      <ProfileQuickLinks />

      <DashboardStorefrontCard />

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
            <div className="hidden sm:contents">
              <CopyStoreLinkButton url={storeUrl} className={actionButtonClass} />
              {profile.storePublished ? (
                <OpenStoreLink url={storeUrl} className={actionButtonClass} />
              ) : null}
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
              <ProfileField
                label="Public URL"
                value={storeUrl ?? "—"}
                className="sm:col-span-2 lg:col-span-3"
                valueClassName="font-mono text-xs sm:text-sm"
              />
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

      <div className="grid gap-3 sm:gap-5 lg:grid-cols-2">
        <ProfileSection
          title="Branding"
          description="Logo, banner, and theme colors"
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`${actionButtonClass} h-10 rounded-xl sm:h-9`}
              asChild
            >
              <Link href={`${dashboardRoutePrefix}/profile/branding`}>
                <Pencil className="size-3.5" />
                Edit branding
              </Link>
            </Button>
          }
        >
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
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
          <div className="rounded-xl border border-[#dcefe0] bg-gradient-to-br from-[#f8fcf9] to-white p-3.5 sm:rounded-2xl sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-base font-bold text-[#1a1f2e] sm:text-lg">
                  {displayOrDash(subscription.plan.name)}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#6b7280]">
                  {displayOrDash(subscription.plan.description)}
                </p>
              </div>
              <div className="shrink-0 sm:text-right">
                <p className="text-lg font-bold text-[#14532d] sm:text-xl">
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
    </DashboardPage>
  );
}
