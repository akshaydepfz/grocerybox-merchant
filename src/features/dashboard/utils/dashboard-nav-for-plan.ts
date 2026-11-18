import type { DashboardNavItem } from "../constants/nav-items";

export function dashboardNavItemsForPlan(
  items: DashboardNavItem[],
  options: { deliveryBoyManagement: boolean },
): DashboardNavItem[] {
  if (options.deliveryBoyManagement) {
    return items;
  }
  return items.filter((item) => item.id !== "delivery-boys");
}

export function dashboardMoreMenuItemIdsForPlan(
  itemIds: string[],
  options: { deliveryBoyManagement: boolean },
): string[] {
  if (options.deliveryBoyManagement) {
    return itemIds;
  }
  return itemIds.filter((id) => id !== "delivery-boys");
}