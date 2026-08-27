import { CheckCircle2, PackageCheck, PackageSearch, ShieldX, Truck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../core/auth";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import Modal from "../../../shared/components/Modal";
import Textarea from "../../../shared/forms/Textarea";
import { useOrderActions } from "../hooks";
import { getOrderCapabilities } from "../utils";

const actionButtonClass = "w-full justify-start rounded-lg";

const ActionError = ({ message }) =>
  message ? (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
      {message}
    </p>
  ) : null;

const ignoreHandledError = () => {};

// Prompt 27's action-bar container. Confirm/Processing landed in Batch 3;
// Ready (31), Dispatch (32/33), Deliver (34), and Cancel (35) land here in
// Batch 4 — the full transition matrix in orderCapabilities.js now has a
// real button behind every entry.
//
// Every action here shares one `useOrderActions({onError, onSuccess})`
// call whose `onSuccess` refetches the Order (+ bumps the Inventory
// refresh token) on BOTH a real success and a mutation error — the exact
// refetch-on-error-too pattern from Phase 5 Prompt 50 / Batch 3's Confirm.
// This is also the whole implementation of Prompt 36 (Order Conflict
// Handling): every listed conflict (insufficient stock, stock changed
// concurrently, already confirmed, already dispatched, invalid transition,
// already cancelled, reservation failure) surfaces as the backend's own
// error message via ActionError, then silently re-syncs Order + Inventory
// in the background — the button set self-corrects from the fresh
// `orderStatus` without this component needing to special-case any one
// conflict type. Prompt 33 (Dispatch Idempotency) is the same mechanism
// applied to Dispatch specifically: a "already dispatched" 409 shows that
// exact backend message, refetches (which flips the button off once the
// fresh order shows DISPATCHED), and never auto-retries.
//
// Double-submit is blocked on every action the same way Confirm was in
// Batch 3: `useAsyncMutation`'s per-action `isLoading` feeds
// `ConfirmDialog`'s `confirmDisabled` prop directly.
export default function OrderLifecycleActions({ onSuccess, order }) {
  const { hasPermission } = useAuth();
  const [dialog, setDialog] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const { canCancelOrder, canConfirmOrder, canDispatchOrder, canMarkDelivered, canMarkProcessing, canMarkReady } =
    getOrderCapabilities({ hasPermission, order });

  const closeDialog = () => {
    setDialog("");
    setCancelReason("");
  };

  const actions = useOrderActions({
    onError: async () => {
      await onSuccess?.();
    },
    onSuccess: async () => {
      closeDialog();
      await onSuccess?.();
    },
  });

  if (
    !canConfirmOrder &&
    !canMarkProcessing &&
    !canMarkReady &&
    !canDispatchOrder &&
    !canMarkDelivered &&
    !canCancelOrder
  ) {
    return null;
  }

  const handleConfirm = () => actions.confirmOrder.mutate(order._id).catch(ignoreHandledError);
  const handleProcess = () => actions.markProcessing.mutate(order._id).catch(ignoreHandledError);
  const handleReady = () => actions.markReady.mutate(order._id).catch(ignoreHandledError);
  const handleDispatch = () => actions.dispatchOrder.mutate(order._id).catch(ignoreHandledError);
  const handleDeliver = () => actions.markDelivered.mutate(order._id).catch(ignoreHandledError);

  const handleCancel = async (event) => {
    event.preventDefault();
    await actions.cancelOrder.mutate(order._id, cancelReason).catch(ignoreHandledError);
  };

  return (
    <>
      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {canConfirmOrder ? (
            <Button className={actionButtonClass} onClick={() => setDialog("confirm")} variant="secondary">
              <CheckCircle2 className="h-4 w-4" />
              Confirm Order
            </Button>
          ) : null}
          {canMarkProcessing ? (
            <Button className={actionButtonClass} onClick={() => setDialog("process")} variant="secondary">
              <PackageSearch className="h-4 w-4" />
              Move To Processing
            </Button>
          ) : null}
          {canMarkReady ? (
            <Button className={actionButtonClass} onClick={() => setDialog("ready")} variant="secondary">
              <PackageCheck className="h-4 w-4" />
              Mark Ready
            </Button>
          ) : null}
          {canDispatchOrder ? (
            <Button className={actionButtonClass} onClick={() => setDialog("dispatch")} variant="secondary">
              <Truck className="h-4 w-4" />
              Dispatch
            </Button>
          ) : null}
          {canMarkDelivered ? (
            <Button className={actionButtonClass} onClick={() => setDialog("deliver")} variant="secondary">
              <CheckCircle2 className="h-4 w-4" />
              Mark Delivered
            </Button>
          ) : null}
          {canCancelOrder ? (
            <Button className={actionButtonClass} onClick={() => setDialog("cancel")} variant="secondary">
              <ShieldX className="h-4 w-4" />
              Cancel Order
            </Button>
          ) : null}
        </div>
      </Card>

      <ConfirmDialog
        cancelLabel="Back"
        confirmDisabled={actions.confirmOrder.isLoading}
        confirmLabel={actions.confirmOrder.isLoading ? "Confirming..." : "Confirm Order"}
        description="Confirm this order? This reserves stock for every item. If any item lacks sufficient available stock, the whole request is rejected and the order stays untouched."
        isOpen={dialog === "confirm"}
        onCancel={closeDialog}
        onConfirm={handleConfirm}
        title="Confirm order"
      />
      {dialog === "confirm" ? <ActionError message={actions.confirmOrder.errorMessage} /> : null}

      <ConfirmDialog
        cancelLabel="Back"
        confirmDisabled={actions.markProcessing.isLoading}
        confirmLabel={actions.markProcessing.isLoading ? "Moving..." : "Move To Processing"}
        description="Move this order to Processing? No stock is consumed at this step."
        isOpen={dialog === "process"}
        onCancel={closeDialog}
        onConfirm={handleProcess}
        title="Move to processing"
      />
      {dialog === "process" ? <ActionError message={actions.markProcessing.errorMessage} /> : null}

      <ConfirmDialog
        cancelLabel="Back"
        confirmDisabled={actions.markReady.isLoading}
        confirmLabel={actions.markReady.isLoading ? "Updating..." : "Mark Ready"}
        description="Mark this order ready for dispatch? No stock is consumed at this step — reserved stock is only consumed when it's actually dispatched."
        isOpen={dialog === "ready"}
        onCancel={closeDialog}
        onConfirm={handleReady}
        title="Mark ready"
      />
      {dialog === "ready" ? <ActionError message={actions.markReady.errorMessage} /> : null}

      <ConfirmDialog
        cancelLabel="Back"
        confirmDisabled={actions.dispatchOrder.isLoading}
        confirmLabel={actions.dispatchOrder.isLoading ? "Dispatching..." : "Dispatch"}
        description="Dispatch this order? This consumes the reserved stock for every item exactly once — it cannot be undone from here, and this cannot be repeated for the same order."
        isOpen={dialog === "dispatch"}
        onCancel={closeDialog}
        onConfirm={handleDispatch}
        title="Dispatch order"
      />
      {dialog === "dispatch" ? <ActionError message={actions.dispatchOrder.errorMessage} /> : null}

      <ConfirmDialog
        cancelLabel="Back"
        confirmDisabled={actions.markDelivered.isLoading}
        confirmLabel={actions.markDelivered.isLoading ? "Updating..." : "Mark Delivered"}
        description="Mark this order delivered? This only updates fulfillment status — it does not record a payment."
        isOpen={dialog === "deliver"}
        onCancel={closeDialog}
        onConfirm={handleDeliver}
        title="Mark delivered"
      />
      {dialog === "deliver" ? <ActionError message={actions.markDelivered.errorMessage} /> : null}

      <Modal isOpen={dialog === "cancel"} onClose={closeDialog} title="Cancel order">
        <form className="space-y-4" onSubmit={handleCancel}>
          <Textarea
            id="order-cancel-reason"
            label="Reason"
            maxLength={500}
            onChange={(event) => setCancelReason(event.target.value)}
            required
            value={cancelReason}
          />
          <p className="text-xs font-semibold text-muted">
            If stock was already reserved for this order, the backend releases it automatically — never
            consumed stock, since this order hasn&apos;t been dispatched.
          </p>
          <ActionError message={actions.cancelOrder.errorMessage} />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button onClick={closeDialog} type="button" variant="secondary">
              Back
            </Button>
            <Button disabled={actions.cancelOrder.isLoading || !cancelReason.trim()} type="submit">
              {actions.cancelOrder.isLoading ? "Cancelling..." : "Cancel Order"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
