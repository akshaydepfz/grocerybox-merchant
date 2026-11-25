"use client";

import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RemoveDomainDialogProps = {
  open: boolean;
  domainHostname: string | null;
  isRemoving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function RemoveDomainDialog({
  open,
  domainHostname,
  isRemoving,
  onOpenChange,
  onConfirm,
}: RemoveDomainDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-[#eceef2]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#1a1f2e]">
            Remove domain?
          </DialogTitle>
          <DialogDescription className="text-left text-sm text-[#6b7280]">
            {domainHostname ? (
              <>
                <span className="font-mono font-medium text-[#1a1f2e]">
                  {domainHostname}
                </span>{" "}
                will be disconnected from your GroceryBox registration.
              </>
            ) : (
              "This domain will be disconnected from your GroceryBox registration."
            )}
          </DialogDescription>
        </DialogHeader>
        <p className="rounded-lg border border-[#fee2e2] bg-[#fef2f2] px-3 py-2.5 text-xs leading-relaxed text-[#991b1b]">
          Removing this domain disconnects its GroceryBox domain registration.
          You may need to configure it again before using it.
        </p>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={isRemoving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl"
            disabled={isRemoving}
            onClick={onConfirm}
          >
            {isRemoving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="size-4" aria-hidden />
            )}
            Remove domain
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}