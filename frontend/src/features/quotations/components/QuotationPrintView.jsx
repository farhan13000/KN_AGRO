import { formatBusinessDateTime } from "../../../shared/utils";
import QuotationAmountSummary from "./QuotationAmountSummary";
import QuotationStatusBadge from "./QuotationStatusBadge";
import { formatQuotationAmount, formatQuotationItemDiscount } from "../utils";

// Renders the backend's dedicated print DTO (`GET /quotations/:id/print`),
// not the regular detail response — it has a deliberately different, wider
// shape than QuotationItemTable's props (no `_id`, no `lineSubtotal`), so
// it is not reused here. Every value is still the backend snapshot, never
// a live Product lookup.
export default function QuotationPrintView({ quotation }) {
  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-ink print:max-w-none print:p-0">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-ink/80 pb-6">
        <div>
          <h1 className="text-2xl font-black">{quotation.company?.name || "KN Agro"}</h1>
          {quotation.company?.address ? (
            <p className="mt-1 max-w-xs whitespace-pre-line text-sm text-muted">{quotation.company.address}</p>
          ) : null}
          <p className="mt-1 text-sm text-muted">
            {[quotation.company?.phone, quotation.company?.email].filter(Boolean).join(" · ")}
          </p>
          {quotation.company?.gstin ? <p className="mt-1 text-xs text-muted">GSTIN: {quotation.company.gstin}</p> : null}
        </div>
        <div className="text-right">
          <h2 className="text-xl font-black uppercase tracking-wide">Quotation</h2>
          <p className="mt-1 text-sm font-bold">{quotation.quotationNumber}</p>
          <p className="mt-1 text-xs text-muted">Date: {formatBusinessDateTime(quotation.quotationDate)}</p>
          <p className="mt-1 text-xs text-muted">Valid Until: {formatBusinessDateTime(quotation.validUntil)}</p>
          <div className="mt-2 flex justify-end">
            <QuotationStatusBadge status={quotation.status} />
          </div>
        </div>
      </div>

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

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-ink/80 text-left text-xs font-black uppercase">
            <th className="py-2 pr-2">Product</th>
            <th className="py-2 pr-2">Description</th>
            <th className="py-2 pr-2 text-right">Qty</th>
            <th className="py-2 pr-2 text-right">Rate</th>
            <th className="py-2 pr-2 text-right">Discount</th>
            <th className="py-2 pr-2 text-right">Tax</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {(quotation.items || []).map((item, index) => (
            <tr className="border-b border-forest/15 align-top" key={`${item.productCode}-${index}`}>
              <td className="py-2 pr-2">
                <p className="font-bold">{item.productName || "Unnamed Product"}</p>
                <p className="text-xs text-muted">{item.productCode}</p>
              </td>
              <td className="py-2 pr-2 text-muted">{item.description || "-"}</td>
              <td className="py-2 pr-2 text-right">
                {item.quantity} {item.unit}
              </td>
              <td className="py-2 pr-2 text-right">{formatQuotationAmount(item.rate)}</td>
              <td className="py-2 pr-2 text-right">{formatQuotationItemDiscount(item)}</td>
              <td className="py-2 pr-2 text-right">{item.taxRate ? `${item.taxRate}%` : "-"}</td>
              <td className="py-2 text-right font-bold">{formatQuotationAmount(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs">
          <QuotationAmountSummary quotation={quotation} />
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
  );
}
