import { ROUTES } from "../../../shared/constants";
import { PaymentListView } from "../../../features/payments";

export default function EmployeePaymentListPage({ showHeading = true }) {
  return (
    <PaymentListView
      invoiceDetailPathFor={(invoiceId) => `${ROUTES.EMPLOYEE.INVOICES}/${invoiceId}`}
      roleLabel="Employee CRM"
      showHeading={showHeading}
      subtitle="Payments tied to your own assigned leads. Read-only."
    />
  );
}
