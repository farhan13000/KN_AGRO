import Badge from "../../../shared/components/Badge";
import { formatLeadPriority, formatLeadSource, formatLeadStatus } from "../utils";
import { LEAD_PRIORITY, LEAD_SOURCE, LEAD_STATUS } from "../constants";

const statusClasses = {
  [LEAD_STATUS.NEW]: "bg-blue-50 text-blue-800 ring-blue-200",
  [LEAD_STATUS.CONTACTED]: "bg-cyan-50 text-cyan-800 ring-cyan-200",
  [LEAD_STATUS.FOLLOW_UP]: "bg-amber-50 text-amber-800 ring-amber-200",
  [LEAD_STATUS.QUALIFIED]: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  [LEAD_STATUS.QUOTATION_SENT]: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  [LEAD_STATUS.NEGOTIATION]: "bg-violet-50 text-violet-800 ring-violet-200",
  [LEAD_STATUS.CONVERTED]: "bg-green-50 text-green-800 ring-green-200",
  [LEAD_STATUS.LOST]: "bg-red-50 text-red-800 ring-red-200",
  [LEAD_STATUS.CLOSED]: "bg-slate-100 text-slate-800 ring-slate-200",
};

const priorityClasses = {
  [LEAD_PRIORITY.LOW]: "bg-slate-100 text-slate-700 ring-slate-200",
  [LEAD_PRIORITY.MEDIUM]: "bg-blue-50 text-blue-800 ring-blue-200",
  [LEAD_PRIORITY.HIGH]: "bg-orange-50 text-orange-800 ring-orange-200",
  [LEAD_PRIORITY.URGENT]: "bg-red-50 text-red-800 ring-red-200",
};

const sourceClasses = {
  [LEAD_SOURCE.WEBSITE]: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  [LEAD_SOURCE.PHONE]: "bg-sky-50 text-sky-800 ring-sky-200",
  [LEAD_SOURCE.WHATSAPP]: "bg-green-50 text-green-800 ring-green-200",
  [LEAD_SOURCE.REFERRAL]: "bg-purple-50 text-purple-800 ring-purple-200",
  [LEAD_SOURCE.WALK_IN]: "bg-yellow-50 text-yellow-800 ring-yellow-200",
  [LEAD_SOURCE.MANUAL]: "bg-stone-100 text-stone-800 ring-stone-200",
  [LEAD_SOURCE.OTHER]: "bg-slate-100 text-slate-800 ring-slate-200",
};

const badgeClass = (classes, value) =>
  `rounded-md ring-1 ${classes[value] || "bg-white text-muted ring-forest/15"}`;

export const LeadStatusBadge = ({ status }) => (
  <Badge className={badgeClass(statusClasses, status)}>{formatLeadStatus(status)}</Badge>
);

export const LeadPriorityBadge = ({ priority }) => (
  <Badge className={badgeClass(priorityClasses, priority)}>{formatLeadPriority(priority)}</Badge>
);

export const LeadSourceBadge = ({ source }) => (
  <Badge className={badgeClass(sourceClasses, source)}>{formatLeadSource(source)}</Badge>
);
