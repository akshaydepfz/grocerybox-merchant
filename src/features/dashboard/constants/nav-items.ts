import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CreditCard,
  FolderTree,
  HelpCircle,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  ShoppingCart,
  Users,
  UserRound,
  Warehouse,
} from "lucide-react";

import { dashboardRoutePrefix } from "@/config/routes";

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
    available: false,
    badge: 12,
  },
  {
    id: "products",
    label: "Products",
    href: `${dashboardRoutePrefix}/products`,
    icon: Package,
    available: false,
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
    id: "marketing",
    label: "Marketing",
    href: `${dashboardRoutePrefix}/marketing`,
    icon: Megaphone,
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
    label: "Store Settings",
    href: `${dashboardRoutePrefix}/settings`,
    icon: Settings,
    available: false,
  },
  {
    id: "payments",
    label: "Payments",
    href: `${dashboardRoutePrefix}/payments`,
    icon: CreditCard,
    available: false,
  },
  {
    id: "team",
    label: "Team",
    href: `${dashboardRoutePrefix}/team`,
    icon: UserRound,
    available: false,
  },
  {
    id: "help",
    label: "Help & Support",
    href: `${dashboardRoutePrefix}/help`,
    icon: HelpCircle,
    available: false,
  },
];
