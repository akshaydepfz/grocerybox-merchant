import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";

export default function DashboardLoading() {
  return (
    <GroceryAnimatedLoader
      fullScreen
      theme="dashboard"
      label="Loading dashboard"
      sublabel="Fetching your latest store data…"
    />
  );
}
