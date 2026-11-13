"use client";

import Image from "next/image";
import { Package } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type ProductThumbnailProps = {
  imageUrl: string | null | undefined;
  name: string;
  size?: "sm" | "md";
  className?: string;
};

export function ProductThumbnail({
  imageUrl,
  name,
  size = "sm",
  className,
}: ProductThumbnailProps) {
  const [failed, setFailed] = useState(false);

  const dimension = size === "sm" ? "size-12" : "size-16";
  const iconSize = size === "sm" ? "size-5" : "size-6";

  if (!imageUrl?.trim() || failed) {
    const initial = name.trim().charAt(0).toUpperCase() || "?";
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-[#f5f6f8] text-sm font-bold text-[#6b7280]",
          dimension,
          className,
        )}
        aria-hidden
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl bg-[#f5f6f8]",
        dimension,
        className,
      )}
    >
      <Image
        src={imageUrl}
        alt=""
        fill
        className="object-cover"
        sizes={size === "sm" ? "48px" : "64px"}
        unoptimized
        onError={() => setFailed(true)}
      />
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f5f6f8]">
          <Package className={cn(iconSize, "text-[#9ca3af]")} aria-hidden />
        </div>
      ) : null}
    </div>
  );
}
