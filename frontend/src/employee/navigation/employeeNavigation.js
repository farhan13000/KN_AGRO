import { LayoutDashboard, UserCircle } from "lucide-react";
import { PERMISSIONS, ROUTES } from "../../shared/constants";

export const employeeNavigation = [
  {
    label: "Dashboard",
    route: ROUTES.EMPLOYEE.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "My Profile",
    route: ROUTES.EMPLOYEE.PROFILE,
    icon: UserCircle,
    permission: PERMISSIONS.EMPLOYEES_READ_SELF,
  },
];
