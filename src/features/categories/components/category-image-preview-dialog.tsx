"use client";

import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CategoryImagePreviewDialogProps = {
  open: boolean;
  categoryName: string;
  imageUrl: string | null;
  onOpenChange: (open: boolean) => void;
};

export function CategoryImagePreviewDialog({
  open,
  categoryName,
  imageUrl,
  onOpenChange,
}: CategoryImagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-4 p-4 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{categoryName}</DialogTitle>
          <DialogDescription>Category image</DialogDescription>
        </DialogHeader>
        {imageUrl ? (
          <div className="relative mx-auto aspect-square w-full max-w-[min(100%,28rem)] overflow-hidden rounded-2xl border border-[#f0f1f4] bg-[#fafbfc]">
            <Image
              src={imageUrl}
              alt={categoryName}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 100vw, 448px"
              unoptimized
            />
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-[#6b7280]">
            No image uploaded for this category.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
