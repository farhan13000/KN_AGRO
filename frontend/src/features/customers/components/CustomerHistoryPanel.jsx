import { useState } from "react";
import Card from "../../../shared/components/Card";
import { formatBusinessDateTime } from "../../../shared/utils";
import { formatMoney } from "../../../shared/utils/money";
// Narrow subpath import — only the one constant is needed here, not the
// whole Invoices feature's components/hooks graph. Prompt 86 (Code Quality
// Audit): the raw string "PAID" was hardcoded here before this fix.
import { INVOICE_PAYMENT_STATUS } from "../../invoices/constants/invoice.constants";

const TABS = [
  { key: "orders", label: "Orders" },
  { key: "invoices", label: "Invoices" },
  { key: "payments", label: "Payments" },
  { key: "outstanding", label: "Outstanding" },
];

const Row = ({ children }) => (
  <div className="flex items-center justify-between gap-3 border-b border-forest/10 px-4 py-3 text-sm last:border-b-0">
    {children}
  </div>
);

// Takes the already-fetched `historyState` as a prop (the caller owns the
// single `useCustomerHistory` call, since it's also needed for the Source
// Lead section) rather than fetching it again here — one combined backend
// call serves both. That single lazy fetch — separate from the primary
// Customer fetch, so Identity/Contact/Address render immediately — is what
// "load tabs lazily" means in practice, since the backend serves all five
// sections (leads/quotations/orders/invoices/payments) from one endpoint,
// not one fetch per tab.
//
// CRITICAL: `history.orders/invoices/payments` are each `{ count, latest
// (max 5) }` — never a full list. The Outstanding tab below sums
// `dueAmount` only across `invoices.latest`, and is explicitly labeled as
// such — it must never be presented as a complete/authoritative
// Outstanding total, which is exactly what Prompt 20 forbids ("Do not
// calculate authoritative Outstanding using partial client datasets").
// The real, authoritative Outstanding Receivables view is its own future
// prompt (51), backed by a proper backend-computed aggregate — not this.
export default function CustomerHistoryPanel({ historyState }) {
  const [activeTab, setActiveTab] = useState("orders");
  const history = historyState.data;

  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-ink">Activity</h2>
      <div className="mt-4 flex flex-wrap gap-2 border-b border-forest/10 pb-3">
        {TABS.map((tab) => (
          <button
            aria-pressed={activeTab === tab.key}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              activeTab === tab.key ? "bg-forest text-white" : "bg-mint/60 text-forest hover:bg-mint"
            }`}
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {historyState.isLoading ? <p className="text-sm text-muted">Loading activity...</p> : null}
        {historyState.isError ? (
          <p className="text-sm font-semibold text-red-700">{historyState.errorMessage}</p>
        ) : null}

        {!historyState.isLoading && !historyState.isError && history ? (
          <>
            {activeTab === "orders" ? (
              <div className="rounded-lg border border-forest/10">
                <p className="border-b border-forest/10 bg-mint/40 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-muted">
                  Showing {history.orders.latest.length} most recent of {history.orders.count} total
                </p>
                {history.orders.latest.length ? (
                  history.orders.latest.map((order) => (
                    <Row key={order._id}>
                      <span className="font-black text-forest">{order.orderNumber}</span>
                      <span className="text-muted">{order.orderStatus}</span>
                      <span className="font-semibold text-ink">{formatMoney(order.grandTotal)}</span>
                      <span className="text-xs text-muted">{formatBusinessDateTime(order.createdAt)}</span>
                    </Row>
                  ))
                ) : (
                  <p className="px-4 py-4 text-sm text-muted">No orders found.</p>
                )}
              </div>
            ) : null}

            {activeTab === "invoices" ? (
              <div className="rounded-lg border border-forest/10">
                <p className="border-b border-forest/10 bg-mint/40 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-muted">
                  Showing {history.invoices.latest.length} most recent of {history.invoices.count} total
                </p>
                {history.invoices.latest.length ? (
                  history.invoices.latest.map((invoice) => (
                    <Row key={invoice._id}>
                      <span className="font-black text-forest">{invoice.invoiceNumber}</span>
                      <span className="text-muted">
                        {invoice.status} · {invoice.paymentStatus}
                      </span>
                      <span className="font-semibold text-ink">{formatMoney(invoice.grandTotal)}</span>
                      <span className="text-xs text-muted">{formatBusinessDateTime(invoice.createdAt)}</span>
                    </Row>
                  ))
                ) : (
                  <p className="px-4 py-4 text-sm text-muted">No invoices found.</p>
                )}
              </div>
            ) : null}

            {activeTab === "payments" ? (
              <div className="rounded-lg border border-forest/10">
                <p className="border-b border-forest/10 bg-mint/40 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-muted">
                  Showing {history.payments.latest.length} most recent of {history.payments.count} total
                </p>
                {history.payments.latest.length ? (
                  history.payments.latest.map((payment) => (
                    <Row key={payment._id}>
                      <span className="font-black text-forest">{payment.paymentNumber}</span>
                      <span className="text-muted">{payment.method}</span>
                      <span className="font-semibold text-ink">{formatMoney(payment.amount)}</span>
                      <span className="text-xs text-muted">{formatBusinessDateTime(payment.createdAt)}</span>
                    </Row>
                  ))
                ) : (
                  <p className="px-4 py-4 text-sm text-muted">No payments recorded.</p>
                )}
              </div>
            ) : null}

            {activeTab === "outstanding" ? (
              <div>
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
                  This reflects only the {history.invoices.latest.length} most recently created invoices (of{" "}
                  {history.invoices.count} total) — it is not a guaranteed complete outstanding total. A full,
                  backend-computed Outstanding Receivables view is a separate feature.
                </p>
                <div className="mt-3 rounded-lg border border-forest/10">
                  {history.invoices.latest.filter((invoice) => invoice.paymentStatus !== INVOICE_PAYMENT_STATUS.PAID).length ? (
                    history.invoices.latest
                      .filter((invoice) => invoice.paymentStatus !== INVOICE_PAYMENT_STATUS.PAID)
                      .map((invoice) => (
                        <Row key={invoice._id}>
                          <span className="font-black text-forest">{invoice.invoiceNumber}</span>
                          <span className="text-muted">{invoice.paymentStatus}</span>
                          <span className="font-bold text-red-700">{formatMoney(invoice.dueAmount)} due</span>
                        </Row>
                      ))
                  ) : (
                    <p className="px-4 py-4 text-sm text-muted">No outstanding invoices among the recent ones shown.</p>
                  )}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </Card>
  );
}
