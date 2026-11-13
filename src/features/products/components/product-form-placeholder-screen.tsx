"use client";

import { ArrowLeft, Construction } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { dashboardRoutePrefix } from "@/config/routes";

type ProductFormPlaceholderScreenProps = {
  mode: "create" | "edit";
  productId?: string;
};

export function ProductFormPlaceholderScreen({
  mode,
  productId,
}: ProductFormPlaceholderScreenProps) {
  const listHref = `${dashboardRoutePrefix}/products`;
  const title = mode === "create" ? "Add product" : "Edit product";

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
      <Link
        href={mode === "edit" && productId ? `${listHref}/${productId}` : listHref}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[#6b7280] transition hover:text-[#16a34a]"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {mode === "edit" ? "Back to product" : "Back to products"}
      </Link>

      <header>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Product create and edit flows are coming soon. Listing and detail views
          are connected to your live catalog API.
        </p>
      </header>

      <DashboardSurface className="flex flex-col items-center gap-4 px-6 py-14 text-center">
        <Construction className="size-10 text-[#16a34a]" aria-hidden />
        <p className="text-sm font-semibold text-[#1a1f2e]">
          This screen is a navigation placeholder
        </p>
        <p className="max-w-md text-sm text-[#6b7280]">
          No backend create or update calls are made from this page. Use the
          products list to browse inventory while the full editor is being built.
        </p>
        <Button
          type="button"
          className="bg-[#16a34a] text-white hover:bg-[#15803d]"
          asChild
        >
          <Link href={listHref}>View all products</Link>
        </Button>
      </DashboardSurface>
    </div>
  );
}
