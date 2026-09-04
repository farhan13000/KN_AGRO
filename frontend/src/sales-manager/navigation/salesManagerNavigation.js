import {
  AlertTriangle,
  CalendarCheck,
  Columns3,
  CreditCard,
  FileText,
  GitBranch,
  LayoutDashboard,
  MapPin,
  PhoneCall,
  Receipt,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Users,
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
];
