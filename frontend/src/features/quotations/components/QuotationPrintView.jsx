import DocumentLetterhead from "../../../shared/components/DocumentLetterhead";
import PrintWatermark from "../../../shared/components/PrintWatermark";
import LinePackSize from "../../products/components/LinePackSize";
import { formatBusinessDateTime, formatDocumentMoney } from "../../../shared/utils";
import QuotationAmountSummary from "./QuotationAmountSummary";
import QuotationStatusBadge from "./QuotationStatusBadge";
import { UNBREAKABLE_DISCOUNT_SEPARATOR, formatQuotationItemDiscount } from "../utils";

// Renders the backend's dedicated print DTO (`GET /quotations/:id/print`),
// not the regular detail response — it has a deliberately different, wider
// shape than QuotationItemTable's props (no `_id`, no `lineSubtotal`), so
// it is not reused here. Every value is still the backend snapshot, never
// a live Product lookup.
export default function QuotationPrintView({ quotation }) {
  return (
    <div className="relative mx-auto max-w-3xl bg-white p-4 text-ink sm:p-8 print:max-w-none print:p-0" data-print-sheet>
      <PrintWatermark />
      <div className="relative">
      <DocumentLetterhead
        company={quotation.company}
        documentNumber={quotation.quotationNumber}
        meta={[
          { label: "Date", value: formatBusinessDateTime(quotation.quotationDate) },
          { label: "Valid Until", value: formatBusinessDateTime(quotation.validUntil) },
        ]}
        status={<QuotationStatusBadge status={quotation.status} />}
        title="Quotation"
      />

      <div className="mt-6">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Customer</p>
        <p className="mt-1 text-sm font-bold text-ink">{quotation.customer?.name || "Not Set"}</p>
        {quotation.customer?.companyName ? (
          <p className="text-sm text-muted">{quotation.customer.companyName}</p>
        ) : null}
        <p className="text-sm text-muted">
          {[quotation.customer?.phone, quotation.customer?.email, quotation.customer?.location]
            .filter(Boolean)
            .join(" · ") || "Not Set"}
        </p>
      </div>

      {/* `doc-items` (index.css) caps Description and keeps every amount
          on one line, so a long description cannot squeeze the numbers.
          Discount is left free to wrap here: "10% (- ₹55.00)" is a phrase,
          not a single figure. */}
      <table className="doc-table doc-items mt-6 w-full border-collapse text-sm">
        <colgroup>
          <col className="doc-col-product" />
          <col className="doc-col-desc" />
          <col span={5} />
        </colgroup>
        <thead>
          <tr className="border-b-2 border-ink/80 text-left text-xs font-black uppercase">
            <th className="py-2 pr-2">Product</th>
            <th className="py-2 pr-2">Description</th>
            <th className="doc-num py-2 pr-2 text-right">Qty</th>
            <th className="doc-num py-2 pr-2 text-right">Rate</th>
            <th className="doc-num py-2 pr-2 text-right">Discount</th>
            <th className="doc-num py-2 pr-2 text-right">Tax</th>
            <th className="doc-num py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {(quotation.items || []).map((item, index) => (
            <tr className="border-b border-forest/15 align-top" key={`${item.productCode}-${index}`}>
              <td className="doc-cell-title py-2 pr-2">
                <p className="font-bold">{item.productName || "Unnamed Product"}</p>
                <p className="text-xs text-muted">{item.productCode}</p>
              </td>
              <td className="doc-desc py-2 pr-2 text-muted">
                <span className="doc-label">Description</span>
                {item.description || "-"}
              </td>
              <td className="doc-num py-2 pr-2 text-right">
                <span className="doc-label">Qty</span>
                {/* One wrapper, so the pack-size lines stack under the
                    quantity in the phone card layout too. */}
                <span>
                  {item.quantity} {item.unit}
                  <LinePackSize packSize={item.packSize} quantity={item.quantity} />
                </span>
              </td>
              <td className="doc-num py-2 pr-2 text-right">
                <span className="doc-label">Rate</span>
                {formatDocumentMoney(item.rate)}
              </td>
              <td className="py-2 pr-2 text-right">
                <span className="doc-label">Discount</span>
                {formatQuotationItemDiscount(item, formatDocumentMoney, UNBREAKABLE_DISCOUNT_SEPARATOR)}
              </td>
              <td className="doc-num py-2 pr-2 text-right">
                <span className="doc-label">Tax</span>
                {item.taxRate ? `${item.taxRate}%` : "-"}
              </td>
              <td className="doc-num py-2 text-right font-bold">
                <span className="doc-label">Total</span>
                {formatDocumentMoney(item.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs">
          <QuotationAmountSummary formatAmount={formatDocumentMoney} quotation={quotation} />
        </div>
      </div>

      {quotation.termsAndConditions ? (
        <div className="mt-6">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Terms &amp; Conditions</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{quotation.termsAndConditions}</p>
        </div>
      ) : null}
      {quotation.notes ? (
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{quotation.notes}</p>
        </div>
      ) : null}
      </div>
    </div>
  );
}
