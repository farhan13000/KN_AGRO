import { ROUTES } from "../../../shared/constants";
import { QuotationDetailRouteView } from "../../../features/quotations";

// No `editPathFor` — Employee has no quotations.update permission, so
// getQuotationCapabilities().canEditQuotation is always false here anyway;
// omitting the prop keeps that intent visible at the page level too.
export default function EmployeeQuotationDetailPage() {
  return (
    <QuotationDetailRouteView
      backTo={ROUTES.EMPLOYEE.QUOTATIONS}
      detailPathFor={(quotation) => `${ROUTES.EMPLOYEE.QUOTATIONS}/${quotation._id}`}
      leadDetailPathFor={(lead) => `${ROUTES.EMPLOYEE.LEADS}/${lead._id}`}
      printPathFor={(quotation) => `${ROUTES.EMPLOYEE.QUOTATIONS}/${quotation._id}/print`}
      roleLabel="Employee CRM"
    />
  );
}
