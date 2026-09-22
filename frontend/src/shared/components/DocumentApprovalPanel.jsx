import { useState } from "react";
import { CheckCircle2, Clock, Undo2 } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";
import Textarea from "../forms/Textarea";

/**
 * The Super Admin's sign-off, on the document itself.
 *
 * Two audiences read this panel and they need opposite things:
 *
 *  - THE PERSON WHO PREPARED IT wants to know where their work went. A
 *    quotation that silently sits at "Waiting for approval" with no note
 *    of who has it is indistinguishable from one that was lost, so the
 *    panel names the approver's side of the exchange and, after a
 *    refusal, shows the note in full. The note is the whole point of a
 *    rejection: it is the instruction for the next attempt.
 *
 *  - THE APPROVER wants to answer in one place, without leaving the
 *    document they are judging. Approve is a single press; sending it
 *    back asks for the note first and will not submit without one,
 *    matching the backend rule rather than discovering it as an error.
 *
 * Presentational only — it is handed a decision callback and reports
 * nothing about quotations or invoices specifically, because the gate is
 * identical for both and a second copy of this would be a second place
 * for the two to drift apart.
 */
export default function DocumentApprovalPanel({
  approval,
  canApprove = false,
  documentLabel = "document",
  errorMessage = "",
  isDeciding = false,
  isWaiting = false,
  onDecide,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState("");

  const wasSentBack = approval?.decision === "REJECTED" && !isWaiting;

  // Nothing to say: never submitted, or submitted and approved long ago.
  if (!isWaiting && !wasSentBack) return null;

  const closeDialog = () => {
    setDialogOpen(false);
    setReason("");
  };

  const sendBack = async (event) => {
    event.preventDefault();
    await onDecide?.("REJECTED", reason);
  };

  return (
    <>
      {isWaiting ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <p className="flex items-center gap-2 text-sm font-black text-amber-900">
            <Clock className="h-4 w-4" />
            Waiting for the Super Admin&apos;s approval
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            {approval?.requestedBy?.name
              ? `${approval.requestedBy.name} sent this ${documentLabel} for approval.`
              : `This ${documentLabel} has been sent for approval.`}{" "}
            It does not reach the customer until the Super Admin or Office Admin says yes, and it cannot be
            edited while it waits.
          </p>

          {canApprove ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button disabled={isDeciding} onClick={() => onDecide?.("APPROVED")}>
                <CheckCircle2 className="h-4 w-4" />
                {isDeciding ? "Working..." : "Approve"}
              </Button>
              <Button disabled={isDeciding} onClick={() => setDialogOpen(true)} variant="secondary">
                <Undo2 className="h-4 w-4" />
                Send back for changes
              </Button>
            </div>
          ) : null}

          {errorMessage ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      ) : null}

      {wasSentBack ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-black text-red-900">
            Sent back for changes{approval?.decidedBy?.name ? ` by ${approval.decidedBy.name}` : ""}
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-red-900">{approval?.reason}</p>
          <p className="mt-3 text-xs font-semibold text-red-800">
            Make the change and send it again — it goes back for approval, and nothing has been lost.
          </p>
        </div>
      ) : null}

      <Modal isOpen={dialogOpen} onClose={closeDialog} title="Send back for changes">
        <form className="space-y-4" onSubmit={sendBack}>
          <p className="text-sm leading-6 text-muted">
            Say what needs changing. The person who prepared this {documentLabel} sees your note and works from
            it, so be specific — a price, a date, a missing line.
          </p>
          <Textarea
            id="approval-send-back-reason"
            label="What should they change?"
            maxLength={1000}
            onChange={(event) => setReason(event.target.value)}
            required
            value={reason}
          />
          {errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button onClick={closeDialog} type="button" variant="secondary">
              Back
            </Button>
            <Button disabled={isDeciding || !reason.trim()} type="submit">
              {isDeciding ? "Sending..." : "Send back"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
