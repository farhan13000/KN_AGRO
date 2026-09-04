import { CheckCircle2, GitPullRequest, PackagePlus, Pencil, RefreshCw, ShieldX, XCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../core/auth";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import Modal from "../../../shared/components/Modal";
import { useAsyncMutation } from "../../../shared/hooks";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import { getBusinessDateKey } from "../../../shared/utils";
// Deliberately imports from the orders feature's services subpath, not its
// root barrel — this needs only orderApi.createOrderFromQuotation, not the
// whole Orders UI (components/hooks), so importing the narrower path keeps
// that code out of the Quotations bundle's module graph.
import { orderApi } from "../../orders/services";
import { quotationApi } from "../services";
import { useQuotationActions } from "../hooks";
import { getQuotationCapabilities } from "../utils";

const actionButtonClass = "w-full justify-start rounded-lg";

const ActionError = ({ message }) =>
  message ? (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
      {message}
    </p>
  ) : null;

const ignoreHandledError = () => {};

// The "Lifecycle Actions" section of the shared detail composition
// (Prompt 21) plus the Send/Accept/Reject/Cancel implementations
// (Prompts 27-30). Every mutation's onSuccess closes whatever dialog is
// open and calls the caller's `onSuccess` (the route view's own
// `quotationState.refetch`) — never an optimistic local status write. A
// re-fetched quotation detail always re-populates its `lead` sub-document
// fresh, so this also naturally satisfies "refetch related Lead" after
// Send (the Lead's live status, e.g. QUOTATION_SENT, is never a frozen
// snapshot the way item fields are — see PHASE5_FRONTEND_API_CONTRACT.md).
// `onRevised(newQuotation)` is separate from `onSuccess` on purpose: every
// other action refetches this same quotation in place, but Revise creates
// a brand-new DRAFT record — Prompt 33 requires navigating to it, not
// refetching the (unchanged) original.
export default function QuotationLifecycleActions({
  editPath = "",
  onOrderCreated,
  onRevised,
  onSuccess,
  quotation,
}) {
  const { hasPermission } = useAuth();
  const [dialog, setDialog] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  const {
    canAcceptQuotation,
    canCancelQuotation,
    canCreateOrderFromQuotation,
    canEditQuotation,
    canRejectQuotation,
    canReviseQuotation,
    canSendQuotation,
  } = getQuotationCapabilities({ hasPermission, quotation });

  const closeDialog = () => {
    setDialog("");
    setRejectReason("");
    setCancelReason("");
    setExpectedDeliveryDate("");
    setOrderNotes("");
  };

  // Prompt 50: on a conflict (409 — someone else already sent/accepted/
  // rejected/cancelled this quotation, or its state otherwise moved under
  // us) the dialog keeps showing the backend's own error message, but the
  // quotation is silently refetched in the background via the same
  // `onSuccess` callback used for a real success. That refetch is what
  // "refresh available actions" means in practice — this bar is entirely
  // derived from `quotation.status` (getQuotationCapabilities), so once the
  // fresh record lands, stale buttons for a transition that no longer
  // applies simply stop rendering, without this component needing to know
  // anything about what changed. Refetching on any other error type
  // (400/403/404/5xx) is equally harmless — it either confirms nothing
  // changed or correctly surfaces the new problem.
  const actions = useQuotationActions({
    onError: async () => {
      await onSuccess?.();
    },
    onSuccess: async () => {
      closeDialog();
      await onSuccess?.();
    },
  });

  const reviseQuotation = useAsyncMutation(quotationApi.reviseQuotation, {
    onError: async () => {
      await onSuccess?.();
    },
    onSuccess: async (payload) => {
      closeDialog();
      if (payload?.quotation) await onRevised?.(payload.quotation);
    },
  });

  // Prompt 23: ACCEPTED quotation -> backend creates/resolves the Customer,
  // creates the Order, flips this Quotation to CONVERTED, and best-effort
  // advances the Lead to CONVERTED — all server-side, in one transaction.
  // This component only calls the endpoint and navigates to the result; it
  // never patches quotation.status/lead.status locally, per Prompt 23's
  // explicit "frontend must not patch these statuses independently".
  const createOrder = useAsyncMutation(
    (quotationId, values) => orderApi.createOrderFromQuotation(quotationId, values),
    {
      onError: async () => {
        await onSuccess?.();
      },
      onSuccess: async (payload) => {
        closeDialog();
        if (payload?.order) await onOrderCreated?.(payload.order);
      },
    },
  );

  if (
    !canEditQuotation &&
    !canSendQuotation &&
    !canAcceptQuotation &&
    !canRejectQuotation &&
    !canCancelQuotation &&
    !canReviseQuotation &&
    !canCreateOrderFromQuotation
  ) {
    return null;
  }

  const handleSend = () => actions.sendQuotation.mutate(quotation._id).catch(ignoreHandledError);
  const handleAccept = () => actions.acceptQuotation.mutate(quotation._id).catch(ignoreHandledError);
  const handleRevise = () => reviseQuotation.mutate(quotation._id).catch(ignoreHandledError);

  const handleCreateOrder = (event) => {
    event.preventDefault();
    createOrder
      .mutate(quotation._id, { expectedDeliveryDate, notes: orderNotes })
      .catch(ignoreHandledError);
  };

  const handleReject = async (event) => {
    event.preventDefault();
    await actions.rejectQuotation.mutate(quotation._id, rejectReason).catch(ignoreHandledError);
  };

  const handleCancel = async (event) => {
    event.preventDefault();
    await actions.cancelQuotation.mutate(quotation._id, cancelReason).catch(ignoreHandledError);
  };

  return (
    <>
      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {canEditQuotation && editPath ? (
            <Button className={actionButtonClass} to={editPath} variant="secondary">
              <Pencil className="h-4 w-4" />
              Edit Draft
            </Button>
          ) : null}
          {canSendQuotation ? (
            <Button className={actionButtonClass} onClick={() => setDialog("send")} variant="secondary">
              <GitPullRequest className="h-4 w-4" />
              Send
            </Button>
          ) : null}
          {canCreateOrderFromQuotation ? (
            <Button className={actionButtonClass} onClick={() => setDialog("create-order")} variant="secondary">
              <PackagePlus className="h-4 w-4" />
              Create Order
            </Button>
          ) : null}
          {canAcceptQuotation ? (
            <Button className={actionButtonClass} onClick={() => setDialog("accept")} variant="secondary">
              <CheckCircle2 className="h-4 w-4" />
              Accept
            </Button>
          ) : null}
          {canRejectQuotation ? (
            <Button className={actionButtonClass} onClick={() => setDialog("reject")} variant="secondary">
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          ) : null}
          {canCancelQuotation ? (
            <Button className={actionButtonClass} onClick={() => setDialog("cancel")} variant="secondary">
              <ShieldX className="h-4 w-4" />
              Cancel
            </Button>
          ) : null}
          {canReviseQuotation ? (
            <Button className={actionButtonClass} onClick={() => setDialog("revise")} variant="secondary">
              <RefreshCw className="h-4 w-4" />
              Revise
            </Button>
          ) : null}
        </div>
      </Card>

      <ConfirmDialog
        cancelLabel="Back"
        confirmLabel={actions.sendQuotation.isLoading ? "Sending..." : "Send"}
        description={`Send ${quotation.quotationNumber} to the customer? The related Lead moves to "Quotation Sent" automatically.`}
        isOpen={dialog === "send"}
        onCancel={closeDialog}
        onConfirm={handleSend}
        title="Send quotation"
      />
      {dialog === "send" ? <ActionError message={actions.sendQuotation.errorMessage} /> : null}

      <ConfirmDialog
        cancelLabel="Back"
        confirmLabel={actions.acceptQuotation.isLoading ? "Accepting..." : "Accept"}
        description={`Mark ${quotation.quotationNumber} as accepted by the customer? This does not create an Order automatically — use the separate "Create Order" action once accepted.`}
        isOpen={dialog === "accept"}
        onCancel={closeDialog}
        onConfirm={handleAccept}
        title="Accept quotation"
      />
      {dialog === "accept" ? <ActionError message={actions.acceptQuotation.errorMessage} /> : null}

      <Modal isOpen={dialog === "create-order"} onClose={closeDialog} title="Create order">
        <form className="space-y-4" onSubmit={handleCreateOrder}>
          <p className="text-sm leading-6 text-muted">
            Create an Order from {quotation.quotationNumber}? The backend resolves/creates the Customer,
            creates the Order from this quotation&apos;s saved items and totals, and moves this Quotation to
            Converted. This cannot be undone from here.
          </p>
          <TextInput
            id="order-expected-delivery-date"
            label="Expected Delivery Date"
            min={getBusinessDateKey(new Date())}
            onChange={(event) => setExpectedDeliveryDate(event.target.value)}
            type="date"
            value={expectedDeliveryDate}
          />
          <Textarea
            id="order-notes"
            label="Notes"
            maxLength={1000}
            onChange={(event) => setOrderNotes(event.target.value)}
            value={orderNotes}
          />
          <ActionError message={createOrder.errorMessage} />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button onClick={closeDialog} type="button" variant="secondary">
              Back
            </Button>
            <Button disabled={createOrder.isLoading} type="submit">
              {createOrder.isLoading ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        cancelLabel="Back"
        confirmLabel={reviseQuotation.isLoading ? "Revising..." : "Revise"}
        description={`Create a new editable Draft from ${quotation.quotationNumber}? The original stays unchanged and is linked as this Draft's parent.`}
        isOpen={dialog === "revise"}
        onCancel={closeDialog}
        onConfirm={handleRevise}
        title="Revise quotation"
      />
      {dialog === "revise" ? <ActionError message={reviseQuotation.errorMessage} /> : null}

      <Modal isOpen={dialog === "reject"} onClose={closeDialog} title="Reject quotation">
        <form className="space-y-4" onSubmit={handleReject}>
          <Textarea
            id="quotation-reject-reason"
            label="Reason"
            maxLength={500}
            onChange={(event) => setRejectReason(event.target.value)}
            required
            value={rejectReason}
          />
          <p className="text-xs font-semibold text-muted">
            Rejecting does not automatically mark the related Lead as Lost.
          </p>
          <ActionError message={actions.rejectQuotation.errorMessage} />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button onClick={closeDialog} type="button" variant="secondary">
              Cancel
            </Button>
            <Button disabled={actions.rejectQuotation.isLoading || !rejectReason.trim()} type="submit">
              {actions.rejectQuotation.isLoading ? "Rejecting..." : "Reject Quotation"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={dialog === "cancel"} onClose={closeDialog} title="Cancel quotation">
        <form className="space-y-4" onSubmit={handleCancel}>
          <Textarea
            id="quotation-cancel-reason"
            label="Reason"
            maxLength={500}
            onChange={(event) => setCancelReason(event.target.value)}
            required
            value={cancelReason}
          />
          <p className="text-xs font-semibold text-muted">
            Cancellation is a permanent, internal withdrawal — not a hard delete, and not reversible.
          </p>
          <ActionError message={actions.cancelQuotation.errorMessage} />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button onClick={closeDialog} type="button" variant="secondary">
              Back
            </Button>
            <Button disabled={actions.cancelQuotation.isLoading || !cancelReason.trim()} type="submit">
              {actions.cancelQuotation.isLoading ? "Cancelling..." : "Cancel Quotation"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
