import type { MerchantProductStockStatus } from "@/features/products/types/merchant-product";

export type MerchantInventorySummary = {
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalUnits: number;
  lowStockThreshold: number;
};

export type InventoryStockFilter =
  | "all"
  | "well_stocked"
  | MerchantProductStockStatus;

export function merchantInventorySummaryFromJson(
  raw: Record<string, unknown>,
): MerchantInventorySummary {
  return {
    totalProducts:
      typeof raw.total_products === "number" ? raw.total_products : 0,
    inStockCount:
      typeof raw.in_stock_count === "number" ? raw.in_stock_count : 0,
    lowStockCount:
      typeof raw.low_stock_count === "number" ? raw.low_stock_count : 0,
    outOfStockCount:
      typeof raw.out_of_stock_count === "number" ? raw.out_of_stock_count : 0,
    totalUnits: typeof raw.total_units === "number" ? raw.total_units : 0,
    lowStockThreshold:
      typeof raw.low_stock_threshold === "number"
        ? raw.low_stock_threshold
        : 10,
  };
}