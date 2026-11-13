"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api/types";

import {
  createMerchantCategory,
  friendlyCategoryError,
  getMerchantCategory,
  updateMerchantCategory,
} from "../services";
import type { MerchantCategory } from "../types/merchant-category";

type CategoryFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  categoryId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  imageUrl: string;
  displayOrder: string;
  isActive: boolean;
};

const defaultForm = (): FormState => ({
  name: "",
  imageUrl: "",
  displayOrder: "0",
  isActive: true,
});

function formFromCategory(category: MerchantCategory): FormState {
  return {
    name: category.name,
    imageUrl: category.imageUrl ?? "",
    displayOrder: String(category.displayOrder),
    isActive: category.isActive,
  };
}

export function CategoryFormDialog({
  open,
  mode,
  categoryId,
  onOpenChange,
  onSuccess,
}: CategoryFormDialogProps) {
  const [draft, setDraft] = useState<FormState | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const editQuery = useQuery({
    queryKey: ["merchant-category", categoryId],
    queryFn: () => getMerchantCategory(categoryId!),
    enabled: open && mode === "edit" && Boolean(categoryId),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const baseForm = useMemo((): FormState => {
    if (mode === "edit" && editQuery.data) {
      return formFromCategory(editQuery.data);
    }
    return defaultForm();
  }, [editQuery.data, mode]);

  const form = draft ?? baseForm;
  const setForm = (patch: Partial<FormState>) => {
    setDraft((prev) => ({ ...(prev ?? baseForm), ...patch }));
  };

  const initialImageUrl = editQuery.data?.imageUrl ?? null;
  const loadingDetail = mode === "edit" && editQuery.isLoading;

  useEffect(() => {
    if (editQuery.error) {
      const message =
        editQuery.error instanceof ApiError
          ? friendlyCategoryError(editQuery.error)
          : "Unable to load category.";
      toast.error(message);
      onOpenChange(false);
    }
  }, [editQuery.error, onOpenChange]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || loadingDetail) {
      return;
    }

    const name = form.name.trim();
    if (!name) {
      toast.error("Category name is required.");
      return;
    }

    const displayOrder = Number.parseInt(form.displayOrder, 10);
    if (Number.isNaN(displayOrder) || displayOrder < 0) {
      toast.error("Display order must be zero or greater.");
      return;
    }

    const trimmedImageUrl = form.imageUrl.trim();
    setSubmitting(true);
    try {
      if (mode === "create") {
        await createMerchantCategory({
          name,
          displayOrder,
          isActive: form.isActive,
          imageUrl: trimmedImageUrl.length > 0 ? trimmedImageUrl : null,
        });
        toast.success("Category created.");
      } else if (categoryId) {
        const imageChanged =
          trimmedImageUrl !== (initialImageUrl ?? "").trim();
        await updateMerchantCategory(categoryId, {
          name,
          displayOrder,
          isActive: form.isActive,
          touchImageUrl: imageChanged,
          imageUrl: trimmedImageUrl.length > 0 ? trimmedImageUrl : null,
        });
        toast.success("Category updated.");
      } else {
        return;
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? friendlyCategoryError(error)
          : "Unable to save category.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add category" : "Edit category"}
          </DialogTitle>
          <DialogDescription>
            Categories group products on your storefront. Image URL is optional.
          </DialogDescription>
        </DialogHeader>

        {loadingDetail ? (
          <div className="flex items-center justify-center py-10 text-sm text-[#6b7280]">
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            Loading category…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(event) => setForm({ name: event.target.value })}
                placeholder="Fruits & Vegetables"
                disabled={submitting}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-image-url">Image URL (optional)</Label>
              <Input
                id="category-image-url"
                value={form.imageUrl}
                onChange={(event) => setForm({ imageUrl: event.target.value })}
                placeholder="https://cdn.example.com/category.webp"
                disabled={submitting}
                inputMode="url"
              />
              <p className="text-xs text-[#9ca3af]">
                Paste a hosted image URL. Merchant category file upload is not
                exposed on the API yet (store branding uses multipart upload).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-display-order">Display order</Label>
              <Input
                id="category-display-order"
                type="number"
                min={0}
                value={form.displayOrder}
                onChange={(event) =>
                  setForm({ displayOrder: event.target.value })
                }
                disabled={submitting}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#eceef2] px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-[#1a1f2e]">Active</p>
                <p className="text-xs text-[#9ca3af]">
                  Inactive categories are hidden from your storefront.
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ isActive: checked })}
                disabled={submitting}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#16a34a] text-white hover:bg-[#15803d]"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : mode === "create" ? (
                  "Create category"
                ) :
                  "Save changes"
                }
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
