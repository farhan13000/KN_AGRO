import { ROUTES } from "../../../shared/constants";
import { InvoiceListView } from "../../../features/invoices";

export default function SuperAdminInvoiceListPage({ showHeading = true }) {
  return (
    <InvoiceListView
      detailPath={(invoice) => `${ROUTES.SUPER_ADMIN.INVOICES}/${invoice._id}`}
      roleLabel="CRM"
      showHeading={showHeading}
      subtitle="Invoices generated from orders, with payment status and search."
      title="Invoices"
    />
  );
}
