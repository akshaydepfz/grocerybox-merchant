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
  FolderTree,
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
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ErrorState } from "@/components/shared/error-state";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { useAuth } from "@/features/auth/components/auth-provider";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import {
  activateMerchantCategory,
  deactivateMerchantCategory,
  friendlyCategoryError,
  listMerchantCategories,
} from "../services";
import type {
  MerchantCategory,
  MerchantCategoryListResult,
} from "../types/merchant-category";

import { CategoryDeleteDialog } from "./category-delete-dialog";
import { CategoryFormDialog } from "./category-form-dialog";

const LIST_LIMIT = 20;

type ActiveFilter = "all" | "active" | "inactive";

const STATUS_STYLES = {
  active: "bg-[#dcfce7] text-[#15803d]",
  inactive: "bg-[#f3f4f6] text-[#4b5563]",
} as const;

function resolveIsActiveFilter(
  filter: ActiveFilter,
): boolean | undefined {
  if (filter === "active") {
    return true;
  }
  if (filter === "inactive") {
    return false;
  }
  return undefined;
}

export function CategoriesScreen() {
  const queryClient = useQueryClient();
  const { user, isRegistered } = useAuth();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [formSession, setFormSession] = useState(0);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MerchantCategory | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const listQueryKey = [
    "merchant-categories",
    page,
    LIST_LIMIT,
    debouncedSearch,
    activeFilter,
  ] as const;

  const listEnabled = Boolean(user && isRegistered);

  const listQuery = useQuery({
    queryKey: listQueryKey,
    queryFn: () =>
      listMerchantCategories({
        page,
        limit: LIST_LIMIT,
        search: debouncedSearch || undefined,
        isActive: resolveIsActiveFilter(activeFilter),
      }),
    enabled: listEnabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const summaryQuery = useQuery({
    queryKey: ["merchant-categories-summary"],
    queryFn: () => listMerchantCategories({ page: 1, limit: 1 }),
    enabled: listEnabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const activeTotalQuery = useQuery({
    queryKey: ["merchant-categories-active-total"],
    queryFn: () =>
      listMerchantCategories({ page: 1, limit: 1, isActive: true }),
    enabled: listEnabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (listQuery.error) {
      toast.error(
        listQuery.error instanceof ApiError
          ? friendlyCategoryError(listQuery.error)
          : "Unable to load categories.",
      );
    }
  }, [listQuery.error]);

  const refreshList = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["merchant-categories"] }),
      queryClient.invalidateQueries({ queryKey: ["merchant-categories-summary"] }),
      queryClient.invalidateQueries({
        queryKey: ["merchant-categories-active-total"],
      }),
    ]);
  };

  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      category,
      nextActive,
    }: {
      category: MerchantCategory;
      nextActive: boolean;
    }) => {
      if (nextActive) {
        return activateMerchantCategory(category.id);
      }
      return deactivateMerchantCategory(category.id);
    },
    onMutate: async ({ category, nextActive }) => {
      await queryClient.cancelQueries({ queryKey: ["merchant-categories"] });
      const previous = queryClient.getQueryData<MerchantCategoryListResult>(
        listQueryKey,
      );
      queryClient.setQueryData<MerchantCategoryListResult>(
        listQueryKey,
        (current) => {
          if (!current) {
            return current;
          }
          return {
            ...current,
            items: current.items.map((item) =>
              item.id === category.id
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
        variables.nextActive ? "Category activated." : "Category deactivated.",
      );
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listQueryKey, context.previous);
      }
      toast.error(
        error instanceof ApiError
          ? friendlyCategoryError(error)
          : "Unable to update category status.",
      );
    },
    onSettled: () => {
      void refreshList();
    },
  });

  const items = listQuery.data?.items ?? [];
  const pagination = listQuery.data?.pagination;
  const totalCount = summaryQuery.data?.pagination.total ?? 0;
  const activeCount = activeTotalQuery.data?.pagination.total ?? 0;
  const inactiveCount = Math.max(0, totalCount - activeCount);
  const filteredTotal = pagination?.total ?? 0;

  const stats = useMemo(
    () => [
      {
        label: "Total Categories",
        value: String(totalCount),
        hint:
          debouncedSearch || activeFilter !== "all"
            ? `${filteredTotal} matching filters`
            : "All categories",
        icon: FolderTree,
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
    [activeCount, activeFilter, debouncedSearch, filteredTotal, inactiveCount, totalCount],
  );

  const openCreate = () => {
    setFormMode("create");
    setEditingCategoryId(null);
    setFormSession((value) => value + 1);
    setFormOpen(true);
  };

  const openEdit = (category: MerchantCategory) => {
    setFormMode("edit");
    setEditingCategoryId(category.id);
    setFormSession((value) => value + 1);
    setFormOpen(true);
  };

  const openDelete = (category: MerchantCategory) => {
    setDeleteTarget(category);
    setDeleteOpen(true);
  };

  const initialLoading = listQuery.isLoading && !listQuery.data;
  const listFailed = listQuery.isError && !listQuery.data;

  if (initialLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-16">
        <GroceryAnimatedLoader
          theme="dashboard"
          label="Loading categories"
          sublabel="Fetching your catalog"
        />
      </div>
    );
  }

  if (listFailed) {
    const message =
      listQuery.error instanceof ApiError
        ? friendlyCategoryError(listQuery.error)
        : "Unable to load categories.";
    return (
      <div className="mx-auto w-full max-w-[1200px] py-8">
        <ErrorState
          title="Could not load categories"
          message={message}
          onRetry={() => void listQuery.refetch()}
        />
      </div>
    );
  }

  const totalPages = pagination?.totalPages ?? 1;

  const isToggling = (categoryId: string) =>
    toggleActiveMutation.isPending &&
    toggleActiveMutation.variables?.category.id === categoryId;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">
            Categories
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Manage the categories displayed in your store.
          </p>
        </div>
        <Button
          type="button"
          className="h-10 shrink-0 rounded-xl bg-[#16a34a] px-4 text-sm font-semibold text-white hover:bg-[#15803d]"
          onClick={openCreate}
        >
          <Plus className="size-4" aria-hidden />
          Add Category
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
              All Categories
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
                placeholder="Search categories…"
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
              <option value="all">All categories</option>
              <option value="active">Active categories</option>
              <option value="inactive">Inactive categories</option>
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
              No categories found
            </p>
            <p className="max-w-sm text-sm text-[#6b7280]">
              {debouncedSearch || activeFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Create your first category to organize products."}
            </p>
            {!debouncedSearch && activeFilter === "all" ? (
              <Button
                type="button"
                className="mt-2 bg-[#16a34a] text-white hover:bg-[#15803d]"
                onClick={openCreate}
              >
                <Plus className="size-4" aria-hidden />
                Add Category
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
                {items.map((category) => (
                  <tr
                    key={category.id}
                    className="transition hover:bg-[#fafbfc]"
                  >
                    <td className="px-5 py-4">
                      <CategoryAvatar category={category} />
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-semibold text-[#1a1f2e]">
                        <Link
                          href={`/dashboard/categories/${category.id}/subcategories`}
                          className="transition hover:text-[#16a34a] hover:underline"
                        >
                          {category.name}
                        </Link>
                      </p>
                      <p className="mt-0.5 text-xs text-[#9ca3af] sm:hidden">
                        /{category.slug}
                      </p>
                    </td>
                    <td className="hidden px-3 py-4 text-[#6b7280] sm:table-cell">
                      /{category.slug}
                    </td>
                    <td className="px-3 py-4 tabular-nums text-[#6b7280]">
                      {category.displayOrder}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={category.isActive}
                            disabled={isToggling(category.id)}
                            aria-label={
                              category.isActive
                                ? `Deactivate ${category.name}`
                                : `Activate ${category.name}`
                            }
                            className="data-[state=checked]:bg-[#16a34a]"
                            onCheckedChange={(checked) => {
                              if (isToggling(category.id)) {
                                return;
                              }
                              toggleActiveMutation.mutate({
                                category,
                                nextActive: checked,
                              });
                            }}
                          />
                          {isToggling(category.id) ? (
                            <Loader2
                              className="size-3.5 animate-spin text-[#6b7280]"
                              aria-hidden
                            />
                          ) : null}
                        </div>
                        <span
                          className={cn(
                            "inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            category.isActive
                              ? STATUS_STYLES.active
                              : STATUS_STYLES.inactive,
                          )}
                        >
                          {category.isActive ? "Active" : "Inactive"}
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
                          asChild
                        >
                          <Link
                            href={`/dashboard/categories/${category.id}/subcategories`}
                          >
                            <Layers className="size-3.5" aria-hidden />
                            <span className="ml-1.5 hidden sm:inline">
                              Subcategories
                            </span>
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl border-[#eceef2] px-3"
                          onClick={() => openEdit(category)}
                        >
                          <Pencil className="size-3.5" aria-hidden />
                          <span className="ml-1.5 hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl border-[#eceef2] px-3 text-destructive hover:bg-destructive/5 hover:text-destructive"
                          onClick={() => openDelete(category)}
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

      <CategoryFormDialog
        key={`${formMode}-${editingCategoryId ?? "new"}-${formSession}`}
        open={formOpen}
        mode={formMode}
        categoryId={editingCategoryId}
        onOpenChange={setFormOpen}
        onSuccess={() => {
          void refreshList();
        }}
      />

      <CategoryDeleteDialog
        open={deleteOpen}
        categoryName={deleteTarget?.name ?? ""}
        categoryId={deleteTarget?.id ?? null}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          void refreshList();
        }}
      />
    </div>
  );
}

function CategoryAvatar({ category }: { category: MerchantCategory }) {
  if (category.imageUrl) {
    return (
      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-[#f5f6f8]">
        <Image
          src={category.imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="48px"
          unoptimized
        />
      </div>
    );
  }

  const initial = category.name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#f5f6f8] text-sm font-bold text-[#6b7280]"
      aria-hidden
    >
      {initial}
    </div>
  );
}
