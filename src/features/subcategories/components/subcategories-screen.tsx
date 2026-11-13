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
  Layers,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ErrorState } from "@/components/shared/error-state";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { useAuth } from "@/features/auth/components/auth-provider";
import {
  friendlyCategoryError,
  getMerchantCategory,
} from "@/features/categories/services";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import {
  activateMerchantSubcategory,
  deactivateMerchantSubcategory,
  friendlySubcategoryError,
  listMerchantSubcategories,
} from "../services";
import type {
  MerchantSubcategory,
  MerchantSubcategoryListResult,
} from "../types/merchant-subcategory";

import { SubcategoryBreadcrumbs } from "./subcategory-breadcrumbs";
import { SubcategoryDeleteDialog } from "./subcategory-delete-dialog";

const LIST_LIMIT = 20;

type ActiveFilter = "all" | "active" | "inactive";

const STATUS_STYLES = {
  active: "bg-[#dcfce7] text-[#15803d]",
  inactive: "bg-[#f3f4f6] text-[#4b5563]",
} as const;

function resolveIsActiveFilter(filter: ActiveFilter): boolean | undefined {
  if (filter === "active") {
    return true;
  }
  if (filter === "inactive") {
    return false;
  }
  return undefined;
}

function subcategoriesBasePath(categoryId: string): string {
  return `/dashboard/categories/${categoryId}/subcategories`;
}

type SubcategoriesScreenProps = {
  categoryId: string;
};

export function SubcategoriesScreen({ categoryId }: SubcategoriesScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isRegistered } = useAuth();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MerchantSubcategory | null>(
    null,
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const listQueryKey = [
    "merchant-subcategories",
    categoryId,
    page,
    LIST_LIMIT,
    debouncedSearch,
    activeFilter,
  ] as const;

  const enabled = Boolean(user && isRegistered && categoryId);

  const categoryQuery = useQuery({
    queryKey: ["merchant-category", categoryId],
    queryFn: () => getMerchantCategory(categoryId),
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const listQuery = useQuery({
    queryKey: listQueryKey,
    queryFn: () =>
      listMerchantSubcategories(categoryId, {
        page,
        limit: LIST_LIMIT,
        search: debouncedSearch || undefined,
        isActive: resolveIsActiveFilter(activeFilter),
      }),
    enabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const summaryQuery = useQuery({
    queryKey: ["merchant-subcategories-summary", categoryId],
    queryFn: () =>
      listMerchantSubcategories(categoryId, { page: 1, limit: 1 }),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const activeTotalQuery = useQuery({
    queryKey: ["merchant-subcategories-active-total", categoryId],
    queryFn: () =>
      listMerchantSubcategories(categoryId, {
        page: 1,
        limit: 1,
        isActive: true,
      }),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (categoryQuery.error) {
      toast.error(
        categoryQuery.error instanceof ApiError
          ? friendlyCategoryError(categoryQuery.error)
          : "Unable to load parent category.",
      );
    }
  }, [categoryQuery.error]);

  useEffect(() => {
    if (listQuery.error) {
      toast.error(
        listQuery.error instanceof ApiError
          ? friendlySubcategoryError(listQuery.error)
          : "Unable to load subcategories.",
      );
    }
  }, [listQuery.error]);

  const refreshList = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["merchant-subcategories", categoryId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["merchant-subcategories-summary", categoryId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["merchant-subcategories-active-total", categoryId],
      }),
    ]);
  };

  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      subcategory,
      nextActive,
    }: {
      subcategory: MerchantSubcategory;
      nextActive: boolean;
    }) => {
      if (nextActive) {
        return activateMerchantSubcategory(categoryId, subcategory.id);
      }
      return deactivateMerchantSubcategory(categoryId, subcategory.id);
    },
    onMutate: async ({ subcategory, nextActive }) => {
      await queryClient.cancelQueries({
        queryKey: ["merchant-subcategories", categoryId],
      });
      const previous = queryClient.getQueryData<MerchantSubcategoryListResult>(
        listQueryKey,
      );
      queryClient.setQueryData<MerchantSubcategoryListResult>(
        listQueryKey,
        (current) => {
          if (!current) {
            return current;
          }
          return {
            ...current,
            items: current.items.map((item) =>
              item.id === subcategory.id
                ? { ...item, isActive: nextActive }
                : item,
            ),
          };
        },
      );
      return { previous };
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.nextActive
          ? "Subcategory activated."
          : "Subcategory deactivated.",
      );
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listQueryKey, context.previous);
      }
      toast.error(
        error instanceof ApiError
          ? friendlySubcategoryError(error)
          : "Unable to update subcategory status.",
      );
    },
    onSettled: () => {
      void refreshList();
    },
  });

  const parentCategory = categoryQuery.data;
  const items = listQuery.data?.items ?? [];
  const pagination = listQuery.data?.pagination;
  const totalCount = summaryQuery.data?.pagination.total ?? 0;
  const activeCount = activeTotalQuery.data?.pagination.total ?? 0;
  const inactiveCount = Math.max(0, totalCount - activeCount);
  const filteredTotal = pagination?.total ?? 0;

  const stats = useMemo(
    () => [
      {
        label: "Total Subcategories",
        value: String(totalCount),
        hint:
          debouncedSearch || activeFilter !== "all"
            ? `${filteredTotal} matching filters`
            : "Under this category",
        icon: Layers,
        iconBg: "bg-[#dcfce7]",
        iconColor: "text-[#16a34a]",
        cardBg: "bg-[#f0fdf4]",
      },
      {
        label: "Active",
        value: String(activeCount),
        hint: "Visible on storefront",
        icon: Sparkles,
        iconBg: "bg-[#f3e8ff]",
        iconColor: "text-[#9333ea]",
        cardBg: "bg-[#faf5ff]",
      },
      {
        label: "Inactive",
        value: String(inactiveCount),
        hint: "Hidden from customers",
        icon: Layers,
        iconBg: "bg-[#ffedd5]",
        iconColor: "text-[#ea580c]",
        cardBg: "bg-[#fff7ed]",
      },
    ],
    [
      activeCount,
      activeFilter,
      debouncedSearch,
      filteredTotal,
      inactiveCount,
      totalCount,
    ],
  );

  const openDelete = (subcategory: MerchantSubcategory) => {
    setDeleteTarget(subcategory);
    setDeleteOpen(true);
  };

  const initialLoading =
    (listQuery.isLoading && !listQuery.data) ||
    (categoryQuery.isLoading && !categoryQuery.data);
  const categoryFailed = categoryQuery.isError && !categoryQuery.data;
  const listFailed = listQuery.isError && !listQuery.data;

  if (initialLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-16">
        <GroceryAnimatedLoader
          theme="dashboard"
          label="Loading subcategories"
          sublabel="Fetching catalog details"
        />
      </div>
    );
  }

  if (categoryFailed) {
    const message =
      categoryQuery.error instanceof ApiError
        ? friendlyCategoryError(categoryQuery.error)
        : "Unable to load parent category.";
    return (
      <div className="mx-auto w-full max-w-[1200px] py-8">
        <ErrorState
          title="Category not found"
          message={message}
          onRetry={() => void categoryQuery.refetch()}
        />
        <div className="mt-4 text-center">
          <Button variant="outline" asChild>
            <Link href="/dashboard/categories">Back to categories</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (listFailed) {
    const message =
      listQuery.error instanceof ApiError
        ? friendlySubcategoryError(listQuery.error)
        : "Unable to load subcategories.";
    return (
      <div className="mx-auto w-full max-w-[1200px] py-8">
        <ErrorState
          title="Could not load subcategories"
          message={message}
          onRetry={() => void listQuery.refetch()}
        />
      </div>
    );
  }

  const totalPages = pagination?.totalPages ?? 1;
  const parentName = parentCategory?.name ?? "Category";

  const isToggling = (subcategoryId: string) =>
    toggleActiveMutation.isPending &&
    toggleActiveMutation.variables?.subcategory.id === subcategoryId;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <SubcategoryBreadcrumbs
        items={[
          { label: "Categories", href: "/dashboard/categories" },
          {
            label: parentName,
            href: subcategoriesBasePath(categoryId),
          },
          { label: "Subcategories" },
        ]}
      />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          {parentCategory ? (
            <ParentCategoryAvatar
              name={parentCategory.name}
              imageUrl={parentCategory.imageUrl}
            />
          ) : null}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">
              {parentName}
            </h1>
            <p className="mt-1 text-sm text-[#6b7280]">
              Manage subcategories under this main category.
              {totalCount > 0 ? (
                <span className="tabular-nums"> · {totalCount} total</span>
              ) : null}
            </p>
          </div>
        </div>
        <Button
          type="button"
          className="h-10 shrink-0 rounded-xl bg-[#16a34a] px-4 text-sm font-semibold text-white hover:bg-[#15803d]"
          onClick={() =>
            router.push(`${subcategoriesBasePath(categoryId)}/new`)
          }
        >
          <Plus className="size-4" aria-hidden />
          Add Subcategory
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={cn(
                "relative overflow-hidden rounded-2xl border border-[#e8f5e9] p-5",
                stat.cardBg,
              )}
            >
              <div
                className={cn(
                  "absolute right-4 top-4 flex size-11 items-center justify-center rounded-xl",
                  stat.iconBg,
                )}
              >
                <Icon className={cn("size-5", stat.iconColor)} aria-hidden />
              </div>
              <p className="text-sm font-medium text-[#6b7280]">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-[#1a1f2e]">
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-medium text-[#9ca3af]">
                {stat.hint}
              </p>
            </div>
          );
        })}
      </section>

      <DashboardSurface>
        <div className="flex flex-col gap-3 border-b border-[#f0f1f4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1a1f2e]">
              All Subcategories
            </h2>
            <p className="mt-0.5 text-xs text-[#9ca3af]">
              Sorted by display order, then name.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search subcategories…"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] pl-10 pr-3 text-sm text-[#1a1f2e] placeholder:text-[#9ca3af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
              />
            </div>
            <select
              value={activeFilter}
              onChange={(event) => {
                setActiveFilter(event.target.value as ActiveFilter);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 text-sm text-[#1a1f2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
              aria-label="Filter by status"
            >
              <option value="all">All subcategories</option>
              <option value="active">Active subcategories</option>
              <option value="inactive">Inactive subcategories</option>
            </select>
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
            <p className="text-sm font-semibold text-[#1a1f2e]">
              No subcategories found
            </p>
            <p className="max-w-sm text-sm text-[#6b7280]">
              {debouncedSearch || activeFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Create your first subcategory to organize products."}
            </p>
            {!debouncedSearch && activeFilter === "all" ? (
              <Button
                type="button"
                className="mt-2 bg-[#16a34a] text-white hover:bg-[#15803d]"
                onClick={() =>
                  router.push(`${subcategoriesBasePath(categoryId)}/new`)
                }
              >
                <Plus className="size-4" aria-hidden />
                Add Subcategory
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#f0f1f4] bg-[#fafbfc] text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  <th className="px-5 py-3 font-semibold" scope="col">
                    Image
                  </th>
                  <th className="px-3 py-3 font-semibold" scope="col">
                    Name
                  </th>
                  <th className="hidden px-3 py-3 font-semibold sm:table-cell" scope="col">
                    Slug
                  </th>
                  <th className="px-3 py-3 font-semibold" scope="col">
                    Order
                  </th>
                  <th className="px-3 py-3 font-semibold" scope="col">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right font-semibold" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f1f4]">
                {items.map((subcategory) => (
                  <tr
                    key={subcategory.id}
                    className="transition hover:bg-[#fafbfc]"
                  >
                    <td className="px-5 py-4">
                      <SubcategoryAvatar subcategory={subcategory} />
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-semibold text-[#1a1f2e]">
                        {subcategory.name}
                      </p>
                      <p className="mt-0.5 text-xs text-[#9ca3af] sm:hidden">
                        /{subcategory.slug}
                      </p>
                    </td>
                    <td className="hidden px-3 py-4 text-[#6b7280] sm:table-cell">
                      /{subcategory.slug}
                    </td>
                    <td className="px-3 py-4 tabular-nums text-[#6b7280]">
                      {subcategory.displayOrder}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={subcategory.isActive}
                            disabled={isToggling(subcategory.id)}
                            aria-label={
                              subcategory.isActive
                                ? `Deactivate ${subcategory.name}`
                                : `Activate ${subcategory.name}`
                            }
                            className="data-[state=checked]:bg-[#16a34a]"
                            onCheckedChange={(checked) => {
                              if (isToggling(subcategory.id)) {
                                return;
                              }
                              toggleActiveMutation.mutate({
                                subcategory,
                                nextActive: checked,
                              });
                            }}
                          />
                          {isToggling(subcategory.id) ? (
                            <Loader2
                              className="size-3.5 animate-spin text-[#6b7280]"
                              aria-hidden
                            />
                          ) : null}
                        </div>
                        <span
                          className={cn(
                            "inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            subcategory.isActive
                              ? STATUS_STYLES.active
                              : STATUS_STYLES.inactive,
                          )}
                        >
                          {subcategory.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl border-[#eceef2] px-3"
                          onClick={() =>
                            router.push(
                              `${subcategoriesBasePath(categoryId)}/${subcategory.id}/edit`,
                            )
                          }
                        >
                          <Pencil className="size-3.5" aria-hidden />
                          <span className="ml-1.5 hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl border-[#eceef2] px-3 text-destructive hover:bg-destructive/5 hover:text-destructive"
                          onClick={() => openDelete(subcategory)}
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                          <span className="ml-1.5 hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-[#f0f1f4] px-5 py-4">
            <p className="text-xs text-[#6b7280]">
              Page {pagination?.page ?? page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || listQuery.isFetching}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || listQuery.isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        ) : null}
      </DashboardSurface>

      <SubcategoryDeleteDialog
        open={deleteOpen}
        subcategoryName={deleteTarget?.name ?? ""}
        categoryId={categoryId}
        subcategoryId={deleteTarget?.id ?? null}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          void refreshList();
        }}
      />
    </div>
  );
}

function ParentCategoryAvatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string | null;
}) {
  if (imageUrl) {
    return (
      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#f5f6f8]">
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="56px"
          unoptimized
        />
      </div>
    );
  }
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#f5f6f8] text-base font-bold text-[#6b7280]"
      aria-hidden
    >
      {initial}
    </div>
  );
}

function SubcategoryAvatar({
  subcategory,
}: {
  subcategory: MerchantSubcategory;
}) {
  if (subcategory.imageUrl) {
    return (
      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-[#f5f6f8]">
        <Image
          src={subcategory.imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="48px"
          unoptimized
        />
      </div>
    );
  }

  const initial = subcategory.name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#f5f6f8] text-sm font-bold text-[#6b7280]"
      aria-hidden
    >
      {initial}
    </div>
  );
}
