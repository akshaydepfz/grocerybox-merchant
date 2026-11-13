"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { ErrorState } from "@/components/shared/error-state";
import {
  CategoryImageUpload,
  emptyCategoryImageField,
  type CategoryImageFieldValue,
} from "@/features/categories/components/category-image-upload";
import {
  friendlyCategoryError,
  friendlyCategoryImageUploadMessage,
  getMerchantCategory,
  uploadMerchantCategoryImage,
} from "@/features/categories/services";
import { revokeCategoryPreview } from "@/features/categories/validators/category-image-validator";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { ApiError } from "@/lib/api/types";

import {
  createMerchantSubcategory,
  friendlySubcategoryError,
  getMerchantSubcategory,
  updateMerchantSubcategory,
} from "../services";

import { SubcategoryBreadcrumbs } from "./subcategory-breadcrumbs";

type FormMode = "create" | "edit";

type SubcategoryFormScreenProps = {
  categoryId: string;
  mode: FormMode;
  subcategoryId?: string;
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

function subcategoriesBasePath(categoryId: string): string {
  return `/dashboard/categories/${categoryId}/subcategories`;
}

export function SubcategoryFormScreen({
  categoryId,
  mode,
  subcategoryId,
}: SubcategoryFormScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [draft, setDraft] = useState<FormState | null>(null);
  const [imageField, setImageField] = useState<CategoryImageFieldValue>(
    emptyCategoryImageField(),
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categoryQuery = useQuery({
    queryKey: ["merchant-category", categoryId],
    queryFn: () => getMerchantCategory(categoryId),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const editQuery = useQuery({
    queryKey: ["merchant-subcategory", categoryId, subcategoryId],
    queryFn: () => getMerchantSubcategory(categoryId, subcategoryId!),
    enabled: mode === "edit" && Boolean(subcategoryId),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const baseForm = useMemo((): FormState => {
    if (mode === "edit" && editQuery.data) {
      return {
        name: editQuery.data.name,
        displayOrder: String(editQuery.data.displayOrder),
        isActive: editQuery.data.isActive,
      };
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

  const invalidateAfterSave = async () => {
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
      mode === "edit" && subcategoryId
        ? queryClient.invalidateQueries({
            queryKey: ["merchant-subcategory", categoryId, subcategoryId],
          })
        : Promise.resolve(),
    ]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || loadingDetail) {
      return;
    }

    const name = form.name.trim();
    if (!name) {
      toast.error("Subcategory name is required.");
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
          : "Unable to upload subcategory image.";
      setImageError(message);
      toast.error(message);
      setSubmitting(false);
      setUploadProgress(null);
      return;
    }

    try {
      if (mode === "create") {
        await createMerchantSubcategory(categoryId, {
          name,
          displayOrder,
          isActive: form.isActive,
          imageUrl:
            imagePatch.imageUrl && imagePatch.imageUrl.length > 0
              ? imagePatch.imageUrl
              : null,
        });
        toast.success("Subcategory created.");
      } else if (subcategoryId) {
        await updateMerchantSubcategory(categoryId, subcategoryId, {
          name,
          displayOrder,
          isActive: form.isActive,
          touchImageUrl: imagePatch.touchImageUrl,
          imageUrl: imagePatch.touchImageUrl
            ? (imagePatch.imageUrl ?? null)
            : undefined,
        });
        toast.success("Subcategory updated.");
      } else {
        return;
      }
      await invalidateAfterSave();
      router.push(subcategoriesBasePath(categoryId));
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? friendlySubcategoryError(error)
          : "Unable to save subcategory.";
      toast.error(message);
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  if (categoryQuery.isLoading && !categoryQuery.data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center py-16">
        <GroceryAnimatedLoader theme="dashboard" label="Loading…" />
      </div>
    );
  }

  if (categoryQuery.isError) {
    const message =
      categoryQuery.error instanceof ApiError
        ? friendlyCategoryError(categoryQuery.error)
        : "Unable to load parent category.";
    return (
      <FormErrorPage
        title="Category not found"
        message={message}
        onRetry={() => void categoryQuery.refetch()}
      />
    );
  }

  if (
    mode === "edit" &&
    editQuery.isError &&
    !editQuery.data
  ) {
    const message =
      editQuery.error instanceof ApiError
        ? friendlySubcategoryError(editQuery.error)
        : "Unable to load subcategory.";
    return (
      <FormErrorPage
        title="Subcategory not found"
        message={message}
        onRetry={() => void editQuery.refetch()}
        backHref={subcategoriesBasePath(categoryId)}
      />
    );
  }

  const parentName = categoryQuery.data?.name ?? "Category";
  const title =
    mode === "create" ? "Add subcategory" : "Edit subcategory";

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
      <SubcategoryBreadcrumbs
        items={[
          { label: "Categories", href: "/dashboard/categories" },
          {
            label: parentName,
            href: subcategoriesBasePath(categoryId),
          },
          { label: mode === "create" ? "Add" : "Edit" },
        ]}
      />

      <header className="flex flex-col gap-3">
        <Button
          type="button"
          variant="ghost"
          className="h-9 w-fit px-2 text-[#6b7280] hover:text-[#1a1f2e]"
          asChild
        >
          <Link href={subcategoriesBasePath(categoryId)}>
            <ArrowLeft className="mr-1.5 size-4" aria-hidden />
            Back to subcategories
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Main category:{" "}
            <span className="font-semibold text-[#1a1f2e]">{parentName}</span>
          </p>
        </div>
      </header>

      <DashboardSurface className="p-5 sm:p-6">
        {loadingDetail ? (
          <div className="flex items-center justify-center py-10 text-sm text-[#6b7280]">
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            Loading subcategory…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-2">
              <Label htmlFor="subcategory-name">Subcategory name</Label>
              <Input
                id="subcategory-name"
                value={form.name}
                onChange={(event) => setForm({ name: event.target.value })}
                placeholder="Fruits"
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
              <Label htmlFor="subcategory-display-order">Display order</Label>
              <Input
                id="subcategory-display-order"
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
                  Inactive subcategories are hidden from your storefront.
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ isActive: checked })}
                disabled={busy}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                asChild
              >
                <Link href={subcategoriesBasePath(categoryId)}>Cancel</Link>
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
                  "Create subcategory"
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </form>
        )}
      </DashboardSurface>
    </div>
  );
}

function FormErrorPage({
  title,
  message,
  onRetry,
  backHref = "/dashboard/categories",
}: {
  title: string;
  message: string;
  onRetry: () => void;
  backHref?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[720px] py-8">
      <ErrorState title={title} message={message} onRetry={onRetry} />
      <div className="mt-4 text-center">
        <Button variant="outline" asChild>
          <Link href={backHref}>Go back</Link>
        </Button>
      </div>
    </div>
  );
}
