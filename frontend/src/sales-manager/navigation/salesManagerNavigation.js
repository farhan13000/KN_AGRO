import { CalendarCheck, Columns3, FileText, GitBranch, LayoutDashboard, MapPin, PhoneCall, Users } from "lucide-react";
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
];
