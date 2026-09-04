import { ROUTES } from "../../../shared/constants";
import { PaymentListView } from "../../../features/payments";

export default function SuperAdminPaymentListPage() {
  return (
    <PaymentListView
      invoiceDetailPathFor={(invoiceId) => `${ROUTES.SUPER_ADMIN.INVOICES}/${invoiceId}`}
      roleLabel="CRM"
    />
  );
}
