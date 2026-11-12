"use client";

import {
  FolderTree,
  Layers,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { cn } from "@/lib/utils";

const STATS = [
  {
    label: "Total Categories",
    value: "14",
    hint: "3 added this month",
    icon: FolderTree,
    iconBg: "bg-[#dcfce7]",
    iconColor: "text-[#16a34a]",
    cardBg: "bg-[#f0fdf4]",
  },
  {
    label: "Active",
    value: "12",
    hint: "Visible on storefront",
    icon: Sparkles,
    iconBg: "bg-[#f3e8ff]",
    iconColor: "text-[#9333ea]",
    cardBg: "bg-[#faf5ff]",
  },
  {
    label: "Products Linked",
    value: "486",
    hint: "Across all categories",
    icon: Package,
    iconBg: "bg-[#ffedd5]",
    iconColor: "text-[#ea580c]",
    cardBg: "bg-[#fff7ed]",
  },
  {
    label: "Empty Categories",
    value: "2",
    hint: "No products yet",
    icon: Layers,
    iconBg: "bg-[#fee2e2]",
    iconColor: "text-[#dc2626]",
    cardBg: "bg-[#fef2f2]",
  },
] as const;

const CATEGORIES = [
  {
    id: "cat-1",
    name: "Fruits & Vegetables",
    slug: "fruits-vegetables",
    products: 86,
    status: "Active" as const,
    emoji: "🥬",
    updated: "2 hours ago",
  },
  {
    id: "cat-2",
    name: "Dairy & Eggs",
    slug: "dairy-eggs",
    products: 42,
    status: "Active" as const,
    emoji: "🥛",
    updated: "Yesterday",
  },
  {
    id: "cat-3",
    name: "Bakery & Bread",
    slug: "bakery-bread",
    products: 28,
    status: "Active" as const,
    emoji: "🍞",
    updated: "Yesterday",
  },
  {
    id: "cat-4",
    name: "Staples & Grains",
    slug: "staples-grains",
    products: 64,
    status: "Active" as const,
    emoji: "🍚",
    updated: "3 days ago",
  },
  {
    id: "cat-5",
    name: "Snacks & Beverages",
    slug: "snacks-beverages",
    products: 51,
    status: "Active" as const,
    emoji: "🥤",
    updated: "3 days ago",
  },
  {
    id: "cat-6",
    name: "Household Essentials",
    slug: "household-essentials",
    products: 0,
    status: "Draft" as const,
    emoji: "🧴",
    updated: "1 week ago",
  },
] as const;

const STATUS_STYLES = {
  Active: "bg-[#dcfce7] text-[#15803d]",
  Draft: "bg-[#f3f4f6] text-[#4b5563]",
} as const;

export function CategoriesScreen() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">
            Categories
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Group products so customers can browse your store easily.
          </p>
        </div>
        <Button
          type="button"
          className="h-10 shrink-0 rounded-xl bg-[#16a34a] px-4 text-sm font-semibold text-white hover:bg-[#15803d]"
          disabled
        >
          <Plus className="size-4" aria-hidden />
          Add Category
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => {
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
              Drag to reorder how they appear in your catalog (coming soon).
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search categories…"
              disabled
              className="h-10 w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] pl-10 pr-3 text-sm text-[#1a1f2e] placeholder:text-[#9ca3af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
            />
          </div>
        </div>

        <ul className="divide-y divide-[#f0f1f4]">
          {CATEGORIES.map((category) => (
            <li
              key={category.id}
              className="flex items-center gap-3 px-5 py-4 transition hover:bg-[#fafbfc]"
            >
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#f5f6f8] text-xl"
                aria-hidden
              >
                {category.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-[#1a1f2e]">
                    {category.name}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      STATUS_STYLES[category.status],
                    )}
                  >
                    {category.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#9ca3af]">
                  /{category.slug} · {category.products} products · Updated{" "}
                  {category.updated}
                </p>
              </div>
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#eceef2] bg-white text-[#6b7280] transition hover:bg-[#fafbfc]"
                aria-label={`Actions for ${category.name}`}
                disabled
              >
                <MoreHorizontal className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </DashboardSurface>
    </div>
  );
}
