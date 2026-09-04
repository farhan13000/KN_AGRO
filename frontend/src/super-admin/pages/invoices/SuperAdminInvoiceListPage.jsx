import { ROUTES } from "../../../shared/constants";
import { InvoiceListView } from "../../../features/invoices";

export default function SuperAdminInvoiceListPage() {
  return (
    <InvoiceListView
      detailPath={(invoice) => `${ROUTES.SUPER_ADMIN.INVOICES}/${invoice._id}`}
      roleLabel="CRM"
      subtitle="Invoices generated from orders, with payment status and search."
      title="Invoices"
    />
  );
}
