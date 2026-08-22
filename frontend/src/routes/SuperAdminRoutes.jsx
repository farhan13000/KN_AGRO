import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";
import { BACKEND_ROLES, ROUTES } from "../shared/constants";

const SuperAdminLayout = lazy(() => import("../super-admin/layout/SuperAdminLayout"));
const SuperAdminDashboardPage = lazy(
  () => import("../super-admin/dashboard/SuperAdminDashboardPage"),
);
const SuperAdminEmployeeListPage = lazy(
  () => import("../super-admin/pages/employees/SuperAdminEmployeeListPage"),
);
const SuperAdminEmployeeCreatePage = lazy(
  () => import("../super-admin/pages/employees/SuperAdminEmployeeCreatePage"),
);
const SuperAdminEmployeeHierarchyPage = lazy(
  () => import("../super-admin/pages/employees/SuperAdminEmployeeHierarchyPage"),
);
const SuperAdminEmployeeDetailPage = lazy(
  () => import("../super-admin/pages/employees/SuperAdminEmployeeDetailPage"),
);
const SuperAdminEmployeeEditPage = lazy(
  () => import("../super-admin/pages/employees/SuperAdminEmployeeEditPage"),
);
const SuperAdminPendingEmployeesPage = lazy(
  () => import("../super-admin/pages/employees/SuperAdminPendingEmployeesPage"),
);
const InternalNotFoundPage = lazy(() => import("./InternalNotFoundPage"));

export const superAdminRouteConfig = {
  element: <ProtectedRoute allowedRoles={[BACKEND_ROLES.SUPER_ADMIN]} />,
  children: [
    {
      element: <SuperAdminLayout />,
      children: [
        { path: ROUTES.SUPER_ADMIN.DASHBOARD, element: <SuperAdminDashboardPage /> },
        { path: ROUTES.SUPER_ADMIN.EMPLOYEES, element: <SuperAdminEmployeeListPage /> },
        { path: ROUTES.SUPER_ADMIN.EMPLOYEE_PENDING, element: <SuperAdminPendingEmployeesPage /> },
        { path: ROUTES.SUPER_ADMIN.EMPLOYEE_HIERARCHY, element: <SuperAdminEmployeeHierarchyPage /> },
        { path: ROUTES.SUPER_ADMIN.EMPLOYEE_CREATE, element: <SuperAdminEmployeeCreatePage /> },
        { path: ROUTES.SUPER_ADMIN.EMPLOYEE_EDIT, element: <SuperAdminEmployeeEditPage /> },
        { path: ROUTES.SUPER_ADMIN.EMPLOYEE_DETAIL, element: <SuperAdminEmployeeDetailPage /> },
        { path: "/super-admin/*", element: <InternalNotFoundPage /> },
      ],
    },
  ],
};
