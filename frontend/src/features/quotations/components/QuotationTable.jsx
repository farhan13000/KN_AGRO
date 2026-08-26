import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { formatBusinessDateTime } from "../../../shared/utils";
import QuotationStatusBadge from "./QuotationStatusBadge";
import { QUOTATION_STATUS } from "../constants";
import { formatQuotationAmount } from "../utils";

// Expiry is lazy on the backend — GET /quotations (the list) never triggers
// the SENT->EXPIRED flip, only touching one quotation individually does
// (see PHASE5_FRONTEND_API_CONTRACT.md). A stale SENT row past its
// validUntil is genuinely possible here. This only adds a muted hint next
// to the real, persisted status — it never repaints the badge itself as
// EXPIRED, since that would be treating a client-side guess as
// authoritative.
const isLikelyOverdue = (quotation) =>
  quotation.status === QUOTATION_STATUS.SENT &&
  quotation.validUntil &&
  new Date(quotation.validUntil).getTime() < Date.now();

export default function QuotationTable({ detailPath, quotations = [] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1060px] divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Quotation Number</th>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Grand Total</th>
              <th className="px-4 py-3">Created By</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3">Validity</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {quotations.map((quotation) => (
              <tr className="align-top transition hover:bg-mint/35" key={quotation._id}>
                <td className="px-4 py-3 font-black text-forest">{quotation.quotationNumber}</td>
                <td className="px-4 py-3 text-ink">{quotation.lead?.name || "Not Set"}</td>
                <td className="px-4 py-3 text-muted">{quotation.lead?.companyName || "Not Set"}</td>
                <td className="px-4 py-3">
                  <QuotationStatusBadge status={quotation.status} />
                  {isLikelyOverdue(quotation) ? (
                    <p className="mt-1 text-xs font-semibold text-amber-700">Validity passed</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right font-bold text-ink">
                  {formatQuotationAmount(quotation.grandTotal)}
                </td>
                <td className="px-4 py-3 text-muted">{quotation.createdBy?.name || "Not Set"}</td>
                <td className="px-4 py-3 text-muted">{formatBusinessDateTime(quotation.createdAt)}</td>
                <td className="px-4 py-3 text-muted">{formatBusinessDateTime(quotation.validUntil)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Link
                      aria-label={`View ${quotation.quotationNumber}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                      to={detailPath(quotation)}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
