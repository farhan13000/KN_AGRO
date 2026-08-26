import { ROUTES } from "../../../shared/constants";
import { QuotationPrintRouteView } from "../../../features/quotations";

export default function SuperAdminQuotationPrintPage() {
  return <QuotationPrintRouteView backTo={ROUTES.SUPER_ADMIN.QUOTATIONS} />;
}
