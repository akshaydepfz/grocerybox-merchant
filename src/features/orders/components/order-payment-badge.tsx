import { cn } from "@/lib/utils";

import type { MerchantOrderPaymentStatus } from "../types/merchant-order";

const styles: Record<MerchantOrderPaymentStatus, string> = {
  paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cod_pending: "bg-amber-50 text-amber-800 border-amber-200",
  pending: "bg-slate-50 text-slate-700 border-slate-200",
  failed: "bg-red-50 text-red-800 border-red-200",
};

const labels: Record<MerchantOrderPaymentStatus, string> = {
  paid: "Paid",
  cod_pending: "COD pending",
  pending: "Payment pending",
  failed: "Payment failed",
};

export function OrderPaymentBadge({
  status,
  className,
}: {
  status: MerchantOrderPaymentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        styles[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  );
}
