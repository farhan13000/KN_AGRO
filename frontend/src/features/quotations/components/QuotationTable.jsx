import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { DataTable, rowActionClass } from "../../../shared/components";
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
  const columns = [
    {
      key: "quotationNumber",
      header: "Quotation Number",
      role: "title",
      cellClassName: "font-black text-forest",
      cell: (quotation) => quotation.quotationNumber,
    },
    {
      key: "lead",
      header: "Lead",
      cellClassName: "text-ink",
      cell: (quotation) => quotation.lead?.name || "Not Set",
    },
    {
      key: "company",
      header: "Company",
      cellClassName: "text-muted",
      cell: (quotation) => quotation.lead?.companyName || "Not Set",
    },
    {
      key: "status",
      header: "Status",
      role: "badge",
      cell: (quotation) => (
        <>
          <QuotationStatusBadge status={quotation.status} />
          {isLikelyOverdue(quotation) ? (
            <p className="mt-1 text-xs font-semibold text-amber-700">Validity passed</p>
          ) : null}
        </>
      ),
    },
    {
      key: "grandTotal",
      header: "Grand Total",
      align: "right",
      cellClassName: "font-bold text-ink",
      cell: (quotation) => formatQuotationAmount(quotation.grandTotal),
    },
    {
      key: "createdBy",
      header: "Created By",
      cellClassName: "text-muted",
      cell: (quotation) => quotation.createdBy?.name || "Not Set",
    },
    {
      key: "createdAt",
      header: "Created At",
      cellClassName: "text-muted",
      cell: (quotation) => formatBusinessDateTime(quotation.createdAt),
    },
    {
      key: "validUntil",
      header: "Validity",
      cellClassName: "text-muted",
      cell: (quotation) => formatBusinessDateTime(quotation.validUntil),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      role: "actions",
      cell: (quotation) => (
        <div className="flex justify-end">
          <Link
            aria-label={`View ${quotation.quotationNumber}`}
            className={rowActionClass}
            to={detailPath(quotation)}
          >
            <Eye className="h-4 w-4" />
            <span className="md:sr-only">View</span>
          </Link>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} minWidth="1060px" rows={quotations} />;
}
