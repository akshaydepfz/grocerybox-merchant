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
  friendlyCategoryImageUploadMessage,
  getMerchantCategory,
  updateMerchantCategory,
  uploadMerchantCategoryImage,
} from "../services";
import type { MerchantCategory } from "../types/merchant-category";
import { revokeCategoryPreview } from "../validators/category-image-validator";

import {
  CategoryImageUpload,
  emptyCategoryImageField,
  type CategoryImageFieldValue,
} from "./category-image-upload";

type CategoryFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  categoryId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  displayOrder: string;
  isActive: boolean;
};

const defaultForm = (): FormState => ({
  name: "",
  displayOrder: "0",
  isActive: true,
});

function formFromCategory(category: MerchantCategory): FormState {
  return {
    name: category.name,
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
  const [imageField, setImageField] = useState<CategoryImageFieldValue>(
    emptyCategoryImageField(),
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
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

  const existingImageUrl = editQuery.data?.imageUrl ?? null;
  const loadingDetail = mode === "edit" && editQuery.isLoading;
  const busy = submitting || uploadProgress != null;

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

  useEffect(() => {
    return () => {
      revokeCategoryPreview(imageField.previewUrl);
    };
  }, [imageField.previewUrl]);

  const resolveImageForSubmit = async (): Promise<{
    imageUrl?: string | null;
    touchImageUrl?: boolean;
  }> => {
    if (imageField.pendingFile) {
      const uploaded = await uploadMerchantCategoryImage({
        file: imageField.pendingFile,
        categoryId: mode === "edit" ? categoryId ?? undefined : undefined,
        onProgress: setUploadProgress,
      });
      return {
        imageUrl: uploaded.imageUrl,
        touchImageUrl: mode === "edit",
      };
    }

    if (mode === "edit" && imageField.removed && existingImageUrl) {
      return {
        imageUrl: null,
        touchImageUrl: true,
      };
    }

    return {};
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || loadingDetail) {
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

    setSubmitting(true);
    setImageError(null);
    setUploadProgress(null);

  let imagePatch: Awaited<ReturnType<typeof resolveImageForSubmit>> = {};

    try {
      imagePatch = await resolveImageForSubmit();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? friendlyCategoryImageUploadMessage(error)
          : "Unable to upload category image.";
      setImageError(message);
      toast.error(message);
      setSubmitting(false);
      setUploadProgress(null);
      return;
    }

    try {
      if (mode === "create") {
        await createMerchantCategory({
          name,
          displayOrder,
          isActive: form.isActive,
          imageUrl:
            imagePatch.imageUrl && imagePatch.imageUrl.length > 0
              ? imagePatch.imageUrl
              : null,
        });
        toast.success("Category created.");
      } else if (categoryId) {
        await updateMerchantCategory(categoryId, {
          name,
          displayOrder,
          isActive: form.isActive,
          touchImageUrl: imagePatch.touchImageUrl,
          imageUrl: imagePatch.touchImageUrl
            ? (imagePatch.imageUrl ?? null)
            : undefined,
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
      setUploadProgress(null);
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
            Categories group products on your storefront.
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
              <Label htmlFor="category-name">Category name</Label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(event) => setForm({ name: event.target.value })}
                placeholder="Fruits & Vegetables"
                disabled={busy}
                autoFocus
              />
            </div>

            <CategoryImageUpload
              existingUrl={existingImageUrl}
              value={imageField}
              onChange={(next) => {
                setImageError(null);
                setImageField(next);
              }}
              uploadProgress={uploadProgress}
              error={imageError}
              disabled={busy}
              onValidationError={(message) => {
                setImageError(message);
                toast.error(message);
              }}
            />

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
                disabled={busy}
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
                disabled={busy}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#16a34a] text-white hover:bg-[#15803d]"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    {uploadProgress != null ? "Uploading…" : "Saving…"}
                  </>
                ) : mode === "create" ? (
                  "Create category"
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
