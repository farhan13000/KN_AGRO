import { ROUTES } from "../../../shared/constants";
import { PaymentListView } from "../../../features/payments";

export default function EmployeePaymentListPage() {
  return (
    <PaymentListView
      invoiceDetailPathFor={(invoiceId) => `${ROUTES.EMPLOYEE.INVOICES}/${invoiceId}`}
      roleLabel="Employee CRM"
      subtitle="Payments tied to your own assigned leads. Read-only."
    />
  );
}
