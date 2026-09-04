import { ROUTES } from "../../../shared/constants";
import { OrderDetailRouteView } from "../../../features/orders";

export default function SalesManagerOrderDetailPage() {
  return (
    <OrderDetailRouteView
      backTo={ROUTES.SALES_MANAGER.ORDERS}
      customerDetailPathFor={(customer) => `${ROUTES.SALES_MANAGER.CUSTOMERS}/${customer._id}`}
      invoiceDetailPathFor={(invoice) => `${ROUTES.SALES_MANAGER.INVOICES}/${invoice._id}`}
      printPathFor={(order) => `${ROUTES.SALES_MANAGER.ORDERS}/${order._id}/print`}
      quotationDetailPathFor={(quotation) => `${ROUTES.SALES_MANAGER.QUOTATIONS}/${quotation._id}`}
      roleLabel="Manager CRM"
    />
  );
}
