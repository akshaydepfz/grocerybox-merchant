"use client";

import { Loader2, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import {
  deleteMerchantProductImage,
  friendlyProductError,
  setPrimaryMerchantProductImage,
} from "../services";
import type { MerchantProductImage } from "../types/merchant-product";

type ProductEditExistingImagesProps = {
  productId: string;
  images: MerchantProductImage[];
  disabled?: boolean;
  onChanged: () => void;
};

export function ProductEditExistingImages({
  productId,
  images,
  disabled,
  onChanged,
}: ProductEditExistingImagesProps) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

  if (sorted.length === 0) {
    return (
      <p className="text-xs text-[#9ca3af]">
        No images on this product yet. Add new images below.
      </p>
    );
  }

  const runAction = async (
    imageId: string,
    action: "delete" | "primary",
  ) => {
    if (disabled || busyId) {
      return;
    }
    setBusyId(imageId);
    try {
      if (action === "delete") {
        const confirmed = window.confirm(
          "Remove this image from the product? This cannot be undone.",
        );
        if (!confirmed) {
          setBusyId(null);
          return;
        }
        await deleteMerchantProductImage(productId, imageId);
        toast.success("Image removed.");
      } else {
        await setPrimaryMerchantProductImage(productId, imageId);
        toast.success("Primary image updated.");
      }
      onChanged();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? friendlyProductError(error)
          : "Unable to update product images.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {sorted.map((image) => {
        const busy = busyId === image.id;
        return (
          <li
            key={image.id}
            className="flex gap-3 rounded-xl border border-[#eceef2] bg-white p-3"
          >
            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-[#f5f6f8]">
              <Image
                src={image.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
              {busy ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2
                    className="size-5 animate-spin text-white"
                    aria-hidden
                  />
                </div>
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="text-[10px] text-[#9ca3af]">
                Order {image.displayOrder + 1}
                {image.isPrimary ? " · Primary" : ""}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  variant={image.isPrimary ? "default" : "outline"}
                  size="sm"
                  disabled={disabled || busy || image.isPrimary}
                  className={cn(
                    "h-7 gap-1 rounded-lg px-2 text-[10px]",
                    image.isPrimary && "bg-[#16a34a] hover:bg-[#15803d]",
                  )}
                  onClick={() => void runAction(image.id, "primary")}
                >
                  <Star
                    className={cn("size-3", image.isPrimary && "fill-current")}
                    aria-hidden
                  />
                  Primary
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || busy}
                  className="h-7 rounded-lg px-2 text-red-600"
                  onClick={() => void runAction(image.id, "delete")}
                  aria-label="Remove image"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
