import { ROUTES } from "../../../shared/constants";
import { OrderListView } from "../../../features/orders";

export default function EmployeeOrderListPage() {
  return (
    <OrderListView
      detailPath={(order) => `${ROUTES.EMPLOYEE.ORDERS}/${order._id}`}
      roleLabel="Employee CRM"
      subtitle="Orders tied to your own assigned leads. Read-only."
      title="Orders"
    />
  );
}
