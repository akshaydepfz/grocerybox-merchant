"use client";

import { Globe, Plus, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/auth-provider";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { ApiError } from "@/lib/api/types";

import { friendlyDomainError } from "../services";
import { useMerchantDomains } from "../hooks/use-merchant-domains";
import type { MerchantDomain, MerchantDomainType } from "../types/merchant-domain";
import {
  DELIVERY_DOMAIN_EXAMPLE,
  STOREFRONT_DOMAIN_EXAMPLE,
} from "../utils/format-domain";

import { AddDomainDialog } from "./add-domain-dialog";
import { DnsInstructionsDialog } from "./dns-instructions-dialog";
import { DomainLoadingPlaceholder } from "./domain-loading-placeholder";
import { DomainTypeSection } from "./domain-type-section";
import { RemoveDomainDialog } from "./remove-domain-dialog";

export function CustomDomainScreen() {
  const { user } = useAuth();
  const {
    domains,
    loading,
    error,
    refetch,
    addDomain,
    removeDomain,
    verifyDomain,
    verifyErrorMessage,
    isCreating,
    isRemoving,
    createError,
  } = useMerchantDomains();

  const [addOpen, setAddOpen] = useState(false);
  const [addFormSession, setAddFormSession] = useState(0);
  const [addType, setAddType] = useState<MerchantDomainType>("storefront");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [removingTarget, setRemovingTarget] = useState<MerchantDomain | null>(null);
  const [expandedDnsId, setExpandedDnsId] = useState<string | null>(null);
  const [dnsDialogDomain, setDnsDialogDomain] = useState<MerchantDomain | null>(null);

  const activeDomains = useMemo(
    () => domains.filter((d) => d.verificationStatus !== "removed"),
    [domains],
  );

  const openAdd = (type: MerchantDomainType) => {
    setAddType(type);
    setAddFormSession((current) => current + 1);
    setAddOpen(true);
  };

  const handleAdd = async (input: {
    domain: string;
    domainType: MerchantDomainType;
  }) => {
    try {
      const created = await addDomain(input);
      setExpandedDnsId(created.id);
      if (created.verification) {
        setDnsDialogDomain(created);
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? friendlyDomainError(err)
          : createError ?? "Could not add domain.";
      toast.error(message);
      throw err;
    }
  };

  const handleVerify = async (domainId: string) => {
    if (verifyingId) return;
    setVerifyingId(domainId);
    try {
      await verifyDomain(domainId);
      toast.success("Domain verified successfully.");
      setExpandedDnsId(null);
    } catch (err) {
      toast.error(verifyErrorMessage(err));
    } finally {
      setVerifyingId(null);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!removingTarget || isRemoving) return;
    try {
      await removeDomain(removingTarget.id);
      toast.success("Domain removed.");
      if (expandedDnsId === removingTarget.id) {
        setExpandedDnsId(null);
      }
      setRemovingTarget(null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not remove domain.";
      toast.error(message);
    }
  };

  const toggleDns = (domainId: string) => {
    const domain = domains.find((item) => item.id === domainId);
    const needsFetch =
      domain &&
      !domain.verification &&
      (domain.verificationStatus === "pending" ||
        domain.verificationStatus === "failed");

    if (needsFetch && domain) {
      setDnsDialogDomain(domain);
      return;
    }

    setExpandedDnsId((current) => (current === domainId ? null : domainId));
  };

  if (!user) {
    return (
      <DashboardPage className="py-4">
        <p className="text-sm text-[#6b7280]">Sign in to manage custom domains.</p>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#16a34a]">
            <Globe className="size-5" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Branding
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1a1f2e]">
            Custom Domain
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#6b7280]">
            Connect your own domain to give your grocery store a professional
            online presence.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 rounded-xl border-[#eceef2]"
            disabled={loading}
            onClick={() => void refetch()}
          >
            <RefreshCw className="size-4" aria-hidden />
            Refresh
          </Button>
          <Button
            type="button"
            className="h-10 rounded-xl bg-[#16a34a] text-white hover:bg-[#15803d]"
            onClick={() => openAdd("storefront")}
          >
            <Plus className="size-4" aria-hidden />
            Add domain
          </Button>
        </div>
      </header>

      {loading && !activeDomains.length ? (
        <DomainLoadingPlaceholder />
      ) : error ? (
        <ErrorState
          title="Could not load domains"
          message={error}
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <DomainTypeSection
            domainType="storefront"
            title="Storefront Domain"
            description="Connect your own website domain where customers can browse products and place grocery orders."
            example={STOREFRONT_DOMAIN_EXAMPLE}
            domains={domains}
            verifyingId={verifyingId}
            removingId={isRemoving ? removingTarget?.id ?? null : null}
            expandedDnsId={expandedDnsId}
            onAdd={() => openAdd("storefront")}
            onToggleDns={toggleDns}
            onVerify={(id) => void handleVerify(id)}
            onRemove={setRemovingTarget}
          />
          <DomainTypeSection
            domainType="delivery"
            title="Delivery Domain"
            description="Give your delivery partners a dedicated branded domain to access their delivery portal."
            example={DELIVERY_DOMAIN_EXAMPLE}
            domains={domains}
            verifyingId={verifyingId}
            removingId={isRemoving ? removingTarget?.id ?? null : null}
            expandedDnsId={expandedDnsId}
            onAdd={() => openAdd("delivery")}
            onToggleDns={toggleDns}
            onVerify={(id) => void handleVerify(id)}
            onRemove={setRemovingTarget}
          />
        </div>
      )}

      <AddDomainDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initialDomainType={addType}
        formSession={addFormSession}
        isSubmitting={isCreating}
        onSubmit={handleAdd}
      />

      <RemoveDomainDialog
        open={Boolean(removingTarget)}
        domainHostname={removingTarget?.domain ?? null}
        isRemoving={isRemoving}
        onOpenChange={(open) => {
          if (!open) setRemovingTarget(null);
        }}
        onConfirm={() => void handleRemoveConfirm()}
      />

      <DnsInstructionsDialog
        domain={dnsDialogDomain}
        open={Boolean(dnsDialogDomain)}
        verifying={Boolean(
          dnsDialogDomain && verifyingId === dnsDialogDomain.id,
        )}
        canVerify={!verifyingId}
        onOpenChange={(open) => {
          if (!open) setDnsDialogDomain(null);
        }}
        onVerify={(id) => void handleVerify(id)}
      />
    </DashboardPage>
  );
}