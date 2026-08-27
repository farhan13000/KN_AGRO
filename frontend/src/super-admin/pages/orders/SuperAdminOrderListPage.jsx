import { ROUTES } from "../../../shared/constants";
import { OrderListView } from "../../../features/orders";

export default function SuperAdminOrderListPage() {
  return (
    <OrderListView
      detailPath={(order) => `${ROUTES.SUPER_ADMIN.ORDERS}/${order._id}`}
      roleLabel="CRM"
      subtitle="Orders created from accepted quotations, with fulfillment status and search."
      title="Orders"
    />
  );
}
