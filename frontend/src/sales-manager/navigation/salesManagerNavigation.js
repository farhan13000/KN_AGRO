import {
  AlertTriangle,
  CalendarCheck,
  CalendarRange,
  ClipboardList,
  ClipboardSignature,
  Clock,
  Columns3,
  CreditCard,
  FileQuestion,
  FileText,
  GitBranch,
  LayoutDashboard,
  Lightbulb,
  MapPin,
  PhoneCall,
  Receipt,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
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
  {
    label: "Regions",
    route: ROUTES.SALES_MANAGER.REGIONS,
    icon: MapPin,
    permission: PERMISSIONS.REGION_READ,
  },
  {
    label: "Districts",
    route: ROUTES.SALES_MANAGER.DISTRICTS,
    icon: GitBranch,
    permission: PERMISSIONS.DISTRICT_READ,
  },
  {
    label: "Hiring Requests",
    route: ROUTES.SALES_MANAGER.HIRING,
    icon: UserPlus,
    permission: PERMISSIONS.HIRING_READ,
  },
  {
    label: "Promotion Approvals",
    route: ROUTES.SALES_MANAGER.PROMOTION_APPROVALS,
    icon: TrendingUp,
    permission: PERMISSIONS.PROMOTION_READ,
  },
  {
    label: "Salary Proposals",
    route: ROUTES.SALES_MANAGER.SALARY_PROPOSAL_APPROVALS,
    icon: Wallet,
    permission: PERMISSIONS.SALARY_PROPOSAL_READ,
  },
  {
    label: "CRM",
    route: ROUTES.SALES_MANAGER.CRM,
    icon: Columns3,
    permission: PERMISSIONS.LEADS_READ,
  },
  {
    label: "Leads",
    route: ROUTES.SALES_MANAGER.LEADS,
    icon: PhoneCall,
    permission: PERMISSIONS.LEADS_READ,
  },
  {
    label: "Follow-Ups",
    route: ROUTES.SALES_MANAGER.FOLLOW_UPS,
    icon: CalendarCheck,
    permission: PERMISSIONS.LEADS_READ,
  },
  {
    label: "Quotations",
    route: ROUTES.SALES_MANAGER.QUOTATIONS,
    icon: FileText,
    permission: PERMISSIONS.QUOTATIONS_READ,
  },
  {
    label: "My DSRs",
    route: ROUTES.SALES_MANAGER.DSR_ME,
    icon: ClipboardList,
    permission: PERMISSIONS.DSR_READ_SELF,
  },
  {
    label: "Team DSRs",
    route: ROUTES.SALES_MANAGER.DSR_TEAM,
    icon: ClipboardList,
    permission: PERMISSIONS.DSR_READ_TEAM,
  },
  {
    label: "Product Recommendations",
    route: ROUTES.SALES_MANAGER.PRODUCT_RECOMMENDATIONS,
    icon: Lightbulb,
    permission: PERMISSIONS.PRODUCTS_READ,
  },
  // Prompt 58: only backend-permitted commercial pages — Sales Manager
  // genuinely holds customers/orders/invoices/payments read (and most
  // create/mutate) permissions per seedRoles.js, so full nav parity with
  // Super Admin here isn't an assumption, it's what the backend already
  // grants.
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
    label: "Invoices",
    route: ROUTES.SALES_MANAGER.INVOICES,
    icon: Receipt,
    permission: PERMISSIONS.INVOICES_READ,
  },
  {
    label: "Outstanding",
    route: ROUTES.SALES_MANAGER.INVOICE_OUTSTANDING,
    icon: AlertTriangle,
    permission: PERMISSIONS.INVOICES_READ,
  },
  {
    label: "Payments",
    route: ROUTES.SALES_MANAGER.PAYMENTS,
    icon: CreditCard,
    permission: PERMISSIONS.PAYMENTS_READ,
  },
  {
    label: "My Attendance",
    route: ROUTES.SALES_MANAGER.ATTENDANCE_ME,
    icon: Clock,
    permission: PERMISSIONS.ATTENDANCE_READ_SELF,
  },
  {
    label: "Team Attendance",
    route: ROUTES.SALES_MANAGER.ATTENDANCE_TEAM,
    icon: Clock,
    permission: PERMISSIONS.ATTENDANCE_READ_TEAM,
  },
  {
    label: "My Leaves",
    route: ROUTES.SALES_MANAGER.LEAVES_ME,
    icon: CalendarRange,
    permission: PERMISSIONS.LEAVES_READ_SELF,
  },
  {
    label: "Team Leaves",
    route: ROUTES.SALES_MANAGER.LEAVES_TEAM,
    icon: CalendarRange,
    permission: PERMISSIONS.LEAVES_READ_TEAM,
  },
  {
    label: "My Reports",
    route: ROUTES.SALES_MANAGER.REPORT_REQUESTS_ME,
    icon: ClipboardSignature,
    permission: PERMISSIONS.REPORTS_READ_SELF,
  },
  {
    label: "Report Requests",
    route: ROUTES.SALES_MANAGER.REPORT_REQUESTS_TEAM,
    icon: FileQuestion,
    permission: PERMISSIONS.REPORTS_READ_TEAM,
  },
];
