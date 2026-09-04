import { ROUTES } from "../../../shared/constants";
import { CustomerListView } from "../../../features/customers";

export default function SalesManagerCustomerListPage() {
  return (
    <CustomerListView
      createPath={ROUTES.SALES_MANAGER.CUSTOMER_CREATE}
      detailPath={(customer) => `${ROUTES.SALES_MANAGER.CUSTOMERS}/${customer._id}`}
      roleLabel="Manager CRM"
      subtitle="View all customers with status, type, and search filters. Customer records are unscoped shared master data."
      title="Customers"
    />
  );
}
