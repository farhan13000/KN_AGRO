import { ROUTES } from "../../../shared/constants";
import { OrderListView } from "../../../features/orders";

export default function EmployeeOrderListPage() {
  return (
    <OrderListView
      createPath={ROUTES.EMPLOYEE.ORDER_CREATE}
      detailPath={(order) => `${ROUTES.EMPLOYEE.ORDERS}/${order._id}`}
      roleLabel="Employee CRM"
      subtitle="Orders tied to your own assigned leads. Take a new one here; a manager confirms and bills it."
      title="Orders"
    />
  );
}
