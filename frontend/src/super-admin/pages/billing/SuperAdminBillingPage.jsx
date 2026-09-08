import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SuperAdminInvoiceListPage from "../invoices/SuperAdminInvoiceListPage";
import SuperAdminInvoiceOutstandingPage from "../invoices/SuperAdminInvoiceOutstandingPage";
import SuperAdminPaymentListPage from "../payments/SuperAdminPaymentListPage";

/**
 * Invoices, what is still owed on them, and what has been collected --
 * three views of one ledger, which is why they are one screen. Chasing a
 * payment used to mean walking between three sidebar entries.
 */
const TABS = [
  {
    id: "invoices",
    label: "Invoices",
    permission: PERMISSIONS.INVOICES_READ,
    blurb: "Invoices generated from orders, with payment status and search.",
    render: () => <SuperAdminInvoiceListPage showHeading={false} />,
  },
  {
    id: "outstanding",
    label: "Outstanding",
    permission: PERMISSIONS.INVOICES_READ,
    blurb: "Backend-aggregated receivables, listed soonest-due first.",
    render: () => <SuperAdminInvoiceOutstandingPage showHeading={false} />,
  },
  {
    id: "payments",
    label: "Payments",
    permission: PERMISSIONS.PAYMENTS_READ,
    blurb: "Every payment recorded against an invoice.",
    render: () => <SuperAdminPaymentListPage showHeading={false} />,
  },
];

export default function SuperAdminBillingPage() {
  return (
    <TabbedWorkspace
      description="Invoices, outstanding balances and payments in one ledger."
      emptyDescription="You do not have permission to view billing."
      emptyTitle="No billing access"
      eyebrow="CRM"
      tabs={TABS}
      title="Billing"
    />
  );
}
