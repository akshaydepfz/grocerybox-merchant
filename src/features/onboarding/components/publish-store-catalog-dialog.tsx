"use client";

import { Package, PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import type { StorePublishCatalogSetup } from "../types/onboarding-review";

export function PublishStoreCatalogDialog({
  open,
  onOpenChange,
  selected,
  onSelect,
  onConfirm,
  isPublishing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: StorePublishCatalogSetup;
  onSelect: (value: StorePublishCatalogSetup) => void;
  onConfirm: () => void;
  isPublishing: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Set up your catalogue</DialogTitle>
          <DialogDescription>
            Choose how you want categories and products in your store when you
            publish.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <CatalogOptionCard
            selected={selected === "import_master"}
            title="Import pre-added categories & products"
            description="Start with our ready-made grocery catalogue."
            hint="You can edit categories and products anytime after publishing."
            icon={Package}
            onClick={() => onSelect("import_master")}
          />
          <CatalogOptionCard
            selected={selected === "manual"}
            title="I'll add my own categories & products"
            description="Publish now and build your catalogue from scratch."
            icon={PencilLine}
            onClick={() => onSelect("manual")}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={isPublishing}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={isPublishing} onClick={onConfirm}>
            {isPublishing ? "Publishing…" : "Publish store"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CatalogOptionCard({
  selected,
  title,
  description,
  hint,
  icon: Icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  hint?: string;
  icon: typeof Package;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-gb-onboard-brand bg-gb-onboard-brand/5 ring-1 ring-gb-onboard-brand"
          : "border-gb-mo-gray-200 bg-white hover:border-gb-mo-gray-300",
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg",
            selected ? "bg-gb-onboard-brand/15 text-gb-onboard-brand" : "bg-gb-mo-gray-100 text-gb-mo-gray-600",
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-bold text-gb-mo-gray-900">{title}</p>
          <p className="mt-1 text-sm text-gb-mo-gray-600">{description}</p>
          {hint ? (
            <p className="mt-2 text-xs font-medium text-gb-mo-gray-500">
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
}