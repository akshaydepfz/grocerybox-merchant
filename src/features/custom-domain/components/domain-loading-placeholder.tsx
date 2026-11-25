import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";

export function DomainLoadingPlaceholder() {
  return (
    <div className="flex flex-col gap-6">
      {[0, 1].map((section) => (
        <DashboardSurface key={section} className="overflow-hidden">
          <div className="border-b border-[#f0f1f4] px-5 py-4">
            <div className="h-5 w-40 animate-pulse rounded-md bg-[#eceef2]" />
            <div className="mt-2 h-4 w-full max-w-md animate-pulse rounded-md bg-[#f3f4f6]" />
          </div>
          <div className="p-5">
            <div className="h-28 animate-pulse rounded-xl bg-[#fafbfc]" />
          </div>
        </DashboardSurface>
      ))}
    </div>
  );
}