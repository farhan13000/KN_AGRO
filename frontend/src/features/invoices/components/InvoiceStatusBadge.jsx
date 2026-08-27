import Badge from "../../../shared/components/Badge";
import { INVOICE_STATUS } from "../constants";
import { formatInvoiceStatus } from "../utils";

const statusClasses = {
  [INVOICE_STATUS.DRAFT]: "bg-slate-100 text-slate-800 ring-slate-200",
  [INVOICE_STATUS.ISSUED]: "bg-blue-50 text-blue-800 ring-blue-200",
  [INVOICE_STATUS.CANCELLED]: "bg-red-50 text-red-800 ring-red-200",
};

const badgeClass = (status) =>
  `rounded-md ring-1 ${statusClasses[status] || "bg-white text-muted ring-forest/15"}`;

export default function InvoiceStatusBadge({ status }) {
  return <Badge className={badgeClass(status)}>{formatInvoiceStatus(status)}</Badge>;
}
