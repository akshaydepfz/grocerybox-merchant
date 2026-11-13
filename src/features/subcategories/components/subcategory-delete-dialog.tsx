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

import {
  deleteMerchantSubcategory,
  friendlySubcategoryError,
} from "../services";

type SubcategoryDeleteDialogProps = {
  open: boolean;
  subcategoryName: string;
  categoryId: string;
  subcategoryId: string | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
};

export function SubcategoryDeleteDialog({
  open,
  subcategoryName,
  categoryId,
  subcategoryId,
  onOpenChange,
  onDeleted,
}: SubcategoryDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!subcategoryId || deleting) {
      return;
    }
    setDeleting(true);
    try {
      await deleteMerchantSubcategory(categoryId, subcategoryId);
      toast.success("Subcategory deleted.");
      onDeleted();
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? friendlySubcategoryError(error)
          : "Unable to delete subcategory.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete subcategory</DialogTitle>
          <DialogDescription>
            You are about to permanently delete &quot;{subcategoryName}&quot;.
            This action cannot be undone. If products are assigned to this
            subcategory, deletion will be blocked until those products are
            reassigned elsewhere.
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
