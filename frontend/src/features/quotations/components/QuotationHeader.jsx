import { formatBusinessDateTime } from "../../../shared/utils";
import QuotationStatusBadge from "./QuotationStatusBadge";
import { QUOTATION_STATUS } from "../constants";

export default function QuotationHeader({ quotation, roleLabel = "CRM" }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{roleLabel}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-black text-ink">{quotation.quotationNumber || "Not Set"}</h1>
        <QuotationStatusBadge status={quotation.status} />
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        {quotation.lead?.name || "Unknown lead"} · Created by {quotation.createdBy?.name || "Unknown"} on{" "}
        {formatBusinessDateTime(quotation.createdAt)} · Valid until {formatBusinessDateTime(quotation.validUntil)}
      </p>
      {quotation.status === QUOTATION_STATUS.ACCEPTED ? (
        <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
          Accepted — Ready for Order. Order creation is not part of Phase 5 and does not happen automatically.
        </p>
      ) : null}
      {quotation.status === QUOTATION_STATUS.REJECTED && quotation.rejectionReason ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          Rejection reason: {quotation.rejectionReason}
        </p>
      ) : null}
      {quotation.status === QUOTATION_STATUS.CANCELLED && quotation.cancellationReason ? (
        <p className="mt-4 rounded-lg border border-stone-300 bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-800">
          Cancellation reason: {quotation.cancellationReason}
        </p>
      ) : null}
      {quotation.status === QUOTATION_STATUS.EXPIRED ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Expired without a response before its validity date. Revise it to create a new editable Draft.
        </p>
      ) : null}
    </div>
  );
}
