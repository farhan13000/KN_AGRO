import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { PermissionGuard } from "../core/auth";
import ProtectedRoute from "./ProtectedRoute";
import { BACKEND_ROLES, PERMISSIONS, ROUTES } from "../shared/constants";

const SalesManagerLayout = lazy(() => import("../sales-manager/layout/SalesManagerLayout"));
const SalesManagerDashboardPage = lazy(
  () => import("../sales-manager/dashboard/SalesManagerDashboardPage"),
);
const SalesManagerTeamPage = lazy(() => import("../sales-manager/pages/team/SalesManagerTeamPage"));
const SalesManagerTeamMemberDetailPage = lazy(
  () => import("../sales-manager/pages/team/SalesManagerTeamMemberDetailPage"),
);
const SalesManagerLeadListPage = lazy(() => import("../sales-manager/pages/crm/SalesManagerLeadListPage"));
const SalesManagerLeadDetailPage = lazy(() => import("../sales-manager/pages/crm/SalesManagerLeadDetailPage"));
const SalesManagerFollowUpsPage = lazy(() => import("../sales-manager/pages/crm/SalesManagerFollowUpsPage"));
const SalesManagerCrmPipelinePage = lazy(() => import("../sales-manager/pages/crm/SalesManagerCrmPipelinePage"));
const InternalNotFoundPage = lazy(() => import("./InternalNotFoundPage"));

const withPermission = (permission, element) => (
  <PermissionGuard
    fallback={<Navigate replace to={ROUTES.ERROR.UNAUTHORIZED} />}
    permission={permission}
  >
    {element}
  </PermissionGuard>
);

export const salesManagerRouteConfig = {
  element: <ProtectedRoute allowedRoles={[BACKEND_ROLES.SALES_MANAGER]} />,
  children: [
    {
      element: <SalesManagerLayout />,
      children: [
        { path: ROUTES.SALES_MANAGER.DASHBOARD, element: <SalesManagerDashboardPage /> },
        { path: ROUTES.SALES_MANAGER.TEAM, element: <SalesManagerTeamPage /> },
        { path: ROUTES.SALES_MANAGER.TEAM_MEMBER_DETAIL, element: <SalesManagerTeamMemberDetailPage /> },
        {
          path: ROUTES.SALES_MANAGER.CRM,
          element: withPermission(PERMISSIONS.LEADS_READ, <SalesManagerCrmPipelinePage />),
        },
        {
          path: ROUTES.SALES_MANAGER.LEADS,
          element: withPermission(PERMISSIONS.LEADS_READ, <SalesManagerLeadListPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.LEAD_DETAIL,
          element: withPermission(PERMISSIONS.LEADS_READ, <SalesManagerLeadDetailPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.FOLLOW_UPS,
          element: withPermission(PERMISSIONS.LEADS_READ, <SalesManagerFollowUpsPage />),
        },
        { path: "/manager/*", element: <InternalNotFoundPage /> },
      ],
    },
  ],
};
