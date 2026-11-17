"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Ellipsis, Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dashboardRoutePrefix } from "@/config/routes";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import {
  deleteMerchantDeliveryBoy,
  friendlyDeliveryBoyError,
} from "../services";
import type { MerchantDeliveryBoy } from "../types/merchant-delivery-boy";
import {
  deliveryBoyInitials,
  formatCommissionLabel,
  formatDeliveryBoyJoinedDate,
  formatDeliveryBoyPhone,
} from "../utils/format-delivery-boy";

type DeliveryBoysTableProps = {
  items: MerchantDeliveryBoy[];
};

export function DeliveryBoysTable({ items }: DeliveryBoysTableProps) {
  const queryClient = useQueryClient();
  const [viewTarget, setViewTarget] = useState<MerchantDeliveryBoy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MerchantDeliveryBoy | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteMerchantDeliveryBoy(deleteTarget.id);
      await queryClient.invalidateQueries({ queryKey: ["merchant-delivery-boys"] });
      await queryClient.invalidateQueries({
        queryKey: ["merchant-delivery-boys-summary"],
      });
      toast.success("Delivery partner removed");
      setDeleteTarget(null);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? friendlyDeliveryBoyError(error)
          : "Unable to delete delivery partner.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#f0f1f4] bg-[#fafbfc] text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              <th className="px-5 py-3 font-semibold" scope="col">
                Delivery Boy
              </th>
              <th className="px-3 py-3 font-semibold" scope="col">
                Phone Number
              </th>
              <th className="px-3 py-3 font-semibold" scope="col">
                Total Deliveries
              </th>
              <th className="px-3 py-3 font-semibold" scope="col">
                Commission
              </th>
              <th className="px-3 py-3 font-semibold" scope="col">
                Status
              </th>
              <th className="px-3 py-3 font-semibold" scope="col">
                Joined Date
              </th>
              <th className="px-5 py-3 text-right font-semibold" scope="col">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f1f4]">
            {items.map((row) => (
              <tr key={row.id} className="transition hover:bg-[#fafbfc]">
                <td className="px-5 py-4">
                  <DeliveryBoyIdentity name={row.fullName} />
                </td>
                <td className="px-3 py-4 text-[#6b7280]">
                  {formatDeliveryBoyPhone(row.phone)}
                </td>
                <td className="px-3 py-4 tabular-nums text-[#1a1f2e]">
                  {row.totalDeliveries}
                </td>
                <td className="px-3 py-4 text-[#6b7280]">
                  {formatCommissionLabel(row.commissionType, row.commissionValue)}
                </td>
                <td className="px-3 py-4">
                  <StatusBadge isActive={row.isActive} />
                </td>
                <td className="px-3 py-4 text-[#6b7280]">
                  {formatDeliveryBoyJoinedDate(row.joinedAt)}
                </td>
                <td className="px-5 py-4 text-right">
                  <RowActions
                    editHref={`${dashboardRoutePrefix}/delivery-boys/${row.id}/edit`}
                    onView={() => setViewTarget(row)}
                    onDelete={() => setDeleteTarget(row)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 p-4 md:hidden">
        {items.map((row) => (
          <article
            key={row.id}
            className="rounded-2xl border border-[#f0f1f4] bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <DeliveryBoyIdentity name={row.fullName} stacked />
              <StatusBadge isActive={row.isActive} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <div>
                <dt className="text-[#9ca3af]">Phone</dt>
                <dd className="mt-0.5 font-medium text-[#1a1f2e]">
                  {formatDeliveryBoyPhone(row.phone)}
                </dd>
              </div>
              <div>
                <dt className="text-[#9ca3af]">Deliveries</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-[#1a1f2e]">
                  {row.totalDeliveries}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[#9ca3af]">Commission</dt>
                <dd className="mt-0.5 font-medium text-[#6b7280]">
                  {formatCommissionLabel(row.commissionType, row.commissionValue)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[#9ca3af]">Joined</dt>
                <dd className="mt-0.5 font-medium text-[#6b7280]">
                  {formatDeliveryBoyJoinedDate(row.joinedAt)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 flex-1 rounded-xl"
                onClick={() => setViewTarget(row)}
              >
                <Eye className="size-3.5" aria-hidden />
                View
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 flex-1 rounded-xl"
                asChild
              >
                <Link href={`${dashboardRoutePrefix}/delivery-boys/${row.id}/edit`}>
                  <Pencil className="size-3.5" aria-hidden />
                  Edit
                </Link>
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 h-9 w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setDeleteTarget(row)}
            >
              <Trash2 className="size-3.5" aria-hidden />
              Remove
            </Button>
          </article>
        ))}
      </div>

      <Dialog
        open={viewTarget !== null}
        onOpenChange={(open) => !open && setViewTarget(null)}
      >
        <DialogContent className="max-w-md rounded-2xl border-[#e8eaef]">
          <DialogHeader>
            <DialogTitle className="text-[#1a1f2e]">
              Delivery partner details
            </DialogTitle>
            <DialogDescription className="text-[#6b7280]">
              Partner profile and commission configuration.
            </DialogDescription>
          </DialogHeader>
          {viewTarget ? (
            <div className="space-y-3 text-sm">
              <DeliveryBoyIdentity name={viewTarget.fullName} />
              <p className="text-[#6b7280]">
                Phone: {formatDeliveryBoyPhone(viewTarget.phone)}
              </p>
              <p className="text-[#6b7280]">
                Commission:{" "}
                {formatCommissionLabel(
                  viewTarget.commissionType,
                  viewTarget.commissionValue,
                )}
              </p>
              <p className="text-[#6b7280]">
                Deliveries: {viewTarget.totalDeliveries}
              </p>
              <p className="text-[#6b7280]">
                Status:{" "}
                <span className="font-medium text-[#1a1f2e]">
                  {viewTarget.isActive ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-md rounded-2xl border-[#e8eaef]">
          <DialogHeader>
            <DialogTitle className="text-[#1a1f2e]">
              Remove delivery partner?
            </DialogTitle>
            <DialogDescription className="text-[#6b7280]">
              {deleteTarget
                ? `This will permanently remove ${deleteTarget.fullName} from your delivery team. They will no longer be able to sign in.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Removing…
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DeliveryBoyIdentity({
  name,
  stacked,
}: {
  name: string;
  stacked?: boolean;
}) {
  const initials = deliveryBoyInitials(name);
  return (
    <div className={cn("flex items-center gap-3", stacked && "min-w-0 flex-1")}>
      <span
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-xs font-bold text-[#15803d]"
        aria-hidden
      >
        {initials}
      </span>
      <p className="font-semibold text-[#1a1f2e]">{name}</p>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isActive ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#f3f4f6] text-[#6b7280]",
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function RowActions({
  editHref,
  onView,
  onDelete,
}: {
  editHref: string;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-[#eceef2] px-2.5"
          aria-label="Row actions"
        >
          <Ellipsis className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[9rem] rounded-xl">
        <DropdownMenuItem onSelect={onView}>
          <Eye className="size-4" aria-hidden />
          View
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={editHref}>
            <Pencil className="size-4" aria-hidden />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={onDelete}
        >
          <Trash2 className="size-4" aria-hidden />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}