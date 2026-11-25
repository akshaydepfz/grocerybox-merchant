"use client";

import { Copy, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import type { MerchantDomainVerificationInstructions } from "../types/merchant-domain";

type DnsInstructionsPanelProps = {
  instructions: MerchantDomainVerificationInstructions;
  verifying?: boolean;
  onVerify?: () => void;
  verifyDisabled?: boolean;
};

async function copyText(label: string, value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Could not copy ${label.toLowerCase()}`);
  }
}

function DnsCopyField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
        {label}
      </p>
      <div className="flex items-stretch gap-2">
        <div
          className={`min-w-0 flex-1 rounded-lg border border-[#eceef2] bg-[#fafbfc] px-3 py-2.5 text-sm text-[#1a1f2e] ${
            mono ? "font-mono text-xs break-all sm:text-sm" : ""
          }`}
        >
          {value}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 rounded-lg border-[#dcefe0] text-[#15803d] hover:bg-[#f0fdf4]"
          onClick={() => void copyText(label, value)}
          aria-label={`Copy ${label}`}
        >
          <Copy className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function DnsInstructionsPanel({
  instructions,
  verifying = false,
  onVerify,
  verifyDisabled = false,
}: DnsInstructionsPanelProps) {
  return (
    <div className="space-y-5 rounded-xl border border-[#eceef2] bg-[#fafbfc] p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-bold text-[#1a1f2e]">DNS verification setup</h3>
        <p className="mt-1 text-sm text-[#6b7280]">
          Add the TXT record below to prove you own this domain.
        </p>
      </div>
      <ol className="space-y-5">
        <li>
          <p className="text-sm font-semibold text-[#1a1f2e]">
            Step 1 — Open your domain provider
          </p>
          <p className="mt-1 text-sm text-[#6b7280]">
            Go to DNS Management in GoDaddy, Hostinger, Cloudflare, or your
            domain provider.
          </p>
        </li>
        <li>
          <p className="text-sm font-semibold text-[#1a1f2e]">
            Step 2 — Add TXT record
          </p>
          <div className="mt-3 space-y-3">
            <DnsCopyField label="Record type" value={instructions.recordType} />
            <DnsCopyField
              label="Record name"
              value={instructions.recordName}
              mono
            />
            <DnsCopyField
              label="Record value"
              value={instructions.recordValue}
              mono
            />
          </div>
        </li>
        <li>
          <p className="text-sm font-semibold text-[#1a1f2e]">
            Step 3 — Verify ownership
          </p>
          <p className="mt-1 text-sm text-[#6b7280]">
            DNS changes can take from a few minutes up to 48 hours to propagate.
            When your TXT record is live, run verification below.
          </p>
          {onVerify ? (
            <Button
              type="button"
              className="mt-3 h-11 w-full rounded-xl bg-[#16a34a] text-white hover:bg-[#15803d] sm:w-auto sm:px-8"
              disabled={verifyDisabled || verifying}
              onClick={onVerify}
            >
              {verifying ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ShieldCheck className="size-4" aria-hidden />
              )}
              Verify domain
            </Button>
          ) : null}
        </li>
      </ol>
    </div>
  );
}