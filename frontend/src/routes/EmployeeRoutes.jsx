import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { PermissionGuard } from "../core/auth";
import ProtectedRoute from "./ProtectedRoute";
import { BACKEND_ROLES, PERMISSIONS, ROUTES } from "../shared/constants";

const EmployeeBillingPage = lazy(
  () => import("../employee/pages/billing/EmployeeBillingPage"),
);
const EmployeeLeadsWorkspacePage = lazy(
  () => import("../employee/pages/crm/EmployeeLeadsWorkspacePage"),
);
const EmployeeLayout = lazy(() => import("../employee/layout/EmployeeLayout"));
const EmployeeDashboardPage = lazy(() => import("../employee/dashboard/EmployeeDashboardPage"));
const EmployeeProfilePage = lazy(() => import("../employee/pages/profile/EmployeeProfilePage"));
const EmployeeProfileEditPage = lazy(() => import("../employee/pages/profile/EmployeeProfileEditPage"));
const EmployeeLeadCreatePage = lazy(() => import("../employee/pages/crm/EmployeeLeadCreatePage"));
const EmployeeLeadDetailPage = lazy(() => import("../employee/pages/crm/EmployeeLeadDetailPage"));
const EmployeeQuotationListPage = lazy(() => import("../employee/pages/quotations/EmployeeQuotationListPage"));
const EmployeeQuotationDetailPage = lazy(() => import("../employee/pages/quotations/EmployeeQuotationDetailPage"));
const EmployeeQuotationPrintPage = lazy(() => import("../employee/pages/quotations/EmployeeQuotationPrintPage"));
const EmployeeCustomerListPage = lazy(() => import("../employee/pages/customers/EmployeeCustomerListPage"));
const EmployeeCustomerDetailPage = lazy(() => import("../employee/pages/customers/EmployeeCustomerDetailPage"));
const EmployeeOrderListPage = lazy(() => import("../employee/pages/orders/EmployeeOrderListPage"));
const EmployeeOrderCreatePage = lazy(
  () => import("../employee/pages/orders/EmployeeOrderCreatePage"),
);
const EmployeeOrderDetailPage = lazy(() => import("../employee/pages/orders/EmployeeOrderDetailPage"));
const EmployeeOrderPrintPage = lazy(() => import("../employee/pages/orders/EmployeeOrderPrintPage"));
const EmployeeInvoiceDetailPage = lazy(() => import("../employee/pages/invoices/EmployeeInvoiceDetailPage"));
const EmployeeInvoicePrintPage = lazy(() => import("../employee/pages/invoices/EmployeeInvoicePrintPage"));
const EmployeeDSRSubmitPage = lazy(() => import("../employee/pages/dsr/EmployeeDSRSubmitPage"));
const EmployeeMyDSRListPage = lazy(() => import("../employee/pages/dsr/EmployeeMyDSRListPage"));
const EmployeeProductRecommendationsPage = lazy(
  () => import("../employee/pages/productRecommendations/EmployeeProductRecommendationsPage"),
);
const EmployeeMyAttendancePage = lazy(() => import("../employee/pages/attendance/EmployeeMyAttendancePage"));
const EmployeeMyLeavesPage = lazy(() => import("../employee/pages/leaves/EmployeeMyLeavesPage"));
const EmployeeMyReportRequestsPage = lazy(
  () => import("../employee/pages/reportRequests/EmployeeMyReportRequestsPage"),
);
const EmployeeMyPayrollPage = lazy(() => import("../employee/pages/payroll/EmployeeMyPayrollPage"));
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
  element: (
    <ProtectedRoute allowedRoles={[BACKEND_ROLES.FO]} />
  ),
  children: [
    {
      element: <EmployeeLayout />,
      children: [
        { path: ROUTES.EMPLOYEE.DASHBOARD, element: <EmployeeDashboardPage /> },
        { path: ROUTES.EMPLOYEE.PROFILE, element: <EmployeeProfilePage /> },
        { path: ROUTES.EMPLOYEE.PROFILE_EDIT, element: <EmployeeProfileEditPage /> },
        {
          path: ROUTES.EMPLOYEE.LEADS,
          element: <EmployeeLeadsWorkspacePage />,
        },
        {
          // Registered BEFORE :leadId — otherwise /employee/leads/create
          // matches the detail route with leadId="create", which is what
          // used to render "Unable to load lead — Validation error" here.
          path: ROUTES.EMPLOYEE.LEAD_CREATE,
          element: withPermission(PERMISSIONS.LEADS_CREATE, <EmployeeLeadCreatePage />),
        },
        {
          path: ROUTES.EMPLOYEE.LEAD_DETAIL,
          element: withPermission(PERMISSIONS.LEADS_READ, <EmployeeLeadDetailPage />),
        },
        {
          path: ROUTES.EMPLOYEE.FOLLOW_UPS,
          element: <Navigate replace to={`${ROUTES.EMPLOYEE.LEADS}?tab=follow-ups`} />,
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
        {
          path: ROUTES.EMPLOYEE.CUSTOMERS,
          element: withPermission(PERMISSIONS.CUSTOMERS_READ, <EmployeeCustomerListPage />),
        },
        {
          path: ROUTES.EMPLOYEE.CUSTOMER_DETAIL,
          element: withPermission(PERMISSIONS.CUSTOMERS_READ, <EmployeeCustomerDetailPage />),
        },
        {
          path: ROUTES.EMPLOYEE.ORDERS,
          element: withPermission(PERMISSIONS.ORDERS_READ, <EmployeeOrderListPage />),
        },
        {
          // Before :orderId — otherwise /orders/create matches the detail
          // route with orderId="create".
          path: ROUTES.EMPLOYEE.ORDER_CREATE,
          element: withPermission(PERMISSIONS.ORDERS_CREATE, <EmployeeOrderCreatePage />),
        },
        {
          path: ROUTES.EMPLOYEE.ORDER_DETAIL,
          element: withPermission(PERMISSIONS.ORDERS_READ, <EmployeeOrderDetailPage />),
        },
        {
          path: ROUTES.EMPLOYEE.ORDER_PRINT,
          element: withPermission(PERMISSIONS.ORDERS_READ, <EmployeeOrderPrintPage />),
        },
        {
          path: ROUTES.EMPLOYEE.BILLING,
          element: <EmployeeBillingPage />,
        },
        {
          path: ROUTES.EMPLOYEE.INVOICES,
          element: <Navigate replace to={`${ROUTES.EMPLOYEE.BILLING}?tab=invoices`} />,
        },
        {
          path: ROUTES.EMPLOYEE.INVOICE_OUTSTANDING,
          element: <Navigate replace to={`${ROUTES.EMPLOYEE.BILLING}?tab=outstanding`} />,
        },
        {
          path: ROUTES.EMPLOYEE.INVOICE_DETAIL,
          element: withPermission(PERMISSIONS.INVOICES_READ, <EmployeeInvoiceDetailPage />),
        },
        {
          path: ROUTES.EMPLOYEE.INVOICE_PRINT,
          element: withPermission(PERMISSIONS.INVOICES_READ, <EmployeeInvoicePrintPage />),
        },
        {
          path: ROUTES.EMPLOYEE.PAYMENTS,
          element: <Navigate replace to={`${ROUTES.EMPLOYEE.BILLING}?tab=payments`} />,
        },
        {
          path: ROUTES.EMPLOYEE.DSR_SUBMIT,
          element: withPermission(PERMISSIONS.DSR_CREATE, <EmployeeDSRSubmitPage />),
        },
        {
          path: ROUTES.EMPLOYEE.DSR_ME,
          element: withPermission(PERMISSIONS.DSR_READ_SELF, <EmployeeMyDSRListPage />),
        },
        {
          path: ROUTES.EMPLOYEE.PRODUCT_RECOMMENDATIONS,
          element: withPermission(PERMISSIONS.PRODUCTS_READ, <EmployeeProductRecommendationsPage />),
        },
        {
          path: ROUTES.EMPLOYEE.ATTENDANCE_ME,
          element: withPermission(PERMISSIONS.ATTENDANCE_READ_SELF, <EmployeeMyAttendancePage />),
        },
        {
          path: ROUTES.EMPLOYEE.LEAVES_ME,
          element: withPermission(PERMISSIONS.LEAVES_READ_SELF, <EmployeeMyLeavesPage />),
        },
        {
          path: ROUTES.EMPLOYEE.REPORT_REQUESTS_ME,
          element: withPermission(PERMISSIONS.REPORTS_READ_SELF, <EmployeeMyReportRequestsPage />),
        },
        {
          path: ROUTES.EMPLOYEE.MY_PAYROLL,
          element: withPermission(PERMISSIONS.PAYROLL_READ_SELF, <EmployeeMyPayrollPage />),
        },
        { path: "/employee/*", element: <InternalNotFoundPage /> },
      ],
    },
  ],
};
