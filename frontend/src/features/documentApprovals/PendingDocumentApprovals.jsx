import { useMemo } from "react";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../core/auth";
import { DataTable, EmptyState, ErrorState, PageLoader, rowActionClass } from "../../shared/components";
import { PERMISSIONS } from "../../shared/constants";
import { formatBusinessDateTime } from "../../shared/utils";
// Narrow subpath imports, not the two feature root barrels: this needs
// four names, not the whole Quotations and Invoices UI graphs pulled into
// the Approvals bundle. Same reasoning as
// InvoicePaymentHistoryTable's own import note.
import { INVOICE_STATUS } from "../invoices/constants";
import { useInvoiceList } from "../invoices/hooks";
import { formatInvoiceAmount } from "../invoices/utils";
import { QUOTATION_STATUS } from "../quotations/constants";
import { useQuotationList } from "../quotations/hooks";
import { formatQuotationAmount } from "../quotations/utils";

/**
 * Everything a manager has prepared and is waiting on the owner to
 * release — quotations and bills together, because from the Super
 * Admin's side they are one job: read it, then say yes or send it back.
 *
 * DECIDING HAPPENS ON THE DOCUMENT, not here. A queue can show a total
 * and a customer name, but approving a quotation without having read its
 * line items is exactly the rubber-stamping this gate exists to prevent,
 * so each row opens the document, where the Approve / Send-back panel
 * lives. That also means there is one implementation of the decision, not
 * a second copy that could drift from the first.
 *
 * Both lists are pinned to PENDING_APPROVAL rather than reading the URL,
 * so this queue cannot be filtered into showing something that is not
 * actually waiting.
 */
const PENDING_QUERY = Object.freeze({ page: 1, limit: 50, sortBy: "createdAt", sortOrder: "asc" });

function Section({ children, count, description, title }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-black text-ink">
          {title}
          {count ? <span className="ml-2 text-sm font-bold text-muted">({count})</span> : null}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function PendingDocumentApprovals({ invoiceDetailPath, quotationDetailPath }) {
  const { hasPermission } = useAuth();
  const canApproveQuotations = hasPermission(PERMISSIONS.QUOTATIONS_APPROVE);
  const canApproveInvoices = hasPermission(PERMISSIONS.INVOICES_APPROVE);

  const quotationQuery = useMemo(
    () => ({ ...PENDING_QUERY, status: QUOTATION_STATUS.PENDING_APPROVAL }),
    []
  );
  const invoiceQuery = useMemo(() => ({ ...PENDING_QUERY, status: INVOICE_STATUS.PENDING_APPROVAL }), []);

  const quotationsState = useQuotationList(quotationQuery, { enabled: canApproveQuotations });
  const invoicesState = useInvoiceList(invoiceQuery, { enabled: canApproveInvoices });

  const quotations = quotationsState.data?.quotations || [];
  const invoices = invoicesState.data?.invoices || [];

  const isLoading = quotationsState.isLoading || invoicesState.isLoading;
  if (isLoading) return <PageLoader message="Loading what is waiting for you..." />;

  if (quotationsState.isError || invoicesState.isError) {
    return (
      <ErrorState
        message={quotationsState.errorMessage || invoicesState.errorMessage}
        title="Unable to load pending documents"
      />
    );
  }

  const waitingSince = (row) => formatBusinessDateTime(row.approval?.requestedAt || row.updatedAt);
  const preparedBy = (row) => row.approval?.requestedBy?.name || row.createdBy?.name || "Not Set";

  const quotationColumns = [
    {
      key: "quotationNumber",
      header: "Quotation",
      role: "title",
      cellClassName: "font-black text-forest",
      cell: (row) => row.quotationNumber,
    },
    { key: "lead", header: "Lead", cellClassName: "text-ink", cell: (row) => row.lead?.name || "Not Set" },
    {
      key: "company",
      header: "Company",
      cellClassName: "text-muted",
      cell: (row) => row.lead?.companyName || "Not Set",
    },
    {
      key: "grandTotal",
      header: "Grand Total",
      align: "right",
      cellClassName: "font-bold text-ink",
      cell: (row) => formatQuotationAmount(row.grandTotal),
    },
    { key: "preparedBy", header: "Prepared By", cellClassName: "text-muted", cell: preparedBy },
    { key: "waiting", header: "Waiting Since", cellClassName: "text-muted", cell: waitingSince },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      role: "actions",
      cell: (row) => (
        <div className="flex justify-end">
          <Link
            aria-label={`Review ${row.quotationNumber}`}
            className={rowActionClass}
            to={quotationDetailPath(row)}
          >
            <Eye className="h-4 w-4" />
            <span className="md:sr-only">Review</span>
          </Link>
        </div>
      ),
    },
  ];

  const invoiceColumns = [
    {
      key: "invoiceNumber",
      header: "Invoice",
      role: "title",
      cellClassName: "font-black text-forest",
      cell: (row) => row.invoiceNumber,
    },
    {
      key: "customer",
      header: "Customer",
      cellClassName: "text-ink",
      cell: (row) => row.customer?.name || "Not Set",
    },
    {
      key: "order",
      header: "Order",
      cellClassName: "text-muted",
      cell: (row) => row.order?.orderNumber || "Not Set",
    },
    {
      key: "grandTotal",
      header: "Grand Total",
      align: "right",
      cellClassName: "font-bold text-ink",
      cell: (row) => formatInvoiceAmount(row.grandTotal),
    },
    { key: "preparedBy", header: "Prepared By", cellClassName: "text-muted", cell: preparedBy },
    { key: "waiting", header: "Waiting Since", cellClassName: "text-muted", cell: waitingSince },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      role: "actions",
      cell: (row) => (
        <div className="flex justify-end">
          <Link aria-label={`Review ${row.invoiceNumber}`} className={rowActionClass} to={invoiceDetailPath(row)}>
            <Eye className="h-4 w-4" />
            <span className="md:sr-only">Review</span>
          </Link>
        </div>
      ),
    },
  ];

  if (!quotations.length && !invoices.length) {
    return (
      <EmptyState
        description="Nothing is waiting on you right now. Quotations and bills prepared by a manager appear here before they reach the customer."
        title="All clear"
      />
    );
  }

  return (
    <div className="space-y-8">
      {canApproveQuotations ? (
        <Section
          count={quotations.length}
          description="Prepared and ready to send. Open one to read its items, then approve it or send it back with a note."
          title="Quotations waiting"
        >
          {quotations.length ? (
            <DataTable columns={quotationColumns} minWidth="900px" rows={quotations} />
          ) : (
            <p className="text-sm text-muted">No quotations are waiting.</p>
          )}
        </Section>
      ) : null}

      {canApproveInvoices ? (
        <Section
          count={invoices.length}
          description="Bills ready to be issued. Open one to check the amount and dates, then approve it or send it back."
          title="Bills waiting"
        >
          {invoices.length ? (
            <DataTable columns={invoiceColumns} minWidth="900px" rows={invoices} />
          ) : (
            <p className="text-sm text-muted">No bills are waiting.</p>
          )}
        </Section>
      ) : null}
    </div>
  );
}
