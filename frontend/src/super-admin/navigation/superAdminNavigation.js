import { ClipboardCheck, GitBranch, LayoutDashboard, Users } from "lucide-react";
import { PERMISSIONS, ROUTES } from "../../shared/constants";

export const superAdminNavigation = [
  {
    label: "Dashboard",
    route: ROUTES.SUPER_ADMIN.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Employees",
    route: ROUTES.SUPER_ADMIN.EMPLOYEES,
    icon: Users,
    permission: PERMISSIONS.EMPLOYEES_READ,
  },
  {
    label: "Pending Approvals",
    route: ROUTES.SUPER_ADMIN.EMPLOYEE_PENDING,
    icon: ClipboardCheck,
    permission: PERMISSIONS.EMPLOYEES_APPROVE,
  },
  {
    label: "Hierarchy",
    route: ROUTES.SUPER_ADMIN.EMPLOYEE_HIERARCHY,
    icon: GitBranch,
    permission: PERMISSIONS.EMPLOYEES_READ,
  },
];
