"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ErrorState } from "@/components/shared/error-state";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { useAuth } from "@/features/auth/components/auth-provider";
import { listMerchantCategories } from "@/features/categories/services";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { listMerchantSubcategories } from "@/features/subcategories/services";
import { dashboardRoutePrefix } from "@/config/routes";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import {
  associateMerchantProductImages,
  createMerchantProduct,
  friendlyProductError,
  friendlyProductImageUploadMessage,
  uploadMerchantProductImage,
} from "../services";
import type { MerchantProductImageAssociateInput, MerchantProductUnit } from "../types/merchant-product";
import {
  computeDiscountPercent,
  defaultProductCreateForm,
  validateProductCreateForm,
  type ProductCreateFieldErrors,
  type ProductCreateFormValues,
} from "../validators/product-create-validator";
import { formatProductUnitLabel } from "../utils/format-product";

import {
  ProductCreateImagesField,
  revokeProductImagePreviews,
  type ProductCreateImageItem,
} from "./product-create-images-field";

const CATEGORY_LIMIT = 100;

const UNIT_OPTIONS: { value: MerchantProductUnit; label: string }[] = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "litre", label: "Litre" },
  { value: "ml", label: "Millilitre (ml)" },
  { value: "piece", label: "Piece" },
  { value: "pack", label: "Pack" },
  { value: "dozen", label: "Dozen" },
  { value: "box", label: "Box" },
];

type AssociationRecovery = {
  productId: string;
  images: MerchantProductImageAssociateInput[];
  productName: string;
};

export function ProductCreateScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isRegistered } = useAuth();

  const [form, setForm] = useState<ProductCreateFormValues>(
    defaultProductCreateForm,
  );
  const [fieldErrors, setFieldErrors] = useState<ProductCreateFieldErrors>({});
  const [images, setImages] = useState<ProductCreateImageItem[]>([]);
  const [primaryClientId, setPrimaryClientId] = useState<string | null>(null);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<
    "idle" | "uploading" | "creating" | "associating"
  >("idle");
  const [associationRecovery, setAssociationRecovery] =
    useState<AssociationRecovery | null>(null);
  const [retryingAssociation, setRetryingAssociation] = useState(false);

  const listEnabled = Boolean(user && isRegistered);

  const categoriesQuery = useQuery({
    queryKey: ["merchant-product-create-categories"],
    queryFn: () => listMerchantCategories({ page: 1, limit: CATEGORY_LIMIT }),
    enabled: listEnabled,
    refetchOnWindowFocus: false,
  });

  const subcategoriesQuery = useQuery({
    queryKey: ["merchant-product-create-subcategories", form.categoryId],
    queryFn: () =>
      listMerchantSubcategories(form.categoryId, {
        page: 1,
        limit: CATEGORY_LIMIT,
      }),
    enabled: listEnabled && form.categoryId.length > 0,
    refetchOnWindowFocus: false,
  });

  const patchForm = (patch: Partial<ProductCreateFormValues>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if (patch.categoryId != null && patch.categoryId !== prev.categoryId) {
        next.subcategoryId = "";
      }
      return next;
    });
    setAssociationRecovery(null);
  };

  const isDirty = useMemo(() => {
    const defaults = defaultProductCreateForm();
    const formDirty = (Object.keys(defaults) as (keyof ProductCreateFormValues)[]).some(
      (key) => form[key] !== defaults[key],
    );
    return formDirty || images.length > 0;
  }, [form, images.length]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || submitting) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, submitting]);

  useEffect(() => {
    return () => revokeProductImagePreviews(images);
  }, [images]);

  const sellingPriceNum = Number(form.sellingPrice.trim());
  const mrpNum = Number(form.mrp.trim());
  const discountPercent = computeDiscountPercent(
    Number.isFinite(sellingPriceNum) ? sellingPriceNum : 0,
    form.mrp.trim() && Number.isFinite(mrpNum) ? mrpNum : undefined,
  );

  const categories = categoriesQuery.data?.items ?? [];
  const subcategories = subcategoriesQuery.data?.items ?? [];

  const buildAssociationPayload = (
    uploaded: ProductCreateImageItem[],
  ): MerchantProductImageAssociateInput[] => {
    const primaryId = primaryClientId ?? uploaded[0]?.clientId ?? null;
    return uploaded
      .map((item, index) => {
        if (!item.uploadedUrl) {
          return null;
        }
        return {
          imageUrl: item.uploadedUrl,
          displayOrder: index,
          isPrimary: item.clientId === primaryId,
        };
      })
      .filter((item): item is MerchantProductImageAssociateInput => item != null);
  };

  const runImageAssociation = async (
    productId: string,
    payload: MerchantProductImageAssociateInput[],
    productName: string,
  ) => {
    await associateMerchantProductImages(productId, payload);
    await queryClient.invalidateQueries({ queryKey: ["merchant-products"] });
    toast.success(`“${productName}” was created successfully.`);
    router.push(`${dashboardRoutePrefix}/products`);
  };

  const handleRetryAssociation = async () => {
    if (!associationRecovery) {
      return;
    }
    setRetryingAssociation(true);
    try {
      await runImageAssociation(
        associationRecovery.productId,
        associationRecovery.images,
        associationRecovery.productName,
      );
      setAssociationRecovery(null);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? friendlyProductError(error)
          : "Unable to attach images. Try again.",
      );
    } finally {
      setRetryingAssociation(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const { errors, payload } = validateProductCreateForm(form);
    setFieldErrors(errors);
    setImagesError(null);

    if (!payload || Object.keys(errors).length > 0) {
      toast.error("Fix the highlighted fields and try again.");
      return;
    }

    setSubmitting(true);
    setSubmitPhase(images.length > 0 ? "uploading" : "creating");

    const uploadedImages: ProductCreateImageItem[] = images.map((item) => ({
      ...item,
      uploadProgress: item.uploadedUrl ? 1 : 0,
      uploadError: null,
    }));
    setImages(uploadedImages);

    try {
      if (images.length > 0) {
        for (let index = 0; index < images.length; index += 1) {
          const item = images[index];
          if (item.uploadedUrl) {
            uploadedImages[index] = { ...item, uploadProgress: 1 };
            setImages([...uploadedImages]);
            continue;
          }
          try {
            const result = await uploadMerchantProductImage({
              file: item.file,
              onProgress: (ratio) => {
                uploadedImages[index] = {
                  ...uploadedImages[index],
                  uploadProgress: ratio,
                };
                setImages([...uploadedImages]);
              },
            });
            uploadedImages[index] = {
              ...uploadedImages[index],
              uploadProgress: 1,
              uploadedUrl: result.imageUrl,
            };
            setImages([...uploadedImages]);
          } catch (error) {
            const message =
              error instanceof ApiError
                ? friendlyProductImageUploadMessage(error)
                : "Image upload failed.";
            uploadedImages[index] = {
              ...uploadedImages[index],
              uploadError: message,
            };
            setImages([...uploadedImages]);
            setImagesError(
              "Some images failed to upload. Remove or retry before saving.",
            );
            toast.error(message);
            return;
          }
        }
      }

      setSubmitPhase("creating");
      const product = await createMerchantProduct(payload);

      const assocPayload = buildAssociationPayload(uploadedImages);
      if (assocPayload.length > 0) {
        setSubmitPhase("associating");
        try {
          await runImageAssociation(product.id, assocPayload, product.name);
        } catch (error) {
          setAssociationRecovery({
            productId: product.id,
            images: assocPayload,
            productName: product.name,
          });
          toast.error(
            error instanceof ApiError
              ? `${friendlyProductError(error)} The product was created — attach images when ready.`
              : "Product created, but images could not be attached.",
          );
          return;
        }
      } else {
        await queryClient.invalidateQueries({ queryKey: ["merchant-products"] });
        toast.success(`“${product.name}” was created successfully.`);
        router.push(`${dashboardRoutePrefix}/products`);
      }
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? friendlyProductError(error)
          : "Unable to create product.",
      );
    } finally {
      setSubmitting(false);
      setSubmitPhase("idle");
    }
  };

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[960px] py-8">
        <ErrorState
          title="Sign in required"
          message="Sign in to add products to your store."
        />
      </div>
    );
  }

  if (categoriesQuery.isLoading && !categoriesQuery.data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-16">
        <GroceryAnimatedLoader
          theme="dashboard"
          label="Preparing form"
          sublabel="Loading categories"
        />
      </div>
    );
  }

  const busy =
    submitting ||
    retryingAssociation ||
    submitPhase !== "idle";

  const unitLabel = form.unit
    ? formatProductUnitLabel(form.unit as MerchantProductUnit)
    : "units";

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`${dashboardRoutePrefix}/products`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6b7280] transition hover:text-[#16a34a]"
            onClick={(event) => {
              if (!isDirty || busy) {
                return;
              }
              const leave = window.confirm(
                "Leave without saving? Your changes will be lost.",
              );
              if (!leave) {
                event.preventDefault();
              }
            }}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to products
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#1a1f2e]">
            Add product
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Create a new item for your storefront catalog.
          </p>
        </div>
      </div>

      {associationRecovery ? (
        <DashboardSurface className="border-amber-200 bg-amber-50/80 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <AlertTriangle
                className="mt-0.5 size-5 shrink-0 text-amber-600"
                aria-hidden
              />
              <div>
                <p className="text-sm font-semibold text-[#92400e]">
                  Product created — images not attached
                </p>
                <p className="mt-1 text-sm text-[#a16207]">
                  “{associationRecovery.productName}” was saved (ID{" "}
                  {associationRecovery.productId.slice(0, 8)}…). Attach images
                  without creating a duplicate product.
                </p>
              </div>
            </div>
            <Button
              type="button"
              className="shrink-0 bg-[#16a34a] text-white hover:bg-[#15803d]"
              disabled={retryingAssociation}
              onClick={() => void handleRetryAssociation()}
            >
              {retryingAssociation ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                "Retry image attach"
              )}
            </Button>
          </div>
        </DashboardSurface>
      ) : null}

      <form className="flex flex-col gap-6" onSubmit={(event) => void handleSubmit(event)}>
        <DashboardSurface className="p-5">
          <SectionTitle
            title="Basic information"
            description="Name, brand, and where this product appears in your catalog."
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Product name"
              required
              error={fieldErrors.name}
              className="sm:col-span-2"
            >
              <Input
                value={form.name}
                disabled={busy}
                onChange={(event) => patchForm({ name: event.target.value })}
                placeholder="e.g. Organic bananas"
              />
            </Field>
            <Field label="Brand" error={fieldErrors.brand}>
              <Input
                value={form.brand}
                disabled={busy}
                onChange={(event) => patchForm({ brand: event.target.value })}
                placeholder="Optional"
              />
            </Field>
            <Field
              label="Category"
              required
              error={fieldErrors.categoryId}
            >
              <select
                value={form.categoryId}
                disabled={busy || categoriesQuery.isLoading}
                onChange={(event) =>
                  patchForm({ categoryId: event.target.value })
                }
                className={selectClassName}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Subcategory" error={fieldErrors.subcategoryId}>
              <select
                value={form.subcategoryId}
                disabled={
                  busy ||
                  !form.categoryId ||
                  subcategoriesQuery.isLoading
                }
                onChange={(event) =>
                  patchForm({ subcategoryId: event.target.value })
                }
                className={selectClassName}
              >
                <option value="">
                  {form.categoryId
                    ? "No subcategory"
                    : "Select a category first"}
                </option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Description"
              className="sm:col-span-2"
            >
              <textarea
                value={form.description}
                disabled={busy}
                rows={4}
                onChange={(event) =>
                  patchForm({ description: event.target.value })
                }
                placeholder="Optional details for your team or storefront"
                className="min-h-[100px] w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 py-2 text-sm text-[#1a1f2e] placeholder:text-[#9ca3af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
              />
            </Field>
          </div>
          {categoriesQuery.isError ? (
            <p className="mt-2 text-xs text-red-600">
              Could not load categories. Refresh the page and try again.
            </p>
          ) : null}
          {form.categoryId && subcategoriesQuery.isError ? (
            <p className="mt-2 text-xs text-red-600">
              Could not load subcategories for this category.
            </p>
          ) : null}
        </DashboardSurface>

        <DashboardSurface className="p-5">
          <ProductCreateImagesField
            items={images}
            primaryClientId={primaryClientId}
            disabled={busy}
            error={imagesError}
            onChange={setImages}
            onPrimaryChange={setPrimaryClientId}
            onValidationError={(message) => toast.error(message)}
          />
        </DashboardSurface>

        <DashboardSurface className="p-5">
          <SectionTitle
            title="Pricing"
            description="Selling price is required. MRP is optional."
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Selling price (₹)"
              required
              error={fieldErrors.sellingPrice}
            >
              <Input
                inputMode="decimal"
                value={form.sellingPrice}
                disabled={busy}
                onChange={(event) =>
                  patchForm({ sellingPrice: event.target.value })
                }
                placeholder="0.00"
              />
            </Field>
            <Field label="MRP (₹)" error={fieldErrors.mrp}>
              <Input
                inputMode="decimal"
                value={form.mrp}
                disabled={busy}
                onChange={(event) => patchForm({ mrp: event.target.value })}
                placeholder="Optional"
              />
            </Field>
          </div>
          {discountPercent != null ? (
            <p className="mt-2 text-xs font-medium text-[#15803d]">
              Customer saves {discountPercent}% vs MRP
            </p>
          ) : null}
        </DashboardSurface>

        <DashboardSurface className="p-5">
          <SectionTitle
            title="Unit & inventory"
            description="How this product is sold and how much you have in stock."
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Unit" required error={fieldErrors.unit}>
              <select
                value={form.unit}
                disabled={busy}
                onChange={(event) =>
                  patchForm({
                    unit: event.target.value as MerchantProductUnit | "",
                  })
                }
                className={selectClassName}
              >
                <option value="">Select unit</option>
                {UNIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Unit value"
              required
              error={fieldErrors.unitValue}
              hint={`Pack size per item (e.g. 500 ${unitLabel})`}
            >
              <Input
                inputMode="decimal"
                value={form.unitValue}
                disabled={busy}
                onChange={(event) =>
                  patchForm({ unitValue: event.target.value })
                }
              />
            </Field>
            <Field
              label="Stock quantity"
              error={fieldErrors.stockQuantity}
              hint={`Number of ${unitLabel} packs/units in stock`}
            >
              <Input
                inputMode="decimal"
                value={form.stockQuantity}
                disabled={busy}
                onChange={(event) =>
                  patchForm({ stockQuantity: event.target.value })
                }
              />
            </Field>
            <Field label="SKU" error={fieldErrors.sku}>
              <Input
                value={form.sku}
                disabled={busy}
                onChange={(event) => patchForm({ sku: event.target.value })}
                placeholder="Optional"
              />
            </Field>
            <Field label="Barcode" className="sm:col-span-2">
              <Input
                value={form.barcode}
                disabled={busy}
                onChange={(event) =>
                  patchForm({ barcode: event.target.value })
                }
                placeholder="Optional"
              />
            </Field>
          </div>
        </DashboardSurface>

        <DashboardSurface className="p-5">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 text-left"
            onClick={() => setShowAdvanced((value) => !value)}
          >
            <SectionTitle
              title="Additional settings"
              description="Tax, order limits, display order, and visibility."
            />
            {showAdvanced ? (
              <ChevronUp className="size-5 text-[#9ca3af]" aria-hidden />
            ) : (
              <ChevronDown className="size-5 text-[#9ca3af]" aria-hidden />
            )}
          </button>
          {showAdvanced ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Tax percentage"
                error={fieldErrors.taxPercentage}
              >
                <Input
                  inputMode="decimal"
                  value={form.taxPercentage}
                  disabled={busy}
                  onChange={(event) =>
                    patchForm({ taxPercentage: event.target.value })
                  }
                  placeholder="Optional"
                />
              </Field>
              <Field
                label="Display order"
                error={fieldErrors.displayOrder}
              >
                <Input
                  inputMode="numeric"
                  value={form.displayOrder}
                  disabled={busy}
                  onChange={(event) =>
                    patchForm({ displayOrder: event.target.value })
                  }
                />
              </Field>
              <Field
                label="Minimum order quantity"
                error={fieldErrors.minOrderQuantity}
              >
                <Input
                  inputMode="decimal"
                  value={form.minOrderQuantity}
                  disabled={busy}
                  onChange={(event) =>
                    patchForm({ minOrderQuantity: event.target.value })
                  }
                  placeholder="Optional"
                />
              </Field>
              <Field
                label="Maximum order quantity"
                error={fieldErrors.maxOrderQuantity}
              >
                <Input
                  inputMode="decimal"
                  value={form.maxOrderQuantity}
                  disabled={busy}
                  onChange={(event) =>
                    patchForm({ maxOrderQuantity: event.target.value })
                  }
                  placeholder="Optional"
                />
              </Field>
              <div className="flex items-center justify-between rounded-xl border border-[#eceef2] px-4 py-3 sm:col-span-2">
                <div>
                  <p className="text-sm font-medium text-[#1a1f2e]">
                    Featured product
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    Highlight on your storefront
                  </p>
                </div>
                <Switch
                  checked={form.isFeatured}
                  disabled={busy}
                  className="data-[state=checked]:bg-[#16a34a]"
                  onCheckedChange={(checked) =>
                    patchForm({ isFeatured: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#eceef2] px-4 py-3 sm:col-span-2">
                <div>
                  <p className="text-sm font-medium text-[#1a1f2e]">
                    Active product
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    Visible to customers when your store is live
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  disabled={busy}
                  className="data-[state=checked]:bg-[#16a34a]"
                  onCheckedChange={(checked) =>
                    patchForm({ isActive: checked })
                  }
                />
              </div>
            </div>
          ) : null}
        </DashboardSurface>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            disabled={busy}
            asChild
          >
            <Link
              href={`${dashboardRoutePrefix}/products`}
              onClick={(event) => {
                if (!isDirty) {
                  return;
                }
                const leave = window.confirm(
                  "Leave without saving? Your changes will be lost.",
                );
                if (!leave) {
                  event.preventDefault();
                }
              }}
            >
              Cancel
            </Link>
          </Button>
          <Button
            type="submit"
            className="h-10 rounded-xl bg-[#16a34a] px-6 text-white hover:bg-[#15803d]"
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Save className="size-4" aria-hidden />
            )}
            <span className="ml-2">
              {submitPhase === "uploading"
                ? "Uploading images…"
                : submitPhase === "creating"
                  ? "Creating product…"
                  : submitPhase === "associating"
                    ? "Saving images…"
                    : "Save product"}
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}

const selectClassName =
  "h-10 w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 text-sm text-[#1a1f2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30 disabled:cursor-not-allowed disabled:opacity-60";

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-[#1a1f2e]">{title}</h2>
      <p className="mt-0.5 text-xs text-[#9ca3af]">{description}</p>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-[#1a1f2e]">
        {label}
        {required ? (
          <span className="text-red-600" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </span>
      {children}
      {hint ? <span className="text-xs text-[#9ca3af]">{hint}</span> : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
