import {
  AlertTriangle,
  Boxes,
  ClipboardCheck,
  Columns3,
  FolderTree,
  GitBranch,
  History,
  LayoutDashboard,
  Package,
  PhoneCall,
  Users,
  Warehouse,
} from "lucide-react";
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
  {
    label: "Categories",
    route: ROUTES.SUPER_ADMIN.CATEGORIES,
    icon: FolderTree,
    permission: PERMISSIONS.CATEGORIES_READ,
  },
  {
    label: "Products",
    route: ROUTES.SUPER_ADMIN.PRODUCTS,
    icon: Package,
    permission: PERMISSIONS.PRODUCTS_READ,
  },
  {
    label: "Inventory",
    route: ROUTES.SUPER_ADMIN.INVENTORY,
    icon: Warehouse,
    permission: PERMISSIONS.INVENTORY_READ,
  },
  {
    label: "CRM",
    route: ROUTES.SUPER_ADMIN.CRM,
    icon: Columns3,
    permission: PERMISSIONS.LEADS_READ,
  },
  {
    label: "Leads",
    route: ROUTES.SUPER_ADMIN.LEADS,
    icon: PhoneCall,
    permission: PERMISSIONS.LEADS_READ,
  },
  {
    label: "Follow-Ups",
    route: ROUTES.SUPER_ADMIN.FOLLOW_UPS,
    icon: ClipboardCheck,
    permission: PERMISSIONS.LEADS_READ,
  },
  {
    label: "Low Stock",
    route: ROUTES.SUPER_ADMIN.INVENTORY_LOW_STOCK,
    icon: AlertTriangle,
    permission: PERMISSIONS.INVENTORY_READ,
  },
  {
    label: "Out Of Stock",
    route: ROUTES.SUPER_ADMIN.INVENTORY_OUT_OF_STOCK,
    icon: Boxes,
    permission: PERMISSIONS.INVENTORY_READ,
  },
  {
    label: "Transactions",
    route: ROUTES.SUPER_ADMIN.INVENTORY_TRANSACTIONS,
    icon: History,
    permission: PERMISSIONS.INVENTORY_TRANSACTIONS_READ,
  },
];
