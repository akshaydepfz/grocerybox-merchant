import { Plus, Store, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";

import type { MerchantDomain, MerchantDomainType } from "../types/merchant-domain";

import { DomainCard } from "./domain-card";

type DomainTypeSectionProps = {
  domainType: MerchantDomainType;
  title: string;
  description: string;
  example: string;
  domains: MerchantDomain[];
  verifyingId: string | null;
  removingId: string | null;
  expandedDnsId: string | null;
  onAdd: () => void;
  onToggleDns: (domainId: string) => void;
  onVerify: (domainId: string) => void;
  onRemove: (domain: MerchantDomain) => void;
};

const ICONS: Record<MerchantDomainType, LucideIcon> = {
  storefront: Store,
  delivery: Truck,
};

export function DomainTypeSection({
  domainType,
  title,
  description,
  example,
  domains,
  verifyingId,
  removingId,
  expandedDnsId,
  onAdd,
  onToggleDns,
  onVerify,
  onRemove,
}: DomainTypeSectionProps) {
  const Icon = ICONS[domainType];
  const items = domains.filter((d) => d.domainType === domainType && d.verificationStatus !== "removed");

  return (
    <DashboardSurface className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-[#f0f1f4] px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]">
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#1a1f2e]">{title}</h2>
            <p className="mt-1 max-w-xl text-sm text-[#6b7280]">{description}</p>
            <p className="mt-2 font-mono text-xs text-[#9ca3af]">e.g. {example}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10 shrink-0 rounded-xl border-[#dcefe0] text-[#15803d] hover:bg-[#f0fdf4]"
          onClick={onAdd}
        >
          <Plus className="size-4" aria-hidden />
          Add domain
        </Button>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {items.length === 0 ? (
          <EmptyDomainSlot domainType={domainType} onAdd={onAdd} />
        ) : (
          items.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              verifying={verifyingId === domain.id}
              removing={removingId === domain.id}
              dnsExpanded={expandedDnsId === domain.id}
              onToggleDns={() => onToggleDns(domain.id)}
              onVerify={() => onVerify(domain.id)}
              onRemove={() => onRemove(domain)}
            />
          ))
        )}
      </div>
    </DashboardSurface>
  );
}

function EmptyDomainSlot({
  domainType,
  onAdd,
}: {
  domainType: MerchantDomainType;
  onAdd: () => void;
}) {
  const label =
    domainType === "delivery" ? "delivery portal domain" : "storefront domain";

  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-[#dcefe0] bg-[#fafbfc] px-6 py-10 text-center">
      <p className="text-sm font-medium text-[#1a1f2e]">
        No {label} connected yet
      </p>
      <p className="mt-1 max-w-sm text-sm text-[#6b7280]">
        Add a custom hostname to give your {domainType === "delivery" ? "delivery partners" : "customers"} a branded experience.
      </p>
      <Button
        type="button"
        className="mt-5 h-10 rounded-xl bg-[#16a34a] text-white hover:bg-[#15803d]"
        onClick={onAdd}
      >
        <Plus className="size-4" aria-hidden />
        Add domain
      </Button>
    </div>
  );
}