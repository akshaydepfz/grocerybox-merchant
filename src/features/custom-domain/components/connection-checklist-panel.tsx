import { Building2, CheckCircle2, ListChecks, Truck } from "lucide-react";

import { cn } from "@/lib/utils";

import type { MerchantDomainType } from "../types/merchant-domain";

type ConnectionChecklistPanelProps = {
  domainType: MerchantDomainType;
  className?: string;
};

function stepsForType(domainType: MerchantDomainType): string[] {
  const hostingTarget =
    domainType === "delivery"
      ? "GroceryBox delivery application hosting configuration"
      : "GroceryBox customer storefront hosting configuration";

  const testTarget =
    domainType === "delivery" ? "the delivery portal" : "the storefront";

  return [
    "Domain ownership verified.",
    `Add the hostname to the ${hostingTarget}.`,
    "Configure the DNS records shown by GroceryBox.",
    "Wait for DNS propagation and HTTPS provisioning.",
    `Test ${testTarget}.`,
  ];
}

export function ConnectionChecklistPanel({
  domainType,
  className,
}: ConnectionChecklistPanelProps) {
  const steps = stepsForType(domainType);
  const Icon = domainType === "delivery" ? Truck : Building2;

  return (
    <div
      className={cn(
        "rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#dcfce7] text-[#15803d]">
          <ListChecks className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Icon className="size-4 text-[#15803d]" aria-hidden />
            <h3 className="text-sm font-bold text-[#14532d]">
              Connect domain to GroceryBox hosting
            </h3>
          </div>
          <p className="mt-1 text-sm text-[#166534]">
            DNS ownership verification is separate from pointing your domain at
            GroceryBox. After verification, your platform administrator completes
            hosting configuration on the infrastructure side.
          </p>
          <ol className="mt-4 space-y-2.5">
            {steps.map((step, index) => (
              <li
                key={step}
                className="flex gap-2.5 text-sm text-[#14532d]"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#15803d] ring-1 ring-[#bbf7d0]">
                  {index + 1}
                </span>
                <span className="flex items-start gap-2 pt-0.5">
                  {index === 0 ? (
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-[#16a34a]"
                      aria-hidden
                    />
                  ) : null}
                  {step}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-lg border border-[#bbf7d0] bg-white/70 px-3 py-2.5 text-xs leading-relaxed text-[#166534]">
            Adding a domain here does not automatically configure Vercel or other
            hosting providers. Contact GroceryBox support if you need help with
            live connection records.
          </p>
        </div>
      </div>
    </div>
  );
}