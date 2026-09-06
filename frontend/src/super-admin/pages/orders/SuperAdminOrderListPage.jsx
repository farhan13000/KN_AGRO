import { ROUTES } from "../../../shared/constants";
import { OrderListView } from "../../../features/orders";

export default function SuperAdminOrderListPage() {
  return (
    <OrderListView
      createPath={ROUTES.SUPER_ADMIN.ORDER_CREATE}
      detailPath={(order) => `${ROUTES.SUPER_ADMIN.ORDERS}/${order._id}`}
      roleLabel="CRM"
      subtitle="Orders created from accepted quotations, with fulfillment status and search."
      title="Orders"
    />
  );
}
