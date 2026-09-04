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
const SalesManagerRegionListPage = lazy(
  () => import("../sales-manager/pages/regions/SalesManagerRegionListPage"),
);
const SalesManagerDistrictListPage = lazy(
  () => import("../sales-manager/pages/districts/SalesManagerDistrictListPage"),
);
const SalesManagerDistrictDetailPage = lazy(
  () => import("../sales-manager/pages/districts/SalesManagerDistrictDetailPage"),
);
const SalesManagerHiringListPage = lazy(
  () => import("../sales-manager/pages/hiring/SalesManagerHiringListPage"),
);
const SalesManagerHiringCreatePage = lazy(
  () => import("../sales-manager/pages/hiring/SalesManagerHiringCreatePage"),
);
const SalesManagerPromotionApprovalsPage = lazy(
  () => import("../sales-manager/pages/promotions/SalesManagerPromotionApprovalsPage"),
);
const SalesManagerSalaryProposalApprovalsPage = lazy(
  () => import("../sales-manager/pages/salaryProposals/SalesManagerSalaryProposalApprovalsPage"),
);
const SalesManagerLeadListPage = lazy(() => import("../sales-manager/pages/crm/SalesManagerLeadListPage"));
const SalesManagerLeadDetailPage = lazy(() => import("../sales-manager/pages/crm/SalesManagerLeadDetailPage"));
const SalesManagerFollowUpsPage = lazy(() => import("../sales-manager/pages/crm/SalesManagerFollowUpsPage"));
const SalesManagerCrmPipelinePage = lazy(() => import("../sales-manager/pages/crm/SalesManagerCrmPipelinePage"));
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
const SalesManagerOrderDetailPage = lazy(
  () => import("../sales-manager/pages/orders/SalesManagerOrderDetailPage"),
);
const SalesManagerOrderPrintPage = lazy(
  () => import("../sales-manager/pages/orders/SalesManagerOrderPrintPage"),
);
const SalesManagerInvoiceListPage = lazy(
  () => import("../sales-manager/pages/invoices/SalesManagerInvoiceListPage"),
);
const SalesManagerInvoiceOutstandingPage = lazy(
  () => import("../sales-manager/pages/invoices/SalesManagerInvoiceOutstandingPage"),
);
const SalesManagerInvoiceDetailPage = lazy(
  () => import("../sales-manager/pages/invoices/SalesManagerInvoiceDetailPage"),
);
const SalesManagerInvoicePrintPage = lazy(
  () => import("../sales-manager/pages/invoices/SalesManagerInvoicePrintPage"),
);
const SalesManagerPaymentListPage = lazy(
  () => import("../sales-manager/pages/payments/SalesManagerPaymentListPage"),
);
const SalesManagerDSRSubmitPage = lazy(() => import("../sales-manager/pages/dsr/SalesManagerDSRSubmitPage"));
const SalesManagerMyDSRListPage = lazy(() => import("../sales-manager/pages/dsr/SalesManagerMyDSRListPage"));
const SalesManagerTeamDSRListPage = lazy(
  () => import("../sales-manager/pages/dsr/SalesManagerTeamDSRListPage"),
);
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
        BACKEND_ROLES.SALES_MANAGER,
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
          path: ROUTES.SALES_MANAGER.REGIONS,
          element: withPermission(PERMISSIONS.REGION_READ, <SalesManagerRegionListPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.DISTRICTS,
          element: withPermission(PERMISSIONS.DISTRICT_READ, <SalesManagerDistrictListPage />),
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
          path: ROUTES.SALES_MANAGER.HIRING,
          element: withPermission(PERMISSIONS.HIRING_READ, <SalesManagerHiringListPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.PROMOTION_APPROVALS,
          element: withPermission(PERMISSIONS.PROMOTION_READ, <SalesManagerPromotionApprovalsPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.SALARY_PROPOSAL_APPROVALS,
          element: withPermission(PERMISSIONS.SALARY_PROPOSAL_READ, <SalesManagerSalaryProposalApprovalsPage />),
        },
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
          path: ROUTES.SALES_MANAGER.ORDER_DETAIL,
          element: withPermission(PERMISSIONS.ORDERS_READ, <SalesManagerOrderDetailPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.ORDER_PRINT,
          element: withPermission(PERMISSIONS.ORDERS_READ, <SalesManagerOrderPrintPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.INVOICES,
          element: withPermission(PERMISSIONS.INVOICES_READ, <SalesManagerInvoiceListPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.INVOICE_OUTSTANDING,
          element: withPermission(PERMISSIONS.INVOICES_READ, <SalesManagerInvoiceOutstandingPage />),
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
          element: withPermission(PERMISSIONS.PAYMENTS_READ, <SalesManagerPaymentListPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.DSR_SUBMIT,
          element: withPermission(PERMISSIONS.DSR_CREATE, <SalesManagerDSRSubmitPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.DSR_ME,
          element: withPermission(PERMISSIONS.DSR_READ_SELF, <SalesManagerMyDSRListPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.DSR_TEAM,
          element: withPermission(PERMISSIONS.DSR_READ_TEAM, <SalesManagerTeamDSRListPage />),
        },
        {
          path: ROUTES.SALES_MANAGER.PRODUCT_RECOMMENDATIONS,
          element: withPermission(PERMISSIONS.PRODUCTS_READ, <SalesManagerProductRecommendationsPage />),
        },
        { path: "/manager/*", element: <InternalNotFoundPage /> },
      ],
    },
  ],
};
