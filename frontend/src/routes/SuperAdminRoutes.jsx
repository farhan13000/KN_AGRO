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
const SuperAdminRegionCreatePage = lazy(
  () => import("../super-admin/pages/regions/SuperAdminRegionCreatePage"),
);
const SuperAdminRegionEditPage = lazy(
  () => import("../super-admin/pages/regions/SuperAdminRegionEditPage"),
);
const SuperAdminDistrictCreatePage = lazy(
  () => import("../super-admin/pages/districts/SuperAdminDistrictCreatePage"),
);
const SuperAdminDistrictDetailPage = lazy(
  () => import("../super-admin/pages/districts/SuperAdminDistrictDetailPage"),
);
const SuperAdminDistrictEditPage = lazy(
  () => import("../super-admin/pages/districts/SuperAdminDistrictEditPage"),
);
const SuperAdminApprovalsPage = lazy(
  () => import("../super-admin/pages/approvals/SuperAdminApprovalsPage"),
);
const SuperAdminBillingPage = lazy(
  () => import("../super-admin/pages/billing/SuperAdminBillingPage"),
);
const SuperAdminStockPage = lazy(
  () => import("../super-admin/pages/inventory/SuperAdminStockPage"),
);
const SuperAdminLeadsWorkspacePage = lazy(
  () => import("../super-admin/pages/crm/SuperAdminLeadsWorkspacePage"),
);
const SuperAdminTerritoryPage = lazy(
  () => import("../super-admin/pages/territory/SuperAdminTerritoryPage"),
);
const SuperAdminCataloguePage = lazy(
  () => import("../super-admin/pages/catalogue/SuperAdminCataloguePage"),
);
const SuperAdminHiringCreatePage = lazy(
  () => import("../super-admin/pages/hiring/SuperAdminHiringCreatePage"),
);
const SuperAdminCategoryCreatePage = lazy(
  () => import("../super-admin/pages/categories/SuperAdminCategoryCreatePage"),
);
const SuperAdminCategoryEditPage = lazy(
  () => import("../super-admin/pages/categories/SuperAdminCategoryEditPage"),
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
const SuperAdminInventoryDetailPage = lazy(
  () => import("../super-admin/pages/inventory/SuperAdminInventoryDetailPage"),
);
const SuperAdminLeadCreatePage = lazy(() => import("../super-admin/pages/crm/SuperAdminLeadCreatePage"));
const SuperAdminLeadDetailPage = lazy(() => import("../super-admin/pages/crm/SuperAdminLeadDetailPage"));
const SuperAdminQuotationListPage = lazy(
  () => import("../super-admin/pages/quotations/SuperAdminQuotationListPage"),
);
const SuperAdminQuotationCreatePage = lazy(
  () => import("../super-admin/pages/quotations/SuperAdminQuotationCreatePage"),
);
const SuperAdminQuotationDetailPage = lazy(
  () => import("../super-admin/pages/quotations/SuperAdminQuotationDetailPage"),
);
const SuperAdminQuotationEditPage = lazy(
  () => import("../super-admin/pages/quotations/SuperAdminQuotationEditPage"),
);
const SuperAdminQuotationPrintPage = lazy(
  () => import("../super-admin/pages/quotations/SuperAdminQuotationPrintPage"),
);
const SuperAdminCustomerListPage = lazy(
  () => import("../super-admin/pages/customers/SuperAdminCustomerListPage"),
);
const SuperAdminCustomerCreatePage = lazy(
  () => import("../super-admin/pages/customers/SuperAdminCustomerCreatePage"),
);
const SuperAdminCustomerDetailPage = lazy(
  () => import("../super-admin/pages/customers/SuperAdminCustomerDetailPage"),
);
const SuperAdminCustomerEditPage = lazy(
  () => import("../super-admin/pages/customers/SuperAdminCustomerEditPage"),
);
const SuperAdminOrderListPage = lazy(() => import("../super-admin/pages/orders/SuperAdminOrderListPage"));
const SuperAdminOrderCreatePage = lazy(
  () => import("../super-admin/pages/orders/SuperAdminOrderCreatePage"),
);
const SuperAdminOrderDetailPage = lazy(() => import("../super-admin/pages/orders/SuperAdminOrderDetailPage"));
const SuperAdminOrderPrintPage = lazy(() => import("../super-admin/pages/orders/SuperAdminOrderPrintPage"));
const SuperAdminInvoiceDetailPage = lazy(
  () => import("../super-admin/pages/invoices/SuperAdminInvoiceDetailPage"),
);
const SuperAdminInvoicePrintPage = lazy(
  () => import("../super-admin/pages/invoices/SuperAdminInvoicePrintPage"),
);
const SuperAdminAllDSRListPage = lazy(() => import("../super-admin/pages/dsr/SuperAdminAllDSRListPage"));
const SuperAdminProductRecommendationsPage = lazy(
  () => import("../super-admin/pages/productRecommendations/SuperAdminProductRecommendationsPage"),
);
const SuperAdminAuditLogListPage = lazy(() => import("../super-admin/pages/audit/SuperAdminAuditLogListPage"));
const SuperAdminAllAttendancePage = lazy(
  () => import("../super-admin/pages/attendance/SuperAdminAllAttendancePage"),
);
const SuperAdminAllLeavesPage = lazy(() => import("../super-admin/pages/leaves/SuperAdminAllLeavesPage"));
const SuperAdminAllReportRequestsPage = lazy(
  () => import("../super-admin/pages/reportRequests/SuperAdminAllReportRequestsPage"),
);
const SuperAdminPayrollPage = lazy(() => import("../super-admin/pages/payroll/SuperAdminPayrollPage"));
const SuperAdminMyPayrollPage = lazy(
  () => import("../super-admin/pages/payroll/SuperAdminMyPayrollPage"),
);
const SuperAdminMyProfilePage = lazy(
  () => import("../super-admin/pages/profile/SuperAdminMyProfilePage"),
);
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
  element: (
    <ProtectedRoute allowedRoles={[BACKEND_ROLES.SA, BACKEND_ROLES.OA]} />
  ),
  children: [
    {
      element: <SuperAdminLayout />,
      children: [
        { path: ROUTES.SUPER_ADMIN.DASHBOARD, element: <SuperAdminDashboardPage /> },
        { path: ROUTES.SUPER_ADMIN.EMPLOYEES, element: <SuperAdminEmployeeListPage /> },
        {
          path: ROUTES.SUPER_ADMIN.EMPLOYEE_PENDING,
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.APPROVALS}?type=employees`} />,
        },
        { path: ROUTES.SUPER_ADMIN.EMPLOYEE_HIERARCHY, element: <SuperAdminEmployeeHierarchyPage /> },
        {
          path: ROUTES.SUPER_ADMIN.EMPLOYEE_CREATE,
          // Was the one unguarded route in this block, which let OA reach
          // a form it could never submit (OA holds no employees.create).
          // Hiding the button alone is not enough — the URL is typeable.
          element: withPermission(PERMISSIONS.EMPLOYEES_CREATE, <SuperAdminEmployeeCreatePage />),
        },
        { path: ROUTES.SUPER_ADMIN.EMPLOYEE_EDIT, element: <SuperAdminEmployeeEditPage /> },
        { path: ROUTES.SUPER_ADMIN.EMPLOYEE_DETAIL, element: <SuperAdminEmployeeDetailPage /> },
        {
          path: ROUTES.SUPER_ADMIN.TERRITORY,
          element: <SuperAdminTerritoryPage />,
        },
        // Regions and districts are one screen now. The old paths stay as
        // redirects into the matching tab, because links to them exist all
        // over the app (and in people's bookmarks).
        {
          path: ROUTES.SUPER_ADMIN.REGIONS,
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.TERRITORY}?tab=regions`} />,
        },
        {
          path: ROUTES.SUPER_ADMIN.REGION_CREATE,
          element: withPermission(PERMISSIONS.REGION_CREATE, <SuperAdminRegionCreatePage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.REGION_EDIT,
          element: withPermission(PERMISSIONS.REGION_UPDATE, <SuperAdminRegionEditPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.DISTRICTS,
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.TERRITORY}?tab=districts`} />,
        },
        {
          path: ROUTES.SUPER_ADMIN.DISTRICT_CREATE,
          element: withPermission(PERMISSIONS.DISTRICT_CREATE, <SuperAdminDistrictCreatePage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.DISTRICT_DETAIL,
          element: withPermission(PERMISSIONS.DISTRICT_READ, <SuperAdminDistrictDetailPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.DISTRICT_EDIT,
          element: withPermission(PERMISSIONS.DISTRICT_UPDATE, <SuperAdminDistrictEditPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.HIRING_CREATE,
          element: withPermission(PERMISSIONS.HIRING_CREATE, <SuperAdminHiringCreatePage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.APPROVALS,
          element: <SuperAdminApprovalsPage />,
        },
        // The four queues merged into one screen. These paths stay so
        // notification deep-links keep working; each opens the combined
        // screen on its own tab.
        {
          path: ROUTES.SUPER_ADMIN.HIRING,
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.APPROVALS}?type=hiring`} />,
        },
        {
          path: ROUTES.SUPER_ADMIN.PROMOTION_APPROVALS,
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.APPROVALS}?type=promotions`} />,
        },
        {
          path: ROUTES.SUPER_ADMIN.SALARY_PROPOSAL_APPROVALS,
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.APPROVALS}?type=salary`} />,
        },
        {
          path: ROUTES.SUPER_ADMIN.CATALOGUE,
          element: <SuperAdminCataloguePage />,
        },
        {
          path: ROUTES.SUPER_ADMIN.CATEGORIES,
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.CATALOGUE}?tab=categories`} />,
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
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.CATALOGUE}?tab=products`} />,
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
          path: ROUTES.SUPER_ADMIN.STOCK,
          element: <SuperAdminStockPage />,
        },
        {
          path: ROUTES.SUPER_ADMIN.INVENTORY,
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.STOCK}?tab=levels`} />,
        },
        {
          path: ROUTES.SUPER_ADMIN.INVENTORY_TRANSACTIONS,
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.STOCK}?tab=movements`} />,
        },
        {
          path: ROUTES.SUPER_ADMIN.INVENTORY_LOW_STOCK,
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.STOCK}?tab=low`} />,
        },
        {
          path: ROUTES.SUPER_ADMIN.INVENTORY_OUT_OF_STOCK,
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.STOCK}?tab=out`} />,
        },
        {
          path: ROUTES.SUPER_ADMIN.INVENTORY_DETAIL,
          element: withPermission(PERMISSIONS.INVENTORY_READ, <SuperAdminInventoryDetailPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.CRM,
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.LEADS}?tab=pipeline`} />,
        },
        {
          // The list, the pipeline board and the follow-up queue are three
          // readings of the same records, so they are tabs on this one path.
          path: ROUTES.SUPER_ADMIN.LEADS,
          element: <SuperAdminLeadsWorkspacePage />,
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
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.LEADS}?tab=follow-ups`} />,
        },
        {
          path: ROUTES.SUPER_ADMIN.QUOTATIONS,
          element: withPermission(PERMISSIONS.QUOTATIONS_READ, <SuperAdminQuotationListPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.QUOTATION_CREATE,
          element: withPermission(PERMISSIONS.QUOTATIONS_CREATE, <SuperAdminQuotationCreatePage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.QUOTATION_DETAIL,
          element: withPermission(PERMISSIONS.QUOTATIONS_READ, <SuperAdminQuotationDetailPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.QUOTATION_EDIT,
          element: withPermission(PERMISSIONS.QUOTATIONS_UPDATE, <SuperAdminQuotationEditPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.QUOTATION_PRINT,
          element: withPermission(PERMISSIONS.QUOTATIONS_READ, <SuperAdminQuotationPrintPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.CUSTOMERS,
          element: withPermission(PERMISSIONS.CUSTOMERS_READ, <SuperAdminCustomerListPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.CUSTOMER_CREATE,
          element: withPermission(PERMISSIONS.CUSTOMERS_CREATE, <SuperAdminCustomerCreatePage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.CUSTOMER_DETAIL,
          element: withPermission(PERMISSIONS.CUSTOMERS_READ, <SuperAdminCustomerDetailPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.CUSTOMER_EDIT,
          element: withPermission(PERMISSIONS.CUSTOMERS_UPDATE, <SuperAdminCustomerEditPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.ORDERS,
          element: withPermission(PERMISSIONS.ORDERS_READ, <SuperAdminOrderListPage />),
        },
        {
          // Before :orderId — otherwise /orders/create matches the detail
          // route with orderId="create".
          path: ROUTES.SUPER_ADMIN.ORDER_CREATE,
          element: withPermission(PERMISSIONS.ORDERS_CREATE, <SuperAdminOrderCreatePage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.ORDER_DETAIL,
          element: withPermission(PERMISSIONS.ORDERS_READ, <SuperAdminOrderDetailPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.ORDER_PRINT,
          element: withPermission(PERMISSIONS.ORDERS_READ, <SuperAdminOrderPrintPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.BILLING,
          element: <SuperAdminBillingPage />,
        },
        {
          path: ROUTES.SUPER_ADMIN.INVOICES,
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.BILLING}?tab=invoices`} />,
        },
        {
          path: ROUTES.SUPER_ADMIN.INVOICE_OUTSTANDING,
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.BILLING}?tab=outstanding`} />,
        },
        {
          path: ROUTES.SUPER_ADMIN.INVOICE_DETAIL,
          element: withPermission(PERMISSIONS.INVOICES_READ, <SuperAdminInvoiceDetailPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.INVOICE_PRINT,
          element: withPermission(PERMISSIONS.INVOICES_READ, <SuperAdminInvoicePrintPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.PAYMENTS,
          element: <Navigate replace to={`${ROUTES.SUPER_ADMIN.BILLING}?tab=payments`} />,
        },
        {
          path: ROUTES.SUPER_ADMIN.DSR,
          element: withPermission(PERMISSIONS.DSR_READ_ALL, <SuperAdminAllDSRListPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.PRODUCT_RECOMMENDATIONS,
          element: withPermission(PERMISSIONS.PRODUCTS_READ, <SuperAdminProductRecommendationsPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.AUDIT_LOG,
          element: withPermission(PERMISSIONS.AUDIT_READ, <SuperAdminAuditLogListPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.ATTENDANCE,
          element: withPermission(PERMISSIONS.ATTENDANCE_READ_ALL, <SuperAdminAllAttendancePage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.LEAVES,
          element: withPermission(PERMISSIONS.LEAVES_READ_ALL, <SuperAdminAllLeavesPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.REPORT_REQUESTS,
          element: withPermission(PERMISSIONS.REPORTS_MANAGE, <SuperAdminAllReportRequestsPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.PAYROLL,
          element: withPermission(PERMISSIONS.PAYROLL_READ, <SuperAdminPayrollPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.MY_PAYROLL,
          element: withPermission(PERMISSIONS.PAYROLL_READ_SELF, <SuperAdminMyPayrollPage />),
        },
        {
          path: ROUTES.SUPER_ADMIN.MY_PROFILE,
          element: withPermission(PERMISSIONS.EMPLOYEES_READ_SELF, <SuperAdminMyProfilePage />),
        },
        { path: "/super-admin/*", element: <InternalNotFoundPage /> },
      ],
    },
  ],
};
