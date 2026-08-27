import { formatBusinessDateTime } from "../../../shared/utils";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import { formatInvoiceAmount } from "../utils";

// Purely arithmetic, derived only from the two amounts this print DTO
// already carries (paidAmount/dueAmount) — never a reimplementation of the
// backend's own date-aware OVERDUE state machine (serializeInvoicePrintView
// doesn't return paymentStatus at all, on purpose: a printed document
// showing "Overdue" would go stale the moment a day passes, so this only
// ever shows the three states derivable from amounts alone). Plain text,
// not a colored badge — never presented as if it were the authoritative
// Invoice.paymentStatus enum value.
const paymentLabel = ({ dueAmount, paidAmount }) => {
  if (Number(dueAmount) <= 0) return "Paid in full";
  if (Number(paidAmount) > 0) return "Partially paid";
  return "Unpaid";
};

// Renders the backend's dedicated print DTO (`GET /invoices/:id/print`),
// not the regular detail response — narrower and different shape (no
// `_id`, adds a `company` letterhead block, drops internal/audit fields).
// Every value is still the backend snapshot — items/addresses are the same
// frozen fields the regular detail page shows, never a live Product/
// Customer re-fetch.
export default function InvoicePrintView({ invoice }) {
  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-ink print:max-w-none print:p-0">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-ink/80 pb-6">
        <div>
          <h1 className="text-2xl font-black">{invoice.company?.name || "KN Agro"}</h1>
          {invoice.company?.address ? (
            <p className="mt-1 max-w-xs whitespace-pre-line text-sm text-muted">{invoice.company.address}</p>
          ) : null}
          <p className="mt-1 text-sm text-muted">
            {[invoice.company?.phone, invoice.company?.email].filter(Boolean).join(" · ")}
          </p>
          {invoice.company?.gstin ? <p className="mt-1 text-xs text-muted">GSTIN: {invoice.company.gstin}</p> : null}
        </div>
        <div className="text-right">
          <h2 className="text-xl font-black uppercase tracking-wide">Invoice</h2>
          <p className="mt-1 text-sm font-bold">{invoice.invoiceNumber}</p>
          <p className="mt-1 text-xs text-muted">Date: {formatBusinessDateTime(invoice.invoiceDate)}</p>
          <p className="mt-1 text-xs text-muted">Due: {formatBusinessDateTime(invoice.dueDate)}</p>
          <div className="mt-2 flex justify-end">
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Customer</p>
          <p className="mt-1 text-sm font-bold text-ink">{invoice.customer?.name || "Not Set"}</p>
          {invoice.customer?.companyName ? (
            <p className="text-sm text-muted">{invoice.customer.companyName}</p>
          ) : null}
          <p className="text-sm text-muted">
            {[invoice.customer?.phone, invoice.customer?.email].filter(Boolean).join(" · ") || "Not Set"}
          </p>
          {invoice.customer?.gstNumber ? (
            <p className="text-xs text-muted">GSTIN: {invoice.customer.gstNumber}</p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Billing Address</p>
            <p className="mt-1 whitespace-pre-line text-sm text-ink">
              {[
                invoice.billingAddress?.line1,
                invoice.billingAddress?.line2,
                [invoice.billingAddress?.city, invoice.billingAddress?.state, invoice.billingAddress?.postalCode]
                  .filter(Boolean)
                  .join(", "),
                invoice.billingAddress?.country,
              ]
                .filter(Boolean)
                .join("\n") || "Not Set"}
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Shipping Address</p>
            <p className="mt-1 whitespace-pre-line text-sm text-ink">
              {[
                invoice.shippingAddress?.line1,
                invoice.shippingAddress?.line2,
                [invoice.shippingAddress?.city, invoice.shippingAddress?.state, invoice.shippingAddress?.postalCode]
                  .filter(Boolean)
                  .join(", "),
                invoice.shippingAddress?.country,
              ]
                .filter(Boolean)
                .join("\n") || "Not Set"}
            </p>
          </div>
        </div>
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
          {(invoice.items || []).map((item, index) => (
            <tr className="border-b border-forest/15 align-top" key={`${item.productCode}-${index}`}>
              <td className="py-2 pr-2">
                <p className="font-bold">{item.productName || "Unnamed Product"}</p>
                <p className="text-xs text-muted">{item.productCode}</p>
              </td>
              <td className="py-2 pr-2 text-muted">{item.description || "-"}</td>
              <td className="py-2 pr-2 text-right">
                {item.quantity} {item.unit}
              </td>
              <td className="py-2 pr-2 text-right">{formatInvoiceAmount(item.rate)}</td>
              <td className="py-2 pr-2 text-right">{formatInvoiceAmount(item.discountAmount)}</td>
              <td className="py-2 pr-2 text-right">{item.taxRate ? `${item.taxRate}%` : "-"}</td>
              <td className="py-2 text-right font-bold">{formatInvoiceAmount(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs divide-y divide-forest/10">
          <div className="flex items-center justify-between py-1.5 text-sm">
            <span>Subtotal</span>
            <span>{formatInvoiceAmount(invoice.subtotal)}</span>
          </div>
          {Number(invoice.discountTotal) > 0 && (
            <div className="flex items-center justify-between py-1.5 text-sm text-muted">
              <span>Discount</span>
              <span>- {formatInvoiceAmount(invoice.discountTotal)}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-1.5 text-sm">
            <span>Tax</span>
            <span>{formatInvoiceAmount(invoice.taxTotal)}</span>
          </div>
          {Number(invoice.shippingCharge) > 0 && (
            <div className="flex items-center justify-between py-1.5 text-sm text-muted">
              <span>Shipping Charge</span>
              <span>{formatInvoiceAmount(invoice.shippingCharge)}</span>
            </div>
          )}
          {Number(invoice.otherCharges) > 0 && (
            <div className="flex items-center justify-between py-1.5 text-sm text-muted">
              <span>Other Charges</span>
              <span>{formatInvoiceAmount(invoice.otherCharges)}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-1.5 text-base font-black">
            <span>Grand Total</span>
            <span>{formatInvoiceAmount(invoice.grandTotal)}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 text-sm">
            <span>Paid</span>
            <span>{formatInvoiceAmount(invoice.paidAmount)}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 text-sm font-bold">
            <span>Due</span>
            <span>{formatInvoiceAmount(invoice.dueAmount)}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 text-sm">
            <span>Payment Status</span>
            <span className="font-semibold">{paymentLabel(invoice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
