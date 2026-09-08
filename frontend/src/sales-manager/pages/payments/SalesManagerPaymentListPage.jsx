import { ROUTES } from "../../../shared/constants";
import { PaymentListView } from "../../../features/payments";

export default function SalesManagerPaymentListPage({ showHeading = true }) {
  return (
    <PaymentListView
      invoiceDetailPathFor={(invoiceId) => `${ROUTES.SALES_MANAGER.INVOICES}/${invoiceId}`}
      roleLabel="Manager CRM"
      showHeading={showHeading}
    />
  );
}
