import { LayoutDashboard, Users } from "lucide-react";
import { PERMISSIONS, ROUTES } from "../../shared/constants";

export const salesManagerNavigation = [
  {
    label: "Dashboard",
    route: ROUTES.SALES_MANAGER.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "My Team",
    route: ROUTES.SALES_MANAGER.TEAM,
    icon: Users,
    permission: PERMISSIONS.MANAGERS_READ,
  },
];
