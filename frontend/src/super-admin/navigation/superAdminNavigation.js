import {
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileQuestion,
  FileText,
  GitBranch,
  LayoutDashboard,
  Lightbulb,
  MapPin,
  Package,
  PhoneCall,
  Receipt,
  ScrollText,
  ShoppingCart,
  UserCircle,
  Users,
  UsersRound,
  Wallet,
  Warehouse,
} from "lucide-react";
import { PERMISSIONS, ROUTES } from "../../shared/constants";

// Several entries below stand for a screen with tabs rather than a single
// view. They carry no `permission` on purpose: each tab declares its own
// and hides itself, so gating the whole entry on any one permission would
// hide the other tabs from someone who holds those instead.
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
    // Your own direct reports, with their performance, attendance, leave
    // and promotions on one page. Every role has this entry.
    label: "My Team",
    route: ROUTES.SUPER_ADMIN.MY_TEAM,
    icon: UsersRound,
    permission: PERMISSIONS.MANAGERS_READ,
  },
  {
    // Hiring, promotions, salary proposals, employee applications.
    label: "Approvals",
    route: ROUTES.SUPER_ADMIN.APPROVALS,
    icon: ClipboardCheck,
  },
  {
    label: "Hierarchy",
    route: ROUTES.SUPER_ADMIN.EMPLOYEE_HIERARCHY,
    icon: GitBranch,
    permission: PERMISSIONS.EMPLOYEES_READ,
  },
  {
    // Regions + districts.
    label: "Territory",
    route: ROUTES.SUPER_ADMIN.TERRITORY,
    icon: MapPin,
  },
  {
    // Products + categories.
    label: "Catalogue",
    route: ROUTES.SUPER_ADMIN.CATALOGUE,
    icon: Package,
  },
  {
    // Stock levels + low stock + out of stock + movements.
    label: "Inventory",
    route: ROUTES.SUPER_ADMIN.STOCK,
    icon: Warehouse,
  },
  {
    // Lead list + pipeline board + follow-ups: one subject, three readings.
    label: "Leads",
    route: ROUTES.SUPER_ADMIN.LEADS,
    icon: PhoneCall,
    permission: PERMISSIONS.LEADS_READ,
  },
  {
    label: "Quotations",
    route: ROUTES.SUPER_ADMIN.QUOTATIONS,
    icon: FileText,
    permission: PERMISSIONS.QUOTATIONS_READ,
  },
  {
    label: "DSRs",
    route: ROUTES.SUPER_ADMIN.DSR,
    icon: ClipboardList,
    permission: PERMISSIONS.DSR_READ_ALL,
  },
  {
    label: "Product Recommendations",
    route: ROUTES.SUPER_ADMIN.PRODUCT_RECOMMENDATIONS,
    icon: Lightbulb,
    permission: PERMISSIONS.PRODUCTS_READ,
  },
  {
    label: "Customers",
    route: ROUTES.SUPER_ADMIN.CUSTOMERS,
    icon: Users,
    permission: PERMISSIONS.CUSTOMERS_READ,
  },
  {
    label: "Orders",
    route: ROUTES.SUPER_ADMIN.ORDERS,
    icon: ShoppingCart,
    permission: PERMISSIONS.ORDERS_READ,
  },
  {
    // Invoices + outstanding + payments: one ledger.
    label: "Billing",
    route: ROUTES.SUPER_ADMIN.BILLING,
    icon: Receipt,
  },
  {
    label: "Audit Log",
    route: ROUTES.SUPER_ADMIN.AUDIT_LOG,
    icon: ScrollText,
    permission: PERMISSIONS.AUDIT_READ,
  },
  {
    label: "Attendance",
    route: ROUTES.SUPER_ADMIN.ATTENDANCE,
    icon: Clock,
    permission: PERMISSIONS.ATTENDANCE_READ_ALL,
  },
  {
    label: "Leaves",
    route: ROUTES.SUPER_ADMIN.LEAVES,
    icon: CalendarRange,
    permission: PERMISSIONS.LEAVES_READ_ALL,
  },
  {
    label: "Report Requests",
    route: ROUTES.SUPER_ADMIN.REPORT_REQUESTS,
    icon: FileQuestion,
    permission: PERMISSIONS.REPORTS_MANAGE,
  },
  {
    label: "Payroll Runs",
    route: ROUTES.SUPER_ADMIN.PAYROLL,
    icon: Wallet,
    permission: PERMISSIONS.PAYROLL_READ,
  },
  {
    // Your own profile and payslips — the two "My ..." entries, merged.
    label: "My Workspace",
    route: ROUTES.SUPER_ADMIN.MY_WORKSPACE,
    icon: UserCircle,
  },
];
