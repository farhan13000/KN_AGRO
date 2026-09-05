import {
  Wallet,
  AlertTriangle,
  CalendarCheck,
  CalendarRange,
  ClipboardList,
  ClipboardSignature,
  Clock,
  CreditCard,
  FileText,
  LayoutDashboard,
  Lightbulb,
  PhoneCall,
  Receipt,
  ShoppingCart,
  UserCircle,
  Users,
} from "lucide-react";
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
  {
    label: "My Leads",
    route: ROUTES.EMPLOYEE.LEADS,
    icon: PhoneCall,
    permission: PERMISSIONS.LEADS_READ,
  },
  {
    label: "Follow-Ups",
    route: ROUTES.EMPLOYEE.FOLLOW_UPS,
    icon: CalendarCheck,
    permission: PERMISSIONS.LEADS_READ,
  },
  {
    label: "My DSRs",
    route: ROUTES.EMPLOYEE.DSR_ME,
    icon: ClipboardList,
    permission: PERMISSIONS.DSR_READ_SELF,
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
    label: "Invoices",
    route: ROUTES.EMPLOYEE.INVOICES,
    icon: Receipt,
    permission: PERMISSIONS.INVOICES_READ,
  },
  {
    label: "Outstanding",
    route: ROUTES.EMPLOYEE.INVOICE_OUTSTANDING,
    icon: AlertTriangle,
    permission: PERMISSIONS.INVOICES_READ,
  },
  {
    label: "Payments",
    route: ROUTES.EMPLOYEE.PAYMENTS,
    icon: CreditCard,
    permission: PERMISSIONS.PAYMENTS_READ,
  },
  {
    label: "My Attendance",
    route: ROUTES.EMPLOYEE.ATTENDANCE_ME,
    icon: Clock,
    permission: PERMISSIONS.ATTENDANCE_READ_SELF,
  },
  {
    label: "My Leaves",
    route: ROUTES.EMPLOYEE.LEAVES_ME,
    icon: CalendarRange,
    permission: PERMISSIONS.LEAVES_READ_SELF,
  },
  {
    label: "My Reports",
    route: ROUTES.EMPLOYEE.REPORT_REQUESTS_ME,
    icon: ClipboardSignature,
    permission: PERMISSIONS.REPORTS_READ_SELF,
  },
  {
    label: "My Payroll",
    route: ROUTES.EMPLOYEE.MY_PAYROLL,
    icon: Wallet,
    permission: PERMISSIONS.PAYROLL_READ_SELF,
  },
];
