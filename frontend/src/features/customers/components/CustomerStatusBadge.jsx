import Badge from "../../../shared/components/Badge";
import { CUSTOMER_STATUS } from "../constants";
import { formatCustomerStatus } from "../utils";

const statusClasses = {
  [CUSTOMER_STATUS.ACTIVE]: "bg-green-50 text-green-800 ring-green-200",
  [CUSTOMER_STATUS.INACTIVE]: "bg-slate-100 text-slate-800 ring-slate-200",
  [CUSTOMER_STATUS.BLOCKED]: "bg-red-50 text-red-800 ring-red-200",
};

const badgeClass = (status) =>
  `rounded-md ring-1 ${statusClasses[status] || "bg-white text-muted ring-forest/15"}`;

export default function CustomerStatusBadge({ status }) {
  return <Badge className={badgeClass(status)}>{formatCustomerStatus(status)}</Badge>;
}
