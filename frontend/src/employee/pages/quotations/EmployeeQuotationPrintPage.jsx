import { ROUTES } from "../../../shared/constants";
import { QuotationPrintRouteView } from "../../../features/quotations";

export default function EmployeeQuotationPrintPage() {
  return <QuotationPrintRouteView backTo={ROUTES.EMPLOYEE.QUOTATIONS} />;
}
