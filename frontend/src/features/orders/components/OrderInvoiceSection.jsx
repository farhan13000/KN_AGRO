import { FileText } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../core/auth";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import Modal from "../../../shared/components/Modal";
import { useAsyncMutation } from "../../../shared/hooks";
import TextInput from "../../../shared/forms/TextInput";
// Narrow subpath imports — only the one service method/badge are needed
// here, not the whole Invoices feature's hooks/forms graph.
import InvoiceStatusBadge from "../../invoices/components/InvoiceStatusBadge";
import { invoiceApi } from "../../invoices/services";
import { getOrderCapabilities } from "../utils";

const ActionError = ({ message }) =>
  message ? (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
      {message}
    </p>
  ) : null;

const ignoreHandledError = () => {};

// Prompt 41: "Generate Invoice" only ever shows when the backend actually
// considers this Order eligible — via `getOrderCapabilities`'s
// `canGenerateInvoice` (mirrors the backend's own
// ORDER_BOOKED_STATUSES/INVOICE_ELIGIBLE_ORDER_STATUSES, see
// order.constants.js) — never shown for PENDING or CANCELLED.
// `existingInvoiceState` is a lightweight `useInvoiceList({order: orderId,
// limit: 1})` lookup owned by OrderDetailRouteView (the Order model itself
// has no back-reference to its Invoice — the uniqueness lives only on the
// Invoice side — so this is the one extra read needed to know whether to
// offer Generate or View). If an invoice already exists, this renders a
// link to it instead of a button that would just 409 ("This order already
// has an invoice").
export default function OrderInvoiceSection({ existingInvoiceState, invoiceDetailPathFor, onInvoiceCreated, order }) {
  const { hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dueDate, setDueDate] = useState("");

  const existingInvoice = existingInvoiceState?.data?.invoices?.[0];
  const { canGenerateInvoice: canGenerate } = getOrderCapabilities({ hasPermission, order });

  const generateInvoice = useAsyncMutation(
    (orderId, values) => invoiceApi.generateInvoice(orderId, values),
    {
      onSuccess: async (payload) => {
        setIsOpen(false);
        setDueDate("");
        if (payload?.invoice) await onInvoiceCreated?.(payload.invoice);
      },
    },
  );

  // Still loading the existence check, or nothing to show either way.
  if (existingInvoiceState?.isLoading) return null;
  if (!existingInvoice && !canGenerate) return null;

  const handleGenerate = (event) => {
    event.preventDefault();
    generateInvoice.mutate(order._id, { dueDate }).catch(ignoreHandledError);
  };

  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-ink">Invoice</h2>
      {existingInvoice ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-forest/10 bg-mint/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-black text-forest">{existingInvoice.invoiceNumber}</span>
            <InvoiceStatusBadge status={existingInvoice.status} />
          </div>
          {invoiceDetailPathFor ? (
            <Link
              className="text-sm font-bold text-forest hover:underline"
              to={invoiceDetailPathFor(existingInvoice)}
            >
              View Invoice
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="mt-4">
          <Button className="justify-start rounded-lg" onClick={() => setIsOpen(true)} variant="secondary">
            <FileText className="h-4 w-4" />
            Generate Invoice
          </Button>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Generate invoice">
        <form className="space-y-4" onSubmit={handleGenerate}>
          <p className="text-sm leading-6 text-muted">
            Generate an invoice from {order.orderNumber}? Items, quantities, and totals are copied directly
            from this order and cannot be edited afterward.
          </p>
          <TextInput
            id="invoice-generate-due-date"
            label="Due Date (optional)"
            onChange={(event) => setDueDate(event.target.value)}
            type="date"
            value={dueDate}
          />
          <ActionError message={generateInvoice.errorMessage} />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button onClick={() => setIsOpen(false)} type="button" variant="secondary">
              Back
            </Button>
            <Button disabled={generateInvoice.isLoading} type="submit">
              {generateInvoice.isLoading ? "Generating..." : "Generate Invoice"}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
