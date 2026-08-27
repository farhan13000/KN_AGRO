import { ROUTES } from "../../../shared/constants";
import { InvoicePrintRouteView } from "../../../features/invoices";

export default function EmployeeInvoicePrintPage() {
  return <InvoicePrintRouteView backTo={ROUTES.EMPLOYEE.INVOICES} />;
}
