import { ROUTES } from "../../../shared/constants";
import { PaymentListView } from "../../../features/payments";

export default function SalesManagerPaymentListPage() {
  return (
    <PaymentListView
      invoiceDetailPathFor={(invoiceId) => `${ROUTES.SALES_MANAGER.INVOICES}/${invoiceId}`}
      roleLabel="Manager CRM"
    />
  );
}
