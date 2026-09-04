import { ROUTES } from "../../../shared/constants";
import { InvoiceDetailRouteView } from "../../../features/invoices";

export default function SalesManagerInvoiceDetailPage() {
  return (
    <InvoiceDetailRouteView
      backTo={ROUTES.SALES_MANAGER.INVOICES}
      customerDetailPathFor={(customer) => `${ROUTES.SALES_MANAGER.CUSTOMERS}/${customer._id}`}
      orderDetailPathFor={(order) => `${ROUTES.SALES_MANAGER.ORDERS}/${order._id}`}
      printPathFor={(invoice) => `${ROUTES.SALES_MANAGER.INVOICES}/${invoice._id}/print`}
      roleLabel="Manager CRM"
    />
  );
}
