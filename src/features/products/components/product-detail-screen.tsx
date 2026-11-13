"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { useAuth } from "@/features/auth/components/auth-provider";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { dashboardRoutePrefix } from "@/config/routes";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import {
  friendlyProductError,
  getMerchantProduct,
} from "../services";
import {
  formatDateTime,
  formatInr,
  formatProductUnitLabel,
  formatSkuOrFallback,
  formatStockQuantity,
} from "../utils/format-product";

import { ProductDeleteDialog } from "./product-delete-dialog";
import { ProductStatusBadges } from "./product-status-badges";

type ProductDetailScreenProps = {
  productId: string;
};

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const { user, isRegistered } = useAuth();
  const router = useRouter();
  const listHref = `${dashboardRoutePrefix}/products`;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const detailQuery = useQuery({
    queryKey: ["merchant-product", productId],
    queryFn: () => getMerchantProduct(productId),
    enabled: Boolean(user && isRegistered && productId),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (detailQuery.error) {
      toast.error(
        detailQuery.error instanceof ApiError
          ? friendlyProductError(detailQuery.error)
          : "Unable to load product.",
      );
    }
  }, [detailQuery.error]);

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[960px] py-8">
        <ErrorState
          title="Sign in required"
          message="Sign in to view this product."
        />
      </div>
    );
  }

  const initialLoading = detailQuery.isLoading && !detailQuery.data;
  const failed = detailQuery.isError && !detailQuery.data;

  if (initialLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-16">
        <GroceryAnimatedLoader
          theme="dashboard"
          label="Loading product"
          sublabel="Fetching product details"
        />
      </div>
    );
  }

  if (failed) {
    const message =
      detailQuery.error instanceof ApiError
        ? friendlyProductError(detailQuery.error)
        : "Unable to load product.";
    return (
      <div className="mx-auto w-full max-w-[960px] flex-col gap-4 py-8">
        <BackLink href={listHref} />
        <ErrorState
          title="Could not load product"
          message={message}
          onRetry={() => void detailQuery.refetch()}
        />
      </div>
    );
  }

  const product = detailQuery.data;
  if (!product) {
    return null;
  }

  const sortedImages = [...product.images].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const galleryImages =
    sortedImages.length > 0
      ? sortedImages
      : product.primaryImage
        ? [product.primaryImage]
        : [];

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <BackLink href={listHref} />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-xl"
            asChild
          >
            <Link href={`${dashboardRoutePrefix}/products/${product.id}/edit`}>
              <Pencil className="size-3.5" aria-hidden />
              Edit product
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-xl text-destructive hover:bg-destructive/5 hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Delete
          </Button>
        </div>
      </div>

      {detailQuery.isFetching && !detailQuery.isLoading ? (
        <div className="flex items-center gap-2 text-xs text-[#6b7280]">
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          Refreshing…
        </div>
      ) : null}

      <header>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">
          {product.name}
        </h1>
        {product.brand ? (
          <p className="mt-1 text-sm text-[#6b7280]">{product.brand}</p>
        ) : null}
        <div className="mt-3">
          <ProductStatusBadges
            isActive={product.isActive}
            isFeatured={product.isFeatured}
            stockQuantity={product.stockQuantity}
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ProductImageGallery
          images={galleryImages.map((image) => ({
            id: image.id,
            url: image.imageUrl,
            isPrimary: image.isPrimary,
          }))}
          productName={product.name}
        />

        <DashboardSurface className="p-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField label="Selling price" value={formatInr(product.sellingPrice)} />
            <DetailField
              label="MRP"
              value={
                product.mrp != null ? formatInr(product.mrp) : "Not set"
              }
            />
            <DetailField
              label="Pack size"
              value={`${product.unitValue} ${formatProductUnitLabel(product.unit)}`}
            />
            <DetailField
              label="Stock"
              value={formatStockQuantity(
                product.stockQuantity,
                product.unitValue,
                product.unit,
              )}
            />
            <DetailField
              label="Category"
              value={product.categoryName || "—"}
            />
            <DetailField
              label="Subcategory"
              value={product.subcategoryName ?? "—"}
            />
            <DetailField
              label="SKU"
              value={formatSkuOrFallback(product.sku, product.barcode, product.id)}
            />
            <DetailField label="Barcode" value={product.barcode ?? "—"} />
            <DetailField
              label="Tax"
              value={
                product.taxPercentage != null
                  ? `${product.taxPercentage}%`
                  : "—"
              }
            />
            <DetailField
              label="Min order"
              value={
                product.minOrderQuantity != null
                  ? String(product.minOrderQuantity)
                  : "—"
              }
            />
            <DetailField
              label="Max order"
              value={
                product.maxOrderQuantity != null
                  ? String(product.maxOrderQuantity)
                  : "—"
              }
            />
            <DetailField
              label="Display order"
              value={String(product.displayOrder)}
            />
            <DetailField
              label="Created"
              value={formatDateTime(product.createdAt)}
            />
            <DetailField
              label="Updated"
              value={formatDateTime(product.updatedAt)}
            />
          </dl>
        </DashboardSurface>
      </div>

      {product.description ? (
        <DashboardSurface className="p-5">
          <h2 className="text-sm font-semibold text-[#1a1f2e]">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#4b5563]">
            {product.description}
          </p>
        </DashboardSurface>
      ) : null}

      <ProductDeleteDialog
        open={deleteOpen}
        productName={product.name}
        productId={product.id}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          router.push(listHref);
        }}
      />
    </div>
  );
}

function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[#6b7280] transition hover:text-[#16a34a]"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Back to products
    </Link>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-[#1a1f2e]">{value}</dd>
    </div>
  );
}

type GalleryImage = {
  id: string;
  url: string;
  isPrimary: boolean;
};

function ProductImageGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const defaultSelectedId =
    images.find((image) => image.isPrimary)?.id ?? images[0]?.id ?? null;
  const [overrideSelectedId, setOverrideSelectedId] = useState<string | null>(
    null,
  );
  const [failedIds, setFailedIds] = useState<Set<string>>(() => new Set());

  const selectedId =
    overrideSelectedId &&
    images.some((image) => image.id === overrideSelectedId)
      ? overrideSelectedId
      : defaultSelectedId;

  const selected =
    images.find((image) => image.id === selectedId) ?? images[0] ?? null;

  if (images.length === 0) {
    return (
      <DashboardSurface className="flex aspect-square items-center justify-center p-8 text-center">
        <p className="text-sm text-[#6b7280]">No images for this product.</p>
      </DashboardSurface>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-[#f0f1f4] bg-[#fafbfc]">
        {selected && !failedIds.has(selected.id) ? (
          <Image
            src={selected.url}
            alt={productName}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 480px"
            unoptimized
            onError={() => {
              setFailedIds((prev) => new Set(prev).add(selected.id));
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#9ca3af]">
            Image unavailable
          </div>
        )}
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setOverrideSelectedId(image.id)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-[#fafbfc] transition",
                selected?.id === image.id
                  ? "border-[#16a34a]"
                  : "border-transparent",
              )}
            >
              {!failedIds.has(image.id) ? (
                <Image
                  src={image.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                  onError={() => {
                    setFailedIds((prev) => new Set(prev).add(image.id));
                  }}
                />
              ) : (
                <span className="flex h-full items-center justify-center bg-[#f3f4f6] text-[10px] text-[#9ca3af]">
                  —
                </span>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
