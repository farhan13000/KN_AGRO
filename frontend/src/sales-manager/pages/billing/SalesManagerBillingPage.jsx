import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SalesManagerInvoiceListPage from "../invoices/SalesManagerInvoiceListPage";
import SalesManagerInvoiceOutstandingPage from "../invoices/SalesManagerInvoiceOutstandingPage";
import SalesManagerPaymentListPage from "../payments/SalesManagerPaymentListPage";

/** Invoices, what is still owed on them, and what has been collected. */
const TABS = [
  {
    id: "invoices",
    label: "Invoices",
    permission: PERMISSIONS.INVOICES_READ,
    blurb: "Invoices generated from orders, with payment status and search.",
    render: () => <SalesManagerInvoiceListPage showHeading={false} />,
  },
  {
    id: "outstanding",
    label: "Outstanding",
    permission: PERMISSIONS.INVOICES_READ,
    blurb: "Backend-aggregated receivables, listed soonest-due first.",
    render: () => <SalesManagerInvoiceOutstandingPage showHeading={false} />,
  },
  {
    id: "payments",
    label: "Payments",
    permission: PERMISSIONS.PAYMENTS_READ,
    blurb: "Every payment recorded against an invoice.",
    render: () => <SalesManagerPaymentListPage showHeading={false} />,
  },
];

export default function SalesManagerBillingPage() {
  return (
    <TabbedWorkspace
      description="Invoices, outstanding balances and payments in one ledger."
      emptyDescription="You do not have permission to view billing."
      emptyTitle="No billing access"
      eyebrow="Manager CRM"
      tabs={TABS}
      title="Billing"
    />
  );
}
