import { Link } from "react-router-dom";
import { formatBusinessDateTime } from "../../../shared/utils";
import QuotationStatusBadge from "./QuotationStatusBadge";
import { QUOTATION_STATUS } from "../constants";

export default function QuotationHeader({ orderDetailPath = "", quotation, roleLabel = "CRM" }) {
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
          Accepted — ready for Order. Use the Create Order action below; this never happens automatically.
        </p>
      ) : null}
      {quotation.status === QUOTATION_STATUS.CONVERTED ? (
        <p className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          Converted into an Order.
          {orderDetailPath ? (
            <Link className="underline hover:no-underline" to={orderDetailPath}>
              View Order
            </Link>
          ) : null}
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
