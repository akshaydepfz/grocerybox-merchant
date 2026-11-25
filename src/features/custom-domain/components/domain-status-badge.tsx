import { AlertCircle, CheckCircle2, Clock, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  domainStatusLabel,
  type MerchantDomainVerificationStatus,
} from "../types/merchant-domain";

const STATUS_STYLES: Record<
  MerchantDomainVerificationStatus,
  { badge: string; icon: typeof Clock }
> = {
  pending: {
    badge: "bg-[#fef3c7] text-[#b45309]",
    icon: Clock,
  },
  verified: {
    badge: "bg-[#dcfce7] text-[#15803d]",
    icon: CheckCircle2,
  },
  failed: {
    badge: "bg-[#fee2e2] text-[#b91c1c]",
    icon: AlertCircle,
  },
  removed: {
    badge: "bg-[#f3f4f6] text-[#6b7280]",
    icon: Trash2,
  },
};

type DomainStatusBadgeProps = {
  status: MerchantDomainVerificationStatus;
  className?: string;
};

export function DomainStatusBadge({ status, className }: DomainStatusBadgeProps) {
  const style = STATUS_STYLES[status];
  const Icon = style.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        style.badge,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {domainStatusLabel(status)}
    </span>
  );
}