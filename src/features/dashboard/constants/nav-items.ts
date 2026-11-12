import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  LayoutDashboard,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Users,
  Warehouse,
} from "lucide-react";

import { dashboardRoutePrefix } from "@/config/routes";

export type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  available: boolean;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: dashboardRoutePrefix,
    icon: LayoutDashboard,
    available: true,
  },
  {
    id: "orders",
    label: "Orders",
    href: `${dashboardRoutePrefix}/orders`,
    icon: ShoppingBag,
    available: false,
  },
  {
    id: "products",
    label: "Products",
    href: `${dashboardRoutePrefix}/products`,
    icon: Package,
    available: false,
  },
  {
    id: "inventory",
    label: "Inventory",
    href: `${dashboardRoutePrefix}/inventory`,
    icon: Warehouse,
    available: false,
  },
  {
    id: "customers",
    label: "Customers",
    href: `${dashboardRoutePrefix}/customers`,
    icon: Users,
    available: false,
  },
  {
    id: "promotions",
    label: "Promotions",
    href: `${dashboardRoutePrefix}/promotions`,
    icon: Percent,
    available: false,
  },
  {
    id: "analytics",
    label: "Analytics",
    href: `${dashboardRoutePrefix}/analytics`,
    icon: BarChart3,
    available: false,
  },
  {
    id: "settings",
    label: "Settings",
    href: `${dashboardRoutePrefix}/settings`,
    icon: Settings,
    available: false,
  },
];
