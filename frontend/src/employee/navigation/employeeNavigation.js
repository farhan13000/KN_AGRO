import {
  FileText,
  LayoutDashboard,
  Lightbulb,
  PhoneCall,
  Receipt,
  ShoppingCart,
  UserCircle,
  Users,
  UsersRound,
} from "lucide-react";
import { PERMISSIONS, ROUTES } from "../../shared/constants";

export const employeeNavigation = [
  {
    label: "Dashboard",
    route: ROUTES.EMPLOYEE.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    // The lead list and the follow-up queue are the same records, so they
    // are two tabs rather than two entries.
    label: "Leads",
    route: ROUTES.EMPLOYEE.LEADS,
    icon: PhoneCall,
    permission: PERMISSIONS.LEADS_READ,
  },
  {
    // Anyone reporting to you. At the bottom of the chain this is empty
    // and says so; the same page is what an SO uses for their FOs.
    label: "My Team",
    route: ROUTES.EMPLOYEE.MY_TEAM,
    icon: UsersRound,
    permission: PERMISSIONS.MANAGERS_READ,
  },
  {
    label: "Product Recommendations",
    route: ROUTES.EMPLOYEE.PRODUCT_RECOMMENDATIONS,
    icon: Lightbulb,
    permission: PERMISSIONS.PRODUCTS_READ,
  },
  {
    label: "Quotations",
    route: ROUTES.EMPLOYEE.QUOTATIONS,
    icon: FileText,
    permission: PERMISSIONS.QUOTATIONS_READ,
  },
  // Prompt 59: Employee genuinely holds customers/orders/invoices/payments
  // .read (verified against seedRoles.js) — read-only, no create/mutate
  // permission for any of the four, so these entries are added (not
  // withheld) but every page behind them is read-only, matching the
  // pattern already established on the pages themselves.
  {
    label: "Customers",
    route: ROUTES.EMPLOYEE.CUSTOMERS,
    icon: Users,
    permission: PERMISSIONS.CUSTOMERS_READ,
  },
  {
    label: "Orders",
    route: ROUTES.EMPLOYEE.ORDERS,
    icon: ShoppingCart,
    permission: PERMISSIONS.ORDERS_READ,
  },
  {
    // Invoices + outstanding + payments. No `permission`: each tab
    // declares its own so a viewer sees only what they can open.
    label: "Billing",
    route: ROUTES.EMPLOYEE.BILLING,
    icon: Receipt,
  },
  {
    // Profile, attendance, DSRs, leave, reports and payslips: everything
    // that used to be its own "My ..." entry.
    label: "My Workspace",
    route: ROUTES.EMPLOYEE.MY_WORKSPACE,
    icon: UserCircle,
  },
];
