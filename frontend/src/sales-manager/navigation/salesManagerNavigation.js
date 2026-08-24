import { CalendarCheck, Columns3, LayoutDashboard, PhoneCall, Users } from "lucide-react";
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
];
