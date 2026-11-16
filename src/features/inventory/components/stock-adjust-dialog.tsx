"use client";

import { Loader2, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MerchantProduct } from "@/features/products/types/merchant-product";
import { ProductThumbnail } from "@/features/products/components/product-thumbnail";
import { ProductStockBadge } from "@/features/products/components/product-status-badges";
import {
  formatStockQuantity,
  resolveStockLabel,
} from "@/features/products/utils/format-product";

const QUICK_DELTAS = [-10, -5, -1, 1, 5, 10] as const;

type StockAdjustDialogProps = {
  open: boolean;
  product: MerchantProduct | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (productId: string, nextQuantity: number) => void;
};

export function StockAdjustDialog({
  open,
  product,
  isSaving,
  onOpenChange,
  onConfirm,
}: StockAdjustDialogProps) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (product) {
      setDraft(String(product.stockQuantity));
    }
  }, [product]);

  if (!product) {
    return null;
  }

  const parsed = Number.parseFloat(draft);
  const quantityValid = Number.isFinite(parsed) && parsed >= 0;
  const current = product.stockQuantity;

  const applyDelta = (delta: number) => {
    const base = quantityValid ? parsed : current;
    const next = Math.max(0, base + delta);
    setDraft(formatDraftNumber(next));
  };

  const handleSave = () => {
    if (!quantityValid) return;
    onConfirm(product.id, parsed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-[#eceef2] p-0 gap-0">
        <DialogHeader className="border-b border-[#f0f1f4] px-5 py-4 text-left">
          <DialogTitle className="text-lg font-bold text-[#1a1f2e]">
            Update stock
          </DialogTitle>
          <DialogDescription className="text-sm text-[#6b7280]">
            Set how many sellable units you have on hand.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-5 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-[#eceef2] bg-[#fafbfc] p-3">
            <ProductThumbnail
              imageUrl={product.primaryImage?.imageUrl}
              name={product.name}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold text-[#1a1f2e]">
                {product.name}
              </p>
              <p className="mt-1 text-xs text-[#6b7280]">
                Current:{" "}
                {formatStockQuantity(
                  product.stockQuantity,
                  product.unitValue,
                  product.unit,
                )}
              </p>
              <div className="mt-2">
                <ProductStockBadge stockQuantity={product.stockQuantity} />
              </div>
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
              New quantity
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11 shrink-0 rounded-xl"
                disabled={isSaving}
                onClick={() => applyDelta(-1)}
                aria-label="Decrease by one"
              >
                <Minus className="size-4" />
              </Button>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={draft}
                disabled={isSaving}
                onChange={(event) => setDraft(event.target.value)}
                className="h-11 flex-1 rounded-xl border border-[#e8eaef] bg-white px-3 text-center text-lg font-semibold tabular-nums text-[#1a1f2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11 shrink-0 rounded-xl"
                disabled={isSaving}
                onClick={() => applyDelta(1)}
                aria-label="Increase by one"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </label>

          <div className="flex flex-wrap gap-2">
            {QUICK_DELTAS.map((delta) => (
              <Button
                key={delta}
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-[#e8eaef] px-3 text-xs font-semibold"
                disabled={isSaving}
                onClick={() => applyDelta(delta)}
              >
                {delta > 0 ? `+${delta}` : delta}
              </Button>
            ))}
          </div>

          {quantityValid && resolveStockLabel(parsed) !== resolveStockLabel(current) ? (
            <p className="text-xs text-[#6b7280]">
              Status will change to{" "}
              <span className="font-semibold text-[#1a1f2e]">
                {resolveStockLabel(parsed) === "out"
                  ? "Out of stock"
                  : resolveStockLabel(parsed) === "low"
                    ? "Low stock"
                    : "In stock"}
              </span>
              .
            </p>
          ) : null}
        </div>

        <DialogFooter className="border-t border-[#f0f1f4] px-5 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10 rounded-xl bg-[#16a34a] text-white hover:bg-[#15803d]"
            disabled={!quantityValid || isSaving}
            onClick={handleSave}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                <span className="ml-2">Saving…</span>
              </>
            ) : (
              "Save stock"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatDraftNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}