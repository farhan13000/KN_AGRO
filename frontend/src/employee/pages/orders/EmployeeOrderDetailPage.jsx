import { ROUTES } from "../../../shared/constants";
import { OrderDetailRouteView } from "../../../features/orders";

export default function EmployeeOrderDetailPage() {
  return (
    <OrderDetailRouteView
      backTo={ROUTES.EMPLOYEE.ORDERS}
      customerDetailPathFor={(customer) => `${ROUTES.EMPLOYEE.CUSTOMERS}/${customer._id}`}
      invoiceDetailPathFor={(invoice) => `${ROUTES.EMPLOYEE.INVOICES}/${invoice._id}`}
      printPathFor={(order) => `${ROUTES.EMPLOYEE.ORDERS}/${order._id}/print`}
      quotationDetailPathFor={(quotation) => `${ROUTES.EMPLOYEE.QUOTATIONS}/${quotation._id}`}
      roleLabel="Employee CRM"
    />
  );
}
