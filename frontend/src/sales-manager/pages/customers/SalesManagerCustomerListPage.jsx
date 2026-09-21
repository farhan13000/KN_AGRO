import { ROUTES } from "../../../shared/constants";
import { CustomerListView } from "../../../features/customers";

export default function SalesManagerCustomerListPage() {
  return (
    <CustomerListView
      createPath={ROUTES.SALES_MANAGER.CUSTOMER_CREATE}
      detailPath={(customer) => `${ROUTES.SALES_MANAGER.CUSTOMERS}/${customer._id}`}
      roleLabel="Manager CRM"
      subtitle="Customers with status, type and search filters. The customer list is shared by the whole company."
      title="Customers"
    />
  );
}
