import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import EmployeeInvoiceListPage from "../invoices/EmployeeInvoiceListPage";
import EmployeeInvoiceOutstandingPage from "../invoices/EmployeeInvoiceOutstandingPage";
import EmployeePaymentListPage from "../payments/EmployeePaymentListPage";

/** Invoices, what is still owed on them, and what has been collected. */
const TABS = [
  {
    id: "invoices",
    label: "Invoices",
    permission: PERMISSIONS.INVOICES_READ,
    blurb: "Invoices raised against the leads assigned to you.",
    render: () => <EmployeeInvoiceListPage showHeading={false} />,
  },
  {
    id: "outstanding",
    label: "Outstanding",
    permission: PERMISSIONS.INVOICES_READ,
    blurb: "What is still owed, soonest-due first.",
    render: () => <EmployeeInvoiceOutstandingPage showHeading={false} />,
  },
  {
    id: "payments",
    label: "Payments",
    permission: PERMISSIONS.PAYMENTS_READ,
    blurb: "Payments recorded against those invoices.",
    render: () => <EmployeePaymentListPage showHeading={false} />,
  },
];

export default function EmployeeBillingPage() {
  return (
    <TabbedWorkspace
      description="Invoices, outstanding balances and payments."
      emptyDescription="You do not have permission to view billing."
      emptyTitle="No billing access"
      eyebrow="Employee CRM"
      tabs={TABS}
      title="Billing"
    />
  );
}
