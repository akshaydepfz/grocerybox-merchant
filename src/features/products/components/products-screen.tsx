"use client";

import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  Eye,
  Loader2,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { useAuth } from "@/features/auth/components/auth-provider";
import { listMerchantCategories } from "@/features/categories/services";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { listMerchantSubcategories } from "@/features/subcategories/services";
import { ApiError } from "@/lib/api/types";
import { dashboardRoutePrefix } from "@/config/routes";
import { cn } from "@/lib/utils";

import {
  resolveListApiFilters,
  useProductListQueryParams,
} from "../hooks/use-product-list-query-params";
import {
  friendlyProductError,
  listMerchantProducts,
} from "../services";
import type { MerchantProduct } from "../types/merchant-product";
import {
  formatInr,
  formatSkuOrFallback,
  formatStockQuantity,
} from "../utils/format-product";

import {
  ProductActiveBadge,
  ProductFeaturedBadge,
} from "./product-status-badges";
import { ProductDeleteDialog } from "./product-delete-dialog";
import { ProductThumbnail } from "./product-thumbnail";

const CATEGORY_OPTIONS_LIMIT = 100;

const STATUS_CHIPS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

const STOCK_CHIPS = [
  { value: "all", label: "All stock" },
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low" },
  { value: "out_of_stock", label: "Out" },
] as const;

export function ProductsScreen() {
  const { user, isRegistered } = useAuth();
  const { state, patchParams, resetFilters, hasActiveFilters } =
    useProductListQueryParams();

  const [searchDraft, setSearchDraft] = useState(state.search);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MerchantProduct | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const openDelete = (product: MerchantProduct) => {
    setDeleteTarget(product);
    setDeleteOpen(true);
  };

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = searchDraft.trim();
      if (trimmed === state.search) {
        return;
      }
      patchParams({
        search: trimmed || null,
        page: null,
      });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchDraft, patchParams, state.search]);

  const listEnabled = Boolean(user && isRegistered);
  const apiFilters = resolveListApiFilters(state);

  const listQueryKey = ["merchant-products", apiFilters] as const;

  const listQuery = useQuery({
    queryKey: listQueryKey,
    queryFn: () => listMerchantProducts(apiFilters),
    enabled: listEnabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const categoriesQuery = useQuery({
    queryKey: ["merchant-products-category-options"],
    queryFn: () =>
      listMerchantCategories({ page: 1, limit: CATEGORY_OPTIONS_LIMIT }),
    enabled: listEnabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const subcategoriesQuery = useQuery({
    queryKey: ["merchant-products-subcategory-options", state.categoryId],
    queryFn: () =>
      listMerchantSubcategories(state.categoryId, {
        page: 1,
        limit: CATEGORY_OPTIONS_LIMIT,
      }),
    enabled: listEnabled && state.categoryId.length > 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (listQuery.error) {
      toast.error(
        listQuery.error instanceof ApiError
          ? friendlyProductError(listQuery.error)
          : "Unable to load products.",
      );
    }
  }, [listQuery.error]);

  if (!user) {
    return (
      <DashboardPage className="py-4">
        <ErrorState
          title="Sign in required"
          message="Sign in to manage your products."
        />
      </DashboardPage>
    );
  }

  const initialLoading = listQuery.isLoading && !listQuery.data;
  const listFailed = listQuery.isError && !listQuery.data;

  if (initialLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-16">
        <GroceryAnimatedLoader
          theme="dashboard"
          label="Loading products"
          sublabel="Fetching your catalog"
        />
      </div>
    );
  }

  if (listFailed) {
    const message =
      listQuery.error instanceof ApiError
        ? friendlyProductError(listQuery.error)
        : "Unable to load products.";
    return (
      <DashboardPage className="py-4">
        <ErrorState
          title="Could not load products"
          message={message}
          onRetry={() => void listQuery.refetch()}
        />
      </DashboardPage>
    );
  }

  const items = listQuery.data?.items ?? [];
  const pagination = listQuery.data?.pagination;
  const totalProducts = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? state.page;

  const categoryOptions = categoriesQuery.data?.items ?? [];
  const subcategoryOptions = subcategoriesQuery.data?.items ?? [];
  const filtersLoading =
    categoriesQuery.isLoading ||
    (state.categoryId.length > 0 && subcategoriesQuery.isLoading);

  const emptyMessage =
    state.search || hasActiveFilters
      ? "Try adjusting your search or filters."
      : "Add your first product to start selling.";

  const mobileFiltersActive =
    state.categoryId.length > 0 ||
    state.subcategoryId.length > 0 ||
    state.featuredFilter !== "all" ||
    state.stockFilter !== "all" ||
    Boolean(state.sortBy);

  return (
    <DashboardPage className="gap-3 sm:gap-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#16a34a] md:hidden">
            {totalProducts.toLocaleString("en-IN")} products
          </p>
          <h1 className="text-xl font-bold tracking-tight text-[#1a1f2e] sm:text-2xl">
            Products
          </h1>
          <p className="mt-0.5 hidden text-sm text-[#6b7280] sm:block">
            Manage your store catalog and inventory.
          </p>
          <p className="mt-2 hidden text-xs font-medium text-[#9ca3af] sm:block">
            {totalProducts.toLocaleString("en-IN")} products total
          </p>
        </div>
        <Button
          type="button"
          className="h-11 w-full shrink-0 rounded-xl bg-[#16a34a] px-4 text-sm font-semibold text-white hover:bg-[#15803d] sm:h-10 sm:w-auto"
          asChild
        >
          <Link href={`${dashboardRoutePrefix}/products/new`}>
            <Plus className="size-4" aria-hidden />
            Add Product
          </Link>
        </Button>
      </header>

      <DashboardSurface className="overflow-hidden">
        <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-[#f0f1f4] bg-white px-3.5 py-3 md:static md:gap-4 md:px-5 md:py-4">
          <div className="relative w-full md:max-w-none lg:ml-auto lg:max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]"
              aria-hidden
            />
            <ProductSearchInput
              key={state.search}
              initialValue={state.search}
              onValueChange={setSearchDraft}
            />
          </div>

          <ProductFilterChips
            ariaLabel="Product status"
            value={state.activeFilter}
            options={STATUS_CHIPS}
            onChange={(value) => {
              patchParams({
                status: value === "all" ? null : value,
                page: null,
              });
            }}
          />

          <ProductFilterChips
            ariaLabel="Stock level"
            value={state.stockFilter}
            options={STOCK_CHIPS}
            onChange={(value) => {
              patchParams({
                stock: value === "all" ? null : value,
                page: null,
              });
            }}
          />

          <div className="flex items-center gap-2 md:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-10 flex-1 rounded-xl",
                (mobileFiltersOpen || mobileFiltersActive) &&
                  "border-[#16a34a] text-[#16a34a]",
              )}
              onClick={() => setMobileFiltersOpen((open) => !open)}
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              <span className="ml-2">More filters</span>
              {mobileFiltersActive ? (
                <span className="ml-1.5 size-1.5 rounded-full bg-[#16a34a]" />
              ) : null}
            </Button>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 shrink-0 rounded-xl"
                onClick={resetFilters}
                aria-label="Reset filters"
              >
                <X className="size-4" />
              </Button>
            ) : null}
          </div>

          {mobileFiltersOpen ? (
            <ProductMobileFiltersPanel
              state={state}
              patchParams={patchParams}
              categoryOptions={categoryOptions}
              subcategoryOptions={subcategoryOptions}
              categoriesLoading={categoriesQuery.isLoading}
              subcategoriesLoading={subcategoriesQuery.isLoading}
            />
          ) : null}

          <div className="hidden gap-2 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <FilterSelect
              label="Category"
              value={state.categoryId}
              disabled={categoriesQuery.isLoading}
              onChange={(value) => {
                patchParams({
                  category_id: value || null,
                  subcategory_id: null,
                  page: null,
                });
              }}
            >
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="Subcategory"
              value={state.subcategoryId}
              disabled={!state.categoryId || subcategoriesQuery.isLoading}
              onChange={(value) => {
                patchParams({
                  subcategory_id: value || null,
                  page: null,
                });
              }}
            >
              <option value="">
                {state.categoryId ? "All subcategories" : "Select category first"}
              </option>
              {subcategoryOptions.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="Status"
              value={state.activeFilter}
              onChange={(value) => {
                patchParams({
                  status: value === "all" ? null : value,
                  page: null,
                });
              }}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </FilterSelect>

            <FilterSelect
              label="Featured"
              value={state.featuredFilter}
              onChange={(value) => {
                patchParams({
                  featured: value === "all" ? null : value,
                  page: null,
                });
              }}
            >
              <option value="all">All products</option>
              <option value="featured">Featured</option>
              <option value="not_featured">Not featured</option>
            </FilterSelect>

            <FilterSelect
              label="Stock"
              value={state.stockFilter}
              onChange={(value) => {
                patchParams({
                  stock: value === "all" ? null : value,
                  page: null,
                });
              }}
            >
              <option value="all">All stock</option>
              <option value="in_stock">In stock</option>
              <option value="out_of_stock">Out of stock</option>
              <option value="low_stock">Low stock</option>
            </FilterSelect>

            <FilterSelect
              label="Sort by"
              value={state.sortBy || "default"}
              onChange={(value) => {
                if (value === "default") {
                  patchParams({
                    sort_by: null,
                    sort_order: null,
                    page: null,
                  });
                  return;
                }
                patchParams({
                  sort_by: value,
                  sort_order: state.sortOrder,
                  page: null,
                });
              }}
            >
              <option value="default">Default order</option>
              <option value="name">Product name</option>
              <option value="selling_price">Selling price</option>
              <option value="stock_quantity">Stock quantity</option>
              <option value="created_at">Created date</option>
              <option value="updated_at">Updated date</option>
              <option value="display_order">Display order</option>
            </FilterSelect>
          </div>

          <div className="hidden flex-col gap-2 md:flex sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {state.sortBy ? (
                <FilterSelect
                  label="Order"
                  value={state.sortOrder}
                  className="w-auto min-w-[120px]"
                  onChange={(value) => {
                    patchParams({
                      sort_order: value === "desc" ? null : value,
                      page: null,
                    });
                  }}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </FilterSelect>
              ) : null}
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-[#eceef2]"
                  onClick={resetFilters}
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  Reset filters
                </Button>
              ) : null}
            </div>
            <FilterSelect
              label="Page size"
              value={String(state.limit)}
              className="w-full sm:w-auto sm:min-w-[120px]"
              onChange={(value) => {
                patchParams({
                  limit: value === "20" ? null : value,
                  page: null,
                });
              }}
            >
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </FilterSelect>
          </div>

          {filtersLoading ? (
            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Loading filter options…
            </div>
          ) : null}
        </div>

        {listQuery.isFetching && !listQuery.isLoading ? (
          <div className="flex items-center gap-2 border-b border-[#f0f1f4] px-3.5 py-2 text-xs text-[#6b7280] md:px-5">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Refreshing…
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <Package className="size-10 text-[#d1d5db]" aria-hidden />
            <p className="text-sm font-semibold text-[#1a1f2e]">
              {state.search || hasActiveFilters
                ? "No products match your filters"
                : "No products yet"}
            </p>
            <p className="max-w-sm text-sm text-[#6b7280]">{emptyMessage}</p>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={resetFilters}
              >
                Reset filters
              </Button>
            ) : (
              <Button
                type="button"
                className="mt-2 bg-[#16a34a] text-white hover:bg-[#15803d]"
                asChild
              >
                <Link href={`${dashboardRoutePrefix}/products/new`}>
                  <Plus className="size-4" aria-hidden />
                  Add Product
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#f0f1f4] bg-[#fafbfc] text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                    <th className="px-5 py-3 font-semibold" scope="col">
                      Product
                    </th>
                    <th className="px-3 py-3 font-semibold" scope="col">
                      Category
                    </th>
                    <th className="px-3 py-3 font-semibold" scope="col">
                      Price
                    </th>
                    <th className="px-3 py-3 font-semibold" scope="col">
                      Stock
                    </th>
                    <th className="px-3 py-3 font-semibold" scope="col">
                      SKU
                    </th>
                    <th className="px-3 py-3 font-semibold" scope="col">
                      Status
                    </th>
                    <th className="px-3 py-3 font-semibold" scope="col">
                      Featured
                    </th>
                    <th className="px-5 py-3 text-right font-semibold" scope="col">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f1f4]">
                  {items.map((product) => (
                    <ProductTableRow
                      key={product.id}
                      product={product}
                      onDelete={() => openDelete(product)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="flex flex-col gap-2 p-3 md:hidden">
              {items.map((product) => (
                <li key={product.id}>
                  <ProductMobileCard
                    product={product}
                    onDelete={() => openDelete(product)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        {totalPages > 1 || state.limit !== 20 ? (
          <div className="flex flex-col gap-3 border-t border-[#f0f1f4] px-3.5 py-3 md:px-5 md:py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-[#6b7280] sm:text-left">
              Page {currentPage} of {totalPages} ·{" "}
              {totalProducts.toLocaleString("en-IN")} items
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl md:h-9"
                disabled={currentPage <= 1 || listQuery.isFetching}
                onClick={() => {
                  const prev = Math.max(1, currentPage - 1);
                  patchParams({
                    page: prev === 1 ? null : String(prev),
                  });
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
                onClick={() => {
                  patchParams({ page: String(currentPage + 1) });
                }}
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        ) : null}
      </DashboardSurface>

      <ProductDeleteDialog
        open={deleteOpen}
        productName={deleteTarget?.name ?? ""}
        productId={deleteTarget?.id ?? null}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          void listQuery.refetch();
        }}
      />
    </DashboardPage>
  );
}

function ProductSearchInput({
  initialValue,
  onValueChange,
}: {
  initialValue: string;
  onValueChange: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <input
      type="search"
      placeholder="Search products…"
      value={value}
      onChange={(event) => {
        const next = event.target.value;
        setValue(next);
        onValueChange(next);
      }}
      className="h-11 w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] pl-10 pr-3 text-base text-[#1a1f2e] placeholder:text-[#9ca3af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30 md:h-10 md:text-sm"
    />
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  disabled?: boolean;
  className?: string;
  onChange: (value: string) => void;
  children: ReactNode;
};

function FilterSelect({
  label,
  value,
  disabled,
  className,
  onChange,
  children,
}: FilterSelectProps) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 text-sm text-[#1a1f2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {children}
      </select>
    </label>
  );
}

function ProductTableRow({
  product,
  onDelete,
}: {
  product: MerchantProduct;
  onDelete: () => void;
}) {
  const detailHref = `${dashboardRoutePrefix}/products/${product.id}`;
  const editHref = `${dashboardRoutePrefix}/products/${product.id}/edit`;

  return (
    <tr className="transition hover:bg-[#fafbfc]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <ProductThumbnail
            imageUrl={product.primaryImage?.imageUrl}
            name={product.name}
          />
          <div className="min-w-0">
            <Link
              href={detailHref}
              className="font-semibold text-[#1a1f2e] transition hover:text-[#16a34a] hover:underline"
            >
              {product.name}
            </Link>
            {product.brand ? (
              <p className="mt-0.5 truncate text-xs text-[#9ca3af]">
                {product.brand}
              </p>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-3 py-4 text-[#6b7280]">
        <p className="font-medium text-[#1a1f2e]">{product.categoryName}</p>
        {product.subcategoryName ? (
          <p className="mt-0.5 text-xs">{product.subcategoryName}</p>
        ) : null}
      </td>
      <td className="px-3 py-4 tabular-nums">
        <p className="font-semibold text-[#1a1f2e]">
          {formatInr(product.sellingPrice)}
        </p>
        {product.mrp != null && product.mrp > product.sellingPrice ? (
          <p className="mt-0.5 text-xs text-[#9ca3af] line-through">
            {formatInr(product.mrp)}
          </p>
        ) : null}
      </td>
      <td className="px-3 py-4 text-[#6b7280]">
        {formatStockQuantity(
          product.stockQuantity,
          product.unitValue,
          product.unit,
        )}
      </td>
      <td className="px-3 py-4 font-mono text-xs text-[#6b7280]">
        {formatSkuOrFallback(product.sku, product.barcode, product.id)}
      </td>
      <td className="px-3 py-4">
        <ProductActiveBadge isActive={product.isActive} />
      </td>
      <td className="px-3 py-4">
        <ProductFeaturedBadge isFeatured={product.isFeatured} />
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-[#eceef2] px-3"
            asChild
          >
            <Link href={detailHref}>
              <Eye className="size-3.5" aria-hidden />
              <span className="ml-1.5 hidden lg:inline">View</span>
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-[#eceef2] px-3"
            asChild
          >
            <Link href={editHref}>
              <Pencil className="size-3.5" aria-hidden />
              <span className="ml-1.5 hidden lg:inline">Edit</span>
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-[#eceef2] px-3 text-destructive hover:bg-destructive/5 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" aria-hidden />
            <span className="ml-1.5 hidden lg:inline">Delete</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}

function ProductFilterChips<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
}: {
  ariaLabel: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((chip) => {
        const active = value === chip.value;
        return (
          <button
            key={chip.label}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(chip.value)}
            className={cn(
              "min-h-[36px] shrink-0 snap-start rounded-full border px-3.5 py-1.5 text-xs font-semibold transition active:scale-[0.98]",
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
  );
}

function ProductMobileFiltersPanel({
  state,
  patchParams,
  categoryOptions,
  subcategoryOptions,
  categoriesLoading,
  subcategoriesLoading,
}: {
  state: ReturnType<typeof useProductListQueryParams>["state"];
  patchParams: ReturnType<typeof useProductListQueryParams>["patchParams"];
  categoryOptions: { id: string; name: string }[];
  subcategoryOptions: { id: string; name: string }[];
  categoriesLoading: boolean;
  subcategoriesLoading: boolean;
}) {
  return (
    <div className="grid gap-2 rounded-xl border border-[#eceef2] bg-[#fafbfc] p-3 md:hidden">
      <FilterSelect
        label="Category"
        value={state.categoryId}
        disabled={categoriesLoading}
        onChange={(value) => {
          patchParams({
            category_id: value || null,
            subcategory_id: null,
            page: null,
          });
        }}
      >
        <option value="">All categories</option>
        {categoryOptions.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        label="Subcategory"
        value={state.subcategoryId}
        disabled={!state.categoryId || subcategoriesLoading}
        onChange={(value) => {
          patchParams({
            subcategory_id: value || null,
            page: null,
          });
        }}
      >
        <option value="">
          {state.categoryId ? "All subcategories" : "Select category first"}
        </option>
        {subcategoryOptions.map((subcategory) => (
          <option key={subcategory.id} value={subcategory.id}>
            {subcategory.name}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        label="Featured"
        value={state.featuredFilter}
        onChange={(value) => {
          patchParams({
            featured: value === "all" ? null : value,
            page: null,
          });
        }}
      >
        <option value="all">All products</option>
        <option value="featured">Featured</option>
        <option value="not_featured">Not featured</option>
      </FilterSelect>

      <FilterSelect
        label="Sort by"
        value={state.sortBy || "default"}
        onChange={(value) => {
          if (value === "default") {
            patchParams({
              sort_by: null,
              sort_order: null,
              page: null,
            });
            return;
          }
          patchParams({
            sort_by: value,
            sort_order: state.sortOrder,
            page: null,
          });
        }}
      >
        <option value="default">Default order</option>
        <option value="name">Product name</option>
        <option value="selling_price">Selling price</option>
        <option value="stock_quantity">Stock quantity</option>
        <option value="created_at">Created date</option>
        <option value="updated_at">Updated date</option>
      </FilterSelect>
    </div>
  );
}

function ProductMobileCard({
  product,
  onDelete,
}: {
  product: MerchantProduct;
  onDelete: () => void;
}) {
  const detailHref = `${dashboardRoutePrefix}/products/${product.id}`;
  const editHref = `${dashboardRoutePrefix}/products/${product.id}/edit`;

  return (
    <article className="overflow-hidden rounded-xl border border-[#eceef2] bg-white shadow-sm">
      <Link
        href={detailHref}
        className="flex gap-3 p-3.5 transition active:bg-[#fafbfc]"
      >
        <ProductThumbnail
          imageUrl={product.primaryImage?.imageUrl}
          name={product.name}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#1a1f2e]">
            {product.name}
          </p>
          {product.brand ? (
            <p className="mt-0.5 truncate text-xs text-[#9ca3af]">{product.brand}</p>
          ) : null}
          <p className="mt-1 text-xs text-[#6b7280]">
            {product.categoryName}
            {product.subcategoryName ? ` · ${product.subcategoryName}` : ""}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <ProductActiveBadge isActive={product.isActive} />
            <ProductFeaturedBadge isFeatured={product.isFeatured} />
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end justify-between gap-1">
          <p className="text-sm font-bold tabular-nums text-[#1a1f2e]">
            {formatInr(product.sellingPrice)}
          </p>
          {product.mrp != null && product.mrp > product.sellingPrice ? (
            <p className="text-[10px] text-[#9ca3af] line-through">
              {formatInr(product.mrp)}
            </p>
          ) : null}
          <p className="text-[10px] text-[#6b7280]">
            {formatStockQuantity(
              product.stockQuantity,
              product.unitValue,
              product.unit,
            )}
          </p>
          <ChevronRightIcon className="size-4 text-[#d1d5db]" aria-hidden />
        </div>
      </Link>
      <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-t border-[#f0f1f4] bg-[#fafbfc] p-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 rounded-lg border-[#eceef2] bg-white"
          asChild
        >
          <Link href={editHref}>
            <Pencil className="size-3.5" aria-hidden />
            <span className="ml-1.5">Edit</span>
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 rounded-lg border-[#eceef2] bg-white px-3"
          asChild
        >
          <Link href={detailHref} aria-label={`View ${product.name}`}>
            <Eye className="size-3.5" aria-hidden />
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 rounded-lg border-[#eceef2] bg-white px-3 text-destructive hover:bg-destructive/5"
          onClick={onDelete}
          aria-label={`Delete ${product.name}`}
        >
          <Trash2 className="size-3.5" aria-hidden />
        </Button>
      </div>
    </article>
  );
}
