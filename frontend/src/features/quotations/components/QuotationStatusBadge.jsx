import Badge from "../../../shared/components/Badge";
import { QUOTATION_STATUS } from "../constants";
import { formatQuotationStatus } from "../utils";

const statusClasses = {
  [QUOTATION_STATUS.DRAFT]: "bg-slate-100 text-slate-800 ring-slate-200",
  [QUOTATION_STATUS.SENT]: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  [QUOTATION_STATUS.ACCEPTED]: "bg-green-50 text-green-800 ring-green-200",
  [QUOTATION_STATUS.REJECTED]: "bg-red-50 text-red-800 ring-red-200",
  [QUOTATION_STATUS.EXPIRED]: "bg-amber-50 text-amber-900 ring-amber-200",
  [QUOTATION_STATUS.CONVERTED]: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  [QUOTATION_STATUS.CANCELLED]: "bg-stone-100 text-stone-800 ring-stone-200",
};

const badgeClass = (status) =>
  `rounded-md ring-1 ${statusClasses[status] || "bg-white text-muted ring-forest/15"}`;

export default function QuotationStatusBadge({ status }) {
  return <Badge className={badgeClass(status)}>{formatQuotationStatus(status)}</Badge>;
}
