import {
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  ClipboardSignature,
  Clock,
  FileText,
  LayoutDashboard,
  Lightbulb,
  MapPin,
  PhoneCall,
  Receipt,
  ShoppingCart,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";
import { PERMISSIONS, ROUTES } from "../../shared/constants";

// Entries without a `permission` open a tabbed screen whose tabs each
// declare their own — including the My/Team pairs, where a manager may
// legitimately hold one side and not the other.
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
  {
    // Regions + districts.
    label: "Territory",
    route: ROUTES.SALES_MANAGER.TERRITORY,
    icon: MapPin,
  },
  {
    // Hiring requests + promotions + salary proposals.
    label: "Approvals",
    route: ROUTES.SALES_MANAGER.APPROVALS,
    icon: ClipboardCheck,
  },
  {
    // Lead list + pipeline board + follow-ups.
    label: "Leads",
    route: ROUTES.SALES_MANAGER.LEADS,
    icon: PhoneCall,
    permission: PERMISSIONS.LEADS_READ,
  },
  {
    label: "Quotations",
    route: ROUTES.SALES_MANAGER.QUOTATIONS,
    icon: FileText,
    permission: PERMISSIONS.QUOTATIONS_READ,
  },
  {
    // Mine + my team.
    label: "DSRs",
    route: ROUTES.SALES_MANAGER.DSRS,
    icon: ClipboardList,
  },
  {
    label: "Product Recommendations",
    route: ROUTES.SALES_MANAGER.PRODUCT_RECOMMENDATIONS,
    icon: Lightbulb,
    permission: PERMISSIONS.PRODUCTS_READ,
  },
  {
    label: "Customers",
    route: ROUTES.SALES_MANAGER.CUSTOMERS,
    icon: Users,
    permission: PERMISSIONS.CUSTOMERS_READ,
  },
  {
    label: "Orders",
    route: ROUTES.SALES_MANAGER.ORDERS,
    icon: ShoppingCart,
    permission: PERMISSIONS.ORDERS_READ,
  },
  {
    // Invoices + outstanding + payments.
    label: "Billing",
    route: ROUTES.SALES_MANAGER.BILLING,
    icon: Receipt,
  },
  {
    label: "Attendance",
    route: ROUTES.SALES_MANAGER.ATTENDANCE,
    icon: Clock,
  },
  {
    label: "Leaves",
    route: ROUTES.SALES_MANAGER.LEAVES,
    icon: CalendarRange,
  },
  {
    label: "Reports",
    route: ROUTES.SALES_MANAGER.REPORTS,
    icon: ClipboardSignature,
  },
  {
    label: "My Payroll",
    route: ROUTES.SALES_MANAGER.MY_PAYROLL,
    icon: Wallet,
    permission: PERMISSIONS.PAYROLL_READ_SELF,
  },
  {
    label: "My Profile",
    route: ROUTES.SALES_MANAGER.MY_PROFILE,
    icon: UserCircle,
    permission: PERMISSIONS.EMPLOYEES_READ_SELF,
  },
];
