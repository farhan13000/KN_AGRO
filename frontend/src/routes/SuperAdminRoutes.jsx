import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { PermissionGuard } from "../core/auth";
import ProtectedRoute from "./ProtectedRoute";
import { BACKEND_ROLES, PERMISSIONS, ROUTES } from "../shared/constants";

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
const SuperAdminCategoryListPage = lazy(
  () => import("../super-admin/pages/categories/SuperAdminCategoryListPage"),
);
const SuperAdminCategoryCreatePage = lazy(
  () => import("../super-admin/pages/categories/SuperAdminCategoryCreatePage"),
);
const SuperAdminCategoryEditPage = lazy(
  () => import("../super-admin/pages/categories/SuperAdminCategoryEditPage"),
);
const SuperAdminProductListPage = lazy(
  () => import("../super-admin/pages/products/SuperAdminProductListPage"),
);
const SuperAdminProductDetailPage = lazy(
  () => import("../super-admin/pages/products/SuperAdminProductDetailPage"),
);
const SuperAdminProductCreatePage = lazy(
  () => import("../super-admin/pages/products/SuperAdminProductCreatePage"),
);
const SuperAdminProductEditPage = lazy(
  () => import("../super-admin/pages/products/SuperAdminProductEditPage"),
);
const SuperAdminInventoryOverviewPage = lazy(
  () => import("../super-admin/pages/inventory/SuperAdminInventoryOverviewPage"),
);
const SuperAdminInventoryTransactionsPage = lazy(
  () => import("../super-admin/pages/inventory/SuperAdminInventoryTransactionsPage"),
);
const SuperAdminLowStockPage = lazy(
  () => import("../super-admin/pages/inventory/SuperAdminLowStockPage"),
);
const SuperAdminOutOfStockPage = lazy(
  () => import("../super-admin/pages/inventory/SuperAdminOutOfStockPage"),
);
const SuperAdminInventoryDetailPage = lazy(
  () => import("../super-admin/pages/inventory/SuperAdminInventoryDetailPage"),
);
const SuperAdminLeadListPage = lazy(() => import("../super-admin/pages/crm/SuperAdminLeadListPage"));
const SuperAdminLeadCreatePage = lazy(() => import("../super-admin/pages/crm/SuperAdminLeadCreatePage"));
const SuperAdminLeadDetailPage = lazy(() => import("../super-admin/pages/crm/SuperAdminLeadDetailPage"));
const SuperAdminFollowUpsPage = lazy(() => import("../super-admin/pages/crm/SuperAdminFollowUpsPage"));
const SuperAdminCrmPipelinePage = lazy(() => import("../super-admin/pages/crm/SuperAdminCrmPipelinePage"));
const InternalNotFoundPage = lazy(() => import("./InternalNotFoundPage"));

const withPermission = (permission, element) => (
  <PermissionGuard
    fallback={<Navigate replace to={ROUTES.ERROR.UNAUTHORIZED} />}
    permission={permission}
  >
    {element}
  </PermissionGuard>
);

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
        {
          path: ROUTES.SUPER_ADMIN.CATEGORIES,
          element: withPermission(PERMISSIONS.CATEGORIES_READ, <SuperAdminCategoryListPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.CATEGORY_CREATE,
          element: withPermission(PERMISSIONS.CATEGORIES_MANAGE, <SuperAdminCategoryCreatePage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.CATEGORY_EDIT,
          element: withPermission(PERMISSIONS.CATEGORIES_MANAGE, <SuperAdminCategoryEditPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.PRODUCTS,
          element: withPermission(PERMISSIONS.PRODUCTS_READ, <SuperAdminProductListPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.PRODUCT_CREATE,
          element: withPermission(PERMISSIONS.PRODUCTS_CREATE, <SuperAdminProductCreatePage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.PRODUCT_EDIT,
          element: withPermission(PERMISSIONS.PRODUCTS_UPDATE, <SuperAdminProductEditPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.PRODUCT_DETAIL,
          element: withPermission(PERMISSIONS.PRODUCTS_READ, <SuperAdminProductDetailPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.INVENTORY,
          element: withPermission(PERMISSIONS.INVENTORY_READ, <SuperAdminInventoryOverviewPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.INVENTORY_TRANSACTIONS,
          element: withPermission(PERMISSIONS.INVENTORY_TRANSACTIONS_READ, <SuperAdminInventoryTransactionsPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.INVENTORY_LOW_STOCK,
          element: withPermission(PERMISSIONS.INVENTORY_READ, <SuperAdminLowStockPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.INVENTORY_OUT_OF_STOCK,
          element: withPermission(PERMISSIONS.INVENTORY_READ, <SuperAdminOutOfStockPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.INVENTORY_DETAIL,
          element: withPermission(PERMISSIONS.INVENTORY_READ, <SuperAdminInventoryDetailPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.CRM,
          element: withPermission(PERMISSIONS.LEADS_READ, <SuperAdminCrmPipelinePage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.LEADS,
          element: withPermission(PERMISSIONS.LEADS_READ, <SuperAdminLeadListPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.LEAD_CREATE,
          element: withPermission(PERMISSIONS.LEADS_CREATE, <SuperAdminLeadCreatePage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.LEAD_DETAIL,
          element: withPermission(PERMISSIONS.LEADS_READ, <SuperAdminLeadDetailPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.FOLLOW_UPS,
          element: withPermission(PERMISSIONS.LEADS_READ, <SuperAdminFollowUpsPage />),
        },
        { path: "/super-admin/*", element: <InternalNotFoundPage /> },
      ],
    },
  ],
};
