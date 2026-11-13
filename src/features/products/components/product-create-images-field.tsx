"use client";

import {
  ChevronDown,
  ChevronUp,
  CloudUpload,
  ImageIcon,
  Loader2,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { validateCategoryImageUpload } from "@/features/categories/validators/category-image-validator";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp";

export type ProductCreateImageItem = {
  clientId: string;
  file: File;
  previewUrl: string;
  uploadProgress: number | null;
  uploadedUrl: string | null;
  uploadError: string | null;
};

type ProductCreateImagesFieldProps = {
  items: ProductCreateImageItem[];
  primaryClientId: string | null;
  disabled?: boolean;
  error?: string | null;
  onChange: (items: ProductCreateImageItem[]) => void;
  onPrimaryChange: (clientId: string | null) => void;
  onValidationError?: (message: string) => void;
};

export function createProductImageItem(file: File): ProductCreateImageItem {
  return {
    clientId: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    uploadProgress: null,
    uploadedUrl: null,
    uploadError: null,
  };
}

export function revokeProductImagePreviews(items: ProductCreateImageItem[]) {
  for (const item of items) {
    if (item.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(item.previewUrl);
    }
  }
}

export function ProductCreateImagesField({
  items,
  primaryClientId,
  disabled,
  error,
  onChange,
  onPrimaryChange,
  onValidationError,
}: ProductCreateImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files?.length || disabled) {
      return;
    }
    const next = [...items];
    for (const file of Array.from(files)) {
      const validation = validateCategoryImageUpload(
        file.size,
        file.type,
        file.name,
      );
      if (validation) {
        onValidationError?.(validation);
        continue;
      }
      next.push(createProductImageItem(file));
    }
    onChange(next);
    if (!primaryClientId && next.length > 0) {
      onPrimaryChange(next[0].clientId);
    }
  };

  const removeItem = (clientId: string) => {
    const removed = items.find((item) => item.clientId === clientId);
    if (removed?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    const next = items.filter((item) => item.clientId !== clientId);
    onChange(next);
    if (primaryClientId === clientId) {
      onPrimaryChange(next[0]?.clientId ?? null);
    }
  };

  const moveItem = (clientId: string, direction: -1 | 1) => {
    const index = items.findIndex((item) => item.clientId === clientId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= items.length) {
      return;
    }
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  };

  const overallProgress =
    items.length === 0
      ? null
      : items.reduce((sum, item) => sum + (item.uploadProgress ?? 0), 0) /
        items.length;

  return (
    <div className="flex flex-col gap-3">
      <Label>Product images (optional)</Label>
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-6 text-center",
          error
            ? "border-red-200 bg-red-50/50"
            : "border-[#e8eaef] bg-[#fafbfc]",
        )}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!disabled) {
            addFiles(event.dataTransfer.files);
          }
        }}
      >
        <div className="flex size-14 items-center justify-center rounded-xl border border-[#eceef2] bg-white text-[#9ca3af]">
          <ImageIcon className="size-7" aria-hidden />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="h-9 gap-1.5 rounded-xl"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5" aria-hidden />
            Choose images
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="h-9 gap-1.5 rounded-xl text-[#6b7280]"
            onClick={() => inputRef.current?.click()}
          >
            <CloudUpload className="size-3.5" aria-hidden />
            Drag & drop here
          </Button>
        </div>
        <p className="text-xs text-[#9ca3af]">
          JPEG, PNG, or WebP · max 15 MB each · optimized on upload
        </p>
        {overallProgress != null && overallProgress > 0 && overallProgress < 1 ? (
          <div className="w-full max-w-xs">
            <p className="mb-1 text-xs font-medium text-[#6b7280]">
              Uploading images… {Math.round(overallProgress * 100)}%
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#eceef2]">
              <div
                className="h-full rounded-full bg-[#16a34a] transition-[width] duration-200"
                style={{
                  width: `${Math.min(100, overallProgress * 100)}%`,
                }}
              />
            </div>
          </div>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {items.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item, index) => {
            const isPrimary = primaryClientId === item.clientId;
            const busy = item.uploadProgress != null && item.uploadProgress < 1;
            return (
              <li
                key={item.clientId}
                className="flex gap-3 rounded-xl border border-[#eceef2] bg-white p-3"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-[#f5f6f8]">
                  <Image
                    src={item.previewUrl}
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
                  <p className="truncate text-xs font-medium text-[#1a1f2e]">
                    {item.file.name}
                  </p>
                  <p className="text-[10px] text-[#9ca3af]">
                    Order {index + 1}
                    {item.uploadedUrl ? " · Uploaded" : ""}
                  </p>
                  {item.uploadError ? (
                    <p className="text-[10px] text-red-600">{item.uploadError}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      type="button"
                      variant={isPrimary ? "default" : "outline"}
                      size="sm"
                      disabled={disabled}
                      className={cn(
                        "h-7 gap-1 rounded-lg px-2 text-[10px]",
                        isPrimary && "bg-[#16a34a] hover:bg-[#15803d]",
                      )}
                      onClick={() => onPrimaryChange(item.clientId)}
                    >
                      <Star
                        className={cn("size-3", isPrimary && "fill-current")}
                        aria-hidden
                      />
                      Primary
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled || index === 0}
                      className="h-7 rounded-lg px-2"
                      onClick={() => moveItem(item.clientId, -1)}
                      aria-label="Move image up"
                    >
                      <ChevronUp className="size-3.5" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled || index === items.length - 1}
                      className="h-7 rounded-lg px-2"
                      onClick={() => moveItem(item.clientId, 1)}
                      aria-label="Move image down"
                    >
                      <ChevronDown className="size-3.5" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      className="h-7 rounded-lg px-2 text-red-600"
                      onClick={() => removeItem(item.clientId)}
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
      ) : null}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
