import { ROUTES } from "../../../shared/constants";
import { QuotationDetailRouteView } from "../../../features/quotations";

// No `editPathFor` — Employee has no quotations.update permission, so
// getQuotationCapabilities().canEditQuotation is always false here anyway;
// omitting the prop keeps that intent visible at the page level too. Same
// reasoning would apply to a Create Order button (no orders.create), but
// `orderDetailPathFor` is still passed — Employee holds orders.read, so
// once a quotation has already converted, the "View Order" link in the
// Converted-status hint should still work for them.
export default function EmployeeQuotationDetailPage() {
  return (
    <QuotationDetailRouteView
      backTo={ROUTES.EMPLOYEE.QUOTATIONS}
      detailPathFor={(quotation) => `${ROUTES.EMPLOYEE.QUOTATIONS}/${quotation._id}`}
      leadDetailPathFor={(lead) => `${ROUTES.EMPLOYEE.LEADS}/${lead._id}`}
      orderDetailPathFor={(order) => `${ROUTES.EMPLOYEE.ORDERS}/${order._id}`}
      printPathFor={(quotation) => `${ROUTES.EMPLOYEE.QUOTATIONS}/${quotation._id}/print`}
      roleLabel="Employee CRM"
    />
  );
}
