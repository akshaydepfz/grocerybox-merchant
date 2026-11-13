"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
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
import { ApiError } from "@/lib/api/types";

import { deleteMerchantProduct, friendlyProductError } from "../services";

type ProductDeleteDialogProps = {
  open: boolean;
  productName: string;
  productId: string | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
};

export function ProductDeleteDialog({
  open,
  productName,
  productId,
  onOpenChange,
  onDeleted,
}: ProductDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!productId || deleting) {
      return;
    }
    setDeleting(true);
    try {
      await deleteMerchantProduct(productId);
      toast.success("Product deleted.");
      onDeleted();
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? friendlyProductError(error)
          : "Unable to delete product.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            You are about to permanently delete &quot;{productName}&quot;. This
            action cannot be undone. Products that appear in existing orders
            cannot be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleDelete()}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
