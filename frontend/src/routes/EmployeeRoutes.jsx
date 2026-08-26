import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { PermissionGuard } from "../core/auth";
import ProtectedRoute from "./ProtectedRoute";
import { BACKEND_ROLES, PERMISSIONS, ROUTES } from "../shared/constants";

const EmployeeLayout = lazy(() => import("../employee/layout/EmployeeLayout"));
const EmployeeDashboardPage = lazy(() => import("../employee/dashboard/EmployeeDashboardPage"));
const EmployeeProfilePage = lazy(() => import("../employee/pages/profile/EmployeeProfilePage"));
const EmployeeProfileEditPage = lazy(() => import("../employee/pages/profile/EmployeeProfileEditPage"));
const EmployeeLeadListPage = lazy(() => import("../employee/pages/crm/EmployeeLeadListPage"));
const EmployeeLeadDetailPage = lazy(() => import("../employee/pages/crm/EmployeeLeadDetailPage"));
const EmployeeFollowUpsPage = lazy(() => import("../employee/pages/crm/EmployeeFollowUpsPage"));
const EmployeeQuotationListPage = lazy(() => import("../employee/pages/quotations/EmployeeQuotationListPage"));
const EmployeeQuotationDetailPage = lazy(() => import("../employee/pages/quotations/EmployeeQuotationDetailPage"));
const EmployeeQuotationPrintPage = lazy(() => import("../employee/pages/quotations/EmployeeQuotationPrintPage"));
const InternalNotFoundPage = lazy(() => import("./InternalNotFoundPage"));

const withPermission = (permission, element) => (
  <PermissionGuard
    fallback={<Navigate replace to={ROUTES.ERROR.UNAUTHORIZED} />}
    permission={permission}
  >
    {element}
  </PermissionGuard>
);

export const employeeRouteConfig = {
  element: <ProtectedRoute allowedRoles={[BACKEND_ROLES.EMPLOYEE]} />,
  children: [
    {
      element: <EmployeeLayout />,
      children: [
        { path: ROUTES.EMPLOYEE.DASHBOARD, element: <EmployeeDashboardPage /> },
        { path: ROUTES.EMPLOYEE.PROFILE, element: <EmployeeProfilePage /> },
        { path: ROUTES.EMPLOYEE.PROFILE_EDIT, element: <EmployeeProfileEditPage /> },
        {
          path: ROUTES.EMPLOYEE.LEADS,
          element: withPermission(PERMISSIONS.LEADS_READ, <EmployeeLeadListPage />),
        },
        {
          path: ROUTES.EMPLOYEE.LEAD_DETAIL,
          element: withPermission(PERMISSIONS.LEADS_READ, <EmployeeLeadDetailPage />),
        },
        {
          path: ROUTES.EMPLOYEE.FOLLOW_UPS,
          element: withPermission(PERMISSIONS.LEADS_READ, <EmployeeFollowUpsPage />),
        },
        {
          path: ROUTES.EMPLOYEE.QUOTATIONS,
          element: withPermission(PERMISSIONS.QUOTATIONS_READ, <EmployeeQuotationListPage />),
        },
        {
          path: ROUTES.EMPLOYEE.QUOTATION_DETAIL,
          element: withPermission(PERMISSIONS.QUOTATIONS_READ, <EmployeeQuotationDetailPage />),
        },
        {
          path: ROUTES.EMPLOYEE.QUOTATION_PRINT,
          element: withPermission(PERMISSIONS.QUOTATIONS_READ, <EmployeeQuotationPrintPage />),
        },
        { path: "/employee/*", element: <InternalNotFoundPage /> },
      ],
    },
  ],
};
