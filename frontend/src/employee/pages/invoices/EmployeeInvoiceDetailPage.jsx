import { ROUTES } from "../../../shared/constants";
import { InvoiceDetailRouteView } from "../../../features/invoices";

export default function EmployeeInvoiceDetailPage() {
  return (
    <InvoiceDetailRouteView
      backTo={ROUTES.EMPLOYEE.INVOICES}
      customerDetailPathFor={(customer) => `${ROUTES.EMPLOYEE.CUSTOMERS}/${customer._id}`}
      orderDetailPathFor={(order) => `${ROUTES.EMPLOYEE.ORDERS}/${order._id}`}
      printPathFor={(invoice) => `${ROUTES.EMPLOYEE.INVOICES}/${invoice._id}/print`}
      roleLabel="Employee CRM"
    />
  );
}
