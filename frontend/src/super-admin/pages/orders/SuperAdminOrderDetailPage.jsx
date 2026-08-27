import { ROUTES } from "../../../shared/constants";
import { OrderDetailRouteView } from "../../../features/orders";

export default function SuperAdminOrderDetailPage() {
  return (
    <OrderDetailRouteView
      backTo={ROUTES.SUPER_ADMIN.ORDERS}
      customerDetailPathFor={(customer) => `${ROUTES.SUPER_ADMIN.CUSTOMERS}/${customer._id}`}
      invoiceDetailPathFor={(invoice) => `${ROUTES.SUPER_ADMIN.INVOICES}/${invoice._id}`}
      printPathFor={(order) => `${ROUTES.SUPER_ADMIN.ORDERS}/${order._id}/print`}
      quotationDetailPathFor={(quotation) => `${ROUTES.SUPER_ADMIN.QUOTATIONS}/${quotation._id}`}
      roleLabel="CRM"
    />
  );
}
