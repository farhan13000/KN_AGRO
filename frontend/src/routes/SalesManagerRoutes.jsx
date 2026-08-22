import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";
import { BACKEND_ROLES, ROUTES } from "../shared/constants";

const SalesManagerLayout = lazy(() => import("../sales-manager/layout/SalesManagerLayout"));
const SalesManagerDashboardPage = lazy(
  () => import("../sales-manager/dashboard/SalesManagerDashboardPage"),
);
const SalesManagerTeamPage = lazy(() => import("../sales-manager/pages/team/SalesManagerTeamPage"));
const SalesManagerTeamMemberDetailPage = lazy(
  () => import("../sales-manager/pages/team/SalesManagerTeamMemberDetailPage"),
);
const InternalNotFoundPage = lazy(() => import("./InternalNotFoundPage"));

export const salesManagerRouteConfig = {
  element: <ProtectedRoute allowedRoles={[BACKEND_ROLES.SALES_MANAGER]} />,
  children: [
    {
      element: <SalesManagerLayout />,
      children: [
        { path: ROUTES.SALES_MANAGER.DASHBOARD, element: <SalesManagerDashboardPage /> },
        { path: ROUTES.SALES_MANAGER.TEAM, element: <SalesManagerTeamPage /> },
        { path: ROUTES.SALES_MANAGER.TEAM_MEMBER_DETAIL, element: <SalesManagerTeamMemberDetailPage /> },
        { path: "/manager/*", element: <InternalNotFoundPage /> },
      ],
    },
  ],
};
