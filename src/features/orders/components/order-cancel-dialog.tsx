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

import { cancelMerchantOrder, friendlyOrderError } from "../services";

type OrderCancelDialogProps = {
  open: boolean;
  orderNumber: string;
  orderId: string | null;
  onOpenChange: (open: boolean) => void;
  onCancelled: () => void;
};

export function OrderCancelDialog({
  open,
  orderNumber,
  orderId,
  onOpenChange,
  onCancelled,
}: OrderCancelDialogProps) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!orderId || cancelling) {
      return;
    }
    setCancelling(true);
    try {
      await cancelMerchantOrder(orderId);
      toast.success(`Order ${orderNumber} was cancelled.`);
      onCancelled();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? friendlyOrderError(error)
          : "Unable to cancel order.",
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel order</DialogTitle>
          <DialogDescription>
            Cancel order &quot;{orderNumber}&quot;? The customer will see this as
            cancelled in My Orders, and product stock will be added back to your
            catalog. Delivered orders cannot be cancelled.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={cancelling}
          >
            Keep order
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleCancel()}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Cancelling…
              </>
            ) : (
              "Cancel order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
