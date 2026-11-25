"use client";

import {
  Calendar,
  FileText,
  Globe,
  Loader2,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  domainTypeLabel,
  type MerchantDomain,
} from "../types/merchant-domain";
import { formatDomainCreatedDate } from "../utils/format-domain";

import { ConnectionChecklistPanel } from "./connection-checklist-panel";
import { DnsInstructionsPanel } from "./dns-instructions-panel";
import { DomainStatusBadge } from "./domain-status-badge";

type DomainCardProps = {
  domain: MerchantDomain;
  verifying: boolean;
  removing: boolean;
  dnsExpanded: boolean;
  onToggleDns: () => void;
  onVerify: () => void;
  onRemove: () => void;
};

export function DomainCard({
  domain,
  verifying,
  removing,
  dnsExpanded,
  onToggleDns,
  onVerify,
  onRemove,
}: DomainCardProps) {
  const dnsActionVisible =
    domain.verificationStatus === "pending" ||
    domain.verificationStatus === "failed" ||
    Boolean(domain.verification);

  const showDnsInline =
    dnsExpanded &&
    domain.verification &&
    (domain.verificationStatus === "pending" ||
      domain.verificationStatus === "failed");

  const showConnectionChecklist = domain.verificationStatus === "verified";

  return (
    <article className="rounded-xl border border-[#eceef2] bg-white p-4 shadow-[0_1px_2px_rgb(0_0_0_/0.03)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#15803d]">
              <Globe className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-mono text-base font-bold text-[#1a1f2e]">
                {domain.domain}
              </h3>
              <p className="text-xs text-[#6b7280]">
                {domainTypeLabel(domain.domainType)} domain
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <DomainStatusBadge status={domain.verificationStatus} />
            {domain.isPrimary ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#eff6ff] px-2.5 py-1 text-xs font-semibold text-[#1d4ed8]">
                <Star className="size-3 fill-current" aria-hidden />
                Primary
              </span>
            ) : null}
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-[#6b7280]">
            <Calendar className="size-3.5 shrink-0" aria-hidden />
            Added {formatDomainCreatedDate(domain.createdAt)}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:min-w-[12rem] sm:items-stretch">
          {(domain.verificationStatus === "pending" ||
            domain.verificationStatus === "failed") && (
            <Button
              type="button"
              className="h-10 rounded-xl bg-[#16a34a] text-white hover:bg-[#15803d]"
              disabled={verifying || removing}
              onClick={onVerify}
            >
              {verifying ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ShieldCheck className="size-4" aria-hidden />
              )}
              Verify domain
            </Button>
          )}
          {dnsActionVisible && (
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-10 rounded-xl border-[#dcefe0] text-[#15803d] hover:bg-[#f0fdf4]",
                dnsExpanded && "bg-[#f0fdf4]",
              )}
              disabled={removing}
              onClick={onToggleDns}
            >
              <FileText className="size-4" aria-hidden />
              {dnsExpanded ? "Hide DNS" : "View DNS instructions"}
            </Button>
          )}
          {domain.verificationStatus !== "removed" ? (
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-xl text-[#b91c1c] hover:bg-[#fef2f2] hover:text-[#b91c1c]"
              disabled={removing || verifying}
              onClick={onRemove}
            >
              {removing ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="size-4" aria-hidden />
              )}
              Remove domain
            </Button>
          ) : null}
        </div>
      </div>

      {showDnsInline && domain.verification ? (
        <div className="mt-5 border-t border-[#f0f1f4] pt-5">
          <DnsInstructionsPanel
            instructions={domain.verification}
            verifying={verifying}
            verifyDisabled={removing}
            onVerify={onVerify}
          />
        </div>
      ) : null}

      {showConnectionChecklist ? (
        <div className="mt-5 border-t border-[#f0f1f4] pt-5">
          <ConnectionChecklistPanel domainType={domain.domainType} />
        </div>
      ) : null}
    </article>
  );
}