import { GitPullRequest, ShieldX } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../core/auth";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import { DocumentApprovalPanel } from "../../../shared/components";
import Modal from "../../../shared/components/Modal";
import Textarea from "../../../shared/forms/Textarea";
import TextInput from "../../../shared/forms/TextInput";
import { useInvoiceActions } from "../hooks";
import { getInvoiceCapabilities } from "../utils";
import { INVOICE_STATUS } from "../constants";

const actionButtonClass = "w-full justify-start rounded-lg";

const ActionError = ({ message }) =>
  message ? (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
      {message}
    </p>
  ) : null;

const ignoreHandledError = () => {};

const toDateInputValue = (value) => (value ? String(value).slice(0, 10) : "");

// Prompts 42 (Issue) + 43 (Cancel). Both actions share one
// `useInvoiceActions({onError, onSuccess})` call whose `onSuccess`
// refetches this invoice on BOTH a real success and a mutation error — the
// same refetch-on-error-too pattern used everywhere else in this project.
export default function InvoiceLifecycleActions({ invoice, onSuccess }) {
  const { hasPermission, role } = useAuth();
  const [dialog, setDialog] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState(() => toDateInputValue(invoice.dueDate));
  const [dueDateError, setDueDateError] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const { canApproveInvoice, canCancelInvoice, canIssueInvoice, issueGoesForApproval } =
    getInvoiceCapabilities({ hasPermission, invoice });

  const isWaitingForApproval = invoice.status === INVOICE_STATUS.PENDING_APPROVAL;
  // A refusal that has not been acted on yet: back in DRAFT, still
  // carrying the note that says why.
  const wasSentBack = invoice.status === INVOICE_STATUS.DRAFT && invoice.approval?.decision === "REJECTED";

  const closeDialog = () => {
    setDialog("");
    setInvoiceDate("");
    setDueDate(toDateInputValue(invoice.dueDate));
    setDueDateError("");
    setCancelReason("");
  };

  const actions = useInvoiceActions({
    onError: async () => {
      await onSuccess?.();
    },
    onSuccess: async () => {
      closeDialog();
      await onSuccess?.();
    },
  });

  if (!canIssueInvoice && !canCancelInvoice && !canApproveInvoice && !isWaitingForApproval && !wasSentBack)
    return null;

  // A dueDate is required to issue an invoice (invoice.service.js#issueInvoice
  // rejects with a 400 if neither this invoice already has one nor the
  // request supplies one) — checked client-side first so a genuinely
  // missing dueDate never round-trips to the backend just to fail.
  const handleIssue = (event) => {
    event.preventDefault();
    if (!dueDate) {
      setDueDateError("Due date is required — this invoice was generated without one.");
      return;
    }
    setDueDateError("");
    actions.issueInvoice.mutate(invoice._id, { invoiceDate, dueDate }).catch(ignoreHandledError);
  };

  const handleDecision = (decision, reason) =>
    actions.decideInvoiceApproval.mutate(invoice._id, decision, reason).catch(ignoreHandledError);

  const handleCancel = async (event) => {
    event.preventDefault();
    await actions.cancelInvoice.mutate(invoice._id, cancelReason).catch(ignoreHandledError);
  };

  return (
    <>
      {/* Above the action bar on purpose: while a bill is waiting, or has
          just come back with changes asked for, that is the only thing
          about it worth reading first. */}
      <DocumentApprovalPanel
        approval={invoice.approval}
        canApprove={canApproveInvoice}
        documentLabel="bill"
        errorMessage={actions.decideInvoiceApproval.errorMessage}
        isDeciding={actions.decideInvoiceApproval.isLoading}
        isWaiting={isWaitingForApproval}
        onDecide={handleDecision}
      />

      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {canIssueInvoice ? (
            <Button className={actionButtonClass} onClick={() => setDialog("issue")} variant="secondary">
              <GitPullRequest className="h-4 w-4" />
              {/* The same press means two different things depending on
                  who makes it, so the button says which one it will be. */}
              {issueGoesForApproval ? "Send for approval" : "Issue Invoice"}
            </Button>
          ) : null}
          {canCancelInvoice ? (
            <Button className={actionButtonClass} onClick={() => setDialog("cancel")} variant="secondary">
              <ShieldX className="h-4 w-4" />
              Cancel Invoice
            </Button>
          ) : null}
        </div>
      </Card>

      <Modal
        isOpen={dialog === "issue"}
        onClose={closeDialog}
        title={issueGoesForApproval ? "Send bill for approval" : "Issue invoice"}
      >
        <form className="space-y-4" onSubmit={handleIssue}>
          <p className="text-sm leading-6 text-muted">
            {issueGoesForApproval
              ? `Send ${invoice.invoiceNumber} to the Super Admin for approval? It reaches the customer only once they say yes, and you cannot edit it while it waits.`
              : `Issue ${invoice.invoiceNumber}? Totals are frozen from this point on — issuing does not recalculate anything.`}
          </p>
          <TextInput
            id="invoice-issue-date"
            label="Invoice Date"
            onChange={(event) => setInvoiceDate(event.target.value)}
            type="date"
            value={invoiceDate}
          />
          <TextInput
            error={dueDateError}
            id="invoice-issue-due-date"
            label="Due Date"
            onChange={(event) => {
              setDueDate(event.target.value);
              if (event.target.value) setDueDateError("");
            }}
            required={!invoice.dueDate}
            type="date"
            value={dueDate}
          />
          <ActionError message={actions.issueInvoice.errorMessage} />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button onClick={closeDialog} type="button" variant="secondary">
              Back
            </Button>
            <Button disabled={actions.issueInvoice.isLoading} type="submit">
              {actions.issueInvoice.isLoading
                ? "Sending..."
                : issueGoesForApproval
                  ? "Send for approval"
                  : "Issue Invoice"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={dialog === "cancel"} onClose={closeDialog} title="Cancel invoice">
        <form className="space-y-4" onSubmit={handleCancel}>
          <Textarea
            id="invoice-cancel-reason"
            label="Reason"
            maxLength={500}
            onChange={(event) => setCancelReason(event.target.value)}
            required
            value={cancelReason}
          />
          <p className="text-xs font-semibold text-muted">
            This is a permanent withdrawal, not a hard delete — no refund or payment-reversal action is
            created here.
          </p>
          <ActionError message={actions.cancelInvoice.errorMessage} />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button onClick={closeDialog} type="button" variant="secondary">
              Back
            </Button>
            <Button disabled={actions.cancelInvoice.isLoading || !cancelReason.trim()} type="submit">
              {actions.cancelInvoice.isLoading ? "Cancelling..." : "Cancel Invoice"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
