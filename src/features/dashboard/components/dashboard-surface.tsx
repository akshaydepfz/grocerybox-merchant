import { cn } from "@/lib/utils";

type DashboardSurfaceProps = {
  className?: string;
  children: React.ReactNode;
};

export function DashboardSurface({ className, children }: DashboardSurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#eceef2] bg-white shadow-[0_1px_3px_rgb(0_0_0_/0.04)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
