"use client";

import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ErrorState } from "@/components/shared/error-state";

import { useMerchantDomainDetail } from "../hooks/use-merchant-domains";
import type { MerchantDomain } from "../types/merchant-domain";

import { DnsInstructionsPanel } from "./dns-instructions-panel";

type DnsInstructionsDialogProps = {
  domain: MerchantDomain | null;
  open: boolean;
  verifying: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (domainId: string) => void;
  canVerify: boolean;
};

export function DnsInstructionsDialog({
  domain,
  open,
  verifying,
  onOpenChange,
  onVerify,
  canVerify,
}: DnsInstructionsDialogProps) {
  const domainId = open && domain ? domain.id : null;
  const detailQuery = useMerchantDomainDetail(domainId);

  const instructions =
    detailQuery.data?.verification ??
    domain?.verification;

  const showVerify =
    domain &&
    (domain.verificationStatus === "pending" ||
      domain.verificationStatus === "failed");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] max-w-lg gap-0 overflow-hidden overflow-y-auto rounded-2xl border-[#eceef2] p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-[#f0f1f4] px-5 py-4 text-left">
          <DialogTitle className="text-lg font-bold text-[#1a1f2e]">
            DNS instructions
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-[#6b7280]">
            {domain?.domain ?? "—"}
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4">
          {detailQuery.isLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Loader2 className="size-8 animate-spin text-[#16a34a]" aria-hidden />
            </div>
          ) : detailQuery.isError ? (
            <ErrorState
              title="Could not load DNS details"
              message="Try again or refresh your domain list."
              onRetry={() => void detailQuery.refetch()}
              className="py-8"
            />
          ) : instructions ? (
            <DnsInstructionsPanel
              instructions={instructions}
              verifying={verifying}
              verifyDisabled={!canVerify}
              onVerify={
                showVerify && domain
                  ? () => onVerify(domain.id)
                  : undefined
              }
            />
          ) : (
            <p className="text-sm text-[#6b7280]">
              No DNS verification instructions are available for this domain
              right now.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}