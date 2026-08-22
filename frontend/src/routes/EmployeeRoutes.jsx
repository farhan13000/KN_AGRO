import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";
import { BACKEND_ROLES, ROUTES } from "../shared/constants";

const EmployeeLayout = lazy(() => import("../employee/layout/EmployeeLayout"));
const EmployeeDashboardPage = lazy(() => import("../employee/dashboard/EmployeeDashboardPage"));
const EmployeeProfilePage = lazy(() => import("../employee/pages/profile/EmployeeProfilePage"));
const EmployeeProfileEditPage = lazy(() => import("../employee/pages/profile/EmployeeProfileEditPage"));
const InternalNotFoundPage = lazy(() => import("./InternalNotFoundPage"));

export const employeeRouteConfig = {
  element: <ProtectedRoute allowedRoles={[BACKEND_ROLES.EMPLOYEE]} />,
  children: [
    {
      element: <EmployeeLayout />,
      children: [
        { path: ROUTES.EMPLOYEE.DASHBOARD, element: <EmployeeDashboardPage /> },
        { path: ROUTES.EMPLOYEE.PROFILE, element: <EmployeeProfilePage /> },
        { path: ROUTES.EMPLOYEE.PROFILE_EDIT, element: <EmployeeProfileEditPage /> },
        { path: "/employee/*", element: <InternalNotFoundPage /> },
      ],
    },
  ],
};
