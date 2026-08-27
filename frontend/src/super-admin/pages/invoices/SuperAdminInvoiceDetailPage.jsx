import { ROUTES } from "../../../shared/constants";
import { InvoiceDetailRouteView } from "../../../features/invoices";

export default function SuperAdminInvoiceDetailPage() {
  return (
    <InvoiceDetailRouteView
      backTo={ROUTES.SUPER_ADMIN.INVOICES}
      customerDetailPathFor={(customer) => `${ROUTES.SUPER_ADMIN.CUSTOMERS}/${customer._id}`}
      orderDetailPathFor={(order) => `${ROUTES.SUPER_ADMIN.ORDERS}/${order._id}`}
      printPathFor={(invoice) => `${ROUTES.SUPER_ADMIN.INVOICES}/${invoice._id}/print`}
      roleLabel="CRM"
    />
  );
}
