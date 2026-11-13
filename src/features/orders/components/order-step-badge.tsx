import { cn } from "@/lib/utils";

import type { MerchantOrderTimelineStep } from "../types/merchant-order";
import { orderStepLabel } from "../utils/format-order";

const stepStyles: Record<MerchantOrderTimelineStep, string> = {
  placed: "bg-slate-100 text-slate-700 border-slate-200",
  confirmed: "bg-blue-50 text-blue-800 border-blue-200",
  packing: "bg-amber-50 text-amber-800 border-amber-200",
  out_for_delivery: "bg-violet-50 text-violet-800 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

export function OrderStepBadge({
  step,
  className,
}: {
  step: MerchantOrderTimelineStep;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        stepStyles[step],
        className,
      )}
    >
      {orderStepLabel(step)}
    </span>
  );
}
