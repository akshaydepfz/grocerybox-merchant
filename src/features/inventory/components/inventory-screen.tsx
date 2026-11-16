"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Pencil,
  RotateCcw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { useAuth } from "@/features/auth/components/auth-provider";
import { listMerchantCategories } from "@/features/categories/services";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { friendlyProductError, listMerchantProducts } from "@/features/products/services";
import { ProductThumbnail } from "@/features/products/components/product-thumbnail";
import { ProductStockBadge } from "@/features/products/components/product-status-badges";
import type { MerchantProduct } from "@/features/products/types/merchant-product";
import {
  formatStockQuantity,
  PRODUCT_LOW_STOCK_THRESHOLD,
  resolveStockLabel,
} from "@/features/products/utils/format-product";
import { dashboardRoutePrefix } from "@/config/routes";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import {
  resolveInventoryListApiFilters,
  useInventoryListQueryParams,
} from "../hooks/use-inventory-list-query-params";
import {
  friendlyInventoryError,
  getMerchantInventorySummary,
  patchMerchantProductStock,
} from "../services";
import type { InventoryStockFilter } from "../types/merchant-inventory";

import { InventorySummaryCards } from "./inventory-summary-cards";
import { StockAdjustDialog } from "./stock-adjust-dialog";

const CATEGORY_OPTIONS_LIMIT = 100;

const STOCK_CHIPS: { value: InventoryStockFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "well_stocked", label: "Well stocked" },
  { value: "low_stock", label: "Low" },
  { value: "out_of_stock", label: "Out" },
];

export function InventoryScreen() {
  const { user, isRegistered } = useAuth();
  const queryClient = useQueryClient();
  const { state, patchParams, resetFilters, hasActiveFilters } =
    useInventoryListQueryParams();

  const [searchDraft, setSearchDraft] = useState(state.search);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<MerchantProduct | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = searchDraft.trim();
      if (trimmed === state.search) return;
      patchParams({ search: trimmed || null, page: null });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchDraft, patchParams, state.search]);

  const listEnabled = Boolean(user && isRegistered);
  const apiFilters = resolveInventoryListApiFilters(state);

  const summaryQuery = useQuery({
    queryKey: ["merchant-inventory-summary"],
    queryFn: getMerchantInventorySummary,
    enabled: listEnabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const listQueryKey = ["merchant-inventory-products", apiFilters] as const;

  const listQuery = useQuery({
    queryKey: listQueryKey,
    queryFn: () => listMerchantProducts(apiFilters),
    enabled: listEnabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const categoriesQuery = useQuery({
    queryKey: ["merchant-inventory-category-options"],
    queryFn: () =>
      listMerchantCategories({ page: 1, limit: CATEGORY_OPTIONS_LIMIT }),
    enabled: listEnabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const stockMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      patchMerchantProductStock(productId, quantity),
    onSuccess: () => {
      toast.success("Stock updated");
      setAdjustOpen(false);
      setAdjustTarget(null);
      void queryClient.invalidateQueries({ queryKey: listQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["merchant-inventory-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["merchant-products"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? friendlyInventoryError(error)
          : "Could not update stock.",
      );
    },
  });

  useEffect(() => {
    if (listQuery.error) {
      toast.error(
        listQuery.error instanceof ApiError
          ? friendlyProductError(listQuery.error)
          : "Unable to load inventory.",
      );
    }
  }, [listQuery.error]);

  const openAdjust = (product: MerchantProduct) => {
    setAdjustTarget(product);
    setAdjustOpen(true);
  };

  const handleSummaryFilter = (filter: string) => {
    patchParams({
      stock: filter === "all" ? null : filter,
      page: null,
    });
  };

  if (!user) {
    return (
      <DashboardPage className="py-4">
        <ErrorState
          title="Sign in required"
          message="Sign in to manage inventory."
        />
      </DashboardPage>
    );
  }

  const initialLoading =
    (listQuery.isLoading && !listQuery.data) ||
    (summaryQuery.isLoading && !summaryQuery.data);
  const listFailed = listQuery.isError && !listQuery.data;

  if (initialLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-16">
        <GroceryAnimatedLoader
          theme="dashboard"
          label="Loading inventory"
          sublabel="Checking stock levels"
        />
      </div>
    );
  }

  if (listFailed) {
    const message =
      listQuery.error instanceof ApiError
        ? friendlyProductError(listQuery.error)
        : "Unable to load inventory.";
    return (
      <DashboardPage className="py-4">
        <ErrorState
          title="Could not load inventory"
          message={message}
          onRetry={() => void listQuery.refetch()}
        />
      </DashboardPage>
    );
  }

  const items = listQuery.data?.items ?? [];
  const pagination = listQuery.data?.pagination;
  const totalItems = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? state.page;
  const summary = summaryQuery.data;
  const categoryOptions = categoriesQuery.data?.items ?? [];

  const needsAttention =
    (summary?.lowStockCount ?? 0) + (summary?.outOfStockCount ?? 0);

  return (
    <DashboardPage className="gap-3 sm:gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-[#1a1f2e] sm:text-2xl">
            Inventory
          </h1>
          <p className="mt-0.5 text-sm text-[#6b7280]">
            Track stock levels and restock before items run out.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-[#e8eaef]"
            disabled={listQuery.isFetching || summaryQuery.isFetching}
            onClick={() => {
              void listQuery.refetch();
              void summaryQuery.refetch();
            }}
          >
            <RotateCcw className="size-4" aria-hidden />
            <span className="ml-2">Refresh</span>
          </Button>
          <Button
            type="button"
            className="h-10 rounded-xl bg-[#16a34a] text-white hover:bg-[#15803d]"
            asChild
          >
            <Link href={`${dashboardRoutePrefix}/products/new`}>
              Add product
            </Link>
          </Button>
        </div>
      </header>

      {summary ? (
        <InventorySummaryCards
          summary={summary}
          activeFilter={state.stockFilter}
          onFilterSelect={handleSummaryFilter}
        />
      ) : null}

      {needsAttention > 0 ? (
        <div className="rounded-2xl border border-[#fed7aa] bg-gradient-to-r from-[#fff7ed] to-[#fffbeb] px-4 py-3 text-sm text-[#9a3412]">
          <span className="font-semibold">{needsAttention.toLocaleString("en-IN")}</span>{" "}
          {needsAttention === 1 ? "item needs" : "items need"} attention — low or out of
          stock.
        </div>
      ) : null}

      <DashboardSurface className="overflow-hidden">
        <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-[#f0f1f4] bg-white px-3.5 py-3 md:static md:px-5 md:py-4">
          <div className="relative w-full lg:ml-auto lg:max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search by product name or SKU…"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              className="h-11 w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] pl-10 pr-3 text-base text-[#1a1f2e] placeholder:text-[#9ca3af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30 md:h-10 md:text-sm"
            />
          </div>

          <div
            className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Stock level"
          >
            {STOCK_CHIPS.map((chip) => {
              const active = state.stockFilter === chip.value;
              return (
                <button
                  key={chip.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() =>
                    patchParams({
                      stock: chip.value === "all" ? null : chip.value,
                      page: null,
                    })
                  }
                  className={cn(
                    "min-h-[36px] shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                    active
                      ? "border-[#16a34a] bg-[#f0fdf4] text-[#15803d]"
                      : "border-[#e8eaef] bg-[#fafbfc] text-[#6b7280]",
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex min-w-[160px] flex-1 flex-col gap-1 sm:max-w-xs">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                Category
              </span>
              <select
                value={state.categoryId}
                disabled={categoriesQuery.isLoading}
                onChange={(event) => {
                  patchParams({
                    category_id: event.target.value || null,
                    page: null,
                  });
                }}
                className="h-10 rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 text-sm text-[#1a1f2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
              >
                <option value="">All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-5 h-9 rounded-xl border-[#eceef2]"
                onClick={resetFilters}
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Reset
              </Button>
            ) : null}
          </div>
        </div>

        {listQuery.isFetching && !listQuery.isLoading ? (
          <div className="flex items-center gap-2 border-b border-[#f0f1f4] px-5 py-2 text-xs text-[#6b7280]">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Refreshing…
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <Package className="size-10 text-[#d1d5db]" aria-hidden />
            <p className="text-sm font-semibold text-[#1a1f2e]">
              {hasActiveFilters ? "No items match your filters" : "No products yet"}
            </p>
            <p className="max-w-sm text-sm text-[#6b7280]">
              {hasActiveFilters
                ? "Try another filter or search term."
                : "Add products to start tracking inventory."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#f0f1f4] bg-[#fafbfc] text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                    <th className="px-5 py-3" scope="col">
                      Product
                    </th>
                    <th className="px-3 py-3" scope="col">
                      On hand
                    </th>
                    <th className="px-3 py-3" scope="col">
                      Level
                    </th>
                    <th className="px-5 py-3 text-right" scope="col">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f1f4]">
                  {items.map((product) => (
                    <InventoryTableRow
                      key={product.id}
                      product={product}
                      onAdjust={() => openAdjust(product)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="flex flex-col gap-2 p-3 md:hidden">
              {items.map((product) => (
                <li key={product.id}>
                  <InventoryMobileCard
                    product={product}
                    onAdjust={() => openAdjust(product)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        {totalPages > 1 || state.limit !== 20 ? (
          <div className="flex flex-col gap-3 border-t border-[#f0f1f4] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
            <p className="text-center text-xs text-[#6b7280] sm:text-left">
              Page {currentPage} of {totalPages} ·{" "}
              {totalItems.toLocaleString("en-IN")} items (low stock first)
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl md:h-9"
                disabled={currentPage <= 1 || listQuery.isFetching}
                onClick={() => {
                  const prev = Math.max(1, currentPage - 1);
                  patchParams({ page: prev === 1 ? null : String(prev) });
                }}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl md:h-9"
                disabled={currentPage >= totalPages || listQuery.isFetching}
                onClick={() => patchParams({ page: String(currentPage + 1) })}
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        ) : null}
      </DashboardSurface>

      <StockAdjustDialog
        open={adjustOpen}
        product={adjustTarget}
        isSaving={stockMutation.isPending}
        onOpenChange={setAdjustOpen}
        onConfirm={(productId, quantity) => {
          stockMutation.mutate({ productId, quantity });
        }}
      />
    </DashboardPage>
  );
}

function stockLevelPercent(quantity: number): number {
  if (quantity <= 0) return 0;
  const cap = Math.max(PRODUCT_LOW_STOCK_THRESHOLD * 3, quantity);
  return Math.min(100, Math.round((quantity / cap) * 100));
}

function InventoryTableRow({
  product,
  onAdjust,
}: {
  product: MerchantProduct;
  onAdjust: () => void;
}) {
  const editHref = `${dashboardRoutePrefix}/products/${product.id}/edit`;
  const level = resolveStockLabel(product.stockQuantity);
  const barTone =
    level === "out"
      ? "bg-[#ef4444]"
      : level === "low"
        ? "bg-[#f97316]"
        : "bg-[#22c55e]";

  return (
    <tr className="transition hover:bg-[#fafbfc]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <ProductThumbnail
            imageUrl={product.primaryImage?.imageUrl}
            name={product.name}
          />
          <div className="min-w-0">
            <p className="font-semibold text-[#1a1f2e]">{product.name}</p>
            <p className="mt-0.5 text-xs text-[#9ca3af]">
              {product.categoryName}
              {product.sku ? ` · ${product.sku}` : ""}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-4">
        <p className="font-semibold tabular-nums text-[#1a1f2e]">
          {formatStockQuantity(
            product.stockQuantity,
            product.unitValue,
            product.unit,
          )}
        </p>
        <div className="mt-2 h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-[#f3f4f6]">
          <div
            className={cn("h-full rounded-full transition-all", barTone)}
            style={{ width: `${stockLevelPercent(product.stockQuantity)}%` }}
          />
        </div>
      </td>
      <td className="px-3 py-4">
        <ProductStockBadge stockQuantity={product.stockQuantity} />
      </td>
      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            className="h-9 rounded-xl bg-[#16a34a] px-3 text-white hover:bg-[#15803d]"
            onClick={onAdjust}
          >
            Update stock
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-xl"
            asChild
          >
            <Link href={editHref}>
              <Pencil className="size-3.5" aria-hidden />
            </Link>
          </Button>
        </div>
      </td>
    </tr>
  );
}

function InventoryMobileCard({
  product,
  onAdjust,
}: {
  product: MerchantProduct;
  onAdjust: () => void;
}) {
  const level = resolveStockLabel(product.stockQuantity);
  const barTone =
    level === "out"
      ? "bg-[#ef4444]"
      : level === "low"
        ? "bg-[#f97316]"
        : "bg-[#22c55e]";

  return (
    <article className="overflow-hidden rounded-xl border border-[#eceef2] bg-white shadow-sm">
      <div className="flex gap-3 p-3.5">
        <ProductThumbnail
          imageUrl={product.primaryImage?.imageUrl}
          name={product.name}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold text-[#1a1f2e]">
            {product.name}
          </p>
          <p className="mt-1 text-xs font-medium tabular-nums text-[#1a1f2e]">
            {formatStockQuantity(
              product.stockQuantity,
              product.unitValue,
              product.unit,
            )}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#f3f4f6]">
            <div
              className={cn("h-full rounded-full", barTone)}
              style={{ width: `${stockLevelPercent(product.stockQuantity)}%` }}
            />
          </div>
          <div className="mt-2">
            <ProductStockBadge stockQuantity={product.stockQuantity} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-[#f0f1f4] bg-[#fafbfc] p-2">
        <Button
          type="button"
          className="h-10 rounded-lg bg-[#16a34a] text-white hover:bg-[#15803d]"
          onClick={onAdjust}
        >
          Update stock
        </Button>
        <Button type="button" variant="outline" className="h-10 rounded-lg" asChild>
          <Link href={`${dashboardRoutePrefix}/products/${product.id}/edit`}>
            Full edit
          </Link>
        </Button>
      </div>
    </article>
  );
}