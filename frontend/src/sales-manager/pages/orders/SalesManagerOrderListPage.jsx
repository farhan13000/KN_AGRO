import { ROUTES } from "../../../shared/constants";
import { OrderListView } from "../../../features/orders";

export default function SalesManagerOrderListPage() {
  return (
    <OrderListView
      detailPath={(order) => `${ROUTES.SALES_MANAGER.ORDERS}/${order._id}`}
      roleLabel="Manager CRM"
      subtitle="Orders created from accepted quotations, with fulfillment status and search."
      title="Orders"
    />
  );
}
