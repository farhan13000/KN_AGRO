import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { PermissionGuard } from "../core/auth";
import ProtectedRoute from "./ProtectedRoute";
import { BACKEND_ROLES, PERMISSIONS, ROUTES } from "../shared/constants";

const SalesManagerMyWorkspacePage = lazy(
  () => import("../sales-manager/pages/me/SalesManagerMyWorkspacePage"),
);
const SalesManagerApprovalsPage = lazy(
  () => import("../sales-manager/pages/approvals/SalesManagerApprovalsPage"),
);
const SalesManagerBillingPage = lazy(
  () => import("../sales-manager/pages/billing/SalesManagerBillingPage"),
);
const SalesManagerLeadsWorkspacePage = lazy(
  () => import("../sales-manager/pages/crm/SalesManagerLeadsWorkspacePage"),
);
const SalesManagerTerritoryPage = lazy(
  () => import("../sales-manager/pages/territory/SalesManagerTerritoryPage"),
);
const SalesManagerDSRWorkspacePage = lazy(
  () => import("../sales-manager/pages/dsr/SalesManagerDSRWorkspacePage"),
);
const SalesManagerAttendanceWorkspacePage = lazy(
  () => import("../sales-manager/pages/attendance/SalesManagerAttendanceWorkspacePage"),
);
const SalesManagerLeavesWorkspacePage = lazy(
  () => import("../sales-manager/pages/leaves/SalesManagerLeavesWorkspacePage"),
);
const SalesManagerReportsWorkspacePage = lazy(
  () => import("../sales-manager/pages/reportRequests/SalesManagerReportsWorkspacePage"),
);
const SalesManagerLayout = lazy(() => import("../sales-manager/layout/SalesManagerLayout"));
const SalesManagerDashboardPage = lazy(
  () => import("../sales-manager/dashboard/SalesManagerDashboardPage"),
);
const SalesManagerTeamPage = lazy(() => import("../sales-manager/pages/team/SalesManagerTeamPage"));
const SalesManagerTeamMemberDetailPage = lazy(
  () => import("../sales-manager/pages/team/SalesManagerTeamMemberDetailPage"),
);
const SalesManagerDistrictDetailPage = lazy(
  () => import("../sales-manager/pages/districts/SalesManagerDistrictDetailPage"),
);
const SalesManagerHiringCreatePage = lazy(
  () => import("../sales-manager/pages/hiring/SalesManagerHiringCreatePage"),
);
const SalesManagerLeadCreatePage = lazy(() => import("../sales-manager/pages/crm/SalesManagerLeadCreatePage"));
const SalesManagerLeadDetailPage = lazy(() => import("../sales-manager/pages/crm/SalesManagerLeadDetailPage"));
const SalesManagerQuotationListPage = lazy(
  () => import("../sales-manager/pages/quotations/SalesManagerQuotationListPage"),
);
const SalesManagerQuotationCreatePage = lazy(
  () => import("../sales-manager/pages/quotations/SalesManagerQuotationCreatePage"),
);
const SalesManagerQuotationDetailPage = lazy(
  () => import("../sales-manager/pages/quotations/SalesManagerQuotationDetailPage"),
);
const SalesManagerQuotationEditPage = lazy(
  () => import("../sales-manager/pages/quotations/SalesManagerQuotationEditPage"),
);
const SalesManagerQuotationPrintPage = lazy(
  () => import("../sales-manager/pages/quotations/SalesManagerQuotationPrintPage"),
);
const SalesManagerCustomerListPage = lazy(
  () => import("../sales-manager/pages/customers/SalesManagerCustomerListPage"),
);
const SalesManagerCustomerCreatePage = lazy(
  () => import("../sales-manager/pages/customers/SalesManagerCustomerCreatePage"),
);
const SalesManagerCustomerDetailPage = lazy(
  () => import("../sales-manager/pages/customers/SalesManagerCustomerDetailPage"),
);
const SalesManagerCustomerEditPage = lazy(
  () => import("../sales-manager/pages/customers/SalesManagerCustomerEditPage"),
);
const SalesManagerOrderListPage = lazy(() => import("../sales-manager/pages/orders/SalesManagerOrderListPage"));
const SalesManagerOrderCreatePage = lazy(
  () => import("../sales-manager/pages/orders/SalesManagerOrderCreatePage"),
);
const SalesManagerOrderDetailPage = lazy(
  () => import("../sales-manager/pages/orders/SalesManagerOrderDetailPage"),
);
const SalesManagerOrderPrintPage = lazy(
  () => import("../sales-manager/pages/orders/SalesManagerOrderPrintPage"),
);
const SalesManagerInvoiceDetailPage = lazy(
  () => import("../sales-manager/pages/invoices/SalesManagerInvoiceDetailPage"),
);
const SalesManagerInvoicePrintPage = lazy(
  () => import("../sales-manager/pages/invoices/SalesManagerInvoicePrintPage"),
);
const SalesManagerDSRSubmitPage = lazy(() => import("../sales-manager/pages/dsr/SalesManagerDSRSubmitPage"));
const SalesManagerProductRecommendationsPage = lazy(
  () => import("../sales-manager/pages/productRecommendations/SalesManagerProductRecommendationsPage"),
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

export const salesManagerRouteConfig = {
  element: (
    <ProtectedRoute
      allowedRoles={[
        BACKEND_ROLES.GM,
        BACKEND_ROLES.RM,
        BACKEND_ROLES.ASM,
        BACKEND_ROLES.SO,
      ]}
    />
  ),
  children: [
    {
      element: <SalesManagerLayout />,
      children: [
        { path: ROUTES.SALES_MANAGER.DASHBOARD, element: <SalesManagerDashboardPage /> },
        { path: ROUTES.SALES_MANAGER.TEAM, element: <SalesManagerTeamPage /> },
        { path: ROUTES.SALES_MANAGER.TEAM_MEMBER_DETAIL, element: <SalesManagerTeamMemberDetailPage /> },
        {
          path: ROUTES.SALES_MANAGER.TERRITORY,
          element: <SalesManagerTerritoryPage />,
        },
        // Old per-view paths stay as redirects into the matching tab:
        // links to them exist across the app and in bookmarks.
        {
          path: ROUTES.SALES_MANAGER.REGIONS,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.TERRITORY}?tab=regions`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.DISTRICTS,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.TERRITORY}?tab=districts`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.DISTRICT_DETAIL,
          element: withPermission(PERMISSIONS.DISTRICT_READ, <SalesManagerDistrictDetailPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.HIRING_CREATE,
          element: withPermission(PERMISSIONS.HIRING_CREATE, <SalesManagerHiringCreatePage />),
        },
        {
          path: ROUTES.SALES_MANAGER.APPROVALS,
          element: <SalesManagerApprovalsPage />,
        },
        {
          path: ROUTES.SALES_MANAGER.HIRING,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.APPROVALS}?type=hiring`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.PROMOTION_APPROVALS,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.APPROVALS}?type=promotions`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.SALARY_PROPOSAL_APPROVALS,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.APPROVALS}?type=salary`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.CRM,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.LEADS}?tab=pipeline`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.LEADS,
          element: <SalesManagerLeadsWorkspacePage />,
        },
        {
          // Registered BEFORE :leadId — otherwise /manager/leads/create
          // matches the detail route with leadId="create".
          path: ROUTES.SALES_MANAGER.LEAD_CREATE,
          element: withPermission(PERMISSIONS.LEADS_CREATE, <SalesManagerLeadCreatePage />),
        },
        {
          path: ROUTES.SALES_MANAGER.LEAD_DETAIL,
          element: withPermission(PERMISSIONS.LEADS_READ, <SalesManagerLeadDetailPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.FOLLOW_UPS,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.LEADS}?tab=follow-ups`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.QUOTATIONS,
          element: withPermission(PERMISSIONS.QUOTATIONS_READ, <SalesManagerQuotationListPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.QUOTATION_CREATE,
          element: withPermission(PERMISSIONS.QUOTATIONS_CREATE, <SalesManagerQuotationCreatePage />),
        },
        {
          path: ROUTES.SALES_MANAGER.QUOTATION_DETAIL,
          element: withPermission(PERMISSIONS.QUOTATIONS_READ, <SalesManagerQuotationDetailPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.QUOTATION_EDIT,
          element: withPermission(PERMISSIONS.QUOTATIONS_UPDATE, <SalesManagerQuotationEditPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.QUOTATION_PRINT,
          element: withPermission(PERMISSIONS.QUOTATIONS_READ, <SalesManagerQuotationPrintPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.CUSTOMERS,
          element: withPermission(PERMISSIONS.CUSTOMERS_READ, <SalesManagerCustomerListPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.CUSTOMER_CREATE,
          element: withPermission(PERMISSIONS.CUSTOMERS_CREATE, <SalesManagerCustomerCreatePage />),
        },
        {
          path: ROUTES.SALES_MANAGER.CUSTOMER_DETAIL,
          element: withPermission(PERMISSIONS.CUSTOMERS_READ, <SalesManagerCustomerDetailPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.CUSTOMER_EDIT,
          element: withPermission(PERMISSIONS.CUSTOMERS_UPDATE, <SalesManagerCustomerEditPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.ORDERS,
          element: withPermission(PERMISSIONS.ORDERS_READ, <SalesManagerOrderListPage />),
        },
        {
          // Before :orderId — otherwise /orders/create matches the detail
          // route with orderId="create".
          path: ROUTES.SALES_MANAGER.ORDER_CREATE,
          element: withPermission(PERMISSIONS.ORDERS_CREATE, <SalesManagerOrderCreatePage />),
        },
        {
          path: ROUTES.SALES_MANAGER.ORDER_DETAIL,
          element: withPermission(PERMISSIONS.ORDERS_READ, <SalesManagerOrderDetailPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.ORDER_PRINT,
          element: withPermission(PERMISSIONS.ORDERS_READ, <SalesManagerOrderPrintPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.BILLING,
          element: <SalesManagerBillingPage />,
        },
        {
          path: ROUTES.SALES_MANAGER.INVOICES,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.BILLING}?tab=invoices`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.INVOICE_OUTSTANDING,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.BILLING}?tab=outstanding`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.INVOICE_DETAIL,
          element: withPermission(PERMISSIONS.INVOICES_READ, <SalesManagerInvoiceDetailPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.INVOICE_PRINT,
          element: withPermission(PERMISSIONS.INVOICES_READ, <SalesManagerInvoicePrintPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.PAYMENTS,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.BILLING}?tab=payments`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.DSR_SUBMIT,
          element: withPermission(PERMISSIONS.DSR_CREATE, <SalesManagerDSRSubmitPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.DSRS,
          element: <SalesManagerDSRWorkspacePage />,
        },
        {
          path: ROUTES.SALES_MANAGER.DSR_ME,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.DSRS}?tab=me`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.DSR_TEAM,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.DSRS}?tab=team`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.PRODUCT_RECOMMENDATIONS,
          element: withPermission(PERMISSIONS.PRODUCTS_READ, <SalesManagerProductRecommendationsPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.ATTENDANCE,
          element: <SalesManagerAttendanceWorkspacePage />,
        },
        {
          path: ROUTES.SALES_MANAGER.ATTENDANCE_ME,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.ATTENDANCE}?tab=me`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.ATTENDANCE_TEAM,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.ATTENDANCE}?tab=team`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.LEAVES,
          element: <SalesManagerLeavesWorkspacePage />,
        },
        {
          path: ROUTES.SALES_MANAGER.LEAVES_ME,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.LEAVES}?tab=me`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.LEAVES_TEAM,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.LEAVES}?tab=team`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.REPORTS,
          element: <SalesManagerReportsWorkspacePage />,
        },
        {
          path: ROUTES.SALES_MANAGER.REPORT_REQUESTS_ME,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.REPORTS}?tab=me`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.REPORT_REQUESTS_TEAM,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.REPORTS}?tab=team`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.MY_WORKSPACE,
          element: <SalesManagerMyWorkspacePage />,
        },
        {
          path: ROUTES.SALES_MANAGER.MY_PAYROLL,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.MY_WORKSPACE}?tab=payroll`} />,
        },
        {
          path: ROUTES.SALES_MANAGER.MY_PROFILE,
          element: <Navigate replace to={`${ROUTES.SALES_MANAGER.MY_WORKSPACE}?tab=profile`} />,
        },
        { path: "/manager/*", element: <InternalNotFoundPage /> },
      ],
    },
  ],
};
