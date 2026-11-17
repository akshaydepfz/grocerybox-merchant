import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  FolderTree,
  HelpCircle,
  LayoutDashboard,
  LayoutGrid,
  Ticket,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  CircleUser,
  Warehouse,
} from "lucide-react";

import { dashboardRoutePrefix } from "@/config/routes";

export function isDashboardNavActive(
  pathname: string,
  item: Pick<DashboardNavItem, "id" | "href">,
): boolean {
  if (item.id === "dashboard") {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export type DashboardBottomNavItem = {
  id: string;
  label: string;
  shortLabel?: string;
  href: string;
  icon: LucideIcon;
  available: boolean;
};

/** Primary mobile tab bar (app-style). Secondary routes live in the “More” drawer. */
export const DASHBOARD_BOTTOM_NAV_ITEMS: DashboardBottomNavItem[] = [
  {
    id: "dashboard",
    label: "Home",
    href: dashboardRoutePrefix,
    icon: LayoutDashboard,
    available: true,
  },
  {
    id: "orders",
    label: "Orders",
    href: `${dashboardRoutePrefix}/orders`,
    icon: ShoppingCart,
    available: true,
  },
  {
    id: "products",
    label: "Products",
    shortLabel: "Products",
    href: `${dashboardRoutePrefix}/products`,
    icon: Package,
    available: true,
  },
  {
    id: "profile",
    label: "Profile",
    href: `${dashboardRoutePrefix}/profile`,
    icon: CircleUser,
    available: true,
  },
];

export const DASHBOARD_MORE_PATH = `${dashboardRoutePrefix}/more` as const;

export const DASHBOARD_MORE_NAV_ITEM = {
  id: "more",
  label: "More",
  icon: LayoutGrid,
  href: DASHBOARD_MORE_PATH,
} as const;

export type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  available: boolean;
  badge?: number;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: dashboardRoutePrefix,
    icon: LayoutDashboard,
    available: true,
  },
  {
    id: "orders",
    label: "Orders",
    href: `${dashboardRoutePrefix}/orders`,
    icon: ShoppingCart,
    available: true,
  },
  {
    id: "delivery-boys",
    label: "Delivery Boys",
    href: `${dashboardRoutePrefix}/delivery-boys`,
    icon: Truck,
    available: true,
  },
  {
    id: "products",
    label: "Products",
    href: `${dashboardRoutePrefix}/products`,
    icon: Package,
    available: true,
  },
  {
    id: "categories",
    label: "Categories",
    href: `${dashboardRoutePrefix}/categories`,
    icon: FolderTree,
    available: true,
  },
  {
    id: "inventory",
    label: "Inventory",
    href: `${dashboardRoutePrefix}/inventory`,
    icon: Warehouse,
    available: true,
  },
  {
    id: "customers",
    label: "Customers",
    href: `${dashboardRoutePrefix}/customers`,
    icon: Users,
    available: true,
  },
  {
    id: "coupons",
    label: "Coupons",
    href: `${dashboardRoutePrefix}/coupons`,
    icon: Ticket,
    available: true,
  },
  {
    id: "analytics",
    label: "Analytics",
    href: `${dashboardRoutePrefix}/analytics`,
    icon: BarChart3,
    available: true,
  },
  {
    id: "profile",
    label: "Profile",
    href: `${dashboardRoutePrefix}/profile`,
    icon: CircleUser,
    available: true,
  },
  {
    id: "settings",
    label: "Store Settings",
    href: `${dashboardRoutePrefix}/settings`,
    icon: Settings,
    available: true,
  },
  {
    id: "help",
    label: "Help & Support",
    href: `${dashboardRoutePrefix}/help`,
    icon: HelpCircle,
    available: false,
  },
];

const PRIMARY_BOTTOM_NAV_IDS = new Set(
  DASHBOARD_BOTTOM_NAV_ITEMS.map((item) => item.id),
);

/** Secondary routes shown on the mobile More menu (excludes bottom tab items). */
export const DASHBOARD_MORE_MENU_ITEMS: DashboardNavItem[] = DASHBOARD_NAV_ITEMS.filter(
  (item) => !PRIMARY_BOTTOM_NAV_IDS.has(item.id),
);

export function isDashboardMoreTabActive(pathname: string): boolean {
  if (pathname === DASHBOARD_MORE_PATH || pathname.startsWith(`${DASHBOARD_MORE_PATH}/`)) {
    return true;
  }
  const onPrimaryTab = DASHBOARD_BOTTOM_NAV_ITEMS.some(
    (item) => item.available && isDashboardNavActive(pathname, item),
  );
  return (
    !onPrimaryTab &&
    (pathname === dashboardRoutePrefix || pathname.startsWith(`${dashboardRoutePrefix}/`))
  );
}
