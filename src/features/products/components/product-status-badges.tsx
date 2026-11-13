import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

import { resolveStockLabel } from "../utils/format-product";

type ProductStatusBadgesProps = {
  isActive: boolean;
  isFeatured: boolean;
  stockQuantity: number;
  layout?: "inline" | "stack";
};

const STATUS_STYLES = {
  active: "bg-[#dcfce7] text-[#15803d]",
  inactive: "bg-[#f3f4f6] text-[#4b5563]",
  featured: "bg-[#fef9c3] text-[#a16207]",
  stockIn: "bg-[#dcfce7] text-[#15803d]",
  stockLow: "bg-[#ffedd5] text-[#c2410c]",
  stockOut: "bg-[#fee2e2] text-[#b91c1c]",
} as const;

export function ProductActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold",
        isActive ? STATUS_STYLES.active : STATUS_STYLES.inactive,
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export function ProductFeaturedBadge({ isFeatured }: { isFeatured: boolean }) {
  if (!isFeatured) {
    return (
      <span className="inline-flex w-fit rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-semibold text-[#6b7280]">
        Not featured
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        STATUS_STYLES.featured,
      )}
    >
      <Star className="size-3 fill-current" aria-hidden />
      Featured
    </span>
  );
}

export function ProductStockBadge({ stockQuantity }: { stockQuantity: number }) {
  const level = resolveStockLabel(stockQuantity);
  const style =
    level === "out"
      ? STATUS_STYLES.stockOut
      : level === "low"
        ? STATUS_STYLES.stockLow
        : STATUS_STYLES.stockIn;
  const label =
    level === "out"
      ? "Out of stock"
      : level === "low"
        ? "Low stock"
        : "In stock";

  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold",
        style,
      )}
    >
      {label}
    </span>
  );
}

export function ProductStatusBadges({
  isActive,
  isFeatured,
  stockQuantity,
  layout = "inline",
}: ProductStatusBadgesProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5",
        layout === "stack" ? "flex-col items-start" : "items-center",
      )}
    >
      <ProductActiveBadge isActive={isActive} />
      <ProductFeaturedBadge isFeatured={isFeatured} />
      <ProductStockBadge stockQuantity={stockQuantity} />
    </div>
  );
}
