import { ROUTES } from "../../../shared/constants";
import { InvoicePrintRouteView } from "../../../features/invoices";

export default function SuperAdminInvoicePrintPage() {
  return <InvoicePrintRouteView backTo={ROUTES.SUPER_ADMIN.INVOICES} />;
}
