"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import type { MerchantProductListParams } from "@/features/products/types/merchant-product";

import type { InventoryStockFilter } from "../types/merchant-inventory";

export type InventoryListQueryState = {
  page: number;
  limit: number;
  search: string;
  stockFilter: InventoryStockFilter;
  categoryId: string;
};

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseStockFilter(raw: string | null): InventoryStockFilter {
  if (
    raw === "in_stock" ||
    raw === "well_stocked" ||
    raw === "out_of_stock" ||
    raw === "low_stock"
  ) {
    return raw;
  }
  return "all";
}

export function useInventoryListQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo<InventoryListQueryState>(() => {
    return {
      page: parsePositiveInt(searchParams.get("page"), 1),
      limit: parsePositiveInt(searchParams.get("limit"), 20),
      search: searchParams.get("search")?.trim() ?? "",
      stockFilter: parseStockFilter(searchParams.get("stock")),
      categoryId: searchParams.get("category_id")?.trim() ?? "",
    };
  }, [searchParams]);

  const patchParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value == null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const hasActiveFilters =
    state.search.length > 0 ||
    state.stockFilter !== "all" ||
    state.categoryId.length > 0;

  return { state, patchParams, resetFilters, hasActiveFilters };
}

export function resolveInventoryListApiFilters(
  state: InventoryListQueryState,
): MerchantProductListParams {
  return {
    page: state.page,
    limit: state.limit,
    search: state.search || undefined,
    categoryId: state.categoryId || undefined,
    stockStatus: state.stockFilter === "all" ? undefined : state.stockFilter,
    sortBy: "stock_quantity",
    sortOrder: "asc",
  };
}