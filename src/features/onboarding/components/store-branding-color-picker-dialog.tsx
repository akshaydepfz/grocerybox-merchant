"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { colorFromHex, colorToHex } from "../utils/brand-colors";

type StoreBrandingColorPickerDialogProps = {
  open: boolean;
  title: string;
  initialHex: string;
  onClose: () => void;
  onConfirm: (hex: string) => void;
};

function ColorPickerFields({
  initialHex,
  onClose,
  onConfirm,
}: {
  initialHex: string;
  onClose: () => void;
  onConfirm: (hex: string) => void;
}) {
  const [hex, setHex] = useState(() => colorToHex(initialHex));

  const pickerValue =
    colorFromHex(hex)?.toLowerCase() ?? initialHex.toLowerCase();

  return (
    <>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => setHex(colorToHex(e.target.value))}
          className="size-12 cursor-pointer rounded-lg border border-gb-mo-gray-200 bg-transparent p-1"
        />
        <Input
          value={hex}
          onChange={(e) => setHex(e.target.value.toUpperCase())}
          onBlur={() => {
            const parsed = colorFromHex(hex);
            if (parsed) setHex(parsed);
          }}
          className="font-mono text-sm"
          aria-label="Hex colour"
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => {
            const parsed = colorFromHex(hex);
            if (parsed) onConfirm(parsed);
          }}
        >
          Apply
        </Button>
      </DialogFooter>
    </>
  );
}

export function StoreBrandingColorPickerDialog({
  open,
  title,
  initialHex,
  onClose,
  onConfirm,
}: StoreBrandingColorPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {open ? (
          <ColorPickerFields
            key={colorToHex(initialHex)}
            initialHex={initialHex}
            onClose={onClose}
            onConfirm={onConfirm}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
