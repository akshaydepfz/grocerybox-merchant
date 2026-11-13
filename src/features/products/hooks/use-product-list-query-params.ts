"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import type {
  MerchantProductSortBy,
  MerchantProductSortOrder,
  MerchantProductStockStatus,
} from "../types/merchant-product";

export type ProductActiveFilter = "all" | "active" | "inactive";
export type ProductFeaturedFilter = "all" | "featured" | "not_featured";
export type ProductStockFilter =
  | "all"
  | MerchantProductStockStatus;

export type ProductListQueryState = {
  page: number;
  limit: number;
  search: string;
  categoryId: string;
  subcategoryId: string;
  activeFilter: ProductActiveFilter;
  featuredFilter: ProductFeaturedFilter;
  stockFilter: ProductStockFilter;
  sortBy: MerchantProductSortBy | "";
  sortOrder: MerchantProductSortOrder;
};

const DEFAULT_LIMIT = 20;

function parsePositiveInt(raw: string | null, fallback: number): number {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 1) {
    return fallback;
  }
  return Math.floor(value);
}

function parseActiveFilter(raw: string | null): ProductActiveFilter {
  if (raw === "active" || raw === "inactive") {
    return raw;
  }
  return "all";
}

function parseFeaturedFilter(raw: string | null): ProductFeaturedFilter {
  if (raw === "featured" || raw === "not_featured") {
    return raw;
  }
  return "all";
}

function parseStockFilter(raw: string | null): ProductStockFilter {
  if (
    raw === "in_stock" ||
    raw === "out_of_stock" ||
    raw === "low_stock"
  ) {
    return raw;
  }
  return "all";
}

const SORT_BY_VALUES: MerchantProductSortBy[] = [
  "name",
  "selling_price",
  "stock_quantity",
  "created_at",
  "updated_at",
  "display_order",
];

function parseSortBy(raw: string | null): MerchantProductSortBy | "" {
  if (!raw) {
    return "";
  }
  return SORT_BY_VALUES.includes(raw as MerchantProductSortBy)
    ? (raw as MerchantProductSortBy)
    : "";
}

function parseSortOrder(raw: string | null): MerchantProductSortOrder {
  return raw === "asc" ? "asc" : "desc";
}

export function readProductListQueryState(
  searchParams: URLSearchParams,
): ProductListQueryState {
  return {
    page: parsePositiveInt(searchParams.get("page"), 1),
    limit: Math.min(100, parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT)),
    search: searchParams.get("search")?.trim() ?? "",
    categoryId: searchParams.get("category_id")?.trim() ?? "",
    subcategoryId: searchParams.get("subcategory_id")?.trim() ?? "",
    activeFilter: parseActiveFilter(searchParams.get("status")),
    featuredFilter: parseFeaturedFilter(searchParams.get("featured")),
    stockFilter: parseStockFilter(searchParams.get("stock")),
    sortBy: parseSortBy(searchParams.get("sort_by")),
    sortOrder: parseSortOrder(searchParams.get("sort_order")),
  };
}

export function resolveListApiFilters(state: ProductListQueryState) {
  return {
    page: state.page,
    limit: state.limit,
    search: state.search || undefined,
    categoryId: state.categoryId || undefined,
    subcategoryId: state.subcategoryId || undefined,
    isActive:
      state.activeFilter === "active"
        ? true
        : state.activeFilter === "inactive"
          ? false
          : undefined,
    isFeatured:
      state.featuredFilter === "featured"
        ? true
        : state.featuredFilter === "not_featured"
          ? false
          : undefined,
    stockStatus:
      state.stockFilter === "all" ? undefined : state.stockFilter,
    sortBy: state.sortBy || undefined,
    sortOrder: state.sortBy ? state.sortOrder : undefined,
  };
}

export function useProductListQueryParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const state = useMemo(
    () => readProductListQueryState(searchParams),
    [searchParams],
  );

  const patchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        const normalized = value?.trim() ?? "";
        if (
          !normalized ||
          normalized === "all" ||
          (key === "page" && normalized === "1") ||
          (key === "limit" && normalized === String(DEFAULT_LIMIT)) ||
          (key === "sort_by" && !normalized) ||
          (key === "sort_order" && normalized === "desc" && !next.get("sort_by"))
        ) {
          next.delete(key);
        } else {
          next.set(key, normalized);
        }
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const hasActiveFilters =
    state.search.length > 0 ||
    state.categoryId.length > 0 ||
    state.subcategoryId.length > 0 ||
    state.activeFilter !== "all" ||
    state.featuredFilter !== "all" ||
    state.stockFilter !== "all" ||
    state.sortBy !== "";

  return {
    state,
    patchParams,
    resetFilters,
    hasActiveFilters,
    defaultLimit: DEFAULT_LIMIT,
  };
}
